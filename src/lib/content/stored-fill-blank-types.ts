import type { CorridorId, LocalizedString } from "@/lib/types";

export type FillBlankSource = "manual" | "generated";

export type StoredFillBlankQuestion = {
  id: string;
  instruction?: LocalizedString;
  /** Text before the blank (target language). */
  before: string;
  /** Text after the blank. */
  after?: string;
  /** Accepted answers (case-insensitive trim match). */
  answers: string[];
  /** Optional wrong options; compile fills more from other questions if omitted. */
  distractors?: string[];
  hint?: LocalizedString;
  phraseId?: string;
};

/** Authoring pool: content/fill-blank/{corridorId}/*.json */
export type StoredFillBlankQuiz = {
  schemaVersion: 1;
  id: string;
  corridorId: CorridorId;
  title: LocalizedString;
  questions: StoredFillBlankQuestion[];
  source: FillBlankSource;
  notes?: string;
};
