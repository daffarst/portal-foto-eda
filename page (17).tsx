import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageSquare, Mail, AtSign, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi Eda Photography untuk konsultasi dan booking sesi foto.",
};

const CONTACT_CHANNELS = [
  {
    label: "WhatsApp",
    value: "+62 800-0000-000",
    href: "https://wa.me/6280000000000",
    icon: MessageSquare,
  },
  {
    label: "Email",
    value: "halo@edaphotography.com",
    href: "mailto:halo@edaphotography.com",
    icon: Mail,
  },
  {
    label: "Instagram",
    value: "@edaphotography",
    href: "https://instagram.com/edaphotography",
    icon: AtSign,
  },
];

export default function KontakPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 pb-32 pt-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent mb-4">
              Kontak & Sapaan
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Mari Berdiskusi
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-lg font-light text-muted">
              Ceritakan visi dokumentasi Anda kepada kami. Tim Eda Photography 
              selalu antusias mendengar setiap kisah baru yang akan diabadikan.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {CONTACT_CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.label}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center rounded-3xl border border-border bg-surface p-10 text-center transition-all duration-300 hover:-translate-y-2 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/5"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <Icon className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted group-hover:text-foreground">
                    {channel.label}
                  </h3>
                  <p className="mt-2 text-lg font-medium text-foreground">
                    {channel.value}
                  </p>
                </a>
              );
            })}
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-3xl border border-border bg-surface-2 p-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-foreground">
                <Clock className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                Jam Operasional
              </h2>
              <dl className="space-y-4 text-base text-muted font-light">
                <div className="flex justify-between border-b border-border/50 pb-4">
                  <dt className="text-foreground font-medium">Senin — Jumat</dt>
                  <dd>09.00 — 18.00</dd>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-4">
                  <dt className="text-foreground font-medium">Sabtu</dt>
                  <dd>09.00 — 15.00</dd>
                </div>
                <div className="flex justify-between pb-2">
                  <dt className="text-accent font-medium">Minggu</dt>
                  <dd className="italic">Booking khusus</dd>
                </div>
              </dl>
            </div>
            
            <div className="flex flex-col rounded-3xl border border-border bg-surface p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(201,166,107,0.1),transparent_60%)]" />
              <div className="relative z-10">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-foreground">
                  <MapPin className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Studio Kami
                </h2>
                <p className="text-base text-muted font-light leading-relaxed mb-8">
                  Jalan Raya Fotografi No. 123,<br />
                  Kawasan Kreatif Selatan,<br />
                  DKI Jakarta, 12345
                </p>
                <div className="inline-block rounded-full bg-surface-2 px-6 py-3 text-sm font-medium text-foreground">
                  Hanya dengan Janji Temu
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
