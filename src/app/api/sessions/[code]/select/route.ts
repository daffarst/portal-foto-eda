import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ code: string }>;
}

const selectSchema = z.object({
  photoIds: z.array(z.string().min(1)),
});

/**
 * POST /api/sessions/:code/select — klien submit daftar foto pilihan.
 * Body pakai `photoIds` (ID internal, bukan nama file) supaya tidak
 * bergantung pada pencarian ulang by filename di Drive.
 * Bersifat "replace": submit ulang akan menimpa seleksi sebelumnya.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { code } = await params;
  const parsed = selectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Daftar foto pilihan tidak valid." }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { sessionCode: code.toUpperCase() },
  });
  if (!session) {
    return NextResponse.json({ error: "Kode sesi tidak ditemukan." }, { status: 404 });
  }
  if (session.status === "finalized") {
    return NextResponse.json(
      { error: "Sesi ini sudah difinalisasi, seleksi tidak bisa diubah lagi." },
      { status: 409 }
    );
  }

  // Validasi photoIds benar-benar milik sesi ini (cegah klien inject ID sesi lain).
  const validPhotos = await prisma.photo.findMany({
    where: { id: { in: parsed.data.photoIds }, sessionId: session.id },
    select: { id: true },
  });
  if (validPhotos.length !== parsed.data.photoIds.length) {
    return NextResponse.json(
      { error: "Beberapa foto tidak ditemukan pada sesi ini." },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.selection.deleteMany({ where: { sessionId: session.id } }),
    prisma.selection.createMany({
      data: validPhotos.map((p) => ({ sessionId: session.id, photoId: p.id })),
    }),
  ]);

  return NextResponse.json({ selectedCount: validPhotos.length });
}
