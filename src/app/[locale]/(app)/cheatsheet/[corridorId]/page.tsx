import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getDestination, isCorridorId } from "@/data/catalog";
import {
  enabledSituationsWithPhrases,
  loadPhraseCatalog,
  phrasesForSituation,
} from "@/lib/content/load-phrase-catalog";
import {
  loadSituationsForCorridor,
  situationTitle,
} from "@/lib/content/load-situations";
import { pickLocalized } from "@/lib/locale";
import type { Locale } from "@/lib/types";

type CheatsheetCorridorPageProps = {
  params: Promise<{ locale: string; corridorId: string }>;
};

export default async function CheatsheetCorridorPage({
  params,
}: CheatsheetCorridorPageProps) {
  const { locale, corridorId } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  if (!isCorridorId(corridorId)) notFound();

  const destination = getDestination(corridorId);
  if (!destination) notFound();

  const [catalog, situationDefs] = await Promise.all([
    loadPhraseCatalog(corridorId),
    loadSituationsForCorridor(corridorId),
  ]);
  const situations = await enabledSituationsWithPhrases(corridorId, catalog);
  const t = await getTranslations({ locale: loc, namespace: "cheatsheet" });

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <header className="space-y-1">
        <Link
          href={`/${loc}/cheatsheet`}
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          ← {t("changeDestination")}
        </Link>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-slate-600">
          {pickLocalized(destination.name, loc)} · {pickLocalized(destination.targetLanguage, loc)}
        </p>
        <p className="text-sm text-slate-600">{t("pickSituation")}</p>
      </header>

      {situations.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-600">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {situations.map((situation) => {
            const count = phrasesForSituation(catalog, situation).length;
            return (
              <li key={situation}>
                <Link
                  href={`/${loc}/cheatsheet/${corridorId}/${situation}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:border-teal-300"
                >
                  <span className="font-medium text-slate-900">
                    {situationTitle(situationDefs, situation, loc)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {count} {loc === "id" ? "frasa" : "phrases"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
