import type { SituationKey } from "@/lib/types";

/** SPEC §4 / §8 — lesson 1 (`basics`) is free per corridor. */
export const FREE_LESSON_SITUATION: SituationKey = "basics";

export function isFreeLesson(situation: SituationKey): boolean {
  return situation === FREE_LESSON_SITUATION;
}

export type LessonAccessMode = "full" | "locked";

export function getLessonAccessMode(
  situation: SituationKey,
  isSignedIn: boolean,
  hasCorridorAccess: boolean,
): LessonAccessMode {
  if (isFreeLesson(situation)) return "full";
  if (!isSignedIn) return "locked";
  if (hasCorridorAccess) return "full";
  return "locked";
}
