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
  /**
   * Travel situation when this dialogue happens (basics, hotel, emergency, …).
   * Used for curriculum, phrase catalog tags, and UI labels.
   */
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
    situation: stored.situation,
    title: stored.title,
    description: stored.description,
    turns: stored.turns,
  };
}
