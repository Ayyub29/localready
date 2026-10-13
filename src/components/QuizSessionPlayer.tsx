"use client";

import { useEffect, useMemo, useState } from "react";
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

export function QuizSessionPlayer({
  locale,
  corridorId,
  playable,
  initialStepIndex = 0,
  initiallyCompleted = false,
  canSaveProgress,
}: QuizSessionPlayerProps) {
  const steps = useMemo(() => buildSteps(playable), [playable]);
  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(Math.max(0, initialStepIndex), Math.max(0, steps.length - 1)),
  );
  const [canAdvance, setCanAdvance] = useState(false);

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

  function goNext() {
    if (!canAdvance && step?.type !== "phrase") return;
    if (atEnd) return;
    setStepIndex((i) => i + 1);
    setCanAdvance(step?.type === "phrase");
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
        />
      )}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          {locale === "id" ? "Soal" : "Item"} {stepIndex + 1}/{steps.length}
        </span>
        <span className="font-medium text-slate-800">{pickLocalized(title, locale)}</span>
      </div>

      {step.type === "fillBlank" && playable.kind === "fillBlank" && (
        <FillBlankStep
          key={playable.quiz.questions[step.index].id}
          locale={locale}
          question={playable.quiz.questions[step.index]}
          onSolved={() => setCanAdvance(true)}
        />
      )}

      {step.type === "flashcard" && playable.kind === "flashcards" && (
        <FlashcardStep
          key={playable.deck.cards[step.index].id}
          locale={locale}
          card={playable.deck.cards[step.index]}
          onRevealed={() => setCanAdvance(true)}
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
          {locale === "id" ? "Kuis selesai — kerja bagus!" : "Quiz complete — nice work!"}
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
