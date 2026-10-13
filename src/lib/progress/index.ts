import { auth } from "@/auth";
import type { CorridorId } from "@/lib/types";
import {
  readGuestCorridorProgress,
  readGuestProgressStore,
  writeGuestItemProgress,
  removeGuestCorridorProgress,
} from "./cookie-store";
import {
  mergeGuestProgressIntoUser,
  readUserCorridorProgress,
  writeUserItemProgress,
} from "./db-store";
import type {
  CorridorProgress,
  ProgressItemState,
  ProgressItemType,
} from "./types";

export type { CorridorProgress, ProgressItemState, ProgressItemType };
export { progressPercent, quizProgressKey } from "./utils";

export async function getCorridorProgress(
  corridorId: CorridorId,
): Promise<CorridorProgress> {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    const fromDb = await readUserCorridorProgress(userId, corridorId);
    const guestStore = await readGuestProgressStore();
    const guest = guestStore[corridorId];
    if (guest) {
      await mergeGuestProgressIntoUser(userId, guest, corridorId);
      await removeGuestCorridorProgress(corridorId);
      return readUserCorridorProgress(userId, corridorId);
    }
    return fromDb;
  }

  return readGuestCorridorProgress(corridorId);
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
  const state: ProgressItemState = {
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    await writeUserItemProgress(userId, corridorId, itemType, itemId, state);
    return;
  }

  await writeGuestItemProgress(corridorId, itemType, itemId, state);
}
