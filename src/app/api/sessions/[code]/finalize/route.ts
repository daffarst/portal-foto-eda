import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePhotographer } from "@/lib/auth";
import { ensureResultFolder, copySelectedPhotos } from "@/lib/drive";

interface RouteParams {
  params: Promise<{ code: string }>;
}

const finalizeSchema = z.object({
  mode: z.enum(["copy", "shortcut"]).default("copy"),
});

/**
 * POST /api/sessions/:code/finalize — fotografer pemilik sesi memicu
 * pembuatan folder "Hasil Seleksi" di Drive dan menyalin (atau shortcut)
 * semua foto yang sudah dipilih klien ke dalamnya.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const { code } = await params;
  const parsed = finalizeSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid." }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { sessionCode: code.toUpperCase() },
    include: { selections: { include: { photo: true } } },
  });
  if (!session) {
    return NextResponse.json({ error: "Kode sesi tidak ditemukan." }, { status: 404 });
  }
  if (session.photographerId !== auth.photographer.id) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }
  if (session.selections.length === 0) {
    return NextResponse.json(
      { error: "Klien belum memilih foto apa pun." },
      { status: 409 }
    );
  }

  try {
    const resultFolderId = await ensureResultFolder(
      session.driveSourceFolderId,
      auth.photographer.id
    );
    const driveFileIds = session.selections.map((s) => s.photo.driveFileId);
    const copied = await copySelectedPhotos(
      driveFileIds,
      resultFolderId,
      auth.photographer.id,
      parsed.data.mode
    );

    await prisma.session.update({
      where: { id: session.id },
      data: { status: "finalized", driveResultFolderId: resultFolderId },
    });

    return NextResponse.json({ resultFolderId, copiedCount: copied.length });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memproses folder hasil seleksi di Google Drive.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
