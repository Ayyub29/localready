import type { LocalizedString, CorridorId, SituationKey } from "@/lib/types";

export type MiniLessonSource = "manual" | "generated" | "wikivoyage";

export type MiniLessonWord = {
  id: string;
  target: string;
  romanization?: string;
  meaning: LocalizedString;
  phraseId?: string;
  usageNote?: LocalizedString;
};

/** Authoring unit: description + words (content/mini-lessons/). */
export type StoredMiniLesson = {
  schemaVersion: 1;
  id: string;
  corridorId: CorridorId;
  topic?: string;
  relatedSituations?: SituationKey[];
  description: LocalizedString;
  words: MiniLessonWord[];
  source: MiniLessonSource;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};
