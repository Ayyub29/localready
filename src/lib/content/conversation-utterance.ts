import { learnerGlossId } from "@/lib/content/gloss-id-from-en";
import type { ConversationTurn } from "@/lib/lesson-content-types";
import type { CorridorId, Locale } from "@/lib/types";

/** Locale key used for the spoken line in `turn.line` when `target` is omitted. */
export function corridorSpokenLocale(corridorId: CorridorId): Locale {
  if (corridorId === "id-id") return "id";
  return "en";
}

/** Spoken line in the corridor target language (both speakers). */
export function conversationUtterance(
  turn: ConversationTurn,
  corridorId: CorridorId,
): string {
  if (turn.target?.trim()) return turn.target.trim();
  const spoken = corridorSpokenLocale(corridorId);
  return turn.line[spoken]?.trim() ?? turn.line.en?.trim() ?? "";
}

/** Learner gloss under the target-language line — follows app UI locale (`/en/` vs `/id/`). */
export function conversationGloss(
  turn: ConversationTurn,
  corridorId: CorridorId,
  uiLocale: Locale,
): string | null {
  const utterance = conversationUtterance(turn, corridorId);

  const primary =
    uiLocale === "id"
      ? learnerGlossId(turn.line)?.trim()
      : turn.line.en?.trim();

  if (primary && primary !== utterance) return primary;

  // Indonesian UI on id-id: speech is already ID — show English helper when ID gloss duplicates target.
  if (uiLocale === "id" && corridorId === "id-id") {
    const en = turn.line.en?.trim();
    if (en && en !== utterance) return en;
  }

  return null;
}
