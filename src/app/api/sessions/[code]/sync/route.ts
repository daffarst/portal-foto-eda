import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePhotographer } from "@/lib/auth";
import { listPhotosInFolder } from "@/lib/drive";

interface RouteParams {
  params: Promise<{ code: string }>;
}

/**
 * POST /api/sessions/:code/sync — fotografer pemilik sesi menarik ulang
 * daftar foto dari folder Google Drive sumber dan meng-upsert ke database
 * (idempotent by driveFileId, bukan by nama file).
 */
export async function POST(_request: Request, { params }: RouteParams) {
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

  let drivePhotos;
  try {
    drivePhotos = await listPhotosInFolder(session.driveSourceFolderId, auth.photographer.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mengambil data dari Google Drive.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let syncedCount = 0;
  for (const photo of drivePhotos) {
    await prisma.photo.upsert({
      where: {
        sessionId_driveFileId: { sessionId: session.id, driveFileId: photo.driveFileId },
      },
      update: {
        filename: photo.filename,
        thumbnailUrl: photo.thumbnailUrl,
        mimeType: photo.mimeType,
        sizeBytes: photo.sizeBytes,
      },
      create: {
        sessionId: session.id,
        driveFileId: photo.driveFileId,
        filename: photo.filename,
        thumbnailUrl: photo.thumbnailUrl,
        mimeType: photo.mimeType,
        sizeBytes: photo.sizeBytes,
      },
    });
    syncedCount += 1;
  }

  return NextResponse.json({ syncedCount });
}
