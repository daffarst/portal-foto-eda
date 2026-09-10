"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SessionSettingsFormProps {
  sessionCode: string;
  initialMaxSelections: number | null;
  initialSelectionDeadline: string | null; // ISO string, buat value datetime-local
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SessionSettingsForm({
  sessionCode,
  initialMaxSelections,
  initialSelectionDeadline,
}: SessionSettingsFormProps) {
  const router = useRouter();
  const [maxSelections, setMaxSelections] = useState(
    initialMaxSelections !== null ? String(initialMaxSelections) : ""
  );
  const [selectionDeadline, setSelectionDeadline] = useState(
    toDatetimeLocalValue(initialSelectionDeadline)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/sessions/${sessionCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxSelections: maxSelections ? Number(maxSelections) : null,
          selectionDeadline: selectionDeadline
            ? new Date(selectionDeadline).toISOString()
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan setelan.");
      setMessage("Setelan tersimpan.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan setelan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2"
    >
      <div>
        <label htmlFor="edit-maxSelections" className="mb-1.5 block text-sm text-muted">
          Batas Maksimal Foto
        </label>
        <input
          id="edit-maxSelections"
          type="number"
          min={1}
          value={maxSelections}
          onChange={(e) => setMaxSelections(e.target.value)}
          placeholder="Tanpa batas"
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="edit-selectionDeadline" className="mb-1.5 block text-sm text-muted">
          Deadline Pemilihan Foto
        </label>
        <input
          id="edit-selectionDeadline"
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
      {message && <p className="text-sm text-accent sm:col-span-2">{message}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="cursor-pointer rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 sm:w-fit"
      >
        {isSaving ? "Menyimpan..." : "Simpan Setelan"}
      </button>
    </form>
  );
}
