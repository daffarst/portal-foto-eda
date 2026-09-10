"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface DriveDestinationFormProps {
  connectedEmail: string | null;
  initialLink: string | null;
  initialFolderName: string | null;
  initialError: string | null;
  initialCheckedAt: string | null; // ISO
}

export default function DriveDestinationForm({
  connectedEmail,
  initialLink,
  initialFolderName,
  initialError,
  initialCheckedAt,
}: DriveDestinationFormProps) {
  const router = useRouter();
  const [link, setLink] = useState(initialLink ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [folderName, setFolderName] = useState(initialFolderName);
  const [error, setError] = useState(initialError);
  const [checkedAt, setCheckedAt] = useState(initialCheckedAt);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/drive/destination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memverifikasi folder.");
        setFolderName(null);
        return;
      }
      setFolderName(data.destination.folderName);
      setCheckedAt(data.destination.checkedAt);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClear() {
    setIsSaving(true);
    try {
      await fetch("/api/drive/destination", { method: "DELETE" });
      setLink("");
      setFolderName(null);
      setError(null);
      setCheckedAt(null);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label htmlFor="destinationLink" className="mb-1.5 block text-sm text-muted">
          Link Folder Google Drive Tujuan
        </label>
        <input
          id="destinationLink"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://drive.google.com/drive/folders/..."
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
        {connectedEmail && (
          <p className="mt-1.5 text-xs text-muted">
            Folder boleh dari akun Google manapun — cukup share sebagai{" "}
            <span className="text-foreground">Editor</span> ke{" "}
            <span className="font-mono text-foreground">{connectedEmail}</span>.
          </p>
        )}
      </div>

      {folderName && !error && (
        <p className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          ✓ Terhubung ke folder: <span className="font-medium">{folderName}</span>
          {checkedAt && (
            <span className="block text-xs opacity-80">
              Diuji: {new Date(checkedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}
      {!folderName && !error && (
        <p className="text-xs text-muted">
          Belum diatur — hasil seleksi akan disimpan sebagai subfolder di
          dalam folder sumber foto masing-masing sesi (default).
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving || !link.trim()}
          className="cursor-pointer rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Menguji..." : "Simpan & Uji Koneksi"}
        </button>
        {(folderName || error) && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isSaving}
            className="cursor-pointer rounded-full border border-border px-5 py-2 text-sm text-muted transition-colors duration-200 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hapus
          </button>
        )}
      </div>
    </form>
  );
}
