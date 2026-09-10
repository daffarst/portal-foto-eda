import { google } from "googleapis";
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

export async function getConnectedAccountEmail(
  photographerId: string
): Promise<string | null> {
  const drive = await getDriveClient(photographerId);
  const res = await drive.about.get({ fields: "user" });
  return res.data.user?.emailAddress ?? null;
}

export interface DrivePhoto {
  driveFileId: string;
  filename: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
}

/** List semua foto (image/*) di sebuah folder Drive, tidak termasuk yang di-trash. */
export async function listPhotosInFolder(
  folderId: string,
  photographerId: string
): Promise<DrivePhoto[]> {
  const drive = await getDriveClient(photographerId);
  const photos: DrivePhoto[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "nextPageToken, files(id, name, thumbnailLink, mimeType, size)",
      pageSize: 200,
      pageToken,
    });

    for (const f of res.data.files ?? []) {
      if (!f.id || !f.name) continue;
      photos.push({
        driveFileId: f.id,
        filename: f.name,
        thumbnailUrl: f.thumbnailLink ?? null,
        mimeType: f.mimeType ?? null,
        sizeBytes: f.size ? Number(f.size) : null,
      });
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return photos;
}

/** Buat folder "Hasil Seleksi" di dalam folder sesi kalau belum ada (idempotent). */
export async function ensureResultFolder(
  parentFolderId: string,
  photographerId: string
): Promise<string> {
  const drive = await getDriveClient(photographerId);

  const existing = await drive.files.list({
    q: `'${parentFolderId}' in parents and name = '${RESULT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
  });
  const found = existing.data.files?.[0];
  if (found?.id) return found.id;

  const created = await drive.files.create({
    requestBody: {
      name: RESULT_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
  });
  if (!created.data.id) throw new Error("Gagal membuat folder Hasil Seleksi di Drive.");
  return created.data.id;
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
  const results: { driveFileId: string; newFileId: string }[] = [];

  for (const [index, fileId] of driveFileIds.entries()) {
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
      results.push({ driveFileId: fileId, newFileId: shortcut.data.id ?? "" });
    } else {
      const copy = await drive.files.copy({
        fileId,
        requestBody: { parents: [targetFolderId] },
        fields: "id",
      });
      results.push({ driveFileId: fileId, newFileId: copy.data.id ?? "" });
    }
  }

  return results;
}
