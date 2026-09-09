import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentPhotographer } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ code: string }>;
}

/**
 * GET /api/sessions/:code — detail sesi + daftar foto untuk galeri klien.
 * Publik (hanya perlu tahu kode sesi), tapi field admin-only (folder Drive)
 * cuma tampil kalau requester adalah fotografer PEMILIK sesi ini.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { code } = await params;
  const currentPhotographer = await getCurrentPhotographer();

  const session = await prisma.session.findUnique({
    where: { sessionCode: code.toUpperCase() },
    include: {
      photos: {
        orderBy: { createdAt: "asc" },
        select: { id: true, filename: true, thumbnailUrl: true },
      },
      selections: { select: { photoId: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Kode sesi tidak ditemukan." }, { status: 404 });
  }

  const isOwner = currentPhotographer?.id === session.photographerId;

  return NextResponse.json({
    session: {
      clientName: session.clientName,
      sessionCode: session.sessionCode,
      status: session.status,
      // driveSourceFolderId hanya relevan untuk fotografer pemilik sesi.
      driveSourceFolderId: isOwner ? session.driveSourceFolderId : undefined,
      driveResultFolderId: isOwner ? session.driveResultFolderId : undefined,
    },
    photos: session.photos,
    selectedPhotoIds: session.selections.map((s) => s.photoId),
  });
}
