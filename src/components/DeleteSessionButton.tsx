"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { readJsonResponse } from "@/lib/http";

interface DeleteSessionButtonProps {
  sessionCode: string;
  clientName: string;
  /** Halaman tujuan setelah sesi terhapus; kalau kosong, halaman saat ini di-refresh. */
  redirectTo?: string;
  variant?: "icon" | "full";
}

export default function DeleteSessionButton({
  sessionCode,
  clientName,
  redirectTo,
  variant = "full",
}: DeleteSessionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Hapus sesi "${clientName}" (${sessionCode})?\n\nSemua data foto dan pilihan klien di portal akan dihapus permanen, dan kode sesi tidak bisa dipakai lagi. File asli di Google Drive tidak ikut terhapus.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionCode}`, { method: "DELETE" });
      await readJsonResponse(res, "Gagal menghapus sesi.");
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus sesi.");
      setIsDeleting(false);
    }
  }

  return (
    <div className={variant === "icon" ? "inline-flex flex-col items-end" : "flex flex-col items-start"}>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={`Hapus sesi ${clientName}`}
        title="Hapus sesi"
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-red-400/40 text-red-400 transition-colors duration-200 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50 ${
          variant === "icon" ? "h-9 w-9 justify-center" : "px-4 py-2 text-sm"
        }`}
      >
        <Trash2 className="h-4 w-4" />
        {variant === "full" && (isDeleting ? "Menghapus..." : "Hapus Sesi")}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
