# Portal Foto Eda

Website bisnis fotografi + portal seleksi foto klien. Dibangun dari nol
dengan Next.js (App Router), menggantikan alur manual "kirim nama file
lalu cari manual di Drive" dengan alur end-to-end yang tersambung ke
Google Drive.

## Fitur

- **Landing page** — profil studio, layanan, galeri, alur kerja, kontak.
- **Portal klien** — masuk pakai kode sesi, lihat galeri foto, pilih foto
  favorit, submit seleksi.
- **Dashboard fotografer (multi-akun)** — tiap fotografer punya akun
  sendiri (daftar pakai kode undangan tim), sesi klien & koneksi Google
  Drive terpisah per akun. Bisa buat sesi baru, sambungkan Google Drive,
  sync foto dari folder Drive, lihat hasil seleksi, dan generate folder
  `Hasil Seleksi` otomatis di Drive (copy atau shortcut).

## Kenapa arsitekturnya begini

- **Foto diidentifikasi lewat `driveFileId`, bukan nama file.** Saat
  admin sync folder, setiap foto disimpan dengan ID Drive-nya. Klien
  memilih foto lewat ID internal, bukan nama file — jadi tidak ada
  masalah "cari file berdasarkan nama yang mirip/duplikat" sama sekali.
- **OAuth 2.0 akun pribadi fotografer, bukan Service Account.** Service
  Account punya kuota storage 0 byte dan akan gagal saat membuat/menyalin
  file ke folder pribadi. Lihat komentar di `src/lib/drive.ts`.
- **Satu akun Google Drive per fotografer**, bukan satu akun global.
  Setiap `Session` (sesi klien) terikat ke `photographerId` pembuatnya,
  jadi tiap fotografer hanya melihat & mengelola sesi miliknya sendiri.
- **Mode "copy" vs "shortcut"** saat finalize — copy aman tapi makan
  storage dobel, shortcut hemat storage (0 byte tambahan) karena hanya
  membuat pointer ke file asli. Dipilih admin per sesi.
- Detail lengkap analisis masalah & alternatif arsitektur ada di riwayat
  percakapan pembuatan project ini.

## Setup lokal

```bash
npm install
cp .env.example .env   # isi ADMIN_SESSION_SECRET, PHOTOGRAPHER_INVITE_CODE
npx prisma db push     # atau: npm run db:push
npm run dev
```

Buka `http://localhost:3000`. Daftar akun fotografer pertama di
`/admin/register` (butuh `PHOTOGRAPHER_INVITE_CODE` dari `.env`), lalu
login di `/admin`. Untuk menambah fotografer lain di tim, cukup bagikan
kode undangan yang sama — mereka daftar sendiri lewat `/admin/register`.

## Menghubungkan Google Drive

1. Buat project di [Google Cloud Console](https://console.cloud.google.com/)
   (gratis, tidak perlu billing account).
2. Aktifkan **Google Drive API**.
3. Buat **OAuth Client ID** (tipe: Web application), tambahkan redirect
   URI: `http://localhost:3000/api/auth/google/callback` (sesuaikan saat
   deploy).
4. Isi `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
   di `.env`. Satu OAuth Client ini dipakai bersama oleh semua fotografer
   di tim — yang berbeda per fotografer hanya refresh token hasil login
   mereka masing-masing.
5. Login sebagai fotografer → klik **"Hubungkan Google Drive"** di
   `/admin/dashboard` → login pakai akun Google pribadi (bukan bikin
   Service Account) → refresh token otomatis tersimpan ke database,
   terikat ke akun fotografer yang sedang login.

## Struktur database (Prisma, `prisma/schema.prisma`)

- `Photographer` — akun fotografer (email, password ter-hash). Satu
  studio bisa punya banyak akun.
- `Session` — satu sesi foto per klien (kode sesi, folder sumber Drive,
  folder hasil, status), terikat ke `photographerId` pembuatnya.
- `Photo` — cache metadata foto dari Drive (`driveFileId` unik per
  sesi), supaya galeri klien tidak perlu listing Drive API berulang.
- `Selection` — foto mana yang dipilih klien untuk sesi tertentu.
- `DriveAccount` — refresh token OAuth, satu baris per fotografer
  (`photographerId` unique).

## Testing

```bash
npm test   # node --test, unit test untuk src/lib/utils.ts
npm run lint
npx tsc --noEmit
```

## Deploy ke Vercel

- Database SQLite (`file:./dev.db`) **tidak bisa dipakai di Vercel**
  karena filesystem-nya ephemeral. Ganti `datasource db.provider` di
  `prisma/schema.prisma` ke `postgresql` dan pakai `DATABASE_URL` dari
  Postgres gratis (mis. [Neon](https://neon.tech) atau
  [Supabase](https://supabase.com)), lalu jalankan `prisma db push`
  sekali terhadap database produksi.
- Set semua env var (`ADMIN_SESSION_SECRET`, `PHOTOGRAPHER_INVITE_CODE`,
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`) di
  Vercel Project Settings, dan update `GOOGLE_REDIRECT_URI` +
  redirect URI di Google Cloud Console ke domain produksi.

## Yang masih perlu disesuaikan sebelum go-live

- [ ] Ganti nama bisnis, kontak, dan warna aksen di
      `src/app/layout.tsx` / `src/app/globals.css` sesuai branding asli.
- [ ] Ganti placeholder galeri di landing page (`src/app/page.tsx`)
      dengan foto portofolio asli.
- [ ] `PHOTOGRAPHER_INVITE_CODE` bersifat statis dan dibagikan manual —
      cukup untuk tim kecil, pertimbangkan sistem invite per-email kalau
      tim makin besar atau perlu audit siapa mengundang siapa.
- [ ] Migrasi database ke Postgres sebelum deploy ke Vercel.
