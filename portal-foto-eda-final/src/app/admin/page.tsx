import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPhotographer } from "@/lib/auth";
import AdminLoginForm from "@/components/AdminLoginForm";

export default async function AdminLoginPage() {
  if (await getCurrentPhotographer()) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Login Fotografer
        </h1>
        <p className="mt-2 text-sm text-muted">
          Masuk untuk mengelola sesi dan hasil seleksi klien.
        </p>
        <AdminLoginForm />
        <p className="mt-6 text-center text-sm text-muted">
          Belum punya akun?{" "}
          <Link
            href="/admin/register"
            className="cursor-pointer text-accent transition-colors duration-200 hover:opacity-80"
          >
            Daftar dengan kode undangan tim
          </Link>
        </p>
      </div>
    </main>
  );
}
