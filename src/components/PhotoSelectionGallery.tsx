"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, Save, FolderHeart, ZoomIn } from "lucide-react";
import PhotoLightbox from "@/components/PhotoLightbox";
import ResilientImage from "@/components/ResilientImage";
import { readJsonResponse } from "@/lib/http";
import { upsizeDriveThumbnail } from "@/lib/utils";

const PAGE_SIZE = 60;
const GRID_THUMB_SIZE = 480;

interface Photo {
  id: string;
  filename: string;
  thumbnailUrl: string | null;
}

interface PhotoSelectionGalleryProps {
  sessionCode: string;
  clientName: string;
  status: string;
  maxSelections: number | null;
  selectionDeadline: string | null;
  isPastDeadline: boolean;
  photos: Photo[];
  initialSelectedIds: string[];
}

type SubmitState = "idle" | "saving" | "saved" | "error";

export default function PhotoSelectionGallery({
  sessionCode,
  clientName,
  status,
  maxSelections,
  selectionDeadline,
  isPastDeadline,
  photos,
  initialSelectedIds,
}: PhotoSelectionGalleryProps) {
  const isFinalized = status === "finalized";
  const isLocked = isFinalized || isPastDeadline;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initialSelectedIds)
  );
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const previewPhoto = previewIndex !== null ? photos[previewIndex] ?? null : null;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Render foto bertahap saat scroll supaya ribuan foto tidak membebani browser.
  const hasMore = visibleCount < photos.length;
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  const isDirty = useMemo(() => {
    if (selectedIds.size !== initialSelectedIds.length) return true;
    return initialSelectedIds.some((id) => !selectedIds.has(id));
  }, [selectedIds, initialSelectedIds]);

  function toggle(photoId: string) {
    if (isLocked) return;
    setSubmitState("idle");
    setSelectedIds((prev) => {
      const isAdding = !prev.has(photoId);
      if (isAdding && maxSelections !== null && prev.size >= maxSelections) {
        setLimitMessage(`Maksimal ${maxSelections} foto yang boleh dipilih.`);
        return prev;
      }
      setLimitMessage(null);
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitState("saving");
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/sessions/${sessionCode}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: Array.from(selectedIds) }),
      });
      await readJsonResponse(res, "Gagal menyimpan seleksi.");
      setSubmitState("saved");
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(err instanceof Error ? err.message : "Gagal menyimpan seleksi.");
    }
  }

  return (
    <main className="flex-1 px-6 pb-40 pt-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 flex flex-col gap-2 border-b border-border pb-8">
          <p className="text-sm tracking-widest uppercase text-accent font-semibold">Portal Seleksi Foto</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {clientName}
          </h1>
          <p className="text-base text-muted mt-2">
            Kode sesi Anda: <span className="font-mono text-foreground bg-surface-2 px-2 py-1 rounded-md">{sessionCode}</span>
          </p>

          {(maxSelections !== null || selectionDeadline) && (
            <p className="text-sm text-muted">
              {maxSelections !== null && <>Batas maksimal: {maxSelections} foto</>}
              {maxSelections !== null && selectionDeadline && " · "}
              {selectionDeadline && (
                <>
                  Deadline:{" "}
                  {new Date(selectionDeadline).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </>
              )}
            </p>
          )}

          {isFinalized && (
            <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <CheckCircle2 className="h-4 w-4" />
              Seleksi difinalisasi — hasil sedang disiapkan
            </div>
          )}
          {!isFinalized && isPastDeadline && (
            <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-red-400/40 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-400">
              Batas waktu pemilihan sudah berakhir
            </div>
          )}
        </header>

        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-surface py-20 px-8 text-center">
            <FolderHeart className="h-12 w-12 text-muted mb-4" />
            <h3 className="text-xl font-heading font-medium text-foreground mb-2">Belum Ada Foto</h3>
            <p className="text-sm text-muted max-w-md">
              Fotografer belum mengunggah foto untuk sesi ini. Silakan hubungi fotografer Anda.
            </p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {photos.slice(0, visibleCount).map((photo, index) => {
              const isSelected = selectedIds.has(photo.id);
              return (
                <div
                  key={photo.id}
                  className={`group relative w-full overflow-hidden rounded-2xl bg-surface transition-all duration-300 ${
                    isSelected ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : "hover:ring-2 hover:ring-accent/50 hover:ring-offset-2 hover:ring-offset-background"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(photo.id)}
                    disabled={isLocked}
                    aria-pressed={isSelected}
                    aria-label={`Pilih ${photo.filename}`}
                    className="block aspect-[4/3] w-full disabled:cursor-not-allowed"
                  >
                    <ResilientImage
                      src={photo.thumbnailUrl ? upsizeDriveThumbnail(photo.thumbnailUrl, GRID_THUMB_SIZE) : null}
                      fallbackSrc={`/api/sessions/${sessionCode}/photos/${photo.id}/thumbnail?size=${GRID_THUMB_SIZE}`}
                      alt={photo.filename}
                      className="h-full w-full bg-surface-2 object-cover"
                    />

                    {/* Overlay gelap hanya saat hover (perangkat dengan mouse) */}
                    <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isSelected ? "opacity-20" : "opacity-0 [@media(hover:hover)]:group-hover:opacity-100"}`} />

                    {/* Indikator pilih: selalu tampil di mobile/layar sentuh, hover di desktop */}
                    <div
                      className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 transform ${
                        isSelected
                          ? "bg-accent text-accent-foreground scale-100 opacity-100"
                          : "bg-black/60 text-white border border-white/40 backdrop-blur-sm opacity-100 scale-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:scale-75 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:scale-100"
                      }`}
                      aria-hidden
                    >
                      <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                    </div>

                    {/* Nama file saat hover */}
                    <div className="absolute bottom-0 left-0 hidden w-full p-4 translate-y-full bg-gradient-to-t from-black/80 to-transparent transition-transform duration-300 [@media(hover:hover)]:block group-hover:translate-y-0">
                      <p className="text-xs text-white/90 truncate">{photo.filename}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewIndex(index);
                    }}
                    aria-label={`Perbesar ${photo.filename}`}
                    className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/60 text-white opacity-100 backdrop-blur-sm transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                  >
                    <ZoomIn className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-10 text-sm text-muted">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memuat foto lainnya ({visibleCount} dari {photos.length})
            </div>
          )}
          </>
        )}
      </div>

      {previewPhoto && previewIndex !== null && (
        <PhotoLightbox
          key={previewPhoto.id}
          sessionCode={sessionCode}
          photo={previewPhoto}
          isSelected={selectedIds.has(previewPhoto.id)}
          onToggleSelect={isLocked ? undefined : () => toggle(previewPhoto.id)}
          limitMessage={limitMessage}
          position={previewIndex + 1}
          total={photos.length}
          onPrev={previewIndex > 0 ? () => setPreviewIndex(previewIndex - 1) : undefined}
          onNext={previewIndex < photos.length - 1 ? () => setPreviewIndex(previewIndex + 1) : undefined}
          onClose={() => setPreviewIndex(null)}
        />
      )}

      {!isLocked && photos.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/80 backdrop-blur-xl px-6 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 font-heading font-semibold text-foreground">
                {selectedIds.size}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Foto Dipilih{maxSelections !== null ? ` (maks. ${maxSelections})` : ""}
                </p>
                <p className="text-xs text-muted">
                  {limitMessage ?? "Ketuk foto atau ikon centang untuk memilih · ikon kaca pembesar untuk memperbesar"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {errorMessage && (
                <span role="alert" className="text-sm text-red-400 font-medium">
                  {errorMessage}
                </span>
              )}
              {submitState === "saved" && !isDirty && (
                <span className="text-sm text-green-500 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Tersimpan
                </span>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitState === "saving" || !isDirty}
                className="flex items-center gap-2 rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-all hover:scale-105 hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitState === "saving" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Pilihan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
