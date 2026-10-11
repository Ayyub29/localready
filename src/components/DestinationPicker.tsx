import { getTranslations } from "next-intl/server";
import { destinations } from "@/data/catalog";
import { pickLocalized } from "@/lib/locale";
import { selectDestination } from "@/app/[locale]/actions";
import type { Locale } from "@/lib/types";
import { Button } from "./Button";

type DestinationPickerProps = {
  locale: Locale;
};

export async function DestinationPicker({ locale }: DestinationPickerProps) {
  const t = await getTranslations("destinations");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
      </header>
      <ul className="space-y-3">
        {destinations.map((dest) => (
          <li key={dest.id}>
            <form action={selectDestination.bind(null, locale, dest.id)}>
              <Button type="submit" variant="secondary" className="w-full !justify-start !px-4 !py-4 !h-auto">
                <span className="text-left">
                  <span className="block font-semibold">
                    {pickLocalized(dest.name, locale)}
                  </span>
                  <span className="block text-sm font-normal text-slate-600">
                    {pickLocalized(dest.targetLanguage, locale)}
                  </span>
                </span>
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
