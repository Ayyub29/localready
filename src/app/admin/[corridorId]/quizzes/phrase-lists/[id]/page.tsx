import { notFound } from "next/navigation";
import { SavePhraseListJson } from "@/components/admin/SaveContentJsonEditors";
import { isCorridorId } from "@/data/catalog";
import { readContentJson } from "@/lib/admin/content-io";
import type { StoredPhraseList } from "@/lib/content/stored-phrase-list-types";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string; id: string }> };

export default async function AdminPhraseListEditPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId, id } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;

  const doc =
    id === "new"
      ? {
          schemaVersion: 1 as const,
          id: `${c}-phrase-list-${Date.now()}`,
          corridorId: c,
          title: { en: "New phrase list", id: "Daftar frasa baru" },
          phraseIds: [],
          source: "manual" as const,
        }
      : await readContentJson<StoredPhraseList>(c, "phrase-lists", id);
  if (!doc) notFound();

  return (
    <SavePhraseListJson
      corridorId={c}
      title={`Phrase list: ${doc.id}`}
      initialJson={JSON.stringify(doc, null, 2)}
    />
  );
}
