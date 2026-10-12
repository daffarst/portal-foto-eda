import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PhotoSelectionGallery from "@/components/PhotoSelectionGallery";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function PortalSessionPage({ params }: PageProps) {
  const { code } = await params;
  const sessionCode = code.toUpperCase();

  const session = await prisma.session.findUnique({
    where: { sessionCode },
    include: {
      photos: {
        select: { id: true, filename: true, thumbnailUrl: true },
        orderBy: [{ createdAt: "asc" }, { filename: "asc" }],
      },
      selections: { select: { photoId: true } },
    },
  });

  if (!session) notFound();

  return (
    <PhotoSelectionGallery
      sessionCode={session.sessionCode}
      clientName={session.clientName}
      status={session.status}
      maxSelections={session.maxSelections}
      selectionDeadline={session.selectionDeadline?.toISOString() ?? null}
      isPastDeadline={
        session.selectionDeadline ? new Date() > session.selectionDeadline : false
      }
      photos={session.photos.map((p) => ({
        id: p.id,
        filename: p.filename,
        thumbnailUrl: p.thumbnailUrl,
      }))}
      initialSelectedIds={session.selections.map((s) => s.photoId)}
    />
  );
}
