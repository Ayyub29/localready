import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CheatsheetPhraseList } from "@/components/CheatsheetPhraseList";
import { isCorridorId } from "@/data/catalog";
import {
  loadPhraseCatalog,
  phrasesForSituation,
} from "@/lib/content/load-phrase-catalog";
import {
  isSituationKeyForCorridor,
  loadSituationsForCorridor,
  situationTitle,
} from "@/lib/content/load-situations";
import type { CorridorId, Locale, SituationKey } from "@/lib/types";

type CheatsheetSituationPageProps = {
  params: Promise<{ locale: string; corridorId: string; situation: string }>;
};

export default async function CheatsheetSituationPage({
  params,
}: CheatsheetSituationPageProps) {
  const { locale, corridorId, situation } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  if (!isCorridorId(corridorId)) {
    notFound();
  }
  const c = corridorId as CorridorId;
  if (!(await isSituationKeyForCorridor(c, situation))) {
    notFound();
  }

  const [catalog, situationDefs] = await Promise.all([
    loadPhraseCatalog(corridorId),
    loadSituationsForCorridor(c),
  ]);
  const phrases = phrasesForSituation(catalog, situation as SituationKey);
  const title = situationTitle(situationDefs, situation as SituationKey, loc);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <header className="space-y-1">
        <Link
          href={`/${loc}/cheatsheet/${corridorId}`}
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          ← {loc === "id" ? "Situasi" : "Situations"}
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-slate-600">
          {phrases.length} {loc === "id" ? "frasa" : "phrases"}
        </p>
      </header>

      <CheatsheetPhraseList locale={loc} phrases={phrases} />
    </div>
  );
}
