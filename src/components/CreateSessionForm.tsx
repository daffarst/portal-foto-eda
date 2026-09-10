"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreateSessionForm() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [driveSourceFolderId, setDriveSourceFolderId] = useState("");
  const [maxSelections, setMaxSelections] = useState("");
  const [selectionDeadline, setSelectionDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setCreatedCode(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          driveSourceFolderId,
          maxSelections: maxSelections ? Number(maxSelections) : null,
          selectionDeadline: selectionDeadline
            ? new Date(selectionDeadline).toISOString()
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal membuat sesi.");
        return;
      }
      setCreatedCode(data.session.sessionCode);
      setClientName("");
      setDriveSourceFolderId("");
      setMaxSelections("");
      setSelectionDeadline("");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="clientName" className="mb-1.5 block text-sm text-muted">
          Nama Klien
        </label>
        <input
          id="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Budi & Sari"
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="driveSourceFolderId" className="mb-1.5 block text-sm text-muted">
          ID Folder Google Drive (sumber foto)
        </label>
        <input
          id="driveSourceFolderId"
          value={driveSourceFolderId}
          onChange={(e) => setDriveSourceFolderId(e.target.value)}
          placeholder="1AbCdEfGhIjKlMnOpQrStUvWxYz"
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">
          Ambil dari URL folder: drive.google.com/drive/folders/
          <span className="text-foreground">ID_INI</span>
        </p>
      </div>

      <div>
        <label htmlFor="maxSelections" className="mb-1.5 block text-sm text-muted">
          Batas Maksimal Foto Dipilih (opsional)
        </label>
        <input
          id="maxSelections"
          type="number"
          min={1}
          value={maxSelections}
          onChange={(e) => setMaxSelections(e.target.value)}
          placeholder="Kosongkan = tanpa batas"
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="selectionDeadline" className="mb-1.5 block text-sm text-muted">
          Deadline Pemilihan Foto (opsional)
        </label>
        <input
          id="selectionDeadline"
          type="datetime-local"
          value={selectionDeadline}
          onChange={(e) => setSelectionDeadline(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400 sm:col-span-2">
          {error}
        </p>
      )}
      {createdCode && (
        <p className="text-sm text-accent sm:col-span-2">
          Sesi dibuat. Kode sesi: <span className="font-mono">{createdCode}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !clientName.trim() || !driveSourceFolderId.trim()}
        className="cursor-pointer rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 sm:w-fit"
      >
        {isSubmitting ? "Membuat..." : "Buat Sesi"}
      </button>
    </form>
  );
}
