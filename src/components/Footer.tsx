import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-heading text-lg font-semibold text-foreground">
            IMAZING VISUAL
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Studio fotografi profesional — wedding, prewedding, dan potret
            keluarga.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-3 font-medium text-foreground">Kontak</p>
            <ul className="space-y-2 text-muted">
              <li>
                <a
                  href="mailto:imazingvisual.new@gmail.com"
                  className="cursor-pointer transition-colors duration-200 hover:text-foreground"
                >
                  imazingvisual.new@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/628163261996"
                  className="cursor-pointer transition-colors duration-200 hover:text-foreground"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-medium text-foreground">Navigasi</p>
            <ul className="space-y-2 text-muted">
              <li>
                <Link
                  href="/layanan"
                  className="cursor-pointer transition-colors duration-200 hover:text-foreground"
                >
                  Layanan
                </Link>
              </li>
              <li>
                <Link
                  href="/galeri"
                  className="cursor-pointer transition-colors duration-200 hover:text-foreground"
                >
                  Galeri
                </Link>
              </li>
              <li>
                <Link
                  href="/kontak"
                  className="cursor-pointer transition-colors duration-200 hover:text-foreground"
                >
                  Kontak
                </Link>
              </li>
              <li>
                <Link
                  href="/portal"
                  className="cursor-pointer transition-colors duration-200 hover:text-foreground"
                >
                  Portal Klien
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-medium text-foreground">Admin</p>
            <ul className="space-y-2 text-muted">
              <li>
                <Link
                  href="/admin"
                  className="cursor-pointer transition-colors duration-200 hover:text-foreground"
                >
                  Login Fotografer
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl text-xs text-muted">
        © {new Date().getFullYear()} IMAZING VISUAL. Semua hak cipta
        dilindungi.
      </p>
    </footer>
  );
}
