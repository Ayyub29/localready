import type { CorridorId, LocalizedString } from "@/lib/types";

export type FillBlankSource = "manual" | "generated";

/** `situation` = scene prompt; `reply` = respond to someone's line. */
export type FillBlankPromptKind = "situation" | "reply";

export type StoredFillBlankQuestion = {
  id: string;
  kind: FillBlankPromptKind;
  /** Learner-facing setup (situation) or short gloss for a reply prompt. */
  prompt: LocalizedString;
  /** Target-language line they said (reply kind). */
  cueTarget?: string;
  cueSpeaker?: LocalizedString;
  correctPhraseId: string;
  distractorPhraseIds?: string[];
  hint?: LocalizedString;
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
