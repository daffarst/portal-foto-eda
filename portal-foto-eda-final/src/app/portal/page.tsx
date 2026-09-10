"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PortalEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setIsChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${trimmed}`);
      if (!res.ok) {
        setError("Kode sesi tidak ditemukan. Periksa kembali kode yang Anda terima.");
        return;
      }
      router.push(`/portal/${trimmed}`);
    } catch {
      setError("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-muted transition-colors duration-200 hover:text-foreground"
        >
          ← Kembali ke beranda
        </Link>

        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Portal Seleksi Foto
        </h1>
        <p className="mt-2 text-sm text-muted">
          Masukkan kode sesi yang diberikan oleh fotografer Anda.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="session-code" className="sr-only">
              Kode sesi
            </label>
            <input
              id="session-code"
              name="session-code"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="Contoh: WZDLNW"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-foreground uppercase outline-none transition-colors duration-200 focus:border-accent"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isChecking || !code.trim()}
            className="w-full cursor-pointer rounded-xl bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isChecking ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
