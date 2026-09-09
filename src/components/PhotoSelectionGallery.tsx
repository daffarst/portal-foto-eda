"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  filename: string;
  thumbnailUrl: string | null;
}

interface PhotoSelectionGalleryProps {
  sessionCode: string;
  clientName: string;
  status: string;
  photos: Photo[];
  initialSelectedIds: string[];
}

type SubmitState = "idle" | "saving" | "saved" | "error";

export default function PhotoSelectionGallery({
  sessionCode,
  clientName,
  status,
  photos,
  initialSelectedIds,
}: PhotoSelectionGalleryProps) {
  const isFinalized = status === "finalized";
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initialSelectedIds)
  );
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    if (selectedIds.size !== initialSelectedIds.length) return true;
    return initialSelectedIds.some((id) => !selectedIds.has(id));
  }, [selectedIds, initialSelectedIds]);

  function toggle(photoId: string) {
    if (isFinalized) return;
    setSubmitState("idle");
    setSelectedIds((prev) => {
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan seleksi.");
      setSubmitState("saved");
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(err instanceof Error ? err.message : "Gagal menyimpan seleksi.");
    }
  }

  return (
    <main className="flex-1 px-6 pb-32 pt-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-2">
          <p className="text-sm text-muted">Portal Seleksi Foto</p>
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {clientName}
          </h1>
          <p className="text-sm text-muted">
            Kode sesi: <span className="font-mono text-foreground">{sessionCode}</span>
          </p>
          {isFinalized && (
            <p className="mt-2 inline-block w-fit rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Seleksi sudah difinalisasi — hasil sedang disiapkan
            </p>
          )}
        </header>

        {photos.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
            Belum ada foto yang tersedia untuk sesi ini. Silakan hubungi
            fotografer Anda.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const isSelected = selectedIds.has(photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => toggle(photo.id)}
                  disabled={isFinalized}
                  aria-pressed={isSelected}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 bg-surface transition-colors duration-200 disabled:cursor-not-allowed ${
                    isSelected ? "border-accent" : "border-border hover:border-accent/50"
                  }`}
                >
                  {photo.thumbnailUrl ? (
                    <Image
                      src={photo.thumbnailUrl}
                      alt={photo.filename}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center p-2 text-center text-xs text-muted">
                      {photo.filename}
                    </span>
                  )}

                  <span
                    className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-colors duration-200 ${
                      isSelected
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-white/40 bg-black/30 text-transparent"
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!isFinalized && photos.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground">{selectedIds.size}</span> foto
              dipilih
              {errorMessage && (
                <span role="alert" className="ml-3 text-red-400">
                  {errorMessage}
                </span>
              )}
              {submitState === "saved" && !isDirty && (
                <span className="ml-3 text-accent">Tersimpan</span>
              )}
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitState === "saving" || (submitState === "saved" && !isDirty)}
              className="w-full cursor-pointer rounded-full bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {submitState === "saving" ? "Menyimpan..." : "Simpan Seleksi"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
