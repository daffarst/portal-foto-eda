import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Kumpulan karya dari sesi wedding, prewedding, potret keluarga, dan event.",
};

import Link from "next/link";

import fs from "fs";
import path from "path";

const CATEGORIES = [
  { label: "Prewedding", slug: "prewedding", fallback: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop" },
  { label: "Sangjit", slug: "sangjit", fallback: "https://images.unsplash.com/photo-1544591572-132d7319c5c7?q=80&w=800&auto=format&fit=crop" }, 
  { label: "Pemberkatan", slug: "pemberkatan", fallback: "https://images.unsplash.com/photo-1522060377042-78d103194a2f?q=80&w=800&auto=format&fit=crop" },
  { label: "Wedding", slug: "wedding", fallback: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop" },
  { label: "Maternity", slug: "maternity", fallback: "https://images.unsplash.com/photo-1527814766155-2287c2fb2d35?q=80&w=800&auto=format&fit=crop" },
  { label: "Birthday", slug: "birthday", fallback: "https://images.unsplash.com/photo-1530103862676-de8892b12a15?q=80&w=800&auto=format&fit=crop" },
  { label: "Graduation", slug: "graduation", fallback: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop" },
];

export default function GaleriPage() {
  const galleryCategories = CATEGORIES.map((cat) => {
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
  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 pb-32 pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 md:flex md:items-end md:justify-between text-center md:text-left">
            <div className="max-w-2xl mx-auto md:mx-0">
              <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent mb-4">
                Karya Visual
              </span>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Sorotan Galeri
              </h1>
              <p className="mt-4 text-lg text-muted font-light leading-relaxed">
                Sebagian mahakarya dokumentasi dari momen-momen berharga yang pernah kami tangkap dan abadikan selamanya.
              </p>
            </div>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryCategories.map((item, index) => (
              <Link
                href={`/galeri/${item.slug}`}
                key={index}
                className="group relative w-full break-inside-avoid overflow-hidden rounded-3xl bg-surface-2 block"
              >
                <img
                  src={item.src}
                  alt={item.label}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Details on Hover */}
                <div className="absolute bottom-0 left-0 w-full p-8 transform translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium tracking-wide text-white">
                      {item.label}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
