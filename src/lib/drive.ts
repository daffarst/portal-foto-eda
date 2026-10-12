import { google } from "googleapis";
import type { Readable } from "node:stream";
import { prisma } from "@/lib/db";

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const RESULT_FOLDER_NAME = "Hasil Seleksi";

/**
 * Kenapa OAuth 2.0 (akun pribadi fotografer), BUKAN Service Account:
 * Service Account punya storage quota 0 byte. Kalau dipakai untuk
 * files.create/files.copy ke folder My Drive pribadi, request akan gagal
 * dengan error "storageQuotaExceeded" karena Service Account jadi owner
 * file baru. OAuth atas nama akun fotografer sendiri memakai kuota Drive
 * pribadinya (gratis 15GB) dan tidak butuh Google Workspace/billing.
 */
function getOAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  return client;
}

export function getGoogleAuthUrl(): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // paksa Google selalu kirim refresh_token
    scope: SCOPES,
  });
}

export async function exchangeCodeForRefreshToken(code: string): Promise<string> {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      "Google tidak mengembalikan refresh_token. Cabut akses aplikasi ini di myaccount.google.com/permissions lalu ulangi (Google hanya kirim refresh_token saat consent pertama kali)."
    );
  }
  return tokens.refresh_token;
}

async function getStoredRefreshToken(photographerId: string): Promise<string | null> {
  const account = await prisma.driveAccount.findUnique({ where: { photographerId } });
  return account?.refreshToken ?? null;
}

async function getDriveClient(photographerId: string) {
  const refreshToken = await getStoredRefreshToken(photographerId);
  if (!refreshToken) {
    throw new Error(
      "Belum ada akun Google Drive terhubung. Klik tombol \"Hubungkan Google Drive\" di /admin/dashboard terlebih dahulu."
    );
  }
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: "v3", auth: client });
}

export interface DrivePhoto {
  driveFileId: string;
  filename: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
}

export interface DrivePhotoPage {
  photos: DrivePhoto[];
  /** Cursor opaque untuk request berikutnya; null kalau seluruh pohon folder sudah selesai. */
  nextCursor: string | null;
}

interface SyncCursor {
  /** Antrean folder yang belum selesai dibaca; elemen pertama = folder yang sedang dibaca. */
  queue: string[];
  /** pageToken Drive untuk daftar foto di folder pertama pada antrean. */
  pageToken?: string;
}

const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{5,200}$/;
const MAX_QUEUE_LENGTH = 5000;
const FOLDER_MIME = "application/vnd.google-apps.folder";

function encodeCursor(cursor: SyncCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeCursor(raw: string): SyncCursor {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (
      Array.isArray(parsed?.queue) &&
      parsed.queue.length <= MAX_QUEUE_LENGTH &&
      parsed.queue.every((id: unknown) => typeof id === "string" && DRIVE_ID_PATTERN.test(id)) &&
      (parsed.pageToken === undefined || typeof parsed.pageToken === "string")
    ) {
      return { queue: parsed.queue, pageToken: parsed.pageToken };
    }
  } catch {
    // jatuh ke error di bawah
  }
  throw new Error("Posisi sinkronisasi tidak valid. Ulangi sync dari awal.");
}

/**
 * Baca foto image/* di folder sumber BESERTA semua subfolder di dalamnya
 * (tidak termasuk yang di-trash). Dikerjakan bertahap: tiap panggilan
 * membaca beberapa halaman folder sampai terkumpul ~`maxPhotos` foto atau
 * `budgetMs` habis, lalu mengembalikan `nextCursor` untuk dilanjutkan di
 * request berikutnya — jadi ribuan foto di banyak folder tidak timeout.
 * Folder di `skipFolderIds` (mis. "Hasil Seleksi") dilewati supaya salinan
 * hasil seleksi tidak ikut terbaca sebagai foto sumber.
 */
