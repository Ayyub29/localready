import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getDestination, getSituationTitle, isCorridorId } from "@/data/catalog";
import {
  loadQuizCatalog,
  quizzesForSituation,
  situationsWithQuizzes,
} from "@/lib/content/load-quiz-catalog";
import { canAccessQuizzes, getContentAccess } from "@/lib/access/content-access";
import { getCorridorProgress } from "@/lib/progress";
import { quizProgressKey } from "@/lib/progress/utils";
import { pickLocalized } from "@/lib/locale";
import type { Locale } from "@/lib/types";

type QuizCorridorPageProps = {
  params: Promise<{ locale: string; corridorId: string }>;
};

export default async function QuizCorridorPage({ params }: QuizCorridorPageProps) {
  const { locale, corridorId } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  if (!isCorridorId(corridorId)) notFound();

  const destination = getDestination(corridorId);
  if (!destination) notFound();

  const access = await getContentAccess();
  const quizzesUnlocked = canAccessQuizzes(access);
  const [catalog, progress] = await Promise.all([
    loadQuizCatalog(corridorId),
    access.canSaveProgress && quizzesUnlocked
      ? getCorridorProgress(corridorId)
      : Promise.resolve(null),
  ]);
  const situations = situationsWithQuizzes(catalog);
  const t = await getTranslations({ locale: loc, namespace: "quiz" });

  function situationScoreSummary(situation: (typeof situations)[number]): string | null {
    if (!progress) return null;
    const quizzes = quizzesForSituation(catalog, situation);
    let correct = 0;
    let total = 0;
    let any = false;
    for (const q of quizzes) {
      const s = progress.quizzes[quizProgressKey(q.kind, q.id)];
      if (s?.scoreTotal != null && s.scoreTotal > 0) {
        any = true;
        correct += s.scoreCorrect ?? 0;
        total += s.scoreTotal;
      }
    }
    if (!any) return null;
    return loc === "id" ? `Skor ${correct}/${total}` : `Score ${correct}/${total}`;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          href={`/${loc}/quiz`}
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          ← {t("changeDestination")}
        </Link>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-slate-600">
          {pickLocalized(destination.name, loc)} · {pickLocalized(destination.targetLanguage, loc)}
        </p>
        <p className="text-sm text-slate-600">{t("pickSituation")}</p>
      </header>

      {situations.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-600">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {situations.map((situation) => {
            const count = quizzesForSituation(catalog, situation).length;
            const scoreSummary = situationScoreSummary(situation);
            return (
              <li key={situation}>
                <Link
                  href={`/${loc}/quiz/${corridorId}/${situation}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 hover:border-teal-300"
                >
                  <span className="font-medium text-slate-900">
                    {getSituationTitle(situation, loc)}
                  </span>
                  <div className="text-right text-sm">
                    {scoreSummary && (
                      <p className="font-semibold text-teal-800">{scoreSummary}</p>
                    )}
                    <p className="text-slate-500">
                      {count} {loc === "id" ? "kuis" : "quizzes"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
