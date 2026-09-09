import { NextResponse } from "next/server";
import { destroyPhotographerSession } from "@/lib/auth";

export async function POST() {
  await destroyPhotographerSession();
  return NextResponse.json({ ok: true });
}
