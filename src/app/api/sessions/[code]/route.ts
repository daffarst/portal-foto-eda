import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentPhotographer, requirePhotographer } from "@/lib/auth";

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
      // Batas & deadline perlu diketahui klien, jadi bukan owner-only.
      maxSelections: session.maxSelections,
      selectionDeadline: session.selectionDeadline,
      // driveSourceFolderId hanya relevan untuk fotografer pemilik sesi.
      driveSourceFolderId: isOwner ? session.driveSourceFolderId : undefined,
      driveResultFolderId: isOwner ? session.driveResultFolderId : undefined,
    },
    photos: session.photos,
    selectedPhotoIds: session.selections.map((s) => s.photoId),
  });
}

const updateSessionSchema = z.object({
  maxSelections: z.number().int().positive().nullable().optional(),
  selectionDeadline: z.string().datetime().nullable().optional(),
});

/** PATCH /api/sessions/:code — fotografer pemilik ubah batas maksimal & deadline seleksi. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const { code } = await params;
  const parsed = updateSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid." }, { status: 400 });
  }

  const session = await prisma.session.findUnique({ where: { sessionCode: code.toUpperCase() } });
  if (!session) {
    return NextResponse.json({ error: "Kode sesi tidak ditemukan." }, { status: 404 });
  }
  if (session.photographerId !== auth.photographer.id) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const updated = await prisma.session.update({
    where: { id: session.id },
    data: {
      ...(parsed.data.maxSelections !== undefined && {
        maxSelections: parsed.data.maxSelections,
      }),
      ...(parsed.data.selectionDeadline !== undefined && {
        selectionDeadline: parsed.data.selectionDeadline
          ? new Date(parsed.data.selectionDeadline)
          : null,
      }),
    },
  });

  return NextResponse.json({ session: updated });
}

/** DELETE /api/sessions/:code — fotografer pemilik hapus sesi beserta foto & seleksinya (file di Drive tidak ikut terhapus). */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const { code } = await params;
  const session = await prisma.session.findUnique({ where: { sessionCode: code.toUpperCase() } });
  if (!session) {
    return NextResponse.json({ error: "Kode sesi tidak ditemukan." }, { status: 404 });
  }
  if (session.photographerId !== auth.photographer.id) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  await prisma.session.delete({ where: { id: session.id } });

  return NextResponse.json({ ok: true });
}
