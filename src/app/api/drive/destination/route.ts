import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePhotographer } from "@/lib/auth";
import { verifyFolderAccess } from "@/lib/drive";
import { extractDriveFolderId } from "@/lib/utils";

/** GET /api/drive/destination — status folder tujuan hasil seleksi milik fotografer yang login. */
export async function GET() {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const driveAccount = await prisma.driveAccount.findUnique({
    where: { photographerId: auth.photographer.id },
  });

  return NextResponse.json({
    connected: Boolean(driveAccount),
    destination: driveAccount
      ? {
          link: driveAccount.resultFolderLink,
          folderId: driveAccount.resultFolderId,
          folderName: driveAccount.resultFolderName,
          error: driveAccount.resultFolderError,
          checkedAt: driveAccount.resultFolderCheckedAt,
        }
      : null,
  });
}

const destinationSchema = z.object({
  link: z.string().trim().min(1, "Link folder Drive wajib diisi."),
});

/**
 * POST /api/drive/destination — simpan sekaligus uji folder tujuan hasil
 * seleksi. Link boleh folder Drive MANAPUN (bukan cuma folder sumber foto),
 * asal folder itu sudah di-share sebagai Editor ke akun Google yang
 * terhubung (lihat verifyFolderAccess di lib/drive.ts).
 */
export async function POST(request: NextRequest) {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const parsed = destinationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid." },
      { status: 400 }
    );
  }

  const driveAccount = await prisma.driveAccount.findUnique({
    where: { photographerId: auth.photographer.id },
  });
  if (!driveAccount) {
    return NextResponse.json(
      { error: "Hubungkan akun Google Drive Anda terlebih dahulu sebelum atur folder tujuan." },
      { status: 409 }
    );
  }

  const folderId = extractDriveFolderId(parsed.data.link);
  if (!folderId) {
    return NextResponse.json(
      { error: "Link Google Drive tidak valid. Pastikan link folder (bukan file) sudah benar." },
      { status: 400 }
    );
  }

  try {
    const folder = await verifyFolderAccess(folderId, auth.photographer.id);
    const updated = await prisma.driveAccount.update({
      where: { photographerId: auth.photographer.id },
      data: {
        resultFolderLink: parsed.data.link,
        resultFolderId: folder.id,
        resultFolderName: folder.name,
        resultFolderError: null,
        resultFolderCheckedAt: new Date(),
      },
    });
    return NextResponse.json({
      destination: {
        link: updated.resultFolderLink,
        folderId: updated.resultFolderId,
        folderName: updated.resultFolderName,
        error: updated.resultFolderError,
        checkedAt: updated.resultFolderCheckedAt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memverifikasi folder Drive.";
    await prisma.driveAccount.update({
      where: { photographerId: auth.photographer.id },
      data: {
        resultFolderLink: parsed.data.link,
        resultFolderId: null,
        resultFolderName: null,
        resultFolderError: message,
        resultFolderCheckedAt: new Date(),
      },
    });
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

/** DELETE /api/drive/destination — hapus folder tujuan kustom, kembali ke perilaku default (per-sesi). */
export async function DELETE() {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  await prisma.driveAccount.updateMany({
    where: { photographerId: auth.photographer.id },
    data: {
      resultFolderLink: null,
      resultFolderId: null,
      resultFolderName: null,
      resultFolderError: null,
      resultFolderCheckedAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}

