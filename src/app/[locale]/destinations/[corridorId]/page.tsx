import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDestination, getLessons, isCorridorId } from "@/data/catalog";
import { pickLocalized } from "@/lib/locale";
import type { Locale } from "@/lib/types";

type LessonsPageProps = {
  params: Promise<{ locale: string; corridorId: string }>;
};

export default async function LessonsPage({ params }: LessonsPageProps) {
  const { locale, corridorId } = await params;
  setRequestLocale(locale);
  if (!isCorridorId(corridorId)) {
    notFound();
  }
  const destination = getDestination(corridorId);
  if (!destination) {
    notFound();
  }

  const t = await getTranslations("lessons");
  const loc = locale as Locale;
  const lessons = getLessons(corridorId);

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/destinations"
          className="text-sm font-medium text-teal-700"
        >
          ← {t("back")}
        </Link>
        <h1 className="mt-3 text-2xl font-bold">
          {pickLocalized(destination.name, loc)}
        </h1>
        <p className="text-sm text-slate-600">
          {pickLocalized(destination.targetLanguage, loc)}
        </p>
      </header>
      <ol className="space-y-2">
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className="flex gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-800">
              {lesson.order}
            </span>
            <div>
              <p className="text-xs uppercase text-slate-500">
                {lesson.situation}
              </p>
              <p className="font-medium">
                {pickLocalized(lesson.title, loc)}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-center text-xs text-slate-500">{t("comingSoon")}</p>
    </div>
  );
}
