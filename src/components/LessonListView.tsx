import { getTranslations } from "next-intl/server";
import { getDestination, getLessons } from "@/data/catalog";
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
                {pickLocalized(lesson.title, locale)}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-center text-xs text-slate-500">{t("comingSoon")}</p>
    </div>
  );
}
