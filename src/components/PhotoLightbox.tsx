"use client";

import { useEffect, useState } from "react";
import ResilientImage from "@/components/ResilientImage";
import { upsizeDriveThumbnail } from "@/lib/utils";

const PREVIEW_SIZE = 2000;

interface PhotoLightboxProps {
  sessionCode: string;
  photo: { id: string; filename: string; thumbnailUrl: string | null };
  onClose: () => void;
}

export default function PhotoLightbox({ sessionCode, photo, onClose }: PhotoLightboxProps) {
  const [isHiResLoaded, setIsHiResLoaded] = useState(false);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const downloadUrl = `/api/sessions/${sessionCode}/photos/${photo.id}/download`;
  const thumbnailEndpoint = `/api/sessions/${sessionCode}/photos/${photo.id}/thumbnail`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.filename}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup preview"
        className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
      >
        ✕
      </button>

      <div
        className="relative flex max-h-[80vh] w-full max-w-4xl items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.thumbnailUrl ? (
          <>
            {/* Thumbnail kecil (sudah ter-cache dari grid) tampil dulu sampai versi besar selesai dimuat */}
            {!isHiResLoaded && (
              <ResilientImage
                src={upsizeDriveThumbnail(photo.thumbnailUrl, 480)}
                fallbackSrc={`${thumbnailEndpoint}?size=480`}
                alt={photo.filename}
                loading="eager"
                className="max-h-[80vh] w-auto rounded-lg object-contain blur-[2px]"
              />
            )}
            <ResilientImage
              src={upsizeDriveThumbnail(photo.thumbnailUrl, PREVIEW_SIZE)}
              fallbackSrc={`${thumbnailEndpoint}?size=${PREVIEW_SIZE}`}
              alt={photo.filename}
              loading="eager"
              onLoad={() => setIsHiResLoaded(true)}
              className={`max-h-[80vh] w-auto rounded-lg object-contain ${isHiResLoaded ? "" : "absolute opacity-0"}`}
            />
          </>
        ) : (
          <p className="text-sm text-white/70">{photo.filename}</p>
        )}
      </div>

      <div
        className="mt-4 flex items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-white/70">{photo.filename}</p>
        <a
          href={downloadUrl}
          className="cursor-pointer rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90"
        >
          Unduh Foto Ini
        </a>
      </div>
    </div>
  );
}
