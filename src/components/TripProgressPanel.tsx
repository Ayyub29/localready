import Link from "next/link";
import { getDestination, getLessons, getSituationTitle } from "@/data/catalog";
import { buildLessonSteps } from "@/lib/content/lesson-player-steps";
import { lessonHasContent, loadCorridorPack } from "@/lib/content/load-pack";
import {
  loadQuizCatalog,
  quizzesForSituation,
  situationsWithQuizzes,
} from "@/lib/content/load-quiz-catalog";
import { canAccessQuizzes, getContentAccess } from "@/lib/access/content-access";
import { getCorridorProgress, progressPercent, quizProgressKey } from "@/lib/progress";
import { pickLocalized } from "@/lib/locale";
import type { CorridorId, Locale } from "@/lib/types";
import { ContentPaywall } from "./ContentPaywall";
import { ProgressBar } from "./ProgressBar";

type TripProgressPanelProps = {
  locale: Locale;
  corridorId: CorridorId;
  isSignedIn: boolean;
};

export async function TripProgressPanel({
  locale,
  corridorId,
  isSignedIn,
}: TripProgressPanelProps) {
  if (!isSignedIn) {
    return <ContentPaywall locale={locale} variant="signIn" />;
  }
  const destination = getDestination(corridorId);
  if (!destination) return null;

  const [progress, pack, quizCatalog, access] = await Promise.all([
    getCorridorProgress(corridorId),
    loadCorridorPack(corridorId),
    loadQuizCatalog(corridorId),
    getContentAccess(),
  ]);
  const quizzesUnlocked = canAccessQuizzes(access);

  const lessons = getLessons(corridorId);
  const quizSituations = situationsWithQuizzes(quizCatalog);

  const lessonsLabel = locale === "id" ? "Pelajaran" : "Lessons";
  const quizzesLabel = locale === "id" ? "Kuis" : "Quizzes";
  const notStarted = locale === "id" ? "Belum mulai" : "Not started";
  const done = locale === "id" ? "Selesai" : "Done";

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {lessonsLabel}
        </h2>
        <ul className="mt-3 space-y-3">
          {lessons.map((lesson) => {
            const contentLesson = pack?.lessons.find((l) => l.situation === lesson.situation);
            const ready = contentLesson ? lessonHasContent(contentLesson) : false;
            const totalSteps = contentLesson ? buildLessonSteps(contentLesson).length : 0;
            const state = progress.lessons[lesson.situation];
            const percent = progressPercent(state);
            const status =
              state?.completed ? done : percent > 0 ? `${percent}%` : notStarted;

            return (
              <li key={lesson.id}>
                <Link
                  href={`/${locale}/lessons/${corridorId}/${lesson.situation}`}
                  className={`block rounded-xl border px-4 py-3 ${
                    ready
                      ? "border-border bg-card hover:border-teal-300"
                      : "border-dashed border-border bg-card/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs uppercase text-slate-500">
                        {getSituationTitle(lesson.situation, locale)}
                      </p>
                      <p className="font-medium text-slate-900">
                        {pickLocalized(lesson.title, locale)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-teal-800">{status}</span>
                  </div>
                  {ready && totalSteps > 0 && (
                    <ProgressBar percent={percent} className="mt-3" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {quizzesLabel}
        </h2>
        {!quizzesUnlocked ? (
          <ContentPaywall locale={locale} variant="subscribe" />
        ) : quizSituations.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            {locale === "id"
              ? "Belum ada kuis untuk trip ini."
              : "No quizzes for this trip yet."}
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {quizSituations.map((situation) => {
              const quizzes = quizzesForSituation(quizCatalog, situation);
              return (
                <li key={situation}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {getSituationTitle(situation, locale)}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {quizzes.map((entry) => {
                      const key = quizProgressKey(entry.kind, entry.id);
                      const state = progress.quizzes[key];
                      const percent = progressPercent(state);
                      const status =
                        state?.completed ? done : percent > 0 ? `${percent}%` : notStarted;
                      return (
                        <li key={key}>
                          <Link
                            href={`/${locale}/quiz/${corridorId}/${situation}/${entry.kind}/${entry.id}`}
                            className="block rounded-xl border border-border bg-card px-4 py-3 hover:border-teal-300"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-slate-900">
                                {pickLocalized(entry.title, locale)}
                              </p>
                              <span className="shrink-0 text-xs font-medium text-teal-800">
                                {status}
                              </span>
                            </div>
                            <ProgressBar percent={percent} className="mt-3" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-center text-xs text-slate-500">
        {locale === "id"
          ? "Progress disimpan ke akunmu (Neon) saat kamu masuk."
          : "Progress is saved to your account when you are signed in."}
      </p>
    </section>
  );
}
