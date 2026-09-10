import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPhotographer } from "@/lib/auth";
import PhotographerRegisterForm from "@/components/PhotographerRegisterForm";

export default async function AdminRegisterPage() {
  if (await getCurrentPhotographer()) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Daftar Akun Fotografer
        </h1>
        <p className="mt-2 text-sm text-muted">
          Butuh kode undangan dari sesama tim studio untuk mendaftar.
        </p>
        <PhotographerRegisterForm />
        <p className="mt-6 text-center text-sm text-muted">
          Sudah punya akun?{" "}
          <Link
            href="/admin"
            className="cursor-pointer text-accent transition-colors duration-200 hover:opacity-80"
          >
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
