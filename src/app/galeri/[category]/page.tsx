import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import fs from "fs";
import path from "path";
import GalleryView from "./GalleryView";

export const metadata: Metadata = {
  title: "Galeri Foto",
  description: "Kumpulan karya foto.",
};

export function generateStaticParams() {
  return [
    { category: 'prewedding' },
    { category: 'sangjit' },
    { category: 'pemberkatan' },
    { category: 'wedding' },
    { category: 'maternity' },
    { category: 'birthday' },
    { category: 'graduation' },
  ];
}

export default async function CategoryGalleryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  
  const imagesDirectory = path.join(process.cwd(), "public", "images", "galeri", category);
  let galleryPhotos: { id: number, src: string, label: string }[] = [];
  
  try {
    if (fs.existsSync(imagesDirectory)) {
      const files = fs.readdirSync(imagesDirectory);
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
      
      galleryPhotos = imageFiles.map((file, i) => ({
        id: i + 1,
        src: `/images/galeri/${category}/${file}`,
        label: `${categoryName} Photo ${i + 1}`,
      }));
    }
  } catch (e) {
    console.error(`Gagal membaca folder foto untuk kategori ${category}:`, e);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 pb-32 pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <Link href="/galeri" className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Kategori
            </Link>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Galeri {categoryName}
            </h1>
            <p className="mt-4 text-lg text-muted font-light leading-relaxed">
              Momen-momen indah dari sesi {categoryName.toLowerCase()} yang kami abadikan.
            </p>
          </div>

          {galleryPhotos.length > 0 ? (
            <GalleryView photos={galleryPhotos} />
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl">
              <p className="text-muted mb-2">Belum ada foto untuk kategori ini.</p>
              <p className="text-sm font-mono text-muted/70">
                Silakan masukkan foto ke folder: <br/>
                <code>public/images/galeri/{category}</code>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
