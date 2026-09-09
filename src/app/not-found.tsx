import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="font-heading text-6xl font-semibold text-accent">404</p>
      <h1 className="mt-4 font-heading text-xl font-medium text-foreground">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 text-sm text-muted">
        Periksa kembali kode sesi atau tautan yang Anda gunakan.
      </p>
      <Link
        href="/"
        className="mt-8 cursor-pointer rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90"
      >
        Kembali ke beranda
      </Link>
    </main>
  );
}
