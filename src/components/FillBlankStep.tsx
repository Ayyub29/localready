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

  const sentencePreview = (
    <p className="text-xl font-semibold text-sky-950">
      {question.before}
      <span className="mx-1 inline-block min-w-[3rem] border-b-2 border-sky-400 border-dashed px-1 text-center text-sky-800">
        ?
      </span>
      {question.after ?? ""}
    </p>
  );

  if (!choices.length || !correctId) {
    return (
      <section className="rounded-xl border border-sky-200 bg-sky-50/80 p-5">
        <p className="text-sm text-rose-700">
          {locale === "id" ? "Soal belum dikompilasi." : "Question not compiled."}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50/80 p-5 space-y-4">
      {question.instruction && (
        <p className="text-sm text-sky-950/90">
          {pickLocalized(question.instruction, locale)}
        </p>
      )}
      {sentencePreview}
      {question.hint && (
        <p className="text-xs text-slate-600">{pickLocalized(question.hint, locale)}</p>
      )}
      <McqChoiceStep
        locale={locale}
        options={choices}
        correctOptionId={correctId}
        onSolved={onSolved}
        prompt={
          locale === "id" ? "Pilih kata yang tepat:" : "Choose the missing word:"
        }
      />
    </section>
  );
}
