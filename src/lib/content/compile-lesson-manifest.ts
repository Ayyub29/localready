import type { StoredLessonManifest } from "@/lib/content/stored-lesson-manifest-types";
import type { StoredMiniLesson } from "@/lib/content/stored-mini-lesson-types";
import { storedToVignetteConversation } from "@/lib/content/stored-conversation-types";
import type {
  Flashcard,
  LessonContent,
  LessonVignette,
  MiniLesson,
  VignetteFillBlankQuiz,
  VignetteFlashcardDeck,
  VignettePlaybackItem,
  VignettePhraseList,
} from "@/lib/lesson-content-types";
import type { StoredFlashcard } from "@/lib/content/stored-flashcard-deck-types";
import {
  loadStoredConversationsMap,
  loadStoredFillBlankQuizzesMap,
  loadStoredFlashcardDecksMap,
  loadStoredMiniLessonsMap,
  loadStoredPhraseListsMap,
} from "@/lib/content/load-pool-files";
import {
  compileFillBlankQuestion,
  enrichConversationTravelerMcq,
} from "@/lib/content/compile-mcq";
import { buildPhraseResolver } from "@/lib/content/resolve-phrase-id";

export type CompileLessonResult = {
  lesson: LessonContent;
  warnings: string[];
};

function compileMiniLesson(
  stored: StoredMiniLesson,
  anchor?: { conversationRef: string; afterTurnId: string },
): MiniLesson {
  return {
    id: stored.id,
    topic: stored.topic,
    description: stored.description,
    words: stored.words.map((w) => ({
      id: w.id,
      target: w.target,
      romanization: w.romanization,
      meaning: w.meaning,
      phraseId: w.phraseId,
      usageNote: w.usageNote,
    })),
    anchorConversationId: anchor?.conversationRef,
    insertAfterTurnId: anchor?.afterTurnId,
  };
}

