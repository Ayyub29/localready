import type { CorridorId, LocalizedString, SituationKey } from "@/lib/types";

export type Destination = {
  id: CorridorId;
  name: LocalizedString;
  targetLanguage: LocalizedString;
};

export type LessonListItem = {
  id: string;
  corridorId: CorridorId;
  situation: SituationKey;
  order: number;
  title: LocalizedString;
};

const lessonTitles: Record<SituationKey, LocalizedString> = {
  basics: { en: "First hour & greetings", id: "Jam pertama & sapaan" },
  train: { en: "Transit & tickets", id: "Transportasi & tiket" },
  money: { en: "Paying & convenience stores", id: "Bayar & minimarket" },
  restaurant: { en: "Ordering & the bill", id: "Pesan makan & bon" },
  hotel: { en: "Check-in & your room", id: "Check-in & kamar" },
  directions: { en: "Lost & maps", id: "Tersesat & peta" },
  culture: { en: "Etiquette & temples", id: "Etiket & tempat suci" },
  emergency: { en: "Help, health & allergies", id: "Bantuan, kesehatan & alergi" },
};

const situationOrder: SituationKey[] = [
  "basics",
  "train",
  "money",
  "restaurant",
  "hotel",
  "directions",
  "culture",
  "emergency",
];

export const destinations: Destination[] = [
  {
    id: "ja-jp",
    name: { en: "Japan", id: "Jepang" },
    targetLanguage: { en: "Japanese", id: "Bahasa Jepang" },
  },
  {
    id: "ko-kr",
    name: { en: "Korea", id: "Korea" },
    targetLanguage: { en: "Korean", id: "Bahasa Korea" },
  },
  {
    id: "th-th",
    name: { en: "Thailand", id: "Thailand" },
    targetLanguage: { en: "Thai", id: "Bahasa Thailand" },
  },
  {
    id: "vi-vn",
    name: { en: "Vietnam", id: "Vietnam" },
    targetLanguage: { en: "Vietnamese", id: "Bahasa Vietnam" },
  },
  {
    id: "id-id",
    name: { en: "Indonesia", id: "Indonesia" },
    targetLanguage: { en: "Indonesian", id: "Bahasa Indonesia" },
  },
];

export function getDestination(id: CorridorId): Destination | undefined {
  return destinations.find((d) => d.id === id);
}

export function getLessons(corridorId: CorridorId): LessonListItem[] {
  return situationOrder.map((situation, index) => ({
    id: `${corridorId}-${situation}`,
    corridorId,
    situation,
    order: index + 1,
    title: lessonTitles[situation],
  }));
}

export function isCorridorId(value: string): value is CorridorId {
  return destinations.some((d) => d.id === value);
}
