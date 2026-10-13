"use client";

import { McqChoiceStep } from "@/components/McqChoiceStep";
import type { FillBlankQuestion } from "@/lib/lesson-content-types";
import { pickLocalized } from "@/lib/locale";
import type { Locale } from "@/lib/types";

type FillBlankStepProps = {
  locale: Locale;
  question: FillBlankQuestion;
  onSolved: () => void;
};

export function FillBlankStep({ locale, question, onSolved }: FillBlankStepProps) {
  const choices = question.choices ?? [];
  const correctId = question.correctChoiceId ?? "";

  if (!choices.length || !correctId) {
    return (
      <section className="rounded-xl border border-sky-200 bg-sky-50/80 p-5">
        <p className="text-sm text-rose-700">
          {locale === "id" ? "Soal belum dikompilasi." : "Question not compiled."}
        </p>
      </section>
    );
  }

  const respondLabel =
    locale === "id" ? "Apa yang kamu katakan?" : "What do you say?";

  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50/80 p-5 space-y-4">
      {question.kind === "situation" && (
        <div className="rounded-lg border border-sky-100 bg-white/90 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-800/80">
            {locale === "id" ? "Situasi" : "Situation"}
          </p>
          <p className="mt-2 text-base leading-relaxed text-sky-950">
            {pickLocalized(question.prompt, locale)}
          </p>
        </div>
      )}

      {question.kind === "reply" && question.cueTarget && (
        <div className="space-y-2">
          {question.cueSpeaker && (
            <p className="text-xs font-medium text-slate-500">
              {pickLocalized(question.cueSpeaker, locale)}
            </p>
          )}
          <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
            <p className="text-lg font-semibold text-slate-900">{question.cueTarget}</p>
            {pickLocalized(question.prompt, locale) !== question.cueTarget && (
              <p className="mt-1 text-sm text-slate-600">
                {pickLocalized(question.prompt, locale)}
              </p>
            )}
          </div>
        </div>
      )}

      {question.hint && (
        <p className="text-xs text-slate-600">{pickLocalized(question.hint, locale)}</p>
      )}

      <McqChoiceStep
        locale={locale}
        options={choices}
        correctOptionId={correctId}
        onSolved={onSolved}
        prompt={respondLabel}
      />
    </section>
  );
}
