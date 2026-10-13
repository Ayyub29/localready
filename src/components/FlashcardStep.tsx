"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/lesson-content-types";
import { pickLocalized } from "@/lib/locale";
import type { Locale } from "@/lib/types";

type FlashcardStepProps = {
  locale: Locale;
  card: Flashcard;
  onRevealed: () => void;
};

export function FlashcardStep({ locale, card, onRevealed }: FlashcardStepProps) {
  const [revealed, setRevealed] = useState(false);

  function reveal() {
    setRevealed(true);
    onRevealed();
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-4">
      <button
        type="button"
        onClick={() => !revealed && reveal()}
        className={`w-full min-h-[10rem] rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          revealed
            ? "border-teal-200 bg-teal-50/50"
            : "border-slate-200 bg-slate-50 hover:border-teal-300 cursor-pointer"
        }`}
      >
        {!revealed ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {locale === "id" ? "Ketuk untuk lihat" : "Tap to reveal"}
            </p>
            <p className="text-2xl font-semibold leading-snug text-slate-900">
              {pickLocalized(card.front, locale)}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-3xl font-semibold leading-snug text-slate-900">
              {card.target}
            </p>
            {card.romanization && (
              <p className="text-lg text-teal-800">{card.romanization}</p>
            )}
            <p className="text-base text-slate-600">
              {pickLocalized(card.meaning, locale)}
            </p>
          </div>
        )}
      </button>
      {!revealed && (
        <button
          type="button"
          onClick={reveal}
          className="w-full rounded-lg border border-border py-2 text-sm font-medium"
        >
          {locale === "id" ? "Tampilkan jawaban" : "Show answer"}
        </button>
      )}
    </section>
  );
}
