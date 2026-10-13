"use client";

import { useState } from "react";
import { isFillBlankCorrect } from "@/lib/content/fill-blank-check";
import type { FillBlankQuestion } from "@/lib/lesson-content-types";
import { pickLocalized } from "@/lib/locale";
import type { Locale } from "@/lib/types";

type FillBlankStepProps = {
  locale: Locale;
  question: FillBlankQuestion;
  onSolved: () => void;
};

export function FillBlankStep({ locale, question, onSolved }: FillBlankStepProps) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const correct = checked && isFillBlankCorrect(value, question.answers);

  function handleCheck() {
    setChecked(true);
    if (isFillBlankCorrect(value, question.answers)) {
      onSolved();
    }
  }

  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50/80 p-5 space-y-4">
      {question.instruction && (
        <p className="text-sm text-sky-950/90">
          {pickLocalized(question.instruction, locale)}
        </p>
      )}
      <div className="flex flex-wrap items-baseline gap-1 text-xl font-semibold text-sky-950">
        <span>{question.before}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setChecked(false);
          }}
          disabled={correct}
          className="min-w-[5rem] max-w-full rounded-md border border-sky-300 bg-white px-2 py-1 text-xl font-semibold text-sky-950 outline-none focus:ring-2 focus:ring-sky-400"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={locale === "id" ? "Isi kata yang hilang" : "Missing word"}
        />
        {question.after ? <span>{question.after}</span> : null}
      </div>
      {question.hint && !correct && (
        <p className="text-xs text-slate-600">
          {pickLocalized(question.hint, locale)}
        </p>
      )}
      {!correct && (
        <button
          type="button"
          onClick={handleCheck}
          disabled={!value.trim()}
          className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {locale === "id" ? "Periksa" : "Check"}
        </button>
      )}
      {checked && !correct && (
        <p className="text-sm font-medium text-rose-700">
          {locale === "id" ? "Belum tepat — coba lagi." : "Not quite — try again."}
        </p>
      )}
      {correct && (
        <p className="text-sm font-medium text-teal-800">
          {locale === "id" ? "Benar!" : "Correct!"}
        </p>
      )}
    </section>
  );
}