export async function listPhotosTree(
  rootFolderId: string,
  photographerId: string,
  options: { cursor?: string; skipFolderIds?: string[]; maxPhotos?: number; budgetMs?: number } = {}
): Promise<DrivePhotoPage> {
  const { cursor, skipFolderIds = [], maxPhotos = 500, budgetMs = 30_000 } = options;
  const drive = await getDriveClient(photographerId);
  const skip = new Set(skipFolderIds);
  const state: SyncCursor = cursor ? decodeCursor(cursor) : { queue: [rootFolderId] };
  const photos: DrivePhoto[] = [];
  const startedAt = Date.now();

  while (state.queue.length > 0) {
    const folderId = state.queue[0];

    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "nextPageToken, files(id, name, thumbnailLink, mimeType, size)",
      orderBy: "name",
      pageSize: 1000,
      pageToken: state.pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    for (const f of res.data.files ?? []) {
      if (!f.id || !f.name) continue;
      photos.push({
        driveFileId: f.id,
        filename: f.name,
        thumbnailUrl: f.thumbnailLink ?? null,
        mimeType: f.mimeType ?? null,
        sizeBytes: f.size && Number(f.size) <= 2_147_483_647 ? Number(f.size) : null,
      });
    }

    if (res.data.nextPageToken) {
      state.pageToken = res.data.nextPageToken;
    } else {
      // Folder ini selesai: daftarkan subfoldernya ke antrean, lalu pindah ke folder berikutnya.
      const subfolders = await listSubfolderIds(drive, folderId);
      for (const id of subfolders) {
        if (!skip.has(id) && !state.queue.includes(id) && state.queue.length < MAX_QUEUE_LENGTH) {
          state.queue.push(id);
        }
      }
      state.queue.shift();
      state.pageToken = undefined;
    }

    if (photos.length >= maxPhotos || Date.now() - startedAt >= budgetMs) break;
  }

  return {
    photos,
    nextCursor: state.queue.length > 0 ? encodeCursor(state) : null,
  };
}

async function listSubfolderIds(
  drive: Awaited<ReturnType<typeof getDriveClient>>,
  folderId: string
): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = '${FOLDER_MIME}' and trashed = false`,
      fields: "nextPageToken, files(id, name)",
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    for (const f of res.data.files ?? []) {
      if (f.id && f.name !== RESULT_FOLDER_NAME) ids.push(f.id);
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);
  return ids;
}

/**
 * Ambil thumbnailLink terbaru sebuah file. Link yang tersimpan di database
 * kedaluwarsa setelah beberapa jam, jadi dipakai sebagai fallback.
 */
export async function getFreshThumbnailLink(
  fileId: string,
  photographerId: string
): Promise<string | null> {
  const drive = await getDriveClient(photographerId);
  const res = await drive.files.get({
    fileId,
    fields: "thumbnailLink",
    supportsAllDrives: true,
  });
  return res.data.thumbnailLink ?? null;
}

/** Buat folder bernama `name` di dalam `parentFolderId` kalau belum ada (idempotent). */
export async function ensureFolder(
  parentFolderId: string,
  name: string,
  photographerId: string
): Promise<string> {
  const drive = await getDriveClient(photographerId);
  const escapedName = name.replace(/'/g, "\\'");

  const existing = await drive.files.list({
    q: `'${parentFolderId}' in parents and name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  const found = existing.data.files?.[0];
  if (found?.id) return found.id;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
    supportsAllDrives: true,
  });
  if (!created.data.id) throw new Error(`Gagal membuat folder "${name}" di Drive.`);
  return created.data.id;
}

/** Buat folder "Hasil Seleksi" di dalam folder sesi kalau belum ada (idempotent). */
export async function ensureResultFolder(
  parentFolderId: string,
  photographerId: string
): Promise<string> {
  return ensureFolder(parentFolderId, RESULT_FOLDER_NAME, photographerId);
}

/** Email akun Google yang sedang terhubung — dipakai untuk instruksi "share folder ke email ini". */
export async function getConnectedAccountEmail(photographerId: string): Promise<string | null> {
  const drive = await getDriveClient(photographerId);
  const res = await drive.about.get({ fields: "user(emailAddress)" });
  return res.data.user?.emailAddress ?? null;
}

export interface FolderInfo {
  id: string;
  name: string;
}

