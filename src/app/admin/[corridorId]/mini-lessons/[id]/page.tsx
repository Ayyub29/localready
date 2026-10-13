import { notFound } from "next/navigation";
import { SaveMiniLessonJson } from "@/components/admin/SaveContentJsonEditors";
import { isCorridorId } from "@/data/catalog";
import { readContentJson } from "@/lib/admin/content-io";
import type { StoredMiniLesson } from "@/lib/content/stored-mini-lesson-types";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string; id: string }> };

function template(corridorId: CorridorId, id: string): StoredMiniLesson {
  return {
    schemaVersion: 1,
    id,
    corridorId,
    description: { en: "", id: "" },
    words: [],
    source: "manual",
  };
}

export default async function AdminMiniLessonEditPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId, id } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;

  const doc =
    id === "new"
      ? template(c, `${c}-mini-${Date.now()}`)
      : await readContentJson<StoredMiniLesson>(c, "mini-lessons", id);
  if (!doc) notFound();

  return (
    <SaveMiniLessonJson
      corridorId={c}
      title={`Mini lesson: ${doc.id}`}
      initialJson={JSON.stringify(doc, null, 2)}
    />
  );
}
