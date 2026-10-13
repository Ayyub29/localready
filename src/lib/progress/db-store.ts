import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { learningProgress } from "@/db/schema";
import type { CorridorId } from "@/lib/types";
import {
  emptyCorridorProgress,
  type CorridorProgress,
  type ProgressItemState,
  type ProgressItemType,
} from "./types";

function rowToState(row: {
  stepIndex: number;
  totalSteps: number;
  completed: number;
  scoreCorrect: number | null;
  scoreTotal: number | null;
  updatedAt: Date | null;
}): ProgressItemState {
  return {
    stepIndex: row.stepIndex,
    totalSteps: row.totalSteps,
    completed: row.completed === 1,
    updatedAt: (row.updatedAt ?? new Date()).toISOString(),
    ...(row.scoreCorrect != null && row.scoreTotal != null
      ? { scoreCorrect: row.scoreCorrect, scoreTotal: row.scoreTotal }
      : {}),
  };
}

export async function readUserCorridorProgress(
  userId: string,
  corridorId: CorridorId,
): Promise<CorridorProgress> {
  try {
  const rows = await db
    .select()
    .from(learningProgress)
    .where(
      and(
        eq(learningProgress.userId, userId),
        eq(learningProgress.corridorId, corridorId),
      ),
    );

  const corridor = emptyCorridorProgress();
  for (const row of rows) {
    const state = rowToState(row);
    if (row.itemType === "lesson") {
      corridor.lessons[row.itemId] = state;
    } else if (row.itemType === "quiz") {
      corridor.quizzes[row.itemId] = state;
    }
  }
  return corridor;
  } catch {
    return emptyCorridorProgress();
  }
}

export async function writeUserItemProgress(
  userId: string,
  corridorId: CorridorId,
  itemType: ProgressItemType,
  itemId: string,
  state: ProgressItemState,
): Promise<void> {
  try {
  await db
    .insert(learningProgress)
    .values({
      userId,
      corridorId,
      itemType,
      itemId,
      stepIndex: state.stepIndex,
      totalSteps: state.totalSteps,
      completed: state.completed ? 1 : 0,
      scoreCorrect: state.scoreCorrect ?? null,
      scoreTotal: state.scoreTotal ?? null,
      updatedAt: new Date(state.updatedAt),
    })
    .onConflictDoUpdate({
      target: [
        learningProgress.userId,
        learningProgress.corridorId,
        learningProgress.itemType,
        learningProgress.itemId,
      ],
      set: {
        stepIndex: state.stepIndex,
        totalSteps: state.totalSteps,
        completed: state.completed ? 1 : 0,
        scoreCorrect: state.scoreCorrect ?? null,
        scoreTotal: state.scoreTotal ?? null,
        updatedAt: new Date(state.updatedAt),
      },
    });
  } catch {
    // DB unavailable
  }
}
