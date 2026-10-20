"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Download, Minus, Plus, Share2, X } from "lucide-react";
import ResilientImage from "@/components/ResilientImage";
import { upsizeDriveThumbnail } from "@/lib/utils";

const PREVIEW_SIZE = 2000;
const SWIPE_THRESHOLD = 50;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

interface PhotoLightboxProps {
  sessionCode: string;
  photo: { id: string; filename: string; thumbnailUrl: string | null };
  isSelected?: boolean;
  onToggleSelect?: () => void;
  limitMessage?: string | null;
  position?: number;
  total?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
}

const roundButton =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40";

export default function PhotoLightbox({
  sessionCode,
  photo,
  isSelected = false,
  onToggleSelect,
  limitMessage,
  position,
  total,
  onPrev,
  onNext,
  onClose,
}: PhotoLightboxProps) {
  const [isHiResLoaded, setIsHiResLoaded] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  // Lightbox hanya dirender setelah klik di klien, jadi aman membaca navigator langsung
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") onPrev?.();
      else if (event.key === "ArrowRight") onNext?.();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null || zoom > MIN_ZOOM) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (deltaX > SWIPE_THRESHOLD) onPrev?.();
    else if (deltaX < -SWIPE_THRESHOLD) onNext?.();
  }

  async function handleShare() {
    try {
      await navigator.share({ title: photo.filename, url: window.location.href });
    } catch {
      // Pengguna membatalkan dialog bagikan
    }
  }

  const downloadUrl = `/api/sessions/${sessionCode}/photos/${photo.id}/download`;
  const thumbnailEndpoint = `/api/sessions/${sessionCode}/photos/${photo.id}/thumbnail`;
  const displayName = photo.filename.replace(/\.[^./\\]+$/, "");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.filename}
      className="fixed inset-0 z-[60] flex flex-col bg-black"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 bg-black px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-semibold text-white">{displayName}</p>
          {position !== undefined && total !== undefined && (
            <p className="text-sm text-white/60">
              {position} / {total}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a href={downloadUrl} aria-label="Unduh foto ini" title="Unduh foto ini" className={roundButton}>
            <Download className="h-5 w-5" />
          </a>
          {canShare && (
            <button type="button" onClick={handleShare} aria-label="Bagikan" title="Bagikan" className={roundButton}>
              <Share2 className="h-5 w-5" />
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Tutup preview" title="Tutup" className={roundButton}>
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        className="relative min-h-0 flex-1"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex overflow-auto">
          <div
            className="relative m-auto shrink-0"
            style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
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
                    className="absolute inset-0 h-full w-full object-contain blur-[2px]"
                  />
                )}
                <ResilientImage
                  src={upsizeDriveThumbnail(photo.thumbnailUrl, PREVIEW_SIZE)}
                  fallbackSrc={`${thumbnailEndpoint}?size=${PREVIEW_SIZE}`}
                  alt={photo.filename}
                  loading="eager"
                  onLoad={() => setIsHiResLoaded(true)}
                  className={`absolute inset-0 h-full w-full object-contain ${isHiResLoaded ? "" : "opacity-0"}`}
                />
              </>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-white/70">{photo.filename}</p>
            )}
          </div>
        </div>

        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Foto sebelumnya"
            className={`${roundButton} absolute left-3 top-1/2 -translate-y-1/2`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            aria-label="Foto berikutnya"
            className={`${roundButton} absolute right-3 top-1/2 -translate-y-1/2`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        <div className="absolute bottom-4 right-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Perbesar"
            className={roundButton}
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Perkecil"
            className={roundButton}
          >
            <Minus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {onToggleSelect && (
        <footer className="shrink-0 bg-black px-4 pb-4 pt-3">
          {limitMessage && (
            <p role="alert" className="mb-2 text-center text-sm text-red-300">
              {limitMessage}
            </p>
          )}
          <button
            type="button"
            onClick={onToggleSelect}
            aria-pressed={isSelected}
            className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-accent text-base font-medium transition-colors duration-200 ${
              isSelected ? "bg-accent text-accent-foreground" : "bg-black text-accent hover:bg-accent/10"
            }`}
          >
            <Check className="h-5 w-5" strokeWidth={2.5} />
            {isSelected ? "Foto terpilih" : "Pilih foto ini"}
          </button>
        </footer>
      )}
    </div>
  );
}
