import type { CorridorId, LocalizedString } from "@/lib/types";

export type PhraseListSource = "manual" | "generated";

/** Authoring unit: ordered phrase ids for study (content/phrase-lists/). */
export type StoredPhraseList = {
  schemaVersion: 1;
  id: string;
  corridorId: CorridorId;
  title: LocalizedString;
  phraseIds: string[];
  source: PhraseListSource;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};
