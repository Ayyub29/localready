import type { CorridorId } from "@/lib/types";

/** Access duration for weekly SKUs (SPEC §8). */
export const PASS_DURATION_DAYS = 7;

export type SkuId = "trip_pass" | "subscription";

export type SkuDefinition = {
  id: SkuId;
  priceIdr: number;
  /** Shown for price psychology (SPEC / ScreensDesign weekly framing). */
  pricePerWeekIdr: number;
};

export const SKUS: Record<SkuId, SkuDefinition> = {
  trip_pass: {
    id: "trip_pass",
    priceIdr: 49_000,
    pricePerWeekIdr: 49_000,
  },
  subscription: {
    id: "subscription",
    priceIdr: 99_000,
    pricePerWeekIdr: 99_000,
  },
};

export function formatIdr(amount: number, locale: "en" | "id"): string {
  return new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isCorridorId(value: string): value is CorridorId {
  return (
    value === "ja-jp" ||
    value === "ko-kr" ||
    value === "th-th" ||
    value === "vi-vn" ||
    value === "id-id"
  );
}
