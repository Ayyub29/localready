import { auth } from "@/auth";
import type { CorridorId } from "@/lib/types";
import {
  readUserCorridorProgress,
  writeUserItemProgress,
} from "./db-store";
import type {
  CorridorProgress,
  ProgressItemState,
  ProgressItemType,
} from "./types";
import { emptyCorridorProgress } from "./types";

export type { CorridorProgress, ProgressItemState, ProgressItemType };
export { progressPercent, quizProgressKey } from "./utils";

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Progress exists only for signed-in users (stored in Neon). */
export async function getCorridorProgress(
  corridorId: CorridorId,
): Promise<CorridorProgress> {
  const userId = await requireUserId();
  if (!userId) return emptyCorridorProgress();
  return readUserCorridorProgress(userId, corridorId);
}

export async function getItemProgress(
  corridorId: CorridorId,
  itemType: ProgressItemType,
  itemId: string,
): Promise<ProgressItemState | null> {
  const corridor = await getCorridorProgress(corridorId);
  if (itemType === "lesson") return corridor.lessons[itemId] ?? null;
  return corridor.quizzes[itemId] ?? null;
}

export async function saveItemProgress(
  corridorId: CorridorId,
  itemType: ProgressItemType,
  itemId: string,
  patch: {
    stepIndex: number;
    totalSteps: number;
    completed: boolean;
  },
): Promise<void> {
  const userId = await requireUserId();
  if (!userId) return;

  const state: ProgressItemState = {
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await writeUserItemProgress(userId, corridorId, itemType, itemId, state);
}
