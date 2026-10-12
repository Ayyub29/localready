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
  | { type: "miniLessonIntro"; vignetteIndex: number; miniLessonIndex: number }
  | {
      type: "miniLessonExample";
      vignetteIndex: number;
      miniLessonIndex: number;
      exampleIndex: number;
    }
  | {
      type: "phraseListPhrase";
      vignetteIndex: number;
      phraseListIndex: number;
      phraseIndex: number;
    }
  | { type: "scenario"; vignetteIndex: number }
  | { type: "phrase"; vignetteIndex: number; phraseIndex: number };

function vignetteHasLegacyPhrases(vignette: LessonVignette): boolean {
  const convTurns =
    vignette.conversations?.reduce((n, c) => n + c.turns.length, 0) ?? 0;
  return convTurns === 0 && (vignette.phrases?.length ?? 0) > 0;
}

function pushAnchoredMiniLessons(
  steps: PlayerStep[],
  vignette: LessonVignette,
  vignetteIndex: number,
  conversationId: string,
  afterTurnId: string,
) {
  vignette.miniLessons?.forEach((ml, miniLessonIndex) => {
    if (
      ml.anchorConversationId !== conversationId ||
      ml.insertAfterTurnId !== afterTurnId
    ) {
      return;
    }
    steps.push({ type: "miniLessonIntro", vignetteIndex, miniLessonIndex });
    ml.examples.forEach((_, exampleIndex) => {
      steps.push({
        type: "miniLessonExample",
        vignetteIndex,
        miniLessonIndex,
        exampleIndex,
      });
    });
  });
}

function pushConversationSteps(
  steps: PlayerStep[],
  vignette: LessonVignette,
  vignetteIndex: number,
  conversationIndex: number,
) {
  const conversation = vignette.conversations[conversationIndex];
  if (!conversation) return;

  steps.push({
    type: "conversationDescription",
    vignetteIndex,
    conversationIndex,
  });

  conversation.turns.forEach((turn, turnIndex) => {
    steps.push({
      type: "conversationTurn",
      vignetteIndex,
      conversationIndex,
      turnIndex,
    });
    pushAnchoredMiniLessons(
      steps,
      vignette,
      vignetteIndex,
      conversation.id,
      turn.id,
    );
  });
}

function pushStandaloneMiniLesson(
  steps: PlayerStep[],
  vignette: LessonVignette,
  vignetteIndex: number,
  miniLessonId: string,
) {
  const miniLessonIndex = vignette.miniLessons?.findIndex((m) => m.id === miniLessonId) ?? -1;
  if (miniLessonIndex < 0) return;
  const ml = vignette.miniLessons![miniLessonIndex];
  if (ml.anchorConversationId) return;

  steps.push({ type: "miniLessonIntro", vignetteIndex, miniLessonIndex });
  ml.examples.forEach((_, exampleIndex) => {
    steps.push({
      type: "miniLessonExample",
      vignetteIndex,
      miniLessonIndex,
      exampleIndex,
    });
  });
}

function pushPhraseListSteps(
  steps: PlayerStep[],
  vignette: LessonVignette,
  vignetteIndex: number,
  phraseListId: string,
) {
  const phraseListIndex =
    vignette.phraseLists?.findIndex((p) => p.id === phraseListId) ?? -1;
  if (phraseListIndex < 0) return;
  const list = vignette.phraseLists![phraseListIndex];
  list.phrases.forEach((_, phraseIndex) => {
    steps.push({
      type: "phraseListPhrase",
      vignetteIndex,
      phraseListIndex,
      phraseIndex,
    });
  });
}

function buildVignetteStepsWithPlayback(
  vignette: LessonVignette,
  vignetteIndex: number,
): PlayerStep[] {
  const steps: PlayerStep[] = [];

  vignette.culture?.forEach((_, cardIndex) => {
    steps.push({ type: "culture", vignetteIndex, cardIndex });
  });

  const convIndexById = new Map(
    vignette.conversations.map((c, i) => [c.id, i]),
  );

  for (const item of vignette.playback ?? []) {
    if (item.kind === "conversation") {
      const conversationIndex = convIndexById.get(item.conversationId);
      if (conversationIndex === undefined) continue;
      pushConversationSteps(steps, vignette, vignetteIndex, conversationIndex);
    } else if (item.kind === "miniLesson") {
      pushStandaloneMiniLesson(steps, vignette, vignetteIndex, item.miniLessonId);
    } else if (item.kind === "phraseList") {
      pushPhraseListSteps(steps, vignette, vignetteIndex, item.phraseListId);
    }
  }

  return steps;
}

function buildVignetteStepsLegacy(
  vignette: LessonVignette,
  vignetteIndex: number,
): PlayerStep[] {
  const steps: PlayerStep[] = [];

  vignette.culture?.forEach((_, cardIndex) => {
    steps.push({ type: "culture", vignetteIndex, cardIndex });
  });

  vignette.conversations?.forEach((conversation, conversationIndex) => {
    pushConversationSteps(steps, vignette, vignetteIndex, conversationIndex);
  });

  if (vignetteHasLegacyPhrases(vignette)) {
    if (vignette.scenario) {
      steps.push({ type: "scenario", vignetteIndex });
    }
    vignette.phrases?.forEach((_, phraseIndex) => {
      steps.push({ type: "phrase", vignetteIndex, phraseIndex });
    });
  }

  return steps;
}

/** Flat ordered steps: vignette order, then culture → playback or legacy conversations. */
export function buildLessonSteps(lesson: LessonContent): PlayerStep[] {
  const steps: PlayerStep[] = [];

  lesson.vignettes.forEach((vignette, vignetteIndex) => {
    if (vignette.playback?.length) {
      steps.push(...buildVignetteStepsWithPlayback(vignette, vignetteIndex));
    } else {
      steps.push(...buildVignetteStepsLegacy(vignette, vignetteIndex));
    }
  });

  return steps;
}
