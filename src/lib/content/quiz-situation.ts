import { situationOrder } from "@/lib/situations";
import type { CorridorId, SituationKey } from "@/lib/types";

function isSituationKey(value: string): value is SituationKey {
  return (situationOrder as string[]).includes(value);
}

/** Infer curriculum situation from stored quiz / deck ids (e.g. `id-id-basics-fill-…`). */
export function situationFromContentId(
  contentId: string,
  corridorId: CorridorId,
): SituationKey | null {
  const prefix = `${corridorId}-`;
  if (contentId.startsWith(prefix)) {
    const first = contentId.slice(prefix.length).split("-")[0];
    if (isSituationKey(first)) return first;
  }
  for (const situation of situationOrder) {
    if (contentId.includes(`-${situation}-`)) return situation;
  }
  return null;
}

export type QuizKind = "fillBlank" | "flashcards" | "phraseDrill";

export function quizKindFromContentId(contentId: string): QuizKind | null {
  if (contentId.includes("-fill-")) return "fillBlank";
  if (contentId.includes("-flash-")) return "flashcards";
  if (contentId.includes("-drill-")) return "phraseDrill";
  return null;
}
