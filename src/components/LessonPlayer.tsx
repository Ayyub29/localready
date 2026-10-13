"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConversationThread } from "@/components/ConversationThread";
import { getSituationTitle } from "@/data/catalog";
import { buildLessonSteps } from "@/lib/content/lesson-player-steps";
import { pickLocalized } from "@/lib/locale";
import type { LessonContent } from "@/lib/lesson-content-types";
import type { Locale } from "@/lib/types";

type LessonPlayerProps = {
  locale: Locale;
  lesson: LessonContent;
  homeHref: string;
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
    scenario: { en: "Scenario", id: "Situasi" },
    phrase: { en: "Phrase", id: "Frasa" },
  };
  return labels[step.type][locale];
}

export function LessonPlayer({ locale, lesson, homeHref }: LessonPlayerProps) {
  const steps = useMemo(() => buildLessonSteps(lesson), [lesson]);
  const [stepIndex, setStepIndex] = useState(0);

  if (steps.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        {locale === "id" ? "Konten belum tersedia." : "Content not available yet."}
      </p>
    );
  }

  const step = steps[stepIndex];
  const vignette = lesson.vignettes[step.vignetteIndex];
  const atStart = stepIndex === 0;
  const atEnd = stepIndex === steps.length - 1;

  const vignetteCount = lesson.vignettes.length;
  const vignetteNumber = step.vignetteIndex + 1;

  const activeConversation =
    step.type === "conversationDescription" || step.type === "conversationTurn"
      ? vignette.conversations[step.conversationIndex]
      : undefined;

  function goNext() {
    if (!atEnd) setStepIndex(stepIndex + 1);
  }

  function goPrev() {
    if (!atStart) setStepIndex(stepIndex - 1);
  }

  return (
    <div className="flex min-h-[50vh] flex-col gap-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {locale === "id" ? "Langkah" : "Step"} {stepIndex + 1}/{steps.length}
          </span>
          <span>
            {locale === "id" ? "Adegan" : "Vignette"} {vignetteNumber}/{vignetteCount}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-sm font-medium text-slate-800">
          {pickLocalized(vignette.title, locale)}
        </p>
        {activeConversation && (
          <p className="text-xs text-slate-600">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
              {getSituationTitle(activeConversation.situation, locale)}
            </span>
            {activeConversation.title ? (
              <span className="ml-2">{pickLocalized(activeConversation.title, locale)}</span>
            ) : null}
          </p>
        )}
        <p className="text-xs uppercase tracking-wide text-teal-800">
          {stepLabel(locale, step)}
        </p>
      </div>

      <div className="flex-1">
        {step.type === "culture" && vignette.culture?.[step.cardIndex] && (
          <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 space-y-3">
            <h2 className="text-lg font-semibold text-amber-950">
              {pickLocalized(vignette.culture[step.cardIndex].title, locale)}
            </h2>
            <p className="text-sm leading-relaxed text-amber-950/90">
              {pickLocalized(vignette.culture[step.cardIndex].body, locale)}
            </p>
          </section>
        )}

        {step.type === "conversationDescription" && activeConversation && (
          <section className="rounded-xl border border-border bg-card p-5">
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
          <section className="rounded-xl border border-border bg-card p-4">
            <ConversationThread
              locale={locale}
              corridorId={lesson.corridorId}
              turns={activeConversation.turns}
              visibleThrough={step.turnIndex}
            />
          </section>
        )}

        {step.type === "scenario" && vignette.scenario && (
          <section className="rounded-xl border border-border bg-card p-5">
            <p className="text-base leading-relaxed">
              {pickLocalized(vignette.scenario, locale)}
            </p>
          </section>
        )}

        {step.type === "miniLesson" && vignette.miniLessons?.[step.miniLessonIndex] && (
          <section className="rounded-xl border border-violet-200 bg-violet-50/80 p-5 space-y-4">
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
            <section className="rounded-xl border border-border bg-card px-5 py-6 text-center space-y-2">
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

        {step.type === "phrase" && vignette.phrases?.[step.phraseIndex] && (
          <section className="rounded-xl border border-border bg-card px-5 py-6 text-center">
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

      {atEnd && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-center text-sm text-teal-900">
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

      <div className="sticky bottom-0 flex gap-3 border-t border-border bg-background pt-4 pb-1">
        <button
          type="button"
          disabled={atStart}
          onClick={goPrev}
          className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium disabled:opacity-40"
        >
          {locale === "id" ? "Sebelumnya" : "Previous"}
        </button>
        <button
          type="button"
          disabled={atEnd}
          onClick={goNext}
          className="flex-1 rounded-xl bg-teal-700 px-4 py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {locale === "id" ? "Lanjut" : "Next"}
        </button>
      </div>
    </div>
  );
}
