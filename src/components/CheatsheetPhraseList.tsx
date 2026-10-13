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
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-600">
        {locale === "id"
          ? "Belum ada frasa untuk situasi ini."
          : "No phrases for this situation yet."}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {phrases.map((phrase) => (
        <li
          key={phrase.id}
          className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm"
        >
          <p className="text-xl font-semibold leading-snug text-slate-900">
            {phrase.target}
          </p>
          {phrase.romanization && (
            <p className="mt-1 text-sm text-teal-800">{phrase.romanization}</p>
          )}
          <p className="mt-2 text-sm text-slate-700">
            {pickLocalized(phrase.meaning, locale)}
          </p>
        </li>
      ))}
    </ul>
  );
}
