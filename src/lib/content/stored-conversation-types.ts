import type { ConversationTurn, VignetteConversation } from "@/lib/lesson-content-types";
import type { CorridorId, LocalizedString, SituationKey } from "@/lib/types";

export type ConversationSource =
  | "manual"
  | "generated"
  | "scraped"
  | "master-compile";

/** Authoring copy of one dialogue scene (stored under content/conversations/). */
export type StoredConversation = {
  schemaVersion: 1;
  id: string;
  corridorId: CorridorId;
  /** Lesson this dialogue belongs to when compiled. */
  situation: SituationKey;
  source: ConversationSource;
  sourceUrl?: string;
  title?: LocalizedString;
  description: LocalizedString;
  turns: ConversationTurn[];
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
};

export function storedToVignetteConversation(
  stored: StoredConversation,
): VignetteConversation {
  return {
    id: stored.id,
    title: stored.title,
    description: stored.description,
    turns: stored.turns,
  };
}
