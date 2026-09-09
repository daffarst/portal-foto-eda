import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Layanan",
  description: "Paket fotografi wedding, prewedding, potret keluarga, dan event korporat.",
};

const SERVICES = [
  {
    title: "Wedding",
    description:
      "Dokumentasi hari pernikahan lengkap, dari persiapan hingga resepsi.",
    points: [
      "Tim fotografer & videografer",
      "Semua foto mentah diserahkan via Google Drive",
      "Pemilihan hasil akhir lewat portal seleksi online",
    ],
  },
  {
    title: "Prewedding",
    description: "Sesi foto konsep sebelum hari pernikahan, indoor & outdoor.",
    points: [
      "Konsultasi konsep & lokasi",
      "1-2 lokasi per sesi",
      "Hasil edit dikirim setelah proses seleksi",
    ],
  },
  {
    title: "Potret Keluarga",
    description:
      "Sesi foto keluarga santai maupun formal di studio atau lokasi pilihan.",
    points: [
      "Cocok untuk keluarga besar maupun kecil",
      "Sesi indoor studio atau outdoor",
      "Durasi fleksibel sesuai kebutuhan",
    ],
  },
  {
    title: "Event & Korporat",
    description:
      "Dokumentasi acara perusahaan, ulang tahun, dan momen spesial lainnya.",
    points: [
      "Dokumentasi full-day event",
      "Tim menyesuaikan skala acara",
      "Laporan hasil cepat untuk kebutuhan publikasi",
    ],
  },
];

export default function LayananPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 pb-24 pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Layanan
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Paket Fotografi
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Setiap paket disesuaikan dengan kebutuhan momen Anda — dari
            sesi pribadi hingga acara skala besar.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <h2 className="font-heading text-xl font-medium text-foreground">
                  {service.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {service.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-muted"
                    >
                      <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface px-8 py-12 text-center">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Tertarik dengan salah satu paket?
            </h2>
            <Link
              href="/kontak"
              className="cursor-pointer rounded-full bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
