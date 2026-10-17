import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getDestination } from "@/data/catalog";
import { getLessonsForCorridor } from "@/lib/content/load-situations";
import { buildLessonSteps } from "@/lib/content/lesson-player-steps";
import { lessonHasContent, loadCorridorPack } from "@/lib/content/load-pack";
import { getContentAccess } from "@/lib/access/content-access";
import { getLessonAccessMode } from "@/lib/lessons/access";
import { getCorridorProgress } from "@/lib/progress";
import { lessonProgressLabel, progressPercent } from "@/lib/progress/utils";
import { pickLocalized } from "@/lib/locale";
import { ProgressBar } from "@/components/ProgressBar";
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
  const lessons = await getLessonsForCorridor(corridorId);
  const access = await getContentAccess(corridorId);
  const [pack, progress] = await Promise.all([
    loadCorridorPack(corridorId),
    access.canSaveProgress ? getCorridorProgress(corridorId) : Promise.resolve(null),
  ]);

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
          const totalSteps = contentLesson ? buildLessonSteps(contentLesson).length : 0;
          const lessonState = progress?.lessons[lesson.situation];
          const percent = progressPercent(lessonState);
          const statusLabel = access.canSaveProgress
            ? lessonProgressLabel(lessonState, locale)
            : null;
          const locked =
            getLessonAccessMode(
              lesson.situation,
              access.isSignedIn,
              access.hasCorridorAccess,
            ) === "locked";
          const href = locked
            ? `/paywall?corridor=${corridorId}`
            : `/lessons/${corridorId}/${lesson.situation}`;
          return (
            <li key={lesson.id}>
              <Link
                href={href}
                className={`flex gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  locked
                    ? "border-amber-200 bg-amber-50/50 hover:border-amber-300"
                    : ready
                      ? "border-border bg-card hover:border-teal-300"
                      : "border-dashed border-border bg-card/60"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    locked
                      ? "bg-amber-100 text-amber-900"
                      : "bg-teal-50 text-teal-800"
                  }`}
                >
                  {locked ? "🔒" : lesson.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs uppercase text-slate-500">
                      {lesson.situation}
                      {locked ? (
                        <span className="ml-2 normal-case font-medium text-amber-800">
                          · {t("locked")}
                        </span>
                      ) : ready ? (
                        <span className="ml-2 normal-case text-teal-700">
                          · {locale === "id" ? "Siap" : "Ready"}
                        </span>
                      ) : null}
                    </p>
                    {statusLabel && !locked && (
                      <span className="shrink-0 text-xs font-semibold text-teal-800">
                        {statusLabel}
                      </span>
                    )}
                  </div>
                  <p className="font-medium">
                    {pickLocalized(lesson.title, locale)}
                  </p>
                  {access.canSaveProgress && ready && !locked && totalSteps > 0 && (
                    <ProgressBar percent={percent} className="mt-2" />
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="text-center text-xs text-slate-500">{t("freeBasicsHint")}</p>
    </div>
  );
}
