import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Camera, Image as ImageIcon, CheckCircle, FolderHeart, ArrowRight } from "lucide-react";

const SERVICES = [
  {
    title: "ALL-IN PACKAGE",
    description: "Prewedding-Sangjit-Holy Matrimony-Wedding Day.",
  },
  {
    title: "Prewedding",
    description: "Sesi foto berkonsep untuk menceritakan kisah Anda berdua.",
  },
  {
    title: "simplycity indoor Sessions",
    description: "simplycity indoor Sessions",
  },
  {
    title: "before wedding ",
    description: "Engagment-Sangjit-Holy Matrimony",
  },
  {
    title: "Wedding Day Collections",
    description: "wedding day documentation (exclude Sangjit & Holy Matrimony)",
  },
  {
    title: "Extra",
    description: "extra items exclude in the package",
  },
];

import fs from "fs";
import path from "path";
import HeroSlideshow from "./HeroSlideshow";

const GALLERY_PREVIEW = [
  { label: "Prewedding", slug: "prewedding", fallback: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop", span: "md:col-span-2 md:row-span-2" },
  { label: "Sangjit", slug: "sangjit", fallback: "https://images.unsplash.com/photo-1544591572-132d7319c5c7?q=80&w=800&auto=format&fit=crop", span: "md:col-span-1 md:row-span-1" },
  { label: "Wedding", slug: "wedding", fallback: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop", span: "md:col-span-1 md:row-span-1" },
];

const STEPS = [
  {
    title: "Sesi Foto Berlangsung",
    description: "Fotografer melakukan pemotretan dan mengunggah preview terbaik ke cloud.",
  },
  {
    title: "Masuk Portal",
    description: "Anda menerima kode unik untuk mengakses galeri eksklusif ini.",
  },
  {
    title: "Pilih Favorit",
    description: "Pilih foto yang ingin diedit secara interaktif tanpa repot.",
  },
  {
    title: "Selesai",
    description: "Hasil foto final dikurasi otomatis dalam folder khusus untuk Anda.",
  },
];

export default function HomePage() {
  const galleryPreviews = GALLERY_PREVIEW.map((cat) => {
    let src = cat.fallback;
    try {
      const dirPath = path.join(process.cwd(), "public", "images", "galeri", cat.slug);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
        if (imageFiles.length > 0) {
          src = `/images/galeri/${cat.slug}/${imageFiles[0]}`;
        }
      }
    } catch (e) {
      // ignore
    }
    return { ...cat, src };
  });

  let slideshowImages: string[] = [];
  try {
    const galeriDir = path.join(process.cwd(), "public", "images", "galeri");
    if (fs.existsSync(galeriDir)) {
      const categories = fs.readdirSync(galeriDir);
      for (const cat of categories) {
        const catPath = path.join(galeriDir, cat);
        if (fs.statSync(catPath).isDirectory()) {
          const files = fs.readdirSync(catPath).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
          slideshowImages.push(...files.map(f => `/images/galeri/${cat}/${f}`));
        }
      }
    }
  } catch(e) {}
  
  if (slideshowImages.length === 0) {
    slideshowImages = [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544591572-132d7319c5c7?q=80&w=1920&auto=format&fit=crop"
    ];
  } else {
    // Shuffle and pick up to 10 images
    slideshowImages = slideshowImages.sort(() => 0.5 - Math.random()).slice(0, 10);
  }

  return (
    <>
      <Navbar />

      <main className="flex-1">
    {/* Hero Section */}
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
      <HeroSlideshow images={slideshowImages} />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,166,107,0.1),transparent_50%)]"
      />
      <div className="relative mx-auto max-w-4xl text-center z-10">
        <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent mb-6">
          Studio Foto Profesional
        </span>
        <h1 className="font-heading text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[5rem]">
          Mengabadikan Momen, <br />
          <span className="text-muted">Menuliskan Cerita.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-base font-light leading-relaxed text-muted sm:text-lg md:text-xl">
          Alur kerja modern untuk klien modern. Mulai dari sesi foto hingga 
          seleksi final dengan pengalaman interaktif dan elegan.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/portal"
            className="group flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-accent-foreground"
          >
            Masuk Portal Klien
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/galeri"
            className="rounded-full border border-border bg-transparent px-8 py-4 text-sm font-medium text-foreground transition-colors duration-300 hover:border-foreground hover:bg-surface"
          >
            Lihat Portfolio
          </Link>
        </div>
      </div>
    </section>

    {/* Layanan Section */}
    <section className="px-6 py-32 bg-surface-2/50 border-y border-border">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 md:flex md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Layanan Kami
            </h2>
            <p className="mt-4 text-lg text-muted">
              Eksplorasi layanan dokumentasi visual yang kami tawarkan dengan dedikasi tinggi.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => {
            return (
              <div
                key={index}
                className="group rounded-3xl border border-border bg-surface p-8 transition-all duration-300 hover:-translate-y-2 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Camera className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Galeri Preview */}
    <section className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sorotan Karya
          </h2>
          <p className="mt-4 mx-auto max-w-xl text-lg text-muted">
            Sebagian keindahan visual yang berhasil kami bingkai secara abadi.
          </p>
        </div>

        <div className="grid auto-rows-[300px] grid-cols-1 md:grid-cols-3 gap-6">
          {galleryPreviews.map((item, index) => (
            <Link
              href={`/galeri/${item.slug}`}
              key={index}
              className={`group relative overflow-hidden rounded-3xl bg-surface-2 block ${item.span}`}
            >
              <img
                src={item.src}
                alt={item.label}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
              <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                <span className="text-lg font-medium tracking-wide text-white">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <Link
            href="/galeri"
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors"
          >
            Lihat Galeri Lengkap
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>

    {/* Workflow Section */}
    <section className="px-6 py-32 bg-surface-2/50 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 md:flex md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Alur Klien Digital
            </h2>
            <p className="mt-4 text-lg text-muted">
              Kami mengadopsi teknologi cloud untuk memudahkan Anda menyeleksi hasil akhir secara nyaman dari rumah.
            </p>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={index} className="relative">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface text-2xl font-light text-muted transition-colors hover:border-accent hover:text-accent">
                0{index + 1}
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="px-6 py-32">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[3rem] border border-border bg-surface relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,166,107,0.15),transparent_60%)]" />
        <div className="relative p-12 md:p-24 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Mulai Seleksi Karya Anda
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted mb-10">
            Punya kode akses sesi? Masuk ke portal interaktif kami sekarang untuk melihat 
            dan menandai momen-momen favorit Anda.
          </p>
          <Link
            href="/portal"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-10 py-5 text-sm font-semibold tracking-wide text-background transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-accent-foreground"
          >
            Masuk Portal Klien Sekarang
          </Link>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</>
  );
}
