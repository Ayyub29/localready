"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { ConversationThread } from "@/components/ConversationThread";
import { FillBlankStep } from "@/components/FillBlankStep";
import { FlashcardStep } from "@/components/FlashcardStep";
import {
  filterLessonSteps,
  lessonPreviewIsLimited,
} from "@/lib/access/content-access";
import { ContentPaywall } from "@/components/ContentPaywall";
import { buildLessonSteps } from "@/lib/content/lesson-player-steps";
import {
  playerStepKey,
  stepNeedsGate,
} from "@/lib/content/lesson-player-step-key";
import { LearningProgressReporter } from "@/components/LearningProgressReporter";
import { pickLocalized } from "@/lib/locale";
import type { LessonContent } from "@/lib/lesson-content-types";
import type { CorridorId, Locale, LocalizedString, SituationKey } from "@/lib/types";

type LessonPlayerProps = {
  locale: Locale;
  corridorId: CorridorId;
  situation: SituationKey;
  situationTitles: Record<SituationKey, LocalizedString>;
  lesson: LessonContent;
  homeHref: string;
  initialStepIndex?: number;
  initiallyCompleted?: boolean;
  canSaveProgress: boolean;
  maxVignetteIndex: number | null;
  isSignedIn: boolean;
};

function stepLabel(
  locale: Locale,
  step: ReturnType<typeof buildLessonSteps>[number],
): string {
  const labels = {
    culture: { en: "Culture", id: "Budaya" },
    conversationDescription: { en: "Scene", id: "Adegan" },
    conversationTurn: { en: "Conversation", id: "Percakapan" },
    miniLesson: { en: "Mini lesson", id: "Pelajaran singkat" },
    phraseListPhrase: { en: "Phrase review", id: "Ulang frasa" },
    fillBlank: { en: "What would you say?", id: "Apa yang kamu katakan?" },
    flashcard: { en: "Flashcard", id: "Kartu kata" },
    scenario: { en: "Scenario", id: "Situasi" },
    phrase: { en: "Phrase", id: "Frasa" },
  };
  return labels[step.type][locale];
}

