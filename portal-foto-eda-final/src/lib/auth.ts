import { cookies } from "next/headers";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "photographer_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export interface CurrentPhotographer {
  id: string;
  name: string;
  email: string;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET belum di-set di .env");
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Bandingkan dua string tanpa membocorkan panjang lewat timing attack. */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Tetap jalankan compare terhadap buffer sepanjang bufA supaya durasi
    // konsisten walau panjang berbeda (tidak short-circuit).
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function createPhotographerSession(photographerId: string): Promise<void> {
  const payload = `${photographerId}|${Date.now()}`;
  const value = `${payload}.${sign(payload)}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyPhotographerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Ambil fotografer yang sedang login dari cookie, atau null kalau tidak ada/invalid. */
export async function getCurrentPhotographer(): Promise<CurrentPhotographer | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const separatorIndex = raw.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const payload = raw.slice(0, separatorIndex);
  const signature = raw.slice(separatorIndex + 1);

  if (!timingSafeStringEqual(signature, sign(payload))) return null;

  const [photographerId] = payload.split("|");
  if (!photographerId) return null;

  return prisma.photographer.findUnique({
    where: { id: photographerId },
    select: { id: true, name: true, email: true },
  });
}

export async function requirePhotographer(): Promise<
  { ok: true; photographer: CurrentPhotographer } | { ok: false; status: 401 }
> {
  const photographer = await getCurrentPhotographer();
  return photographer ? { ok: true, photographer } : { ok: false, status: 401 };
}
