import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { isCorridorId } from "@/data/catalog";
import { adminSectionPath } from "@/lib/admin/admin-path";
import { listContentIds } from "@/lib/admin/content-io";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId, Locale } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string }> };

function EntityList({
  title,
  basePath,
  ids,
  newHref,
  newLabel,
  emptyLabel,
}: {
  title: string;
  basePath: string;
  ids: string[];
  newHref: string;
  newLabel: string;
  emptyLabel: string;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link href={newHref} className="text-sm font-medium text-teal-800 hover:underline">
          + {newLabel}
        </Link>
      </div>
      <ul className="divide-y rounded-xl border border-slate-200 bg-white">
        {ids.map((id) => (
          <li key={id}>
            <Link href={`${basePath}/${id}`} className="block px-4 py-2 font-mono text-sm hover:bg-slate-50">
              {id}
            </Link>
          </li>
        ))}
        {ids.length === 0 ? (
          <li className="px-4 py-4 text-sm text-slate-500">{emptyLabel}</li>
        ) : null}
      </ul>
    </section>
  );
}

export default async function AdminQuizzesPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin");

  const [fillBlank, phraseLists, flashcards] = await Promise.all([
    listContentIds(c, "fill-blank"),
    listContentIds(c, "phrase-lists"),
    listContentIds(c, "flashcard-decks"),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("quizzesTitle")}</h1>
      <EntityList
        title={t("fillBlank")}
        basePath={adminSectionPath(locale, c, "quizzes", "fill-blank")}
        ids={fillBlank}
        newHref={adminSectionPath(locale, c, "quizzes", "fill-blank", "new")}
        newLabel={t("new")}
        emptyLabel={t("noneYet")}
      />
      <EntityList
        title={t("phraseLists")}
        basePath={adminSectionPath(locale, c, "quizzes", "phrase-lists")}
        ids={phraseLists}
        newHref={adminSectionPath(locale, c, "quizzes", "phrase-lists", "new")}
        newLabel={t("new")}
        emptyLabel={t("noneYet")}
      />
      <EntityList
        title={t("flashcards")}
        basePath={adminSectionPath(locale, c, "quizzes", "flashcards")}
        ids={flashcards}
        newHref={adminSectionPath(locale, c, "quizzes", "flashcards", "new")}
        newLabel={t("new")}
        emptyLabel={t("noneYet")}
      />
    </div>
  );
}
