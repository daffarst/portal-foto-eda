"use client";

import { useState } from "react";

interface ResilientImageProps {
  src: string | null;
  fallbackSrc: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
}

/**
 * Gambar yang otomatis pindah ke `fallbackSrc` (proxy server dengan link
 * Drive segar) kalau `src` gagal dimuat — mis. thumbnailLink Drive yang
 * tersimpan sudah kedaluwarsa. Tanpa `src`, langsung pakai fallback.
 */
export default function ResilientImage({
  src,
  fallbackSrc,
  alt,
  className,
  loading = "lazy",
  onLoad,
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);
  const useFallback = failed || !src;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- sumber eksternal/proxy dengan ukuran bervariasi
    <img
      key={useFallback ? "fallback" : "primary"}
      src={useFallback ? fallbackSrc : src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={onLoad}
      onError={() => setFailed(true)}
    />
  );
}
