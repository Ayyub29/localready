import {
  compileStoredFillBlankQuiz,
  compileStoredFlashcardDeck,
  compileStoredPhraseDrill,
} from "@/lib/content/compile-stored-quiz";
import { loadCorridorPack } from "@/lib/content/load-pack";
import type { QuizKind } from "@/lib/content/quiz-situation";
import type {
  VignetteFillBlankQuiz,
  VignetteFlashcardDeck,
  VignettePhraseList,
} from "@/lib/lesson-content-types";
import type { CorridorId } from "@/lib/types";

export type PlayableQuiz =
  | { kind: "fillBlank"; quiz: VignetteFillBlankQuiz }
  | { kind: "flashcards"; deck: VignetteFlashcardDeck }
  | { kind: "phraseDrill"; list: VignettePhraseList };

async function findInPack(
  corridorId: CorridorId,
  kind: QuizKind,
  id: string,
): Promise<PlayableQuiz | null> {
  const pack = await loadCorridorPack(corridorId);
  if (!pack) return null;
  for (const lesson of pack.lessons) {
    for (const vignette of lesson.vignettes) {
      if (kind === "fillBlank") {
        const quiz = vignette.fillBlankQuizzes?.find((q) => q.id === id);
        if (quiz?.questions.length) return { kind, quiz };
      }
      if (kind === "flashcards") {
        const deck = vignette.flashcardDecks?.find((d) => d.id === id);
        if (deck?.cards.length) return { kind, deck };
      }
      if (kind === "phraseDrill") {
        const list = vignette.phraseLists?.find((p) => p.id === id);
        if (list?.phrases.length) return { kind, list };
      }
    }
  }
  return null;
}

export async function loadQuizForPlay(
  corridorId: CorridorId,
  kind: QuizKind,
  id: string,
): Promise<PlayableQuiz | null> {
  if (kind === "fillBlank") {
    const compiled = await compileStoredFillBlankQuiz(corridorId, id);
    if (compiled) return { kind, quiz: compiled };
  }
  if (kind === "flashcards") {
    const compiled = await compileStoredFlashcardDeck(corridorId, id);
    if (compiled) return { kind, deck: compiled };
  }
  if (kind === "phraseDrill") {
    const compiled = await compileStoredPhraseDrill(corridorId, id);
    if (compiled) return { kind, list: compiled };
  }

  return findInPack(corridorId, kind, id);
}
