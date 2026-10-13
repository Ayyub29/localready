import type { PlayerStep } from "@/lib/content/lesson-player-steps";
import type { LessonContent } from "@/lib/lesson-content-types";
export function playerStepKey(step: PlayerStep, lesson: LessonContent): string {
  const vignette = lesson.vignettes[step.vignetteIndex];
  switch (step.type) {
    case "culture":
      return `culture-${step.vignetteIndex}-${step.cardIndex}`;
    case "conversationDescription":
      return `conv-desc-${step.vignetteIndex}-${step.conversationIndex}`;
    case "conversationTurn": {
      const conv = vignette.conversations[step.conversationIndex];
      const turn = conv?.turns[step.turnIndex];
      return `conv-turn-${step.vignetteIndex}-${step.conversationIndex}-${turn?.id ?? step.turnIndex}`;
    }
    case "miniLesson":
      return `mini-${step.vignetteIndex}-${step.miniLessonIndex}`;
    case "phraseListPhrase":
      return `phrase-list-${step.vignetteIndex}-${step.phraseListIndex}-${step.phraseIndex}`;
    case "fillBlank":
      return `fill-${step.vignetteIndex}-${step.fillBlankQuizIndex}-${step.questionIndex}`;
    case "flashcard":
      return `flash-${step.vignetteIndex}-${step.flashcardDeckIndex}-${step.cardIndex}`;
    case "scenario":
      return `scenario-${step.vignetteIndex}`;
    case "phrase":
      return `legacy-phrase-${step.vignetteIndex}-${step.phraseIndex}`;
  }
}

export function stepNeedsGate(step: PlayerStep): boolean {
  return step.type === "fillBlank" || step.type === "flashcard";
}
