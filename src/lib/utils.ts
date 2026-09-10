// Alfabet tanpa karakter yang gampang tertukar (0/O, 1/I/L) supaya kode
// sesi nyaman dibacakan/diketik ulang oleh klien.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateSessionCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function slugifyClientName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Google Drive thumbnailLink diakhiri "=s220" (atau ukuran lain). Ganti
 * jadi ukuran lebih besar untuk preview, tanpa perlu download file asli.
 */
export function upsizeDriveThumbnail(url: string, size = 1600): string {
  return /=s\d+$/.test(url) ? url.replace(/=s\d+$/, `=s${size}`) : url;
}

/**
 * Ekstrak folder ID dari berbagai bentuk link Google Drive, atau terima
 * langsung raw ID kalau user paste ID-nya saja. Return null kalau format
 * tidak dikenali sama sekali.
 *
 * Bentuk yang didukung:
 *   https://drive.google.com/drive/folders/<ID>?usp=sharing
 *   https://drive.google.com/drive/u/0/folders/<ID>
 *   https://drive.google.com/open?id=<ID>
 *   https://drive.google.com/drive/folders/<ID>/edit
 *   <ID> (raw, tanpa URL sama sekali)
 */
export function extractDriveFolderId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const folderPathMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderPathMatch) return folderPathMatch[1];

  const queryIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryIdMatch) return queryIdMatch[1];

  // Bukan URL sama sekali — anggap user paste ID mentah kalau formatnya
  // masuk akal (Drive ID: alfanumerik + "-"/"_", biasanya 25+ karakter).
  if (!trimmed.includes("/") && /^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}
