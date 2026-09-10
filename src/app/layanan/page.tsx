import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Aperture, Camera, Church, Heart, HeartHandshake, PackagePlus, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Layanan",
  description: "Paket fotografi wedding, prewedding, potret keluarga, dan event korporat.",
};

const SERVICES = [
  {
    title: "ALL-IN PACKAGE",
    icon: HeartHandshake,
    description: "Prewedding-Sangjit-Holy Matrimony-Wedding Day.",
    packages: [
      {
        title: "Prewedding",
        description: "1 day Prewedding session (max. 8 hours)",
        points: ["Photo album 20x30, 10sheets", "2 framed canvas 50x60 cm", "2-3 minutes prewedding film", "Flashdrive", "60 edited prewedding photos"],
      },
      {
        title: "Full Day Wedding",
        description: "Wedding day documentation (include Sangjit & Holy Matrimony)",
        points: ["2 Photographers", "3 Videographers", "Highlight cinematic video", "Full coverage video", "Album 20x30cm (23 sheets)", "Flashdrive & DVD"],
      },
    ],
  },
  {
    title: "Prewedding",
    icon: Heart,
    description: "Sesi foto berkonsep untuk menceritakan kisah Anda berdua.",
    packages: [
      {
        title: "Bronze",
        description: "Bronze Package",
        points: ["3 hours session", "Close range area", "1 framed canvas 50x60 cm", "Flashdrive", "30 edited photos"],
      },
      {
        title: "Silver",
        description: "Silver Package",
        points: ["1 day session (max. 8 hours)", "Photo album 20x30, 20 pages", "1 framed canvas 50x60 cm", "1 minute instagram highlight video", "2-3 minutes prewedding film", "Flashdrive", "60 edited photos"],
      },
      {
        title: "Gold",
        description: "Gold Package",
        points: ["1 day session (max. 8 hours)", "Photo album 20x30, 20 pages", "1 framed canvas 60x90 cm", "Flashdrive", "60 edited photos"],
      },
      {
        title: "Silver Plus",
        description: "Silver Plus Package",
        points: ["1 day session (max. 8 hours)", "Photo album 20x30, 20 pages", "1 framed canvas 50x60 cm", "1 framed canvas 60x90 cm", "Flashdrive", "80 edited photos"],
      },
      {
        title: "Gold Plus",
        description: "Gold Plus Package",
        points: ["1 day session (max. 8 hours)", "Photo album 25x30, 20 pages", "1 framed canvas 50x60 cm", "1 framed canvas 60x90 cm", "1 minute instagram highlight video", "2-3 minutes prewedding film", "Flashdrive", "80 edited photos"],
      },
      {
        title: "Platinum",
        description: "Platinum Package",
        points: ["1 day session (max. 8 hours)", "Photo album 30x30, 24 pages", "1 framed canvas 40x60 cm", "1 framed canvas 50x60 cm", "1 framed canvas 60x90 cm", "1 minute instagram highlight video", "2-3 minutes prewedding film", "Aerial shoot (drone)", "Flashdrive", "100 edited photos"],
      },
    ],
  },
  {
    title: "simplycity indoor Sessions",
    icon: Camera,
    description: "simplycity indoor Sessions",
    packages: [
      {
        title: "simplycity",
        description: "simplycity indoor Sessions",
        points: ["90 minutes session", "1 framed canvas 50x60", "edited files stored in Google drive"],
      },
    ],
  },
  {
    title: "before wedding ",
    icon: Church,
    description: "Engagment-Sangjit-Holy Matrimony",
    packages: [
      {
        title: "Engagement/Sangjit/ Holy Matrimony",
        description: "choose one of the three events to be documented",
        points: ["3 hours session ", "1 Photographer", "flashdrive", "Files contained in Google Drive"],
      },
      {
        title: "Engagement/Sangjit & Holy Matrimony",
        description: "2 events to be documented",
        points: ["6 hours session incld. Beautyshoots", "1 Photographer", "1 Videographer", "100+ files edited photos", "1 minute cinematic highlight", "Files contained in Google Drive "],
      },
      {
        title: "Videography",
        description: "Videography services for your special day",
        points: ["1 minute teaser ceremony", "2-3 minutes ceremony film", "full coverage video"],
      },
    ],
  },
  {
    title: "Wedding Day Collections",
    icon: Aperture,
    description: "wedding day documentation (exclude Sangjit & Holy Matrimony)",
    packages: [
      {
        title: "Package 1",
        description: "package 1 description",
        points: ["Wedding day documentation", "2 Photographers", "Album 20x30cm (15 sheets)", "flashdrive"],
      },
      {
        title: "Package 2",
        description: "package 2 description",
        points: ["Wedding day documentation", "2 Photographers", "2 Videographer", "Highlight cinematic video", "Album 20x30cm (20 sheets)", "flashdrive"],
      },
      {
        title: "Packages 3",
        description: "Videography services for your special day",
        points: ["Wedding day documentation", "2 Photographers", "3 Videographer", "Full coverage video", "Highlight cinematic video", "Album 20x30cm (23 sheets)", "flashdrive & DVD"],
      },
    ],
  },
  {
    title: "Extra Items",
    icon: PackagePlus,
    description: "extra services exclude in the package",
    packages: [
      {
        title: "Extra",
        description: "extra items exclude in the package",
        points: ["Extra photography session", "Aerial shoot (drone)", "Video/Photographer crew"],
      },
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
                
                {/* Perbaikan: Melakukan map ke service.packages, bukan service.points */}
                <div className="space-y-6 border-t border-border/50 pt-8">
                  {service.packages.map((pkg, pkgIndex) => (
                    <div key={pkgIndex} className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{pkg.title}</h3>
                      <p className="text-sm text-muted">{pkg.description}</p>
                      <ul className="space-y-2 pt-2">
                        {pkg.points.map((point: string, pointIndex: number) => (
                          <li
                            key={pointIndex}
                            className="flex items-center gap-3 text-sm text-foreground/80 font-medium"
                          >
                            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
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
