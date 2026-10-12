import type { LessonContent, LessonVignette } from "@/lib/lesson-content-types";

export type PlayerStep =
  | { type: "culture"; vignetteIndex: number; cardIndex: number }
  | {
      type: "conversationDescription";
      vignetteIndex: number;
      conversationIndex: number;
    }
  | {
      type: "conversationTurn";
      vignetteIndex: number;
      conversationIndex: number;
      turnIndex: number;
    }
  | { type: "scenario"; vignetteIndex: number }
  | { type: "phrase"; vignetteIndex: number; phraseIndex: number };

function vignetteHasLegacyPhrases(vignette: LessonVignette): boolean {
  const convTurns =
    vignette.conversations?.reduce((n, c) => n + c.turns.length, 0) ?? 0;
  return convTurns === 0 && (vignette.phrases?.length ?? 0) > 0;
}

/** Flat ordered steps: vignette order, then culture → each conversation (description → turns). */
export function buildLessonSteps(lesson: LessonContent): PlayerStep[] {
  const steps: PlayerStep[] = [];

  lesson.vignettes.forEach((vignette, vignetteIndex) => {
    vignette.culture?.forEach((_, cardIndex) => {
      steps.push({ type: "culture", vignetteIndex, cardIndex });
    });

    vignette.conversations?.forEach((conversation, conversationIndex) => {
      steps.push({
        type: "conversationDescription",
        vignetteIndex,
        conversationIndex,
      });
      conversation.turns.forEach((_, turnIndex) => {
        steps.push({
          type: "conversationTurn",
          vignetteIndex,
          conversationIndex,
          turnIndex,
        });
      });
    });

    if (vignetteHasLegacyPhrases(vignette)) {
      if (vignette.scenario) {
        steps.push({ type: "scenario", vignetteIndex });
      }
      vignette.phrases?.forEach((_, phraseIndex) => {
        steps.push({ type: "phrase", vignetteIndex, phraseIndex });
      });
    }
  });

  return steps;
}
