"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FillBlankStep } from "@/components/FillBlankStep";
import { FlashcardStep } from "@/components/FlashcardStep";
import { LearningProgressReporter } from "@/components/LearningProgressReporter";
import type { PlayableQuiz } from "@/lib/content/load-quiz-for-play";
import { quizProgressKey } from "@/lib/progress/utils";
import { pickLocalized } from "@/lib/locale";
import type { CorridorId, Locale } from "@/lib/types";

type QuizSessionPlayerProps = {
  locale: Locale;
  corridorId: CorridorId;
  playable: PlayableQuiz;
  initialStepIndex?: number;
  initiallyCompleted?: boolean;
  canSaveProgress: boolean;
  initialScoreCorrect?: number;
};

type Step =
  | { type: "fillBlank"; index: number }
  | { type: "flashcard"; index: number }
  | { type: "phrase"; index: number };

function progressQuizId(playable: PlayableQuiz): string {
  if (playable.kind === "fillBlank") return playable.quiz.id;
  if (playable.kind === "flashcards") return playable.deck.id;
  return playable.list.id;
}

function buildSteps(playable: PlayableQuiz): Step[] {
  if (playable.kind === "fillBlank") {
    return playable.quiz.questions.map((_, index) => ({
      type: "fillBlank",
      index,
    }));
  }
  if (playable.kind === "flashcards") {
    return playable.deck.cards.map((_, index) => ({
      type: "flashcard",
      index,
    }));
  }
  return playable.list.phrases.map((_, index) => ({ type: "phrase", index }));
}

function scoreTotalForQuiz(playable: PlayableQuiz): number {
  if (playable.kind === "fillBlank") return playable.quiz.questions.length;
  if (playable.kind === "flashcards") return playable.deck.cards.length;
  return playable.list.phrases.length;
}

export function QuizSessionPlayer({
  locale,
  corridorId,
  playable,
  initialStepIndex = 0,
  initiallyCompleted = false,
  canSaveProgress,
  initialScoreCorrect = 0,
}: QuizSessionPlayerProps) {
  const steps = useMemo(() => buildSteps(playable), [playable]);
  const scoreTotal = scoreTotalForQuiz(playable);
  const tracksMcqScore = playable.kind === "fillBlank";

  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(Math.max(0, initialStepIndex), Math.max(0, steps.length - 1)),
  );
  const [canAdvance, setCanAdvance] = useState(false);
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [reviewedCount, setReviewedCount] = useState(initialScoreCorrect);

  useEffect(() => {
    const current = steps[stepIndex];
    setCanAdvance(current?.type === "phrase");
  }, [stepIndex, steps]);

  const title =
    playable.kind === "fillBlank"
      ? playable.quiz.title
      : playable.kind === "flashcards"
        ? playable.deck.title
        : playable.list.title;

  const atEnd = stepIndex >= steps.length - 1;
  const step = steps[stepIndex];

  const scoreCorrect = tracksMcqScore ? solvedQuestionIds.size : reviewedCount;

  const markFillBlankSolved = useCallback((questionId: string) => {
    setSolvedQuestionIds((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
    setCanAdvance(true);
  }, []);

  const [revealedCardIds, setRevealedCardIds] = useState<Set<string>>(() => new Set());

  const markCardRevealed = useCallback((cardId: string) => {
    setRevealedCardIds((prev) => {
      if (prev.has(cardId)) return prev;
      const next = new Set(prev);
      next.add(cardId);
      setReviewedCount(next.size);
      return next;
    });
    setCanAdvance(true);
  }, []);

  function goNext() {
    if (!canAdvance && step?.type !== "phrase") return;
    if (atEnd) return;
    if (step?.type === "phrase" && playable.kind === "phraseDrill") {
      setReviewedCount((c) => Math.max(c, step.index + 1));
    }
    setStepIndex((i) => i + 1);
    setCanAdvance(steps[stepIndex + 1]?.type === "phrase");
  }

  function goPrev() {
    if (stepIndex <= 0) return;
    setStepIndex((i) => i - 1);
    setCanAdvance(true);
  }

  if (!step) {
    return null;
  }

  const progressKey = quizProgressKey(playable.kind, progressQuizId(playable));
  const completed = canSaveProgress && (initiallyCompleted || atEnd);

  return (
    <div className="space-y-4">
      {canSaveProgress && (
        <LearningProgressReporter
          corridorId={corridorId}
          itemType="quiz"
          itemId={progressKey}
          stepIndex={stepIndex}
          totalSteps={steps.length}
          completed={completed}
          scoreCorrect={scoreCorrect}
          scoreTotal={scoreTotal}
        />
      )}
      <div className="flex items-center justify-between gap-2 text-sm text-slate-600">
        <span>
          {locale === "id" ? "Soal" : "Item"} {stepIndex + 1}/{steps.length}
        </span>
        <span className="text-right font-medium text-slate-800">
          {pickLocalized(title, locale)}
        </span>
      </div>
      {tracksMcqScore && (
        <p className="text-center text-sm font-semibold text-teal-800">
          {locale === "id" ? "Skor" : "Score"}: {scoreCorrect}/{scoreTotal}
        </p>
      )}

      {step.type === "fillBlank" && playable.kind === "fillBlank" && (
        <FillBlankStep
          key={playable.quiz.questions[step.index].id}
          locale={locale}
          question={playable.quiz.questions[step.index]}
          onSolved={() =>
            markFillBlankSolved(playable.quiz.questions[step.index].id)
          }
        />
      )}

      {step.type === "flashcard" && playable.kind === "flashcards" && (
        <FlashcardStep
          key={playable.deck.cards[step.index].id}
          locale={locale}
          card={playable.deck.cards[step.index]}
          onRevealed={() => markCardRevealed(playable.deck.cards[step.index].id)}
        />
      )}

      {step.type === "phrase" && playable.kind === "phraseDrill" && (
        <section className="rounded-xl border border-border bg-card px-5 py-6 text-center space-y-2">
          <p className="text-3xl font-semibold leading-snug tracking-tight">
            {playable.list.phrases[step.index].target}
          </p>
          {playable.list.phrases[step.index].romanization && (
            <p className="mt-2 text-lg text-teal-800">
              {playable.list.phrases[step.index].romanization}
            </p>
          )}
          <p className="mt-4 text-base text-slate-700">
            {pickLocalized(playable.list.phrases[step.index].meaning, locale)}
          </p>
        </section>
      )}

      {atEnd && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-center text-sm text-teal-900">
          {tracksMcqScore
            ? locale === "id"
              ? `Kuis selesai — skor ${scoreCorrect}/${scoreTotal}.`
              : `Quiz complete — score ${scoreCorrect}/${scoreTotal}.`
            : locale === "id"
              ? "Kuis selesai — kerja bagus!"
              : "Quiz complete — nice work!"}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={stepIndex === 0}
          className="flex-1 rounded-xl border border-border py-3 text-sm font-medium disabled:opacity-40"
        >
          {locale === "id" ? "Sebelumnya" : "Previous"}
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={atEnd || (!canAdvance && step.type !== "phrase")}
          className="flex-1 rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          {locale === "id" ? "Lanjut" : "Next"}
        </button>
      </div>
    </div>
  );
}
