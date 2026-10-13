import { notFound } from "next/navigation";
import { SaveFlashcardDeckJson } from "@/components/admin/SaveContentJsonEditors";
import { isCorridorId } from "@/data/catalog";
import { readContentJson } from "@/lib/admin/content-io";
import type { StoredFlashcardDeck } from "@/lib/content/stored-flashcard-deck-types";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string; id: string }> };

export default async function AdminFlashcardEditPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId, id } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;

  const doc =
    id === "new"
      ? {
          schemaVersion: 1 as const,
          id: `${c}-flash-${Date.now()}`,
          corridorId: c,
          title: { en: "New deck", id: "Deck baru" },
          cards: [],
          source: "manual" as const,
        }
      : await readContentJson<StoredFlashcardDeck>(c, "flashcard-decks", id);
  if (!doc) notFound();

  return (
    <SaveFlashcardDeckJson
      corridorId={c}
      title={`Flashcard deck: ${doc.id}`}
      initialJson={JSON.stringify(doc, null, 2)}
    />
  );
}
