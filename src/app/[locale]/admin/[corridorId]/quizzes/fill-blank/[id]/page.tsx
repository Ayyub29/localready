import { notFound } from "next/navigation";
import { SaveFillBlankJson } from "@/components/admin/SaveContentJsonEditors";
import { isCorridorId } from "@/data/catalog";
import { readContentJson } from "@/lib/admin/content-io";
import type { StoredFillBlankQuiz } from "@/lib/content/stored-fill-blank-types";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string; id: string }> };

export default async function AdminFillBlankEditPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId, id } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;

  const doc =
    id === "new"
      ? {
          schemaVersion: 1 as const,
          id: `${c}-fill-${Date.now()}`,
          corridorId: c,
          title: { en: "New quiz", id: "Kuis baru" },
          questions: [],
          source: "manual" as const,
        }
      : await readContentJson<StoredFillBlankQuiz>(c, "fill-blank", id);
  if (!doc) notFound();

  return (
    <SaveFillBlankJson
      corridorId={c}
      title={`Fill-blank: ${doc.id}`}
      initialJson={JSON.stringify(doc, null, 2)}
    />
  );
}
