import { getTranslations } from "next-intl/server";
import { destinations } from "@/data/catalog";
import { pickLocalized } from "@/lib/locale";
import { selectDestination } from "@/app/[locale]/actions";
import type { CorridorId, Locale } from "@/lib/types";
import { CORRIDOR_FLAG, CORRIDOR_GRADIENT } from "@/lib/corridor-visuals";
import { PageHeader } from "./PageHeader";

type DestinationPickerProps = {
  locale: Locale;
  /** Hide page title when embedded in profile. */
  embedded?: boolean;
};

export async function DestinationPicker({
  locale,
  embedded = false,
}: DestinationPickerProps) {
  const t = await getTranslations("destinations");

  return (
    <div className={embedded ? "space-y-3" : "space-y-6"}>
      {!embedded && (
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      )}
      <ul className="space-y-2.5">
        {destinations.map((dest) => (
          <li key={dest.id}>
            <form action={selectDestination.bind(null, locale, dest.id)}>
              <button
                type="submit"
                className={`lr-card lr-card-interactive flex w-full items-center gap-3 bg-gradient-to-br px-4 py-3.5 text-left ${CORRIDOR_GRADIENT[dest.id as CorridorId]}`}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/90 text-2xl shadow-sm"
                  aria-hidden
                >
                  {CORRIDOR_FLAG[dest.id as CorridorId]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-900">
                    {pickLocalized(dest.name, locale)}
                  </span>
                  <span className="block text-sm text-slate-600">
                    {pickLocalized(dest.targetLanguage, locale)}
                  </span>
                </span>
                <span
                  className="shrink-0 text-xs font-bold uppercase tracking-wide text-teal-800"
                  aria-hidden
                >
                  →
                </span>
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
