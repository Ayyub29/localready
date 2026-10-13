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
