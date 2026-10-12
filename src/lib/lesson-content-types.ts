import type { CorridorId, LocalizedString, SituationKey } from "./types";

/**
 * Configurable player steps. Default product flow per vignette:
 * culture (optional) → conversation → quiz.
 * Legacy packs may still use scenario + phrases.
 */
export type LessonUnitType =
  | "culture"
  | "conversation"
  | "scenario"
  | "phrases"
  | "quiz"
  | "flashcards"
  | "pronunciation"
  | "complete";

export type Phrase = {
  id: string;
  target: string;
  romanization?: string;
  meaning: LocalizedString;
  usageNote?: LocalizedString;
  audioUrl?: string;
  wvSource?: string;
};

export type CultureCard = {
  id: string;
  title: LocalizedString;
  body: LocalizedString;
  do?: LocalizedString[];
  avoid?: LocalizedString[];
};

export type QuizQuestion =
  | {
      id: string;
      type: "mcq";
      prompt: LocalizedString;
      options: LocalizedString[];
      correctIndex: number;
    }
  | {
      id: string;
      type: "pick-phrase";
      prompt: LocalizedString;
      phraseIds: string[];
      correctPhraseId: string;
    };

export type ConversationRole = "narrator" | "local" | "traveler";

/** One line in a vignette dialogue. Traveler/local lines use `target` + `line` (gloss). */
export type ConversationTurn = {
  id: string;
  role: ConversationRole;
  label?: LocalizedString;
  target?: string;
  romanization?: string;
  /** Narration or meaning in learner locales (en + id). */
  line: LocalizedString;
  phraseId?: string;
};

/**
 * One micro-situation inside a lesson (e.g. luggage, taxi, train to city at the airport).
 * Prefer `conversation` for the player; keep `phrases` for quiz / cheatsheet indexing.
 */
export type LessonVignette = {
  id: string;
  title: LocalizedString;
  /** Etiquette / context for this vignette only. Optional — empty or omitted skips culture. */
  culture?: CultureCard[];
  /** Legacy intro text when `conversation` is not used. */
  scenario?: LocalizedString;
  /** Ordered dialogue; player advances one turn per step. */
  conversation?: ConversationTurn[];
  phrases: Phrase[];
  quiz: QuizQuestion[];
};

export type LessonContent = {
  id: string;
  corridorId: CorridorId;
  situation: SituationKey;
  order: number;
  title: LocalizedString;
  free: boolean;
  /** Ordered micro-scenarios inside this lesson. */
  vignettes: LessonVignette[];
  /**
   * Step order per vignette. With `conversation`, scenario/phrases steps are skipped.
   */
  unitOrder: LessonUnitType[];
};

export type CorridorContentPack = {
  corridorId: CorridorId;
  lessons: LessonContent[];
  emergencyPhrases: Phrase[];
};

/** Default flow requested for LocalReady lessons. */
export const defaultLessonUnitOrder: LessonUnitType[] = [
  "culture",
  "conversation",
  "quiz",
];

/** Legacy phrase-by-phrase flow. */
export const legacyLessonUnitOrder: LessonUnitType[] = [
  "culture",
  "scenario",
  "phrases",
  "quiz",
];
