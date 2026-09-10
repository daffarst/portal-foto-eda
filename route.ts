import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createPhotographerSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid." },
      { status: 400 }
    );
  }

  const photographer = await prisma.photographer.findUnique({
    where: { email: parsed.data.email },
  });

  // Pesan error disamakan (bukan "email tidak ditemukan" vs "password
  // salah") supaya tidak bocorkan email mana saja yang terdaftar.
  const isValid =
    photographer && (await verifyPassword(parsed.data.password, photographer.passwordHash));
  if (!isValid || !photographer) {
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  await createPhotographerSession(photographer.id);
  return NextResponse.json({
    photographer: { id: photographer.id, name: photographer.name, email: photographer.email },
  });
}