export async function compileLessonManifest(
  manifest: StoredLessonManifest,
): Promise<CompileLessonResult> {
  const { corridorId } = manifest;
  const warnings: string[] = [];

  const conversations = await loadStoredConversationsMap(corridorId);
  const miniLessons = await loadStoredMiniLessonsMap(corridorId);
  const phraseLists = await loadStoredPhraseListsMap(corridorId);
  const fillBlankQuizzes = await loadStoredFillBlankQuizzesMap(corridorId);
  const flashcardDecks = await loadStoredFlashcardDecksMap(corridorId);
  const resolvePhrase = await buildPhraseResolver(corridorId, conversations);

  function resolveFlashcard(card: StoredFlashcard): Flashcard | null {
    if (card.phraseId) {
      const p = resolvePhrase(card.phraseId);
      if (!p) return null;
      return {
        id: card.id,
        front: card.front,
        target: p.target,
        romanization: p.romanization,
        meaning: p.meaning,
        phraseId: card.phraseId,
      };
    }
    if (!card.target?.trim()) return null;
    return {
      id: card.id,
      front: card.front,
      target: card.target,
      romanization: card.romanization,
      meaning: card.meaning ?? card.front,
      phraseId: card.phraseId,
    };
  }

  const vignettes: LessonVignette[] = manifest.vignettes.map((vm) => {
    const vignetteConversations: ReturnType<typeof storedToVignetteConversation>[] =
      [];
    const vignetteMiniLessons: MiniLesson[] = [];
    const vignettePhraseLists: VignettePhraseList[] = [];
    const vignetteFillBlank: VignetteFillBlankQuiz[] = [];
    const vignetteFlashcards: VignetteFlashcardDeck[] = [];
    const playback: VignettePlaybackItem[] = [];

    const conversationIds = new Set<string>();

    for (const item of vm.sequence) {
      if (item.kind === "miniLesson" && item.anchor) {
        const ml = miniLessons.get(item.ref);
        if (!ml) {
          warnings.push(`Missing mini lesson: ${item.ref}`);
          continue;
        }
        vignetteMiniLessons.push(
          compileMiniLesson(ml, {
            conversationRef: item.anchor.conversationRef,
            afterTurnId: item.anchor.afterTurnId,
          }),
        );
        continue;
      }

      if (item.kind === "conversation") {
        const stored = conversations.get(item.ref);
        if (!stored) {
          warnings.push(`Missing conversation: ${item.ref}`);
          continue;
        }
        if (!conversationIds.has(item.ref)) {
          vignetteConversations.push(storedToVignetteConversation(stored));
          conversationIds.add(item.ref);
        }
        playback.push({ kind: "conversation", conversationId: item.ref });
        continue;
      }

      if (item.kind === "miniLesson") {
        const ml = miniLessons.get(item.ref);
        if (!ml) {
          warnings.push(`Missing mini lesson: ${item.ref}`);
          continue;
        }
        vignetteMiniLessons.push(compileMiniLesson(ml));
        playback.push({ kind: "miniLesson", miniLessonId: item.ref });
        continue;
      }

      if (item.kind === "phraseList") {
        const pl = phraseLists.get(item.ref);
        if (!pl) {
          warnings.push(`Missing phrase list: ${item.ref}`);
          continue;
        }
        const phrases = [];
        for (const pid of pl.phraseIds) {
          const p = resolvePhrase(pid);
          if (!p) {
            warnings.push(`Unresolved phrase id ${pid} in list ${item.ref}`);
            continue;
          }
          phrases.push({ ...p, id: pid });
        }
        vignettePhraseLists.push({
          id: pl.id,
          title: pl.title,
          phrases,
        });
        playback.push({ kind: "phraseList", phraseListId: pl.id });
        continue;
      }

      if (item.kind === "fillBlank") {
        const quiz = fillBlankQuizzes.get(item.ref);
        if (!quiz) {
          warnings.push(`Missing fill-blank quiz: ${item.ref}`);
          continue;
        }
        vignetteFillBlank.push({
          id: quiz.id,
          title: quiz.title,
          questions: quiz.questions.map((q) =>
            compileFillBlankQuestion(q, quiz.questions),
          ),
        });
        playback.push({ kind: "fillBlank", fillBlankQuizId: quiz.id });
        continue;
      }

      if (item.kind === "flashcards") {
        const deck = flashcardDecks.get(item.ref);
        if (!deck) {
          warnings.push(`Missing flashcard deck: ${item.ref}`);
          continue;
        }
        const cards: Flashcard[] = [];
        for (const card of deck.cards) {
          const resolved = resolveFlashcard(card);
          if (!resolved) {
            warnings.push(`Unresolved flashcard ${card.id} in deck ${item.ref}`);
            continue;
          }
          cards.push(resolved);
        }
        vignetteFlashcards.push({
          id: deck.id,
          title: deck.title,
          cards,
        });
        playback.push({ kind: "flashcards", flashcardDeckId: deck.id });
      }
    }

    const conversationsWithMcq = vignetteConversations.map((conv) =>
      enrichConversationTravelerMcq(conv, vignetteConversations, corridorId),
    );

    return {
      id: vm.id,
      title: vm.title,
      culture: vm.culture,
      conversations: conversationsWithMcq,
      miniLessons: vignetteMiniLessons.length ? vignetteMiniLessons : undefined,
      phraseLists: vignettePhraseLists.length ? vignettePhraseLists : undefined,
      fillBlankQuizzes: vignetteFillBlank.length ? vignetteFillBlank : undefined,
      flashcardDecks: vignetteFlashcards.length ? vignetteFlashcards : undefined,
      playback: playback.length ? playback : undefined,
    };
  });

  const lesson: LessonContent = {
    id: manifest.id,
    corridorId: manifest.corridorId,
    situation: manifest.situation,
    order: manifest.order,
    title: manifest.title,
    free: manifest.free,
    vignettes,
  };

  return { lesson, warnings };
}
