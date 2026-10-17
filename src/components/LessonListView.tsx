import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { IconCheck, IconLock } from "@/components/icons/NavIcons";
import { getDestination } from "@/data/catalog";
import { getLessonsForCorridor } from "@/lib/content/load-situations";
import { buildLessonSteps } from "@/lib/content/lesson-player-steps";
import { lessonHasContent, loadCorridorPack } from "@/lib/content/load-pack";
import { getContentAccess } from "@/lib/access/content-access";
import { getLessonAccessMode } from "@/lib/lessons/access";
import { CORRIDOR_FLAG, SITUATION_EMOJI } from "@/lib/corridor-visuals";
import { getCorridorProgress } from "@/lib/progress";
import { progressPercent } from "@/lib/progress/utils";
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

  const OFFSETS = [0, 64, 96, 64, 0, -64, -96, -64];
  const progressRing = (percent: number) => {
    const r = 38;
    const c = 2 * Math.PI * r;
    return (
      <svg
        className="pointer-events-none absolute -inset-2 h-[5.5rem] w-[5.5rem] -rotate-90"
        viewBox="0 0 88 88"
        aria-hidden
      >
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#0d9488"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-5">
      <section className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {CORRIDOR_FLAG[corridorId]}
          </span>
          <div>
            <p className="font-extrabold leading-tight text-slate-900">{destName}</p>
            <p className="text-xs font-semibold text-slate-500">{langName}</p>
          </div>
        </div>
        {open.length > 0 && (
          <div className="text-right">
            <p className="text-lg font-extrabold leading-tight text-teal-700">
              {doneCount}/{open.length}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {locale === "id" ? "selesai" : "done"}
            </p>
          </div>
        )}
      </section>

      <Link
        href={`/cheatsheet/${corridorId}`}
        className="lr-card lr-card-interactive flex items-center gap-3 px-4 py-3"
      >
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-lg"
          aria-hidden
        >
          📒
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">
            {locale === "id" ? "Cheatsheet frasa" : "Phrase cheatsheet"}
          </p>
          <p className="text-xs text-slate-500">
            {locale === "id"
              ? "Frasa darurat selalu gratis"
              : "Emergency phrases are always free"}
          </p>
        </div>
        <span className="font-bold text-teal-700" aria-hidden>→</span>
      </Link>

      <div className="lr-unit-banner flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-100">
            {locale === "id" ? "Unit 1" : "Unit 1"}
          </p>
          <p className="text-lg font-extrabold">
            {locale === "id" ? "Siap jalan" : "Get trip-ready"}
          </p>
        </div>
        <span className="text-2xl" aria-hidden>🧳</span>
      </div>

      <ol className="relative flex flex-col items-center gap-9 pb-4 pt-10">
        {rows.map(({ lesson, ready, state: lessonState, locked }, index) => {
          const percent = progressPercent(lessonState);
          const done = Boolean(lessonState?.completed);
          const isCurrent = continueRow?.lesson.id === lesson.id;
          const href = locked
            ? `/paywall?corridor=${corridorId}`
            : `/lessons/${corridorId}/${lesson.situation}`;
          const tone = locked
            ? "lr-node-locked"
            : done
              ? "lr-node-done"
              : ready
                ? "lr-node-open"
                : "lr-node-locked";
          return (
            <li
              key={lesson.id}
              className="relative flex flex-col items-center"
              style={{ transform: `translateX(${OFFSETS[index % OFFSETS.length]}px)` }}
            >
              {isCurrent && !locked && (
                <span className="lr-start-bubble">
                  {hasStarted
                    ? locale === "id" ? "LANJUT" : "CONTINUE"
                    : locale === "id" ? "MULAI" : "START"}
                </span>
              )}
              <Link href={href} className="relative" aria-label={pickLocalized(lesson.title, locale)}>
                {!locked && ready && !done && percent > 0 && progressRing(percent)}
                <span className={`lr-node ${tone}`}>
                  {locked ? (
                    <IconLock className="h-7 w-7" />
                  ) : done ? (
                    <IconCheck className="h-8 w-8" />
                  ) : (
                    <span aria-hidden>{SITUATION_EMOJI[lesson.situation] ?? lesson.order}</span>
                  )}
                </span>
              </Link>
              <p className="mt-3 max-w-[9rem] text-center text-sm font-bold leading-tight text-slate-800">
                {pickLocalized(lesson.title, locale)}
              </p>
              {locked && (
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  {t("locked")}
                </p>
              )}
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
