import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminPhraseListEditor } from "@/components/admin/AdminPhraseListEditor";
import { isCorridorId } from "@/data/catalog";
import { adminSectionPath } from "@/lib/admin/admin-path";
import { readContentJson } from "@/lib/admin/content-io";
import { readPhrasePool } from "@/lib/content-pipeline/pool-store";
import type { StoredPhraseList } from "@/lib/content/stored-phrase-list-types";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId, Locale } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string; id: string }> };

export default async function AdminPhraseListEditPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId, id } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;
  const locale = (await getLocale()) as Locale;

  const doc =
    id === "new"
      ? {
          schemaVersion: 1 as const,
          id: `${c}-drill-${Date.now()}`,
          corridorId: c,
          title: { en: "Phrase drill", id: "Drill frasa" },
          phraseIds: [],
          source: "manual" as const,
        }
      : await readContentJson<StoredPhraseList>(c, "phrase-lists", id);
  if (!doc) notFound();

  const pool = await readPhrasePool(c);
  const t = await getTranslations("admin");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("editPhraseList")}</h1>
      <AdminPhraseListEditor
        corridorId={c}
        initial={doc}
        listHref={adminSectionPath(locale, c, "quizzes")}
        phraseItems={pool.items}
      />
    </div>
  );
}
