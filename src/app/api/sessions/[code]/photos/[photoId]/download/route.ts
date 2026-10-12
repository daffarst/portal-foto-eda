import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { prisma } from "@/lib/db";
import { downloadFile } from "@/lib/drive";

export const maxDuration = 300;

interface RouteParams {
  params: Promise<{ code: string; photoId: string }>;
}

/**
 * GET /api/sessions/:code/photos/:photoId/download — klien unduh foto asli.
 * Publik (klien tidak login), tapi photoId divalidasi harus milik sesi
 * dengan kode ini — jadi tidak bisa dipakai untuk unduh file Drive sembarangan.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { code, photoId } = await params;

  const session = await prisma.session.findUnique({
    where: { sessionCode: code.toUpperCase() },
    select: { id: true, photographerId: true },
  });
  if (!session) {
    return NextResponse.json({ error: "Kode sesi tidak ditemukan." }, { status: 404 });
  }

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, sessionId: session.id },
    select: { driveFileId: true, filename: true },
  });
  if (!photo) {
    return NextResponse.json({ error: "Foto tidak ditemukan pada sesi ini." }, { status: 404 });
  }

  try {
    const { stream, mimeType, sizeBytes } = await downloadFile(photo.driveFileId, session.photographerId);
    const webStream = Readable.toWeb(stream) as ReadableStream;
    const asciiName = photo.filename.replace(/[^\x20-\x7E]|["\\]/g, "_");

    const headers: Record<string, string> = {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(photo.filename)}`,
      "Cache-Control": "private, no-store",
    };
    if (sizeBytes !== null) headers["Content-Length"] = String(sizeBytes);

    return new Response(webStream, { headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mengunduh foto dari Google Drive.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
