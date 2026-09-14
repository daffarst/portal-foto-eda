"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/layanan", label: "Layanan" },
  { href: "/galeri", label: "Galeri" },
  { href: "/kontak", label: "Kontak" },
];

// Jarak scroll minimum sebelum navbar dianggap "sudah discroll" (hindari
// jitter waktu scroll cuma bergeser 1-2px).
const SCROLLED_THRESHOLD = 24;
// Jarak scroll ke bawah minimum sebelum navbar disembunyikan — supaya
// tidak langsung hilang begitu user baru mulai scroll dikit.
const HIDE_THRESHOLD = 120;

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      setIsScrolled(currentScrollY > SCROLLED_THRESHOLD);

      if (currentScrollY < HIDE_THRESHOLD) {
        setIsHidden(false);
      } else if (delta > 4) {
        setIsHidden(true);
        setIsMobileMenuOpen(false); // Close menu when scrolling down
      } else if (delta < -4) {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-4 top-4 z-50 mx-auto max-w-6xl transition-transform duration-300 ease-out ${
        isHidden ? "-translate-y-[calc(100%+1rem)]" : "translate-y-0"
      }`}
    >
      <nav
        className={`relative flex items-center justify-between rounded-full border px-6 backdrop-blur-md transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? "border-border bg-surface py-2.5 shadow-lg shadow-black/5"
            : "border-border/60 bg-surface/70 py-3"
        }`}
      >
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          IMAZING VISUAL
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`text-sm transition-colors duration-200 hover:text-foreground ${
                    isActive ? "text-foreground" : "text-muted"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
          <Link
            href="/portal"
            className="hidden md:block cursor-pointer rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90"
          >
            Portal Klien
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-1 hover:opacity-80 transition-opacity"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 rounded-2xl border border-border bg-surface p-4 shadow-lg md:hidden flex flex-col gap-4 backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-200">
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl text-sm transition-colors duration-200 ${
                      isActive ? "bg-accent/10 text-accent font-semibold" : "text-muted hover:bg-surface-2 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/portal"
            className="mt-2 block cursor-pointer rounded-xl bg-accent px-5 py-3 text-center text-sm font-medium text-accent-foreground transition-colors duration-200 hover:opacity-90"
          >
            Portal Klien
          </Link>
        </div>
      )}
    </header>
  );
}
