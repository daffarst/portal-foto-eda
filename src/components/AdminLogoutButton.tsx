"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors duration-200 hover:text-foreground"
    >
      Keluar
    </button>
  );
}
