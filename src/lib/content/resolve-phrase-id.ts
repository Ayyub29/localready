import type { PhrasePoolItem } from "@/lib/content-pipeline/types";
import { readPhrasePool } from "@/lib/content-pipeline/pool-store";
import type { StoredConversation } from "@/lib/content/stored-conversation-types";
import type { Phrase } from "@/lib/lesson-content-types";
import type { CorridorId } from "@/lib/types";

function phraseFromPoolItem(item: PhrasePoolItem): Phrase {
  return {
    id: item.id,
    target: item.target,
    romanization: item.romanization,
    meaning: {
      en: item.meaningEn,
      id: item.meaningId ?? item.meaningEn,
    },
    wvSource: item.wvSource,
  };
}

function phraseFromTurn(
  phraseId: string,
  conv: StoredConversation,
): Phrase | null {
  for (const turn of conv.turns) {
    if (turn.phraseId !== phraseId) continue;
    return {
      id: phraseId,
      target: turn.target ?? "",
      romanization: turn.romanization,
      meaning: turn.line,
    };
  }
  return null;
}

/** Resolve a phrase id from approved pool rows, then conversation turns. */
export async function buildPhraseResolver(
  corridorId: CorridorId,
  conversations: Map<string, StoredConversation>,
): Promise<(phraseId: string) => Phrase | null> {
  const pool = await readPhrasePool(corridorId);
  const byId = new Map<string, PhrasePoolItem>();
  for (const item of pool.items) {
    byId.set(item.id, item);
  }

  return (phraseId: string): Phrase | null => {
    const poolItem = byId.get(phraseId);
    if (poolItem && poolItem.status === "approved") {
      return phraseFromPoolItem(poolItem);
    }
    for (const conv of conversations.values()) {
      const fromTurn = phraseFromTurn(phraseId, conv);
      if (fromTurn) return fromTurn;
    }
    if (poolItem) {
      return phraseFromPoolItem(poolItem);
    }
    return null;
  };
}
