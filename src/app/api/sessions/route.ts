import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePhotographer } from "@/lib/auth";
import { generateSessionCode } from "@/lib/utils";

const createSessionSchema = z.object({
  clientName: z.string().trim().min(1, "Nama klien wajib diisi."),
  driveSourceFolderId: z.string().trim().min(1, "Folder Google Drive wajib diisi."),
  maxSelections: z.number().int().positive().nullable().optional(),
  selectionDeadline: z.string().datetime().nullable().optional(),
});

/** GET /api/sessions — daftar sesi milik fotografer yang login. */
export async function GET() {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    where: { photographerId: auth.photographer.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { photos: true, selections: true } } },
  });

  return NextResponse.json({ sessions });
}

/** POST /api/sessions — buat sesi baru untuk klien, milik fotografer yang login. */
export async function POST(request: NextRequest) {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const parsed = createSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid." },
      { status: 400 }
    );
  }

  // Retry singkat kalau kode sesi kebetulan bentrok (peluang sangat kecil).
  for (let attempt = 0; attempt < 5; attempt++) {
    const sessionCode = generateSessionCode();
    try {
      const session = await prisma.session.create({
        data: {
          photographerId: auth.photographer.id,
          clientName: parsed.data.clientName,
          driveSourceFolderId: parsed.data.driveSourceFolderId,
          maxSelections: parsed.data.maxSelections ?? null,
          selectionDeadline: parsed.data.selectionDeadline
            ? new Date(parsed.data.selectionDeadline)
            : null,
          sessionCode,
        },
      });
      return NextResponse.json({ session }, { status: 201 });
    } catch (err: unknown) {
      const isUniqueConflict =
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "P2002";
      if (!isUniqueConflict) throw err;
    }
  }

  return NextResponse.json(
    { error: "Gagal membuat kode sesi unik, coba lagi." },
    { status: 500 }
  );
}
