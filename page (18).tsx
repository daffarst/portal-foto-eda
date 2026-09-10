import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Camera, Image as ImageIcon, Users, Briefcase, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Layanan",
  description: "Paket fotografi wedding, prewedding, potret keluarga, dan event korporat.",
};

const SERVICES = [
  {
    title: "Wedding",
    description: "Dokumentasi hari pernikahan lengkap, dari persiapan hingga resepsi dengan sentuhan sinematik.",
    icon: Camera,
    points: [
      "2 Fotografer & 1 Videografer",
      "Sesi Full-day (12 Jam)",
      "Akses Eksklusif Portal Seleksi Klien",
      "Foto Master via Cloud & Flashdisk",
    ],
  },
  {
    title: "Prewedding",
    description: "Sesi foto konsep sebelum hari pernikahan, tersedia untuk lokasi indoor maupun outdoor.",
    icon: ImageIcon,
    points: [
      "Konsultasi konsep & lokasi",
      "Maksimal 2 lokasi per sesi",
      "Akses Portal Seleksi Klien",
      "30 Hasil Edit Resolusi Tinggi",
    ],
  },
  {
    title: "Potret Keluarga",
    description: "Sesi foto hangat bersama keluarga di studio, rumah, atau lokasi alam pilihan Anda.",
    icon: Users,
    points: [
      "Sesi santai selama 2-3 jam",
      "Gaya arahan natural (Candid-focused)",
      "Akses Portal Seleksi Klien",
      "Cetak Canvas Premium (1 buah)",
    ],
  },
  {
    title: "Event & Korporat",
    description: "Dokumentasi acara perusahaan, ulang tahun, peluncuran produk, dan momen bisnis.",
    icon: Briefcase,
    points: [
      "Dokumentasi half-day atau full-day",
      "Fokus pada interaksi dan detail acara",
      "Hasil foto diserahkan H+1 via Cloud",
      "Video Highlight 1 Menit",
    ],
  },
];

export default function LayananPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 pb-32 pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent mb-4">
              Layanan Spesialis
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Paket Fotografi
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-lg font-light text-muted">
              Kami merancang setiap paket untuk memastikan momen Anda ditangkap 
              dengan dedikasi, kualitas premium, dan alur kerja yang mudah.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-border bg-surface p-10 transition-all duration-300 hover:-translate-y-2 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-foreground transition-opacity group-hover:opacity-10 group-hover:text-accent">
                    <Icon className="h-32 w-32" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-8 w-8" strokeWidth={1.5} />
                    </div>
                    <h2 className="font-heading text-3xl font-semibold text-foreground mb-4">
                      {service.title}
                    </h2>
                    <p className="text-base font-light leading-relaxed text-muted mb-8">
                      {service.description}
                    </p>
                    
                    <ul className="space-y-4 border-t border-border/50 pt-8">
                      {service.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-center gap-3 text-sm text-foreground/80 font-medium"
                        >
                          <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 overflow-hidden rounded-[3rem] border border-border bg-surface relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,166,107,0.1),transparent_60%)]" />
            <div className="relative flex flex-col items-center gap-6 px-8 py-16 text-center">
              <h2 className="font-heading text-3xl font-bold text-foreground">
                Miliki Cerita Anda Sendiri
              </h2>
              <p className="max-w-xl text-lg text-muted font-light mb-4">
                Punya konsep unik yang ingin diwujudkan? Atau ingin menyesuaikan paket 
                dengan kebutuhan spesifik Anda?
              </p>
              <Link
                href="/kontak"
                className="group flex items-center gap-2 rounded-full bg-foreground px-10 py-5 text-sm font-semibold tracking-wide text-background transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-accent-foreground"
              >
                Konsultasikan Sekarang
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
