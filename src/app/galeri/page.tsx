import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Kumpulan karya dari sesi wedding, prewedding, potret keluarga, dan event.",
};

const GALLERY_PLACEHOLDER = [
  { label: "Wedding \u2014 The Ritz-Carlton", src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop" },
  { label: "Prewedding \u2014 Outdoor", src: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop" },
  { label: "Potret Keluarga", src: "https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=800&auto=format&fit=crop" },
  { label: "Event Korporat", src: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop" },
  { label: "Wedding \u2014 Golden Hour", src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop" },
  { label: "Prewedding \u2014 Studio", src: "https://images.unsplash.com/photo-1525258946800-98ffdddc2165?q=80&w=800&auto=format&fit=crop" },
  { label: "Potret Keluarga \u2014 Outdoor", src: "https://images.unsplash.com/photo-1581022295087-35e5d32c1c69?q=80&w=800&auto=format&fit=crop" },
  { label: "Wedding \u2014 Resepsi", src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop" },
];

export default function GaleriPage() {
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

          {/* Masonry Layout for Gallery */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {GALLERY_PLACEHOLDER.map((item, index) => (
              <div
                key={index}
                className="group relative w-full break-inside-avoid overflow-hidden rounded-3xl bg-surface-2"
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
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
