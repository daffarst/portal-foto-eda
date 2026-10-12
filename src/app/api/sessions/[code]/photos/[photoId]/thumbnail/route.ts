import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getFreshThumbnailLink } from "@/lib/drive";
import { upsizeDriveThumbnail } from "@/lib/utils";

export const maxDuration = 30;

interface RouteParams {
  params: Promise<{ code: string; photoId: string }>;
}

const MIN_SIZE = 200;
const MAX_SIZE = 2400;
const DEFAULT_SIZE = 640;

/**
 * GET /api/sessions/:code/photos/:photoId/thumbnail?size=640 — thumbnail
 * dengan link Drive yang selalu segar. Dipakai sebagai fallback ketika
 * thumbnailLink tersimpan di database sudah kedaluwarsa. Hasilnya di-cache
 * lama oleh browser/CDN, jadi Drive API hanya dipanggil sekali per foto.
 * Publik, tapi photoId divalidasi harus milik sesi dengan kode ini.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { code, photoId } = await params;
  const requested = Number(new URL(request.url).searchParams.get("size"));
  const size = Number.isFinite(requested) && requested > 0
    ? Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(requested)))
    : DEFAULT_SIZE;

  const session = await prisma.session.findUnique({
    where: { sessionCode: code.toUpperCase() },
    select: { id: true, photographerId: true },
  });
  if (!session) {
    return NextResponse.json({ error: "Kode sesi tidak ditemukan." }, { status: 404 });
  }

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, sessionId: session.id },
    select: { driveFileId: true },
  });
  if (!photo) {
    return NextResponse.json({ error: "Foto tidak ditemukan pada sesi ini." }, { status: 404 });
  }

  try {
    const link = await getFreshThumbnailLink(photo.driveFileId, session.photographerId);
    if (!link) {
      return NextResponse.json({ error: "Thumbnail belum tersedia." }, { status: 404 });
    }

    const upstream = await fetch(upsizeDriveThumbnail(link, size));
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Gagal mengambil thumbnail." }, { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mengambil thumbnail.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
