import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPhotographer } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getConnectedAccountEmail } from "@/lib/drive";
import CreateSessionForm from "@/components/CreateSessionForm";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import DriveDestinationForm from "@/components/DriveDestinationForm";
import DeleteSessionButton from "@/components/DeleteSessionButton";

interface PageProps {
  searchParams: Promise<{ drive_connected?: string; drive_error?: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  finalized: "Selesai",
};

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const photographer = await getCurrentPhotographer();
  if (!photographer) redirect("/admin");

  const { drive_connected, drive_error } = await searchParams;

  const [sessions, driveAccount] = await Promise.all([
    prisma.session.findMany({
      where: { photographerId: photographer.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { photos: true, selections: true } } },
    }),
    prisma.driveAccount.findUnique({ where: { photographerId: photographer.id } }),
  ]);

  const connectedEmail = driveAccount
    ? await getConnectedAccountEmail(photographer.id).catch(() => null)
    : null;

  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Dashboard Fotografer
            </h1>
            <p className="mt-1 text-sm text-muted">
              Masuk sebagai <span className="text-foreground">{photographer.name}</span> (
              {photographer.email})
            </p>
          </div>
          <AdminLogoutButton />
        </div>

        {drive_connected && (
          <p className="mt-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
            Akun Google Drive berhasil terhubung.
          </p>
        )}
        {drive_error && (
          <p className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-400">
            Gagal menghubungkan Google Drive. Coba lagi.
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-medium text-foreground">
                Koneksi Google Drive
              </h2>
              <p className="mt-1 text-sm text-muted">
                {driveAccount
                  ? "Akun Drive terhubung — folder sesi & hasil seleksi dapat diproses otomatis."
                  : "Belum ada akun Drive terhubung. Hubungkan akun Google pribadi Anda (bukan Service Account)."}
              </p>
            </div>
            <a
              href="/api/auth/google"
              className="cursor-pointer whitespace-nowrap rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-2"
            >
              {driveAccount ? "Sambungkan Ulang" : "Hubungkan Google Drive"}
            </a>
          </div>
        </section>

        {driveAccount && (
          <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-heading text-lg font-medium text-foreground">
              Folder Tujuan Hasil Seleksi
            </h2>
            <p className="mt-1 text-sm text-muted">
              Opsional. Boleh diisi link folder Drive dari akun mana pun
              (folder klien, folder tim, dll) — tidak harus folder sumber
              foto sesi.
            </p>
            <DriveDestinationForm
              connectedEmail={connectedEmail}
              initialLink={driveAccount.resultFolderLink}
              initialFolderName={driveAccount.resultFolderName}
              initialError={driveAccount.resultFolderError}
              initialCheckedAt={driveAccount.resultFolderCheckedAt?.toISOString() ?? null}
            />
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-heading text-lg font-medium text-foreground">
            Buat Sesi Baru
          </h2>
          <CreateSessionForm />
        </section>

        <section className="mt-8">
          <h2 className="font-heading text-lg font-medium text-foreground">
            Daftar Sesi ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Belum ada sesi dibuat.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2 text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Klien</th>
                    <th className="px-4 py-3 font-medium">Kode</th>
                    <th className="px-4 py-3 font-medium">Foto</th>
                    <th className="px-4 py-3 font-medium">Dipilih</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/sessions/${session.sessionCode}`}
                          className="cursor-pointer font-medium text-foreground transition-colors duration-200 hover:text-accent"
                        >
                          {session.clientName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted">
                        {session.sessionCode}
                      </td>
                      <td className="px-4 py-3 text-muted">{session._count.photos}</td>
                      <td className="px-4 py-3 text-muted">{session._count.selections}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
                          {STATUS_LABEL[session.status] ?? session.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteSessionButton
                          sessionCode={session.sessionCode}
                          clientName={session.clientName}
                          variant="icon"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
