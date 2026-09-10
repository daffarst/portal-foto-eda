import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentPhotographer } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SessionActions from "@/components/SessionActions";
import SessionSettingsForm from "@/components/SessionSettingsForm";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function AdminSessionDetailPage({ params }: PageProps) {
  const photographer = await getCurrentPhotographer();
  if (!photographer) redirect("/admin");

  const { code } = await params;
  const session = await prisma.session.findUnique({
    where: { sessionCode: code.toUpperCase() },
    include: {
      photos: { orderBy: { createdAt: "asc" } },
      selections: { include: { photo: true } },
    },
  });

  // 404 (bukan 403) supaya tidak bocorkan keberadaan sesi milik fotografer lain.
  if (!session || session.photographerId !== photographer.id) notFound();

  const selectedPhotos = session.selections.map((s) => s.photo);

  return (
    <main className="flex-1 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/dashboard"
          className="mb-6 inline-block text-sm text-muted transition-colors duration-200 hover:text-foreground"
        >
          ← Kembali ke dashboard
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              {session.clientName}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Kode sesi: <span className="font-mono text-foreground">{session.sessionCode}</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              Batas foto:{" "}
              <span className="text-foreground">
                {session.maxSelections ? `${session.maxSelections} foto` : "Tanpa batas"}
              </span>
              {" · "}
              Deadline:{" "}
              <span className="text-foreground">
                {session.selectionDeadline
                  ? new Date(session.selectionDeadline).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Tidak ada"}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted">
              Folder sumber:{" "}
              <a
                href={`https://drive.google.com/drive/folders/${session.driveSourceFolderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer font-mono underline decoration-dotted hover:text-foreground"
              >
                {session.driveSourceFolderId}
              </a>
            </p>
          </div>

          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
            {session.status === "finalized" ? "Selesai" : "Aktif"}
          </span>
        </div>

        {session.driveResultFolderId && (
          <p className="mt-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
            Folder Hasil Seleksi:{" "}
            <a
              href={`https://drive.google.com/drive/folders/${session.driveResultFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer underline"
            >
              Buka di Google Drive
            </a>
          </p>
        )}

        <SessionActions
          sessionCode={session.sessionCode}
          isFinalized={session.status === "finalized"}
          hasSelections={selectedPhotos.length > 0}
        />

        <SessionSettingsForm
          sessionCode={session.sessionCode}
          initialMaxSelections={session.maxSelections}
          initialSelectionDeadline={session.selectionDeadline?.toISOString() ?? null}
        />

        <section className="mt-10">
          <h2 className="font-heading text-lg font-medium text-foreground">
            Foto Terpilih ({selectedPhotos.length} / {session.photos.length})
          </h2>

          {selectedPhotos.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Klien belum memilih foto, atau data belum di-sync.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {selectedPhotos.map((photo) => (
                <li
                  key={photo.id}
                  className="truncate rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted"
                  title={photo.filename}
                >
                  {photo.filename}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
