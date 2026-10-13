import type { Locale } from "@/lib/types";

export function adminBasePath(locale: Locale): string {
  return `/${locale}/admin`;
}

export function adminCorridorPath(locale: Locale, corridorId: string): string {
  return `${adminBasePath(locale)}/${corridorId}`;
}

export function adminSectionPath(
  locale: Locale,
  corridorId: string,
  ...segments: string[]
): string {
  return [adminCorridorPath(locale, corridorId), ...segments].join("/");
}
