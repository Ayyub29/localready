import type { CorridorId, LocalizedString } from "@/lib/types";

export type FlashcardDeckSource = "manual" | "generated";

export type StoredFlashcard = {
  id: string;
  /** Shown first (usually meaning in learner language). */
  front: LocalizedString;
  phraseId?: string;
  /** Filled at compile from phrase pool / conversations when phraseId set. */
  target?: string;
  romanization?: string;
  meaning?: LocalizedString;
};

/** Authoring pool: content/flashcard-decks/{corridorId}/*.json */
export type StoredFlashcardDeck = {
  schemaVersion: 1;
  id: string;
  corridorId: CorridorId;
  title: LocalizedString;
  cards: StoredFlashcard[];
  source: FlashcardDeckSource;
  notes?: string;
};
