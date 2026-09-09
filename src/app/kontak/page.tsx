import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi IMAZING VISUAL untuk konsultasi dan booking sesi foto.",
};

const CONTACT_CHANNELS = [
  {
    label: "WhatsApp",
    value: "+62 816-3261-1996",
    href: "https://wa.me/6281632611996",
  },
  {
    label: "Email",
    value: "imazingvisual.new@gmail.com",
    href: "mailto:imazingvisual.new@gmail.com",
  },
  {
    label: "Instagram",
    value: "@imazingvisual_new",
    href: "https://instagram.com/imazingvisual_new",
  },
];

export default function KontakPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 pb-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Kontak
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Mari Berdiskusi
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Konsultasikan tanggal, konsep, dan paket yang Anda butuhkan —
            kami akan membalas secepatnya.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {CONTACT_CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-accent/50"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {channel.label}
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {channel.value}
                </p>
              </a>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-heading text-lg font-medium text-foreground">
              Jam Operasional
            </h2>
            <dl className="mt-3 space-y-1.5 text-sm text-muted">
              <div className="flex justify-between">
                <dt>Senin — Jumat</dt>
                <dd>09.00 — 18.00</dd>
              </div>
              <div className="flex justify-between">
                <dt>Sabtu</dt>
                <dd>09.00 — 18.00</dd>
              </div>
              <div className="flex justify-between">
                <dt>Minggu</dt>
                <dd>Booking khusus</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
