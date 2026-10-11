import type { CorridorId, LocalizedString, SituationKey } from "./types";

/** Configurable player steps. Default product flow: culture → scenario → phrases → quiz. */
export type LessonUnitType =
  | "culture"
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

/**
 * One micro-situation inside a lesson (e.g. luggage, taxi, train to city at the airport).
 * Player runs scenario → phrases → quiz per vignette (after optional lesson-level culture).
 */
export type LessonVignette = {
  id: string;
  title: LocalizedString;
  scenario: LocalizedString;
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
  /** Top-of-lesson etiquette / context (shown once). */
  culture: CultureCard[];
  /** Ordered micro-scenarios inside this lesson. */
  vignettes: LessonVignette[];
  /**
   * High-level step order. For multi-vignette lessons, `scenario` / `phrases` / `quiz`
   * repeat once per vignette after `culture`.
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
  "scenario",
  "phrases",
  "quiz",
];
