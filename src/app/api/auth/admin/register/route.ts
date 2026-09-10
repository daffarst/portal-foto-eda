import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createPhotographerSession, timingSafeStringEqual } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi."),
  email: z.string().trim().toLowerCase().email("Email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
  inviteCode: z.string().min(1, "Kode undangan wajib diisi."),
});

/** POST /api/auth/admin/register — daftar akun fotografer baru (butuh kode undangan tim). */
export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid." },
      { status: 400 }
    );
  }

  const expectedInviteCode = process.env.PHOTOGRAPHER_INVITE_CODE;
  if (!expectedInviteCode) {
    return NextResponse.json(
      { error: "PHOTOGRAPHER_INVITE_CODE belum dikonfigurasi di server." },
      { status: 500 }
    );
  }
  if (!timingSafeStringEqual(parsed.data.inviteCode, expectedInviteCode)) {
    return NextResponse.json({ error: "Kode undangan salah." }, { status: 401 });
  }

  const existing = await prisma.photographer.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const photographer = await prisma.photographer.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
    select: { id: true, name: true, email: true },
  });

  await createPhotographerSession(photographer.id);
  return NextResponse.json({ photographer }, { status: 201 });
}
