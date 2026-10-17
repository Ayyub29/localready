import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { SituationCardLink } from "@/components/SituationCardLink";
import { getDestination, isCorridorId } from "@/data/catalog";
import {
  enabledSituationsWithQuizzes,
  loadQuizCatalog,
  quizzesForSituation,
} from "@/lib/content/load-quiz-catalog";
import {
  loadSituationsForCorridor,
  situationTitle,
} from "@/lib/content/load-situations";
import { canAccessQuizzes, getContentAccess } from "@/lib/access/content-access";
import { getCorridorProgress } from "@/lib/progress";
import { quizProgressKey } from "@/lib/progress/utils";
import { CORRIDOR_FLAG, CORRIDOR_GRADIENT } from "@/lib/corridor-visuals";
import { pickLocalized } from "@/lib/locale";
import type { CorridorId, Locale } from "@/lib/types";

type QuizCorridorPageProps = {
  params: Promise<{ locale: string; corridorId: string }>;
};

export default async function QuizCorridorPage({ params }: QuizCorridorPageProps) {
  const { locale, corridorId } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  if (!isCorridorId(corridorId)) notFound();

  const c = corridorId as CorridorId;
  const destination = getDestination(corridorId);
  if (!destination) notFound();

  const access = await getContentAccess(corridorId);
  const quizzesUnlocked = canAccessQuizzes(access);
  const [catalog, progress, situationDefs] = await Promise.all([
    loadQuizCatalog(corridorId),
    access.canSaveProgress && quizzesUnlocked
      ? getCorridorProgress(corridorId)
      : Promise.resolve(null),
    loadSituationsForCorridor(corridorId),
  ]);
  const situations = await enabledSituationsWithQuizzes(corridorId, catalog);
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
      <BackLink href="/quiz">{t("changeDestination")}</BackLink>

      <section
        className={`lr-card overflow-hidden bg-gradient-to-br p-5 ${CORRIDOR_GRADIENT[c]}`}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-2xl shadow-sm"
            aria-hidden
          >
            {CORRIDOR_FLAG[c]}
          </span>
          <PageHeader
            eyebrow={t("title")}
            title={pickLocalized(destination.name, loc)}
            subtitle={`${pickLocalized(destination.targetLanguage, loc)} · ${t("pickSituation")}`}
          />
        </div>
      </section>

      {situations.length === 0 ? (
        <p className="lr-card border-dashed px-4 py-10 text-center text-sm text-slate-600">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {situations.map((situation) => {
            const count = quizzesForSituation(catalog, situation).length;
            const scoreSummary = situationScoreSummary(situation);
            return (
              <li key={situation}>
                <SituationCardLink
                  href={`/quiz/${corridorId}/${situation}`}
                  title={situationTitle(situationDefs, situation, loc)}
                  trailing={
                    <>
                      {scoreSummary && (
                        <p className="font-semibold text-teal-800">{scoreSummary}</p>
                      )}
                      <p>
                        {count} {loc === "id" ? "kuis" : "quizzes"}
                      </p>
                    </>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
