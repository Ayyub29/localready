import type { Locale, LocalizedString } from "./types";

export function pickLocalized(value: LocalizedString, locale: Locale): string {
  const primary = value[locale]?.trim();
  if (primary) return primary;
  const fallback = locale === "en" ? value.id : value.en;
  return fallback?.trim() ?? "";
}
