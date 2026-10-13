"use client";

import { useState } from "react";
import type { McqOption } from "@/lib/lesson-content-types";
import type { Locale } from "@/lib/types";

type McqChoiceStepProps = {
  locale: Locale;
  options: McqOption[];
  correctOptionId: string;
  onSolved: () => void;
  prompt?: string;
};

export function McqChoiceStep({
  locale,
  options,
  correctOptionId,
  onSolved,
  prompt,
}: McqChoiceStepProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const solved = selectedId === correctOptionId;
  const wrong = selectedId !== null && !solved;

  function choose(optionId: string) {
    if (solved) return;
    setSelectedId(optionId);
    if (optionId === correctOptionId) {
      onSolved();
    }
  }

  return (
    <div className="space-y-3">
      {prompt && <p className="text-sm text-slate-700">{prompt}</p>}
      <ul className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const isCorrect = option.id === correctOptionId;
          let style =
            "w-full rounded-xl border px-4 py-3 text-left text-base font-medium transition-colors ";
          if (solved && isCorrect) {
            style += "border-teal-600 bg-teal-50 text-teal-950";
          } else if (isSelected && wrong) {
            style += "border-rose-400 bg-rose-50 text-rose-950";
          } else if (isSelected) {
            style += "border-teal-600 bg-teal-50";
          } else {
            style +=
              "border-border bg-card text-slate-900 hover:border-teal-400 disabled:opacity-60";
          }
          return (
            <li key={option.id}>
              <button
                type="button"
                disabled={solved}
                onClick={() => choose(option.id)}
                className={style}
              >
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
      {wrong && (
        <p className="text-sm font-medium text-rose-700">
          {locale === "id" ? "Belum tepat — coba lagi." : "Not quite — try again."}
        </p>
      )}
      {solved && (
        <p className="text-sm font-medium text-teal-800">
          {locale === "id" ? "Benar!" : "Correct!"}
        </p>
      )}
    </div>
  );
}
