"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryView({ photos }: { photos: { id: number, src: string, label: string }[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-4 gap-4 space-y-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative w-full break-inside-avoid overflow-hidden rounded-2xl bg-surface-2 cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <img
              src={photo.src}
              alt={photo.label}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 p-2"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>
          
          <button 
            className="absolute left-2 md:left-6 text-white/70 hover:text-white transition-colors z-50 p-2"
            onClick={prevPhoto}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <div className="relative max-h-full max-w-full flex items-center justify-center">
            <img
              src={photos[selectedIndex].src}
              alt={photos[selectedIndex].label}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <button 
            className="absolute right-2 md:right-6 text-white/70 hover:text-white transition-colors z-50 p-2"
            onClick={nextPhoto}
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>
      )}
    </>
  );
}