export function LessonPlayer({
  locale,
  corridorId,
  situation,
  situationTitles,
  lesson,
  homeHref,
  initialStepIndex = 0,
  initiallyCompleted = false,
  canSaveProgress,
  maxVignetteIndex,
  isSignedIn,
}: LessonPlayerProps) {
  const allSteps = useMemo(() => buildLessonSteps(lesson), [lesson]);
  const steps = useMemo(
    () => filterLessonSteps(allSteps, maxVignetteIndex),
    [allSteps, maxVignetteIndex],
  );
  const previewLimited = lessonPreviewIsLimited(allSteps, steps);
  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(Math.max(0, initialStepIndex), Math.max(0, steps.length - 1)),
  );
  const [canAdvance, setCanAdvance] = useState(true);

  const step = steps[stepIndex];
  const stepKey = step ? playerStepKey(step, lesson) : "none";

  useEffect(() => {
    if (!step) return;
    setCanAdvance(!stepNeedsGate(step));
  }, [stepKey, step]);

  if (steps.length === 0 || !step) {
    return (
      <p className="text-sm text-slate-600">
        {locale === "id" ? "Konten belum tersedia." : "Content not available yet."}
      </p>
    );
  }

  const vignette = lesson.vignettes[step.vignetteIndex];
  const atStart = stepIndex === 0;
  const atEnd = stepIndex === steps.length - 1;

  const vignetteCount = lesson.vignettes.length;
  const vignetteNumber = step.vignetteIndex + 1;

  const activeConversation =
    step.type === "conversationDescription" || step.type === "conversationTurn"
      ? vignette.conversations[step.conversationIndex]
      : undefined;

  const fillBlankQuestion =
    step.type === "fillBlank"
      ? vignette.fillBlankQuizzes?.[step.fillBlankQuizIndex]?.questions[
          step.questionIndex
        ]
      : undefined;

  const flashcard =
    step.type === "flashcard"
      ? vignette.flashcardDecks?.[step.flashcardDeckIndex]?.cards[step.cardIndex]
      : undefined;

  function goNext() {
    if (!atEnd) setStepIndex(stepIndex + 1);
  }

  function goPrev() {
    if (!atStart) setStepIndex(stepIndex - 1);
  }

  const completed =
    canSaveProgress && (initiallyCompleted || (atEnd && !previewLimited));

  return (
    <div className="flex min-h-[50vh] flex-col gap-6">
      {canSaveProgress && (
        <LearningProgressReporter
          corridorId={corridorId}
          itemType="lesson"
          itemId={situation}
          stepIndex={stepIndex}
          totalSteps={steps.length}
          completed={completed}
        />
      )}
      <div className="lr-card space-y-3 p-4">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            {locale === "id" ? "Langkah" : "Step"} {stepIndex + 1}/{steps.length}
          </span>
          <span>
            {locale === "id" ? "Adegan" : "Vignette"} {vignetteNumber}/{vignetteCount}
          </span>
        </div>
        <ProgressBar
          percent={Math.round(((stepIndex + 1) / steps.length) * 100)}
        />
        <p className="text-base font-semibold text-slate-900">
          {pickLocalized(vignette.title, locale)}
        </p>
        {activeConversation && (
          <p className="text-xs text-slate-600">
            <span className="lr-step-chip">
              {pickLocalized(
                situationTitles[activeConversation.situation] ?? {
                  en: activeConversation.situation,
                  id: activeConversation.situation,
                },
                locale,
              )}
            </span>
            {activeConversation.title ? (
              <span className="ml-2">{pickLocalized(activeConversation.title, locale)}</span>
            ) : null}
          </p>
        )}
        <p className="lr-eyebrow !text-[0.625rem]">{stepLabel(locale, step)}</p>
      </div>

      <div className="flex-1">
        {step.type === "culture" && vignette.culture?.[step.cardIndex] && (
          <section className="lr-card border-amber-200/80 bg-amber-50/90 p-5 space-y-3">
            <h2 className="text-lg font-semibold text-amber-950">
              {pickLocalized(vignette.culture[step.cardIndex].title, locale)}
            </h2>
            <p className="text-sm leading-relaxed text-amber-950/90">
              {pickLocalized(vignette.culture[step.cardIndex].body, locale)}
            </p>
          </section>
        )}

        {step.type === "conversationDescription" && activeConversation && (
          <section className="lr-card p-5">
            <p className="text-base leading-relaxed text-slate-800">
              {pickLocalized(activeConversation.description, locale)}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              {locale === "id"
                ? "Ketuk Lanjut untuk mulai percakapan."
                : "Tap Next to start the conversation."}
            </p>
          </section>
        )}

        {step.type === "conversationTurn" && activeConversation && (
          <section className="lr-card p-4">
            <ConversationThread
              locale={locale}
              corridorId={lesson.corridorId}
              turns={activeConversation.turns}
              visibleThrough={step.turnIndex}
            />
          </section>
        )}

        {step.type === "scenario" && vignette.scenario && (
          <section className="lr-card p-5">
            <p className="text-base leading-relaxed">
              {pickLocalized(vignette.scenario, locale)}
            </p>
          </section>
        )}

        {step.type === "miniLesson" && vignette.miniLessons?.[step.miniLessonIndex] && (
          <section className="lr-card border-violet-200/80 bg-violet-50/90 p-5 space-y-4">
            <p className="text-sm leading-relaxed text-violet-950/90">
              {pickLocalized(vignette.miniLessons[step.miniLessonIndex].description, locale)}
            </p>
            <ul className="space-y-2">
              {vignette.miniLessons[step.miniLessonIndex].words.map((word) => (
                <li
                  key={word.id}
                  className="rounded-lg border border-violet-100 bg-white/80 px-4 py-3"
                >
                  <p className="text-xl font-semibold text-violet-950">{word.target}</p>
                  {word.romanization && (
                    <p className="text-sm text-teal-800">{word.romanization}</p>
                  )}
                  <p className="mt-1 text-sm text-slate-700">
                    {pickLocalized(word.meaning, locale)}
                  </p>
                  {word.usageNote && (
                    <p className="mt-1 text-xs text-slate-500">
                      {pickLocalized(word.usageNote, locale)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {step.type === "phraseListPhrase" &&
          vignette.phraseLists?.[step.phraseListIndex]?.phrases[step.phraseIndex] && (
            <section className="lr-card px-5 py-6 text-center space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {pickLocalized(
                  vignette.phraseLists[step.phraseListIndex].title,
                  locale,
                )}
              </p>
              <p className="text-3xl font-semibold leading-snug tracking-tight">
                {
                  vignette.phraseLists[step.phraseListIndex].phrases[step.phraseIndex]
                    .target
                }
              </p>
              {vignette.phraseLists[step.phraseListIndex].phrases[step.phraseIndex]
                .romanization && (
                <p className="mt-2 text-lg text-teal-800">
                  {
                    vignette.phraseLists[step.phraseListIndex].phrases[step.phraseIndex]
                      .romanization
                  }
                </p>
              )}
              <p className="mt-4 text-base text-slate-700">
                {pickLocalized(
                  vignette.phraseLists[step.phraseListIndex].phrases[step.phraseIndex]
                    .meaning,
                  locale,
                )}
              </p>
            </section>
          )}

        {step.type === "fillBlank" && fillBlankQuestion && (
          <div className="space-y-2" key={stepKey}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {pickLocalized(
                vignette.fillBlankQuizzes![step.fillBlankQuizIndex].title,
                locale,
              )}
            </p>
            <FillBlankStep
              key={fillBlankQuestion.id}
              locale={locale}
              question={fillBlankQuestion}
              onSolved={() => setCanAdvance(true)}
            />
          </div>
        )}

        {step.type === "flashcard" && flashcard && (
          <div className="space-y-2" key={stepKey}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {pickLocalized(
                vignette.flashcardDecks![step.flashcardDeckIndex].title,
                locale,
              )}
            </p>
            <FlashcardStep
              key={flashcard.id}
              locale={locale}
              card={flashcard}
              onRevealed={() => setCanAdvance(true)}
            />
          </div>
        )}

        {step.type === "phrase" && vignette.phrases?.[step.phraseIndex] && (
          <section className="lr-card px-5 py-6 text-center">
            <p className="text-3xl font-semibold leading-snug tracking-tight">
              {vignette.phrases[step.phraseIndex].target}
            </p>
            {vignette.phrases[step.phraseIndex].romanization && (
              <p className="mt-2 text-lg text-teal-800">
                {vignette.phrases[step.phraseIndex].romanization}
              </p>
            )}
            <p className="mt-4 text-base text-slate-700">
              {pickLocalized(vignette.phrases[step.phraseIndex].meaning, locale)}
            </p>
          </section>
        )}
      </div>

      {atEnd && previewLimited && (
        <ContentPaywall
          locale={locale}
          corridorId={corridorId}
          variant={isSignedIn ? "subscribe" : "signIn"}
        />
      )}

      {atEnd && !previewLimited && (
        <div className="lr-card border-teal-200/80 bg-teal-50/80 px-4 py-4 text-center text-sm text-teal-900">
          {locale === "id"
            ? "Kamu sudah menyelesaikan pelajaran ini."
            : "You finished this lesson."}
          <div className="mt-2">
            <Link href={homeHref} className="font-medium text-teal-800 underline">
              {locale === "id" ? "Kembali ke beranda" : "Back to home"}
            </Link>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 lr-player-footer flex gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={atStart}
          onClick={goPrev}
          className="flex-1 !py-3"
        >
          {locale === "id" ? "Sebelumnya" : "Previous"}
        </Button>
        <Button
          type="button"
          disabled={atEnd || !canAdvance}
          onClick={goNext}
          className="flex-1 !py-3"
        >
          {locale === "id" ? "Lanjut" : "Next"}
        </Button>
      </div>
    </div>
  );
}
