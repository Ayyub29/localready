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
};

export function LearningProgressReporter({
  corridorId,
  itemType,
  itemId,
  stepIndex,
  totalSteps,
  completed,
}: LearningProgressReporterProps) {
  const lastSent = useRef<string>("");

  useEffect(() => {
    if (totalSteps < 1) return;
    const signature = `${stepIndex}:${totalSteps}:${completed}`;
    if (signature === lastSent.current) return;
    lastSent.current = signature;
    void reportLearningProgress(
      corridorId,
      itemType,
      itemId,
      stepIndex,
      totalSteps,
      completed,
    );
  }, [corridorId, itemType, itemId, stepIndex, totalSteps, completed]);

  return null;
}
