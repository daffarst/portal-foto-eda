import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePhotographer } from "@/lib/auth";
import { listPhotosTree } from "@/lib/drive";

export const maxDuration = 60;

interface RouteParams {
  params: Promise<{ code: string }>;
}

/**
 * POST /api/sessions/:code/sync — fotografer pemilik sesi menarik daftar
 * foto dari folder Google Drive sumber BESERTA semua subfolder-nya, dibaca
 * bertahap (~500+ foto per request), lalu di-upsert ke database dalam satu
 * query massal (idempotent by driveFileId, bukan by nama file). Client
 * memanggil berulang dengan `cursor` dari respons sebelumnya sampai
 * `nextCursor` bernilai null, sehingga ribuan foto tetap cepat dan tidak
 * kena timeout.
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

  const body = (await request.json().catch(() => null)) as { cursor?: unknown } | null;
  const cursor = typeof body?.cursor === "string" && body.cursor ? body.cursor : undefined;

  try {
    const driveAccount = await prisma.driveAccount.findUnique({
      where: { photographerId: auth.photographer.id },
      select: { resultFolderId: true },
    });
    const skipFolderIds = [session.driveResultFolderId, driveAccount?.resultFolderId].filter(
      (id): id is string => Boolean(id)
    );

    const page = await listPhotosTree(session.driveSourceFolderId, auth.photographer.id, {
      cursor,
      skipFolderIds,
    });

    // File yang punya beberapa parent bisa muncul dua kali; ON CONFLICT tidak boleh kena baris sama dalam satu query.
    const uniquePhotos = [...new Map(page.photos.map((p) => [p.driveFileId, p])).values()];

    if (uniquePhotos.length > 0) {
      const rows = JSON.stringify(uniquePhotos);
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
      syncedCount: uniquePhotos.length,
      nextCursor: page.nextCursor,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mengambil data dari Google Drive.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
