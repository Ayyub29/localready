import type { LessonContent, LessonUnitType, LessonVignette } from "@/lib/lesson-content-types";

export type PlayerStep =
  | { type: "culture"; vignetteIndex: number; cardIndex: number }
  | { type: "scenario"; vignetteIndex: number }
  | { type: "phrase"; vignetteIndex: number; phraseIndex: number }
  | { type: "quiz"; vignetteIndex: number; quizIndex: number };

function unitsForVignette(
  unitOrder: LessonUnitType[],
  vignette: LessonVignette,
): LessonUnitType[] {
  const hasCulture = (vignette.culture?.length ?? 0) > 0;
  return hasCulture ? unitOrder : unitOrder.filter((u) => u !== "culture");
}

/** Flat ordered steps: vignette 1 fully, then vignette 2, … one piece per screen. */
export function buildLessonSteps(lesson: LessonContent): PlayerStep[] {
  const steps: PlayerStep[] = [];

  lesson.vignettes.forEach((vignette, vignetteIndex) => {
    const units = unitsForVignette(lesson.unitOrder, vignette);
    for (const unit of units) {
      if (unit === "culture") {
        vignette.culture?.forEach((_, cardIndex) => {
          steps.push({ type: "culture", vignetteIndex, cardIndex });
        });
      } else if (unit === "scenario") {
        steps.push({ type: "scenario", vignetteIndex });
      } else if (unit === "phrases") {
        vignette.phrases.forEach((_, phraseIndex) => {
          steps.push({ type: "phrase", vignetteIndex, phraseIndex });
        });
      } else if (unit === "quiz") {
        vignette.quiz.forEach((_, quizIndex) => {
          steps.push({ type: "quiz", vignetteIndex, quizIndex });
        });
      }
    }
  });

  return steps;
}
