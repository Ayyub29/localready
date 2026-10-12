import type { CorridorId, LocalizedString, SituationKey } from "./types";

/**
 * Player flow per vignette: optional culture → each conversation (description → turns).
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

/** @deprecated Quizzes are not stored in runtime packs; may return for exercises later. */
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

export type ConversationTurn = {
  id: string;
  role: ConversationRole;
  label?: LocalizedString;
  target?: string;
  romanization?: string;
  line: LocalizedString;
  phraseId?: string;
};

/**
 * One dialogue scene inside a vignette (description screen, then turn-by-turn chat).
 * `situation` = travel context when this talk happens (hotel, train, basics, …).
 */
export type VignetteConversation = {
  id: string;
  /** Curriculum situation key — when / where this conversation takes place. */
  situation: SituationKey;
  title?: LocalizedString;
  /** Scene setup shown before turns (what is happening right now). */
  description: LocalizedString;
  turns: ConversationTurn[];
};

/** Lesson 0 — writing system + essential words (non-Latin corridors). */
export type ScriptBlock =
  | {
      type: "intro";
      id: string;
      title: LocalizedString;
      body: LocalizedString;
    }
  | {
      type: "script_row";
      id: string;
      title: LocalizedString;
      rows: {
        symbol: string;
        romanization?: string;
        meaning: LocalizedString;
      }[];
    }
  | {
      type: "essential_word";
      id: string;
      target: string;
      romanization?: string;
      meaning: LocalizedString;
    };

export type LessonVignette = {
  id: string;
  title: LocalizedString;
  culture?: CultureCard[];
  /** One or more dialogues in this micro-situation. */
  conversations: VignetteConversation[];
  /** Legacy packs only — prefer `conversations`. */
  scenario?: LocalizedString;
  phrases?: Phrase[];
  quiz?: QuizQuestion[];
};

export type LessonContent = {
  id: string;
  corridorId: CorridorId;
  situation: SituationKey;
  order: number;
  title: LocalizedString;
  free: boolean;
  vignettes: LessonVignette[];
  /** Present when `situation === "script"`. */
  scriptBlocks?: ScriptBlock[];
  unitOrder?: LessonUnitType[];
};

export type CorridorContentPack = {
  corridorId: CorridorId;
  lessons: LessonContent[];
  emergencyPhrases: Phrase[];
};

export const defaultLessonUnitOrder: LessonUnitType[] = ["culture", "conversation"];

export const legacyLessonUnitOrder: LessonUnitType[] = [
  "culture",
  "scenario",
  "phrases",
  "quiz",
];
