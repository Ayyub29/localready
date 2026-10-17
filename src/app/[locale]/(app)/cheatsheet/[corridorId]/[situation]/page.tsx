import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CheatsheetPhraseList } from "@/components/CheatsheetPhraseList";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
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
    <div className="space-y-6">
      <BackLink href={`/cheatsheet/${corridorId}`}>
        {loc === "id" ? "Situasi" : "Situations"}
      </BackLink>
      <PageHeader
        eyebrow={loc === "id" ? "Cheatsheet" : "Cheatsheet"}
        title={title}
        subtitle={`${phrases.length} ${loc === "id" ? "frasa siap pakai" : "phrases at a glance"}`}
      />
      <CheatsheetPhraseList locale={loc} phrases={phrases} />
    </div>
  );
}
