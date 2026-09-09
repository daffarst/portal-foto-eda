import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SERVICES = [
  {
    title: "Wedding",
    description:
      "Dokumentasi hari pernikahan lengkap, dari persiapan hingga resepsi.",
  },
  {
    title: "Prewedding",
    description: "Sesi foto konsep sebelum hari pernikahan, indoor & outdoor.",
  },
  {
    title: "Potret Keluarga",
    description: "Sesi foto keluarga santai maupun formal di studio atau lokasi pilihan.",
  },
  {
    title: "Event & Korporat",
    description: "Dokumentasi acara perusahaan, ulang tahun, dan momen spesial lainnya.",
  },
];

const GALLERY_PREVIEW = [
  { label: "Wedding — Studio A", span: "md:col-span-2 md:row-span-2" },
  { label: "Prewedding — Outdoor", span: "" },
  { label: "Potret Keluarga", span: "" },
];

const STEPS = [
  {
    title: "Sesi Foto",
    description: "Fotografer melakukan sesi foto dan mengunggah semua hasil ke Google Drive.",
  },
  {
    title: "Buka Portal Klien",
    description: "Anda menerima kode sesi, lalu membuka portal untuk melihat semua foto.",
  },
  {
    title: "Pilih Foto Favorit",
    description: "Tandai foto-foto yang Anda inginkan langsung dari galeri online.",
  },
  {
    title: "Terima Hasil Seleksi",
    description: "Tim kami menyiapkan folder khusus berisi foto pilihan Anda di Google Drive.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,166,107,0.15),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-accent">
              Studio Foto Profesional
            </p>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
              Mengabadikan Momen,
              <br />
              Menyerahkan Cerita.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted sm:text-lg">
              Dari sesi foto hingga seleksi hasil akhir — semua dalam satu
              alur kerja yang rapi, cepat, dan mudah diakses kapan saja.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/portal"
                className="cursor-pointer rounded-full bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90"
              >
                Masuk Portal Seleksi Foto
              </Link>
              <Link
                href="/layanan"
                className="cursor-pointer rounded-full border border-border px-8 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface"
              >
                Lihat Layanan
              </Link>
            </div>
          </div>
        </section>

        {/* Layanan (teaser) */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                  Layanan
                </h2>
                <p className="mt-3 max-w-xl text-muted">
                  Paket fotografi yang disesuaikan dengan kebutuhan momen Anda.
                </p>
              </div>
              <Link
                href="/layanan"
                className="cursor-pointer whitespace-nowrap text-sm font-medium text-accent transition-colors duration-200 hover:opacity-80"
              >
                Lihat Semua Layanan →
              </Link>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service) => (
                <Link
                  key={service.title}
                  href="/layanan"
                  className="cursor-pointer rounded-2xl border border-border bg-surface p-6 transition-colors duration-200 hover:border-accent/50"
                >
                  <h3 className="font-heading text-lg font-medium text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Galeri (teaser) */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                  Galeri
                </h2>
                <p className="mt-3 max-w-xl text-muted">
                  Sebagian karya dari sesi-sesi yang telah kami dokumentasikan.
                </p>
              </div>
              <Link
                href="/galeri"
                className="cursor-pointer whitespace-nowrap text-sm font-medium text-accent transition-colors duration-200 hover:opacity-80"
              >
                Lihat Galeri Lengkap →
              </Link>
            </div>

            <div className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-4 md:grid-cols-4">
              {GALLERY_PREVIEW.map((item) => (
                <Link
                  key={item.label}
                  href="/galeri"
                  className={`group relative flex cursor-pointer items-end overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface-2 to-surface p-4 transition-colors duration-200 hover:border-accent/50 ${item.span}`}
                >
                  <span className="relative text-sm font-medium text-muted transition-colors duration-200 group-hover:text-foreground">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Alur kerja / How it works */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Alur Seleksi Foto
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Empat langkah sederhana dari sesi foto sampai hasil akhir di
              tangan Anda.
            </p>

            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="relative">
                  <span className="font-heading text-3xl font-semibold text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-heading text-lg font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-3xl border border-border bg-surface px-8 py-16 text-center">
            <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Sudah punya kode sesi?
            </h2>
            <p className="max-w-md text-muted">
              Masuk ke portal klien untuk melihat dan memilih foto hasil sesi
              Anda.
            </p>
            <Link
              href="/portal"
              className="cursor-pointer rounded-full bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90"
            >
              Masuk Portal Seleksi Foto
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
