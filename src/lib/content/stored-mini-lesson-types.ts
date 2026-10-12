import type { LocalizedString, CorridorId, SituationKey } from "@/lib/types";

export type MiniLessonSource = "manual" | "generated" | "wikivoyage";

export type StoredMiniLessonExample = {
  id: string;
  target: string;
  romanization?: string;
  meaning: LocalizedString;
  phraseId?: string;
  usageNote?: LocalizedString;
};

/** Authoring unit: short teachable bite (content/mini-lessons/). */
export type StoredMiniLesson = {
  schemaVersion: 1;
  id: string;
  corridorId: CorridorId;
  topic?: string;
  relatedSituations?: SituationKey[];
  title: LocalizedString;
  body: LocalizedString;
  examples: StoredMiniLessonExample[];
  source: MiniLessonSource;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};
