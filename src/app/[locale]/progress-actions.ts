"use server";

import { auth } from "@/auth";
import { isCorridorId } from "@/data/catalog";
import { saveItemProgress, type ProgressItemType } from "@/lib/progress";

export async function reportLearningProgress(
  corridorId: string,
  itemType: ProgressItemType,
  itemId: string,
  stepIndex: number,
  totalSteps: number,
  completed: boolean,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  if (!isCorridorId(corridorId)) return;
  if (!itemId.trim() || totalSteps < 1) return;
  const clampedStep = Math.max(0, Math.min(stepIndex, totalSteps - 1));
  await saveItemProgress(corridorId, itemType, itemId, {
    stepIndex: clampedStep,
    totalSteps,
    completed,
  });
}
