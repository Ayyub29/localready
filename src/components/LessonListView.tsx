import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/PageHeader";
import { IconLock } from "@/components/icons/NavIcons";
import { getDestination } from "@/data/catalog";
import { getLessonsForCorridor } from "@/lib/content/load-situations";
import { buildLessonSteps } from "@/lib/content/lesson-player-steps";
import { lessonHasContent, loadCorridorPack } from "@/lib/content/load-pack";
import { getContentAccess } from "@/lib/access/content-access";
import { getLessonAccessMode } from "@/lib/lessons/access";
import { CORRIDOR_FLAG, CORRIDOR_GRADIENT } from "@/lib/corridor-visuals";
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

  const destName = pickLocalized(destination.name, locale);
  const langName = pickLocalized(destination.targetLanguage, locale);

  const rows = lessons.map((lesson) => {
    const contentLesson = pack?.lessons.find((l) => l.situation === lesson.situation);
    const ready = contentLesson ? lessonHasContent(contentLesson) : false;
    const totalSteps = contentLesson ? buildLessonSteps(contentLesson).length : 0;
    const state = progress?.lessons[lesson.situation];
    const locked =
      getLessonAccessMode(
        lesson.situation,
        access.isSignedIn,
        access.hasCorridorAccess,
      ) === "locked";
    return { lesson, ready, totalSteps, state, locked };
  });
  const open = rows.filter((r) => r.ready && !r.locked);
  const doneCount = open.filter((r) => r.state?.completed).length;
  const recommended = open.find((r) => !r.state?.completed) ?? null;
  const inProgress = open
    .filter((r) => r.state && !r.state.completed && r.state.totalSteps > 0)
    .sort((a, b) => (b.state!.updatedAt > a.state!.updatedAt ? 1 : -1))[0];
  const continueRow = inProgress ?? recommended;
  const hasStarted = Boolean(inProgress);

  return (
    <div className="space-y-6">
      <section
        className={`lr-card overflow-hidden bg-gradient-to-br p-5 ${CORRIDOR_GRADIENT[corridorId]}`}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-3xl shadow-sm"
            aria-hidden
          >
            {CORRIDOR_FLAG[corridorId]}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <PageHeader
              eyebrow={locale === "id" ? "Trip kamu" : "Your trip"}
              title={destName}
              subtitle={langName}
            />
          </div>
        </div>
        {open.length > 0 && (
          <div className="-mt-2 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>{locale === "id" ? "Persiapan" : "Trip readiness"}</span>
              <span>
                {doneCount}/{open.length}{" "}
                {locale === "id" ? "pelajaran" : "lessons"}
              </span>
            </div>
            <ProgressBar percent={Math.round((doneCount / open.length) * 100)} />
          </div>
        )}
      </section>

      {continueRow && (
        <Link
          href={`/lessons/${corridorId}/${continueRow.lesson.situation}`}
          className="lr-hero-panel lr-card-interactive flex items-center gap-4 p-5"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-100">
              {hasStarted
                ? locale === "id" ? "Lanjutkan" : "Continue"
                : locale === "id" ? "Mulai sekarang" : "Start here"}
            </p>
            <p className="mt-1 truncate text-lg font-bold">
              {pickLocalized(continueRow.lesson.title, locale)}
            </p>
            {hasStarted && (
              <p className="mt-0.5 text-sm text-teal-50/90">
                {progressPercent(continueRow.state)}%
                {locale === "id" ? " selesai" : " complete"}
              </p>
            )}
          </div>
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-teal-800"
            aria-hidden
          >
            →
          </span>
        </Link>
      )}

      <Link
        href={`/cheatsheet/${corridorId}/emergency`}
        className="lr-card lr-card-interactive flex items-center gap-3 !border-rose-200/80 !bg-rose-50/60 px-4 py-3"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-base"
          aria-hidden
        >
          🆘
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-rose-950">
            {locale === "id" ? "Frasa darurat" : "Emergency phrases"}
          </p>
          <p className="text-xs text-rose-900/80">
            {locale === "id" ? "Selalu gratis, tanpa login" : "Always free, no sign-in"}
          </p>
        </div>
        <span className="text-rose-900" aria-hidden>→</span>
      </Link>

      <ol className="space-y-2.5">
        {rows.map(({ lesson, ready, totalSteps, state: lessonState, locked }) => {
          const percent = progressPercent(lessonState);
          const statusLabel = access.canSaveProgress
            ? lessonProgressLabel(lessonState, locale)
            : null;
          const isRecommended = recommended?.lesson.id === lesson.id;
          const href = locked
            ? `/paywall?corridor=${corridorId}`
            : `/lessons/${corridorId}/${lesson.situation}`;
          return (
            <li key={lesson.id}>
              <Link
                href={href}
                className={`lr-card lr-card-interactive flex gap-3 px-4 py-3.5 ${
                  locked
                    ? "!border-amber-200/80 !bg-amber-50/40"
                    : ready
                      ? "border-l-4 border-l-teal-500"
                      : ""
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    locked
                      ? "bg-amber-100 text-amber-900"
                      : "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                  }`}
                >
                  {locked ? <IconLock className="h-4 w-4" /> : lesson.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {lesson.situation}
                      {locked ? (
                        <span className="ml-2 normal-case text-amber-800">
                          · {t("locked")}
                        </span>
                      ) : isRecommended ? (
                        <span className="ml-2 rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold normal-case text-white">
                          {locale === "id" ? "Disarankan" : "Up next"}
                        </span>
                      ) : ready ? (
                        <span className="ml-2 normal-case font-medium text-teal-700">
                          · {locale === "id" ? "Siap" : "Ready"}
                        </span>
                      ) : null}
                    </p>
                    {statusLabel && !locked && (
                      <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                        {statusLabel}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-semibold text-slate-900">
                    {pickLocalized(lesson.title, locale)}
                  </p>
                  {access.canSaveProgress && ready && !locked && totalSteps > 0 && (
                    <ProgressBar percent={percent} className="mt-2.5" />
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="rounded-xl bg-white/60 px-3 py-2 text-center text-xs leading-relaxed text-slate-500">
        {t("freeBasicsHint")}
      </p>
    </div>
  );
}
