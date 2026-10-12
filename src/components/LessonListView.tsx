import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getDestination, getLessons } from "@/data/catalog";
import { lessonHasContent, loadCorridorPack } from "@/lib/content/load-pack";
import { pickLocalized } from "@/lib/locale";
import type { CorridorId, Locale } from "@/lib/types";

type LessonListViewProps = {
  locale: Locale;
  corridorId: CorridorId;
};

export async function LessonListView({
  locale,
  corridorId,
}: LessonListViewProps) {
  const destination = getDestination(corridorId);
  if (!destination) {
    return null;
  }

  const t = await getTranslations("lessons");
  const lessons = getLessons(corridorId);
  const pack = await loadCorridorPack(corridorId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">
          {pickLocalized(destination.name, locale)}
        </h1>
        <p className="text-sm text-slate-600">
          {pickLocalized(destination.targetLanguage, locale)}
        </p>
      </header>
      <ol className="space-y-2">
        {lessons.map((lesson) => {
          const contentLesson = pack?.lessons.find((l) => l.situation === lesson.situation);
          const ready = contentLesson ? lessonHasContent(contentLesson) : false;
          return (
            <li key={lesson.id}>
              <Link
                href={`/${locale}/lessons/${corridorId}/${lesson.situation}`}
                className={`flex gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  ready
                    ? "border-border bg-card hover:border-teal-300"
                    : "border-dashed border-border bg-card/60"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-800">
                  {lesson.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase text-slate-500">
                    {lesson.situation}
                    {ready ? (
                      <span className="ml-2 normal-case text-teal-700">
                        · {locale === "id" ? "Siap" : "Ready"}
                      </span>
                    ) : null}
                  </p>
                  <p className="font-medium">
                    {pickLocalized(lesson.title, locale)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="text-center text-xs text-slate-500">{t("comingSoon")}</p>
    </div>
  );
}
