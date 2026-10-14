import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminFillBlankEditor } from "@/components/admin/AdminFillBlankEditor";
import { isCorridorId } from "@/data/catalog";
import { adminSectionPath } from "@/lib/admin/admin-path";
import { readContentJson } from "@/lib/admin/content-io";
import { readPhrasePool } from "@/lib/content-pipeline/pool-store";
import type { StoredFillBlankQuiz } from "@/lib/content/stored-fill-blank-types";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId, Locale } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string; id: string }> };

export default async function AdminFillBlankEditPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId, id } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;
  const locale = (await getLocale()) as Locale;

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

  const pool = await readPhrasePool(c);
  const t = await getTranslations("admin");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("editFillBlank")}</h1>
      <AdminFillBlankEditor
        corridorId={c}
        initial={doc}
        listHref={adminSectionPath(locale, c, "quizzes")}
        phraseItems={pool.items}
      />
    </div>
  );
}
