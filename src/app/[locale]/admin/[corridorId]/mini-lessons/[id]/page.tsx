import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminMiniLessonEditor } from "@/components/admin/AdminMiniLessonEditor";
import { isCorridorId } from "@/data/catalog";
import { adminSectionPath } from "@/lib/admin/admin-path";
import { readContentJson } from "@/lib/admin/content-io";
import {
  loadSituationsForCorridor,
  situationKeysInOrder,
} from "@/lib/content/load-situations";
import type { StoredMiniLesson } from "@/lib/content/stored-mini-lesson-types";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId, Locale } from "@/lib/types";

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
  const locale = (await getLocale()) as Locale;

  const doc =
    id === "new"
      ? template(c, `${c}-mini-${Date.now()}`)
      : await readContentJson<StoredMiniLesson>(c, "mini-lessons", id);
  if (!doc) notFound();

  const situationDefs = await loadSituationsForCorridor(c);
  const t = await getTranslations("admin");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("editMiniLesson")}</h1>
      <AdminMiniLessonEditor
        corridorId={c}
        initial={doc}
        listHref={adminSectionPath(locale, c, "mini-lessons")}
        situationKeys={situationKeysInOrder(situationDefs)}
      />
    </div>
  );
}
