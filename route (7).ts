import { NextResponse } from "next/server";
import { requirePhotographer } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/drive";

/** GET /api/auth/google — fotografer memulai flow OAuth untuk hubungkan Google Drive. */
export async function GET() {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  return NextResponse.redirect(getGoogleAuthUrl());
}
