import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Kumpulan karya dari sesi wedding, prewedding, potret keluarga, dan event.",
};

const GALLERY_PLACEHOLDER = [
  { label: "Wedding — Studio A", span: "md:col-span-2 md:row-span-2" },
  { label: "Prewedding — Outdoor", span: "" },
  { label: "Potret Keluarga", span: "" },
  { label: "Event Korporat", span: "" },
  { label: "Wedding — Golden Hour", span: "md:col-span-2" },
  { label: "Prewedding — Studio", span: "" },
  { label: "Potret Keluarga — Outdoor", span: "" },
  { label: "Wedding — Resepsi", span: "md:col-span-2" },
  { label: "Event — Ulang Tahun", span: "" },
];

export default function GaleriPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 pb-24 pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Galeri
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Karya Kami
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Sebagian hasil dokumentasi dari sesi-sesi yang telah kami
            kerjakan.
          </p>

          <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4">
            {GALLERY_PLACEHOLDER.map((item) => (
              <div
                key={item.label}
                className={`group relative flex items-end overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface-2 to-surface p-4 ${item.span}`}
              >
                <span className="relative text-sm font-medium text-muted transition-colors duration-200 group-hover:text-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            * Placeholder galeri — ganti dengan foto portofolio asli sebelum publish.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
