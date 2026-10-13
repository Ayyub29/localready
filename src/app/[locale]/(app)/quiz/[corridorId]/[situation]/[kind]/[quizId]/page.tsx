import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { QuizSessionPlayer } from "@/components/QuizSessionPlayer";
import { getDestination, getSituationTitle, isCorridorId } from "@/data/catalog";
import { loadQuizForPlay } from "@/lib/content/load-quiz-for-play";
import { getItemProgress, quizProgressKey } from "@/lib/progress";
import type { QuizKind } from "@/lib/content/quiz-situation";
import { situationOrder } from "@/lib/situations";
import type { Locale, SituationKey } from "@/lib/types";

type QuizPlayPageProps = {
  params: Promise<{
    locale: string;
    corridorId: string;
    situation: string;
    kind: string;
    quizId: string;
  }>;
};

function isSituationKey(value: string): value is SituationKey {
  return (situationOrder as string[]).includes(value);
}

function parseKind(value: string): QuizKind | null {
  if (value === "fillBlank" || value === "flashcards" || value === "phraseDrill") {
    return value;
  }
  return null;
}

export default async function QuizPlayPage({ params }: QuizPlayPageProps) {
  const { locale, corridorId, situation, kind: kindParam, quizId } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const kind = parseKind(kindParam);
  if (!isCorridorId(corridorId) || !isSituationKey(situation) || !kind) {
    notFound();
  }

  const destination = getDestination(corridorId);
  if (!destination) notFound();

  const playable = await loadQuizForPlay(corridorId, kind, quizId);
  if (!playable) notFound();

  const progressId = quizProgressKey(kind, quizId);
  const saved = await getItemProgress(corridorId, "quiz", progressId);
  const totalSteps =
    playable.kind === "fillBlank"
      ? playable.quiz.questions.length
      : playable.kind === "flashcards"
        ? playable.deck.cards.length
        : playable.list.phrases.length;
  const initialStepIndex =
    saved?.completed && totalSteps > 0 ? totalSteps - 1 : saved?.stepIndex ?? 0;

  const t = await getTranslations({ locale: loc, namespace: "quiz" });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${loc}/quiz/${corridorId}/${situation}`}
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          ← {t("backToList")}
        </Link>
      </div>
      <header>
        <h1 className="text-xl font-bold">{getSituationTitle(situation, loc)}</h1>
        <p className="text-sm text-slate-600">{t("inProgress")}</p>
      </header>
      <QuizSessionPlayer
        locale={loc}
        corridorId={corridorId}
        playable={playable}
        initialStepIndex={initialStepIndex}
        initiallyCompleted={saved?.completed ?? false}
      />
    </div>
  );
}
