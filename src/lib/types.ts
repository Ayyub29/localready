export type Locale = "en" | "id";

export type CorridorId = "ja-jp" | "ko-kr" | "th-th" | "vi-vn" | "id-id";

export type SituationKey =
  | "basics"
  | "train"
  | "money"
  | "restaurant"
  | "hotel"
  | "directions"
  | "culture"
  | "emergency";

export type LocalizedString = {
  en: string;
  id: string;
};
