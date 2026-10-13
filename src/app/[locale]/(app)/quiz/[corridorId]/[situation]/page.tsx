import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getDestination, getSituationTitle, isCorridorId } from "@/data/catalog";
import { ProgressBar } from "@/components/ProgressBar";
import {
  loadQuizCatalog,
  quizzesForSituation,
  type QuizCatalogEntry,
} from "@/lib/content/load-quiz-catalog";
import { canAccessQuizzes, getContentAccess } from "@/lib/access/content-access";
import { ContentPaywall } from "@/components/ContentPaywall";
import { getCorridorProgress } from "@/lib/progress";
import {
  progressPercent,
  quizProgressKey,
  quizScoreLabel,
} from "@/lib/progress/utils";
import type { QuizKind } from "@/lib/content/quiz-situation";
import { pickLocalized } from "@/lib/locale";
import { situationOrder } from "@/lib/situations";
import type { Locale, SituationKey } from "@/lib/types";

type QuizSituationPageProps = {
  params: Promise<{ locale: string; corridorId: string; situation: string }>;
};

function isSituationKey(value: string): value is SituationKey {
  return (situationOrder as string[]).includes(value);
}

function kindLabel(kind: QuizKind, loc: Locale): string {
  if (loc === "id") {
    if (kind === "fillBlank") return "Isian";
    if (kind === "flashcards") return "Kartu";
    return "Drill frasa";
  }
  if (kind === "fillBlank") return "Fill-in";
  if (kind === "flashcards") return "Flashcards";
  return "Phrase drill";
}

function playHref(
  loc: Locale,
  corridorId: string,
  situation: SituationKey,
  entry: QuizCatalogEntry,
): string {
  return `/${loc}/quiz/${corridorId}/${situation}/${entry.kind}/${entry.id}`;
}

export default async function QuizSituationPage({ params }: QuizSituationPageProps) {
  const { locale, corridorId, situation } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  if (!isCorridorId(corridorId) || !isSituationKey(situation)) notFound();

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
  const quizzes = quizzesForSituation(catalog, situation);
  const t = await getTranslations({ locale: loc, namespace: "quiz" });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          href={`/${loc}/quiz/${corridorId}`}
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          ← {getSituationTitle(situation, loc)}
        </Link>
        <h1 className="text-2xl font-bold">{getSituationTitle(situation, loc)}</h1>
        <p className="text-sm text-slate-600">
          {pickLocalized(destination.name, loc)} · {t("pickQuiz")}
        </p>
      </header>

      {!quizzesUnlocked && (
        <ContentPaywall
          locale={loc}
          variant={access.isSignedIn ? "subscribe" : "signIn"}
        />
      )}

      {quizzes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-600">
          {t("emptySituation")}
        </p>
      ) : (
        <ul className="space-y-2">
          {quizzes.map((entry) => {
            const key = quizProgressKey(entry.kind, entry.id);
            const quizState = progress?.quizzes[key];
            const percent = progressPercent(quizState);
            const scoreLabel = quizScoreLabel(quizState, loc);
            return (
            <li key={`${entry.kind}-${entry.id}`}>
              <Link
                href={playHref(loc, corridorId, situation, entry)}
                className="block rounded-xl border border-border bg-card px-4 py-3 hover:border-teal-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {pickLocalized(entry.title, loc)}
                    </p>
                    <p className="text-xs text-slate-500">{kindLabel(entry.kind, loc)}</p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    {scoreLabel && (
                      <p className="font-semibold text-teal-800">{scoreLabel}</p>
                    )}
                    <p className="text-slate-500">
                      {entry.itemCount} {loc === "id" ? "item" : "items"}
                    </p>
                  </div>
                </div>
                {quizzesUnlocked && access.canSaveProgress && (
                  <ProgressBar percent={percent} className="mt-3" />
                )}
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
