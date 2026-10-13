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

/** Learner gloss; omit when it duplicates the spoken line. */
export function conversationGloss(
  turn: ConversationTurn,
  corridorId: CorridorId,
  uiLocale: Locale,
): string | null {
  const utterance = conversationUtterance(turn, corridorId);
  const spokenLocale = corridorSpokenLocale(corridorId);

  // UI in the same language as the corridor (e.g. id-id + /id/…): show the other gloss (usually EN).
  if (uiLocale === spokenLocale) {
    const helperLocale: Locale = spokenLocale === "id" ? "en" : "id";
    const helper = turn.line[helperLocale]?.trim();
    if (!helper || helper === utterance) return null;
    return helper;
  }

  const gloss = turn.line[uiLocale]?.trim();
  if (!gloss || gloss === utterance) return null;
  return gloss;
}
