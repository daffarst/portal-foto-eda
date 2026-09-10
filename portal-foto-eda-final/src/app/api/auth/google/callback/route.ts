import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePhotographer } from "@/lib/auth";
import { exchangeCodeForRefreshToken } from "@/lib/drive";

/** GET /api/auth/google/callback — tukar authorization code jadi refresh_token, simpan per fotografer. */
export async function GET(request: NextRequest) {
  const auth = await requirePhotographer();
  if (!auth.ok) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/dashboard?drive_error=missing_code", request.url)
    );
  }

  try {
    const refreshToken = await exchangeCodeForRefreshToken(code);
    await prisma.driveAccount.upsert({
      where: { photographerId: auth.photographer.id },
      update: { refreshToken },
      create: { photographerId: auth.photographer.id, refreshToken },
    });
  } catch {
    return NextResponse.redirect(
      new URL("/admin/dashboard?drive_error=exchange_failed", request.url)
    );
  }

  return NextResponse.redirect(new URL("/admin/dashboard?drive_connected=1", request.url));
}
