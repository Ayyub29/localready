import type { CultureCard } from "@/lib/lesson-content-types";
import type { CorridorId, LocalizedString, SituationKey } from "@/lib/types";

export type StoredSequenceItem =
  | { kind: "conversation"; ref: string }
  | {
      kind: "miniLesson";
      ref: string;
      anchor?: { conversationRef: string; afterTurnId: string };
    }
  | { kind: "phraseList"; ref: string }
  | { kind: "fillBlank"; ref: string }
  | { kind: "flashcards"; ref: string };

export type StoredVignetteManifest = {
  id: string;
  title: LocalizedString;
  culture?: CultureCard[];
  sequence: StoredSequenceItem[];
};

/** Human-assembled lesson (content/lessons/{corridorId}/{id}.json). */
export type StoredLessonManifest = {
  schemaVersion: 1;
  id: string;
  corridorId: CorridorId;
  situation: SituationKey;
  order: number;
  title: LocalizedString;
  free: boolean;
  vignettes: StoredVignetteManifest[];
};
