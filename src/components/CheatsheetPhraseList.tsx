import type { PhraseCatalogEntry } from "@/lib/content/load-phrase-catalog";
import { pickLocalized } from "@/lib/locale";
import type { Locale } from "@/lib/types";

type CheatsheetPhraseListProps = {
  locale: Locale;
  phrases: PhraseCatalogEntry[];
};

export function CheatsheetPhraseList({ locale, phrases }: CheatsheetPhraseListProps) {
  if (phrases.length === 0) {
    return (
      <p className="lr-card border-dashed px-4 py-10 text-center text-sm text-slate-600">
        {locale === "id"
          ? "Belum ada frasa untuk situasi ini."
          : "No phrases for this situation yet."}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {phrases.map((phrase) => (
        <li key={phrase.id} className="lr-card lr-card-interactive px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[1.35rem] font-bold leading-snug tracking-tight text-slate-900">
                {phrase.target}
              </p>
              {phrase.romanization && (
                <p className="mt-1.5 text-sm font-medium text-teal-700">
                  {phrase.romanization}
                </p>
              )}
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                {pickLocalized(phrase.meaning, locale)}
              </p>
            </div>
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-100"
              title={locale === "id" ? "Audio menyusul" : "Audio coming soon"}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
