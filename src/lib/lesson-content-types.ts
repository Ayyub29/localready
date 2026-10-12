import type { CorridorId, LocalizedString, SituationKey } from "./types";

/**
 * Configurable player steps. Default product flow per vignette:
 * culture (optional) → scenario → phrases → quiz.
 */
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
 * Player runs optional culture, then scenario → phrases → quiz for each vignette.
 * Omit `culture` or use `culture: []` to skip the culture step for that vignette.
 */
export type LessonVignette = {
  id: string;
  title: LocalizedString;
  /** Etiquette / context for this vignette only. Optional — empty or omitted skips culture. */
  culture?: CultureCard[];
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
  /** Ordered micro-scenarios inside this lesson. */
  vignettes: LessonVignette[];
  /**
   * Step order for each vignette. `culture` is skipped when that vignette has no culture cards.
   * `scenario` / `phrases` / `quiz` repeat once per vignette.
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
