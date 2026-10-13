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

export function isCorridorId(value: string): value is CorridorId {
  return destinations.some((d) => d.id === value);
}
