"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readJsonResponse } from "@/lib/http";

interface SessionActionsProps {
  sessionCode: string;
  isFinalized: boolean;
  hasSelections: boolean;
}

export default function SessionActions({
  sessionCode,
  isFinalized,
  hasSelections,
}: SessionActionsProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"copy" | "shortcut">("copy");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setError(null);
    setMessage(null);
    try {
      let total = 0;
      let cursor: string | null = null;
      // Sinkron bertahap (folder + subfolder) supaya ribuan foto tidak timeout.
      do {
        const res: Response = await fetch(`/api/sessions/${sessionCode}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cursor }),
        });
        const data = await readJsonResponse<{ syncedCount: number; nextCursor: string | null }>(
          res,
          "Gagal sync foto dari Drive."
        );
        total += data.syncedCount;
        cursor = data.nextCursor;
        setMessage(
          cursor
            ? `Menyinkronkan... ${total} foto sudah diproses.`
            : `${total} foto berhasil disinkronkan.`
        );
      } while (cursor);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal sync.");
      router.refresh();
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleFinalize() {
    setIsFinalizing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/sessions/${sessionCode}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await readJsonResponse<{ copiedCount: number }>(
        res,
        "Gagal memproses folder hasil seleksi."
      );
      setMessage(`${data.copiedCount} foto berhasil diproses ke folder Hasil Seleksi.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal finalize.");
    } finally {
      setIsFinalizing(false);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing || isFinalized}
        className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors duration-200 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSyncing ? "Menyinkronkan..." : "Sync Foto dari Drive"}
      </button>

      <div className="flex items-center gap-2">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "copy" | "shortcut")}
          disabled={isFinalized}
          className="cursor-pointer rounded-full border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="copy">Copy (aman, dobel storage)</option>
          <option value="shortcut">Shortcut (hemat storage)</option>
        </select>

        <button
          type="button"
          onClick={handleFinalize}
          disabled={isFinalizing || isFinalized || !hasSelections}
          className="cursor-pointer rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFinalizing
            ? "Memproses..."
            : isFinalized
              ? "Sudah Difinalisasi"
              : "Buat Folder Hasil Seleksi"}
        </button>
      </div>

      {message && <p className="w-full text-sm text-accent">{message}</p>}
      {error && (
        <p role="alert" className="w-full text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
