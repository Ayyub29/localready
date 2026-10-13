import type { CorridorId } from "@/lib/types";

export type ProgressItemType = "lesson" | "quiz";

export type ProgressItemState = {
  stepIndex: number;
  totalSteps: number;
  completed: boolean;
  updatedAt: string;
};

export type CorridorProgress = {
  lessons: Record<string, ProgressItemState>;
  quizzes: Record<string, ProgressItemState>;
};

export type LearningProgressStore = Partial<Record<CorridorId, CorridorProgress>>;

export function emptyCorridorProgress(): CorridorProgress {
  return { lessons: {}, quizzes: {} };
}
