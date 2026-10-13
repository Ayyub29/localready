import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getDestination, isCorridorId } from "@/data/catalog";
import { adminSectionPath } from "@/lib/admin/admin-path";
import { listContentIds } from "@/lib/admin/content-io";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { pickLocalized } from "@/lib/locale";
import type { CorridorId, Locale } from "@/lib/types";

type AdminCorridorPageProps = {
  params: Promise<{ corridorId: string }>;
};

export default async function AdminCorridorPage({ params }: AdminCorridorPageProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin");
  const destination = getDestination(c);

  const [conversations, miniLessons, phraseLists, fillBlank, flashcards, lessons] =
    await Promise.all([
      listContentIds(c, "conversations"),
      listContentIds(c, "mini-lessons"),
      listContentIds(c, "phrase-lists"),
      listContentIds(c, "fill-blank"),
      listContentIds(c, "flashcard-decks"),
      listContentIds(c, "lessons"),
    ]);

  const stats = [
    { labelKey: "phrases" as const, href: "phrases", count: t("statsPool") },
    { labelKey: "conversations" as const, href: "conversations", count: conversations.length },
    { labelKey: "miniLessons" as const, href: "mini-lessons", count: miniLessons.length },
    {
      labelKey: "quizzes" as const,
      href: "quizzes",
      count: phraseLists.length + fillBlank.length + flashcards.length,
    },
    { labelKey: "lessons" as const, href: "lessons", count: lessons.length },
    { labelKey: "cheatsheet" as const, href: "cheatsheet", count: t("statsManifest") },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {destination ? pickLocalized(destination.name, locale) : c}{" "}
        <span className="text-slate-500">({c})</span>
      </h1>
      <p className="text-sm text-slate-600">{t("corridorIntro")}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {stats.map((s) => (
          <li key={s.href}>
            <Link
              href={adminSectionPath(locale, c, s.href)}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-teal-300"
            >
              <span className="font-medium">{t(`nav.${s.labelKey}`)}</span>
              <span className="text-sm text-slate-500">{s.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
