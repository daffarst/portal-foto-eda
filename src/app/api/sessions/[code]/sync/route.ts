import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePhotographer } from "@/lib/auth";
import { listPhotosPage } from "@/lib/drive";

export const maxDuration = 60;

interface RouteParams {
  params: Promise<{ code: string }>;
}

/**
 * POST /api/sessions/:code/sync — fotografer pemilik sesi menarik daftar
 * foto dari folder Google Drive sumber, SATU HALAMAN (maks. 1000 foto) per
 * request, lalu di-upsert ke database dalam satu query massal (idempotent
 * by driveFileId, bukan by nama file). Client memanggil berulang dengan
 * `pageToken` dari respons sebelumnya sampai `nextPageToken` bernilai null,
 * sehingga ribuan foto tetap cepat dan tidak kena timeout.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const { code } = await params;
  const session = await prisma.session.findUnique({
    where: { sessionCode: code.toUpperCase() },
  });
  if (!session) {
    return NextResponse.json({ error: "Kode sesi tidak ditemukan." }, { status: 404 });
  }
  if (session.photographerId !== auth.photographer.id) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { pageToken?: unknown } | null;
  const pageToken = typeof body?.pageToken === "string" && body.pageToken ? body.pageToken : undefined;

  try {
    const page = await listPhotosPage(session.driveSourceFolderId, auth.photographer.id, pageToken);

    if (page.photos.length > 0) {
      const rows = JSON.stringify(page.photos);
      await prisma.$executeRaw`
        INSERT INTO "Photo" ("id", "sessionId", "driveFileId", "filename", "thumbnailUrl", "mimeType", "sizeBytes")
        SELECT gen_random_uuid()::text, ${session.id}, v."driveFileId", v."filename", v."thumbnailUrl", v."mimeType", v."sizeBytes"
        FROM jsonb_to_recordset(${rows}::jsonb) AS v(
          "driveFileId" text,
          "filename" text,
          "thumbnailUrl" text,
          "mimeType" text,
          "sizeBytes" integer
        )
        ON CONFLICT ("sessionId", "driveFileId") DO UPDATE SET
          "filename" = EXCLUDED."filename",
          "thumbnailUrl" = EXCLUDED."thumbnailUrl",
          "mimeType" = EXCLUDED."mimeType",
          "sizeBytes" = EXCLUDED."sizeBytes"
      `;
    }

    return NextResponse.json({
      syncedCount: page.photos.length,
      nextPageToken: page.nextPageToken,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mengambil data dari Google Drive.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
