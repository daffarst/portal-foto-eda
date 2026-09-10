"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function PhotographerRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mendaftar.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm text-muted">
          Nama
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-muted">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">Minimal 8 karakter.</p>
      </div>

      <div>
        <label htmlFor="inviteCode" className="mb-1.5 block text-sm text-muted">
          Kode Undangan Tim
        </label>
        <input
          id="inviteCode"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-mono text-foreground outline-none transition-colors duration-200 focus:border-accent"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !name || !email || !password || !inviteCode}
        className="w-full cursor-pointer rounded-xl bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Mendaftar..." : "Daftar"}
      </button>
    </form>
  );
}
