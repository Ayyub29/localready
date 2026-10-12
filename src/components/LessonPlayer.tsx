"use client";

import { useMemo, useState } from "react";
import { pickLocalized } from "@/lib/locale";
import type { LessonContent, LessonUnitType, LessonVignette } from "@/lib/lesson-content-types";
import type { Locale } from "@/lib/types";

type LessonPlayerProps = {
  locale: Locale;
  lesson: LessonContent;
};

function unitsForVignette(
  unitOrder: LessonUnitType[],
  vignette: LessonVignette,
): LessonUnitType[] {
  const hasCulture = (vignette.culture?.length ?? 0) > 0;
  return hasCulture ? unitOrder : unitOrder.filter((u) => u !== "culture");
}

export function LessonPlayer({ locale, lesson }: LessonPlayerProps) {
  const [vignetteIndex, setVignetteIndex] = useState(0);
  const [unitIndex, setUnitIndex] = useState(0);

  const vignette = lesson.vignettes[vignetteIndex];
  const units = useMemo(
    () => (vignette ? unitsForVignette(lesson.unitOrder, vignette) : []),
    [lesson.unitOrder, vignette],
  );
  const unit = units[unitIndex];

  if (!vignette) {
    return (
      <p className="text-sm text-slate-600">
        {locale === "id" ? "Konten belum tersedia." : "Content not available yet."}
      </p>
    );
  }

  function goNext() {
    if (unitIndex < units.length - 1) {
      setUnitIndex(unitIndex + 1);
      return;
    }
    if (vignetteIndex < lesson.vignettes.length - 1) {
      setVignetteIndex(vignetteIndex + 1);
      setUnitIndex(0);
    }
  }

  function goPrev() {
    if (unitIndex > 0) {
      setUnitIndex(unitIndex - 1);
      return;
    }
    if (vignetteIndex > 0) {
      const prevV = lesson.vignettes[vignetteIndex - 1];
      const prevUnits = unitsForVignette(lesson.unitOrder, prevV);
      setVignetteIndex(vignetteIndex - 1);
      setUnitIndex(prevUnits.length - 1);
    }
  }

  const atStart = vignetteIndex === 0 && unitIndex === 0;
  const atEnd =
    vignetteIndex === lesson.vignettes.length - 1 && unitIndex === units.length - 1;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {pickLocalized(vignette.title, locale)} · {unit}
        </p>
        <p className="text-sm text-slate-600">
          {locale === "id" ? "Vignette" : "Vignette"}{" "}
          {vignetteIndex + 1}/{lesson.vignettes.length}
        </p>
      </header>

      {unit === "culture" && vignette.culture?.map((card) => (
        <section
          key={card.id}
          className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 space-y-2"
        >
          <h2 className="font-semibold text-amber-950">
            {pickLocalized(card.title, locale)}
          </h2>
          <p className="text-sm text-amber-950/90">{pickLocalized(card.body, locale)}</p>
        </section>
      ))}

      {unit === "scenario" && (
        <section className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm leading-relaxed">{pickLocalized(vignette.scenario, locale)}</p>
        </section>
      )}

      {unit === "phrases" && (
        <ul className="space-y-3">
          {vignette.phrases.map((phrase) => (
            <li
              key={phrase.id}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <p className="text-xl font-semibold leading-snug">{phrase.target}</p>
              {phrase.romanization && (
                <p className="text-sm text-teal-800">{phrase.romanization}</p>
              )}
              <p className="mt-1 text-sm text-slate-700">
                {pickLocalized(phrase.meaning, locale)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {unit === "quiz" && vignette.quiz[0] && (
        <section className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="font-medium">{pickLocalized(vignette.quiz[0].prompt, locale)}</p>
          {vignette.quiz[0].type === "pick-phrase" && (
            <ul className="space-y-2 text-sm">
              {vignette.quiz[0].phraseIds.map((id) => {
                const phrase = vignette.phrases.find((p) => p.id === id);
                if (!phrase) return null;
                return (
                  <li key={id} className="rounded-lg bg-slate-50 px-3 py-2">
                    {phrase.target}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-xs text-slate-500">
            {locale === "id"
              ? "Kuis interaktif menyusul — untuk sekarang baca frasa di atas."
              : "Interactive quiz coming soon — review the phrases above for now."}
          </p>
        </section>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          disabled={atStart}
          onClick={goPrev}
          className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium disabled:opacity-40"
        >
          {locale === "id" ? "Sebelumnya" : "Back"}
        </button>
        <button
          type="button"
          disabled={atEnd}
          onClick={goNext}
          className="flex-1 rounded-xl bg-teal-700 px-4 py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {atEnd
            ? locale === "id"
              ? "Selesai"
              : "Done"
            : locale === "id"
              ? "Lanjut"
              : "Next"}
        </button>
      </div>
    </div>
  );
}
