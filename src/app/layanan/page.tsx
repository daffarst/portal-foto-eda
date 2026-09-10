import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "Pilihan layanan fotografi wedding, prewedding, dan before wedding.",
};

const SERVICES = [
  {
    title: "ALL-IN PACKAGE",
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
      <main className="flex-1 px-6 pb-24 pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Layanan
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Paket Fotografi
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Pilih klasifikasi layanan yang paling sesuai dengan rangkaian
            momen pernikahan Anda.
          </p>

          <div className="mt-12 space-y-12">
            {SERVICES.map((service) => (
              <section key={service.title} aria-labelledby={`${service.title}-title`}>
                <div className="mb-5 border-b border-border pb-4">
                  <h2
                    id={`${service.title}-title`}
                    className="font-heading text-2xl font-semibold text-foreground"
                  >
                    {service.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{service.description}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {service.packages.map((servicePackage) => (
                    <div
                      key={servicePackage.title}
                      className="rounded-2xl border border-border bg-surface p-5"
                    >
                      <h3 className="font-heading text-lg font-medium text-foreground">
                        {servicePackage.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {servicePackage.description}
                      </p>
                      <ul className="mt-4 space-y-2">
                        {servicePackage.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-2 text-sm text-muted"
                          >
                            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface px-8 py-12 text-center">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Tertarik dengan salah satu paket?
            </h2>
            <Link
              href="/kontak"
              className="cursor-pointer rounded-full bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
