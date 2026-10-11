import type { Locale, LocalizedString } from "./types";

export function pickLocalized(value: LocalizedString, locale: Locale): string {
  return value[locale];
}