/**
 * Verifikasi folder Drive bisa dipakai sebagai tujuan hasil seleksi:
 * harus benar-benar ada, harus folder (bukan file biasa), dan akun yang
 * terhubung harus punya izin Editor (canAddChildren) ke dalamnya. Lempar
 * Error dengan pesan yang jelas kalau salah satu syarat tidak terpenuhi.
 */
export async function verifyFolderAccess(
  folderId: string,
  photographerId: string
): Promise<FolderInfo> {
  const drive = await getDriveClient(photographerId);

  let res;
  try {
    res = await drive.files.get({
      fileId: folderId,
      fields: "id, name, mimeType, capabilities(canAddChildren)",
      supportsAllDrives: true,
    });
  } catch {
    throw new Error(
      "Folder tidak ditemukan atau akun yang terhubung tidak punya akses sama sekali ke folder ini."
    );
  }

  if (res.data.mimeType !== "application/vnd.google-apps.folder") {
    throw new Error("Link ini bukan folder Google Drive.");
  }
  if (!res.data.capabilities?.canAddChildren) {
    const email = await getConnectedAccountEmail(photographerId).catch(() => null);
    throw new Error(
      `Akun Google yang terhubung tidak punya izin edit ke folder ini. Minta pemilik folder share sebagai "Editor"${email ? ` ke ${email}` : ""}, lalu coba lagi.`
    );
  }

  return { id: res.data.id ?? folderId, name: res.data.name ?? "(tanpa nama)" };
}

export type CopyMode = "copy" | "shortcut";

/**
 * Salin foto terpilih ke folder hasil. Default "copy" (aman, tidak
 * bergantung file asli). Mode "shortcut" hemat storage (0 byte tambahan)
 * karena hanya bikin pointer ke file asli — cocok untuk akun Drive gratis
 * 15GB yang isinya foto beresolusi besar.
 */
export async function copySelectedPhotos(
  driveFileIds: string[],
  targetFolderId: string,
  photographerId: string,
  mode: CopyMode = "copy"
): Promise<{ driveFileId: string; newFileId: string }[]> {
  const drive = await getDriveClient(photographerId);
  const results: { driveFileId: string; newFileId: string }[] = new Array(driveFileIds.length);
  const CONCURRENCY = 8;

  // Beberapa request paralel supaya ratusan foto terpilih tidak diproses satu per satu.
  for (let start = 0; start < driveFileIds.length; start += CONCURRENCY) {
    const batch = driveFileIds.slice(start, start + CONCURRENCY);
    await Promise.all(
      batch.map(async (fileId, offset) => {
        const index = start + offset;
        if (mode === "shortcut") {
          const shortcut = await drive.files.create({
            requestBody: {
              name: `${String(index + 1).padStart(2, "0")}_${fileId}`,
              mimeType: "application/vnd.google-apps.shortcut",
              shortcutDetails: { targetId: fileId },
              parents: [targetFolderId],
            },
            fields: "id",
          });
          results[index] = { driveFileId: fileId, newFileId: shortcut.data.id ?? "" };
        } else {
          const copy = await drive.files.copy({
            fileId,
            requestBody: { parents: [targetFolderId] },
            fields: "id",
          });
          results[index] = { driveFileId: fileId, newFileId: copy.data.id ?? "" };
        }
      })
    );
  }

  return results;
}

export interface DriveFileStream {
  stream: Readable;
  mimeType: string;
  sizeBytes: number | null;
}

/**
 * Download file asli (bukan thumbnail) langsung dari Drive, di-stream
 * lewat server kita (bukan link publik) — jadi tidak perlu ubah permission
 * file di Drive milik fotografer supaya klien bisa unduh foto pilihannya.
 */
export async function downloadFile(
  fileId: string,
  photographerId: string
): Promise<DriveFileStream> {
  const drive = await getDriveClient(photographerId);

  const [meta, file] = await Promise.all([
    drive.files.get({ fileId, fields: "mimeType, size", supportsAllDrives: true }),
    drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" }
    ),
  ]);

  return {
    stream: file.data as unknown as Readable,
    mimeType: meta.data.mimeType ?? "application/octet-stream",
    sizeBytes: meta.data.size ? Number(meta.data.size) : null,
  };
}
