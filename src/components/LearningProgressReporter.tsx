"use client";

import { useEffect, useRef } from "react";
import { reportLearningProgress } from "@/app/[locale]/progress-actions";
import type { ProgressItemType } from "@/lib/progress";
import type { CorridorId } from "@/lib/types";

type LearningProgressReporterProps = {
  corridorId: CorridorId;
  itemType: ProgressItemType;
  itemId: string;
  stepIndex: number;
  totalSteps: number;
  completed: boolean;
  scoreCorrect?: number;
  scoreTotal?: number;
};

export function LearningProgressReporter({
  corridorId,
  itemType,
  itemId,
  stepIndex,
  totalSteps,
  completed,
  scoreCorrect,
  scoreTotal,
}: LearningProgressReporterProps) {
  const lastSent = useRef<string>("");

  useEffect(() => {
    if (totalSteps < 1) return;
    const signature = `${stepIndex}:${totalSteps}:${completed}:${scoreCorrect ?? ""}:${scoreTotal ?? ""}`;
    if (signature === lastSent.current) return;
    lastSent.current = signature;
    void reportLearningProgress(
      corridorId,
      itemType,
      itemId,
      stepIndex,
      totalSteps,
      completed,
      scoreCorrect,
      scoreTotal,
    );
  }, [
    corridorId,
    itemType,
    itemId,
    stepIndex,
    totalSteps,
    completed,
    scoreCorrect,
    scoreTotal,
  ]);

  return null;
}
