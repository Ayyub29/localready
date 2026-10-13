import type { CorridorId, LocalizedString, SituationKey } from "./types";

/**
 * Player flow per vignette: optional culture → each conversation (description → turns).
 */
export type LessonUnitType =
  | "culture"
  | "conversation"
  | "miniLesson"
  | "phraseList"
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

export type FillBlankQuestion = {
  id: string;
  instruction?: LocalizedString;
  before: string;
  after?: string;
  answers: string[];
  hint?: LocalizedString;
  phraseId?: string;
};

export type VignetteFillBlankQuiz = {
  id: string;
  title: LocalizedString;
  questions: FillBlankQuestion[];
};

export type Flashcard = {
  id: string;
  front: LocalizedString;
  target: string;
  romanization?: string;
  meaning: LocalizedString;
  phraseId?: string;
};

export type VignetteFlashcardDeck = {
  id: string;
  title: LocalizedString;
  cards: Flashcard[];
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

export type MiniLessonWord = {
  id: string;
  target: string;
  romanization?: string;
  meaning: LocalizedString;
  phraseId?: string;
  usageNote?: LocalizedString;
};

/** Short teachable bite: description + words (content/mini-lessons/). */
export type MiniLesson = {
  id: string;
  topic?: string;
  description: LocalizedString;
  words: MiniLessonWord[];
  /** Play after this turn inside `anchorConversationId`. */
  anchorConversationId?: string;
  insertAfterTurnId?: string;
};

/** Resolved phrase list for the player (from content/phrase-lists/). */
export type VignettePhraseList = {
  id: string;
  title: LocalizedString;
  phrases: Phrase[];
};

/** Compiled vignette playback order (from lesson manifest sequence). */
export type VignettePlaybackItem =
  | { kind: "conversation"; conversationId: string }
  | { kind: "miniLesson"; miniLessonId: string }
  | { kind: "phraseList"; phraseListId: string }
  | { kind: "fillBlank"; fillBlankQuizId: string }
  | { kind: "flashcards"; flashcardDeckId: string };

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
  miniLessons?: MiniLesson[];
  phraseLists?: VignettePhraseList[];
  fillBlankQuizzes?: VignetteFillBlankQuiz[];
  flashcardDecks?: VignetteFlashcardDeck[];
  /** Top-level unit order between conversations and phrase lists. */
  playback?: VignettePlaybackItem[];
  /** Legacy packs only — prefer `conversations`. */
  scenario?: LocalizedString;
  phrases?: Phrase[];
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
