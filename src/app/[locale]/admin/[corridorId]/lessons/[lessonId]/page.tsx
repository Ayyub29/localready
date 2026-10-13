import { notFound } from "next/navigation";
import { AdminLessonEditor } from "@/components/admin/AdminLessonEditor";
import { isCorridorId } from "@/data/catalog";
import { listContentIds, readContentJson } from "@/lib/admin/content-io";
import type { StoredLessonManifest } from "@/lib/content/stored-lesson-manifest-types";
import {
  loadSituationsForCorridor,
  situationKeysInOrder,
} from "@/lib/content/load-situations";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string; lessonId: string }> };

export default async function AdminLessonEditPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId, lessonId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;

  const doc =
    lessonId === "new"
      ? {
          schemaVersion: 1 as const,
          id: `${c}-lesson-${Date.now()}`,
          corridorId: c,
          situation: "basics" as const,
          order: 99,
          title: { en: "New lesson", id: "Pelajaran baru" },
          free: false,
          vignettes: [],
        }
      : await readContentJson<StoredLessonManifest>(c, "lessons", lessonId);
  if (!doc) notFound();

  const [
    conversations,
    miniLessons,
    phraseLists,
    fillBlank,
    flashcardDecks,
    situationDefs,
  ] = await Promise.all([
    listContentIds(c, "conversations"),
    listContentIds(c, "mini-lessons"),
    listContentIds(c, "phrase-lists"),
    listContentIds(c, "fill-blank"),
    listContentIds(c, "flashcard-decks"),
    loadSituationsForCorridor(c),
  ]);
  const situationKeys = situationKeysInOrder(situationDefs);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Lesson manifest</h1>
      <AdminLessonEditor
        corridorId={c}
        initial={doc}
        poolRefs={{
          conversations,
          miniLessons,
          phraseLists,
          fillBlank,
          flashcardDecks,
        }}
        situationKeys={situationKeys}
      />
    </div>
  );
}
