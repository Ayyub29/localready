import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { SituationCardLink } from "@/components/SituationCardLink";
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
import { CORRIDOR_FLAG, CORRIDOR_GRADIENT } from "@/lib/corridor-visuals";
import { pickLocalized } from "@/lib/locale";
import type { CorridorId, Locale } from "@/lib/types";

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

  const c = corridorId as CorridorId;
  const destination = getDestination(corridorId);
  if (!destination) notFound();

  const [catalog, situationDefs] = await Promise.all([
    loadPhraseCatalog(corridorId),
    loadSituationsForCorridor(corridorId),
  ]);
  const situations = await enabledSituationsWithPhrases(corridorId, catalog);
  const t = await getTranslations({ locale: loc, namespace: "cheatsheet" });

  return (
    <div className="space-y-6">
      <BackLink href="/cheatsheet">{t("changeDestination")}</BackLink>

      <section
        className={`lr-card overflow-hidden bg-gradient-to-br p-5 ${CORRIDOR_GRADIENT[c]}`}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-2xl shadow-sm"
            aria-hidden
          >
            {CORRIDOR_FLAG[c]}
          </span>
          <PageHeader
            eyebrow={t("title")}
            title={pickLocalized(destination.name, loc)}
            subtitle={`${pickLocalized(destination.targetLanguage, loc)} · ${t("pickSituation")}`}
          />
        </div>
      </section>

      {situations.length === 0 ? (
        <p className="lr-card border-dashed px-4 py-10 text-center text-sm text-slate-600">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {situations.map((situation) => {
            const count = phrasesForSituation(catalog, situation).length;
            return (
              <li key={situation}>
                <SituationCardLink
                  href={`/cheatsheet/${corridorId}/${situation}`}
                  title={situationTitle(situationDefs, situation, loc)}
                  trailing={
                    <span>
                      {count} {loc === "id" ? "frasa" : "phrases"}
                    </span>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
