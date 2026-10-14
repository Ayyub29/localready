import type { Locale } from "@/lib/types";
import type { ProgressItemState } from "./types";

export function progressPercent(state: ProgressItemState | undefined): number {
  if (!state || state.totalSteps <= 0) return 0;
  if (state.completed) return 100;
  return Math.min(
    100,
    Math.round(((state.stepIndex + 1) / state.totalSteps) * 100),
  );
}

export function quizProgressKey(kind: string, quizId: string): string {
  return `${kind}:${quizId}`;
}

export function lessonProgressLabel(
  state: ProgressItemState | undefined,
  locale: Locale,
): string {
  if (!state || state.totalSteps <= 0) {
    return locale === "id" ? "Belum mulai" : "Not started";
  }
  if (state.completed) return locale === "id" ? "Selesai" : "Done";
  const pct = progressPercent(state);
  return `${pct}%`;
}

/** e.g. "3/4" for MCQ quizzes; null if no score recorded yet. */
export function quizScoreLabel(
  state: ProgressItemState | undefined,
  locale: Locale,
): string | null {
  if (
    state?.scoreCorrect == null ||
    state.scoreTotal == null ||
    state.scoreTotal <= 0
  ) {
    return null;
  }
  const base = `${state.scoreCorrect}/${state.scoreTotal}`;
  if (locale === "id") return `Skor ${base}`;
  return `Score ${base}`;
}
