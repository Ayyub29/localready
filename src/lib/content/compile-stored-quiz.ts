import { compileFillBlankQuestion } from "@/lib/content/compile-mcq";
import {
  loadStoredConversationsMap,
  loadStoredFillBlankQuizzesMap,
  loadStoredFlashcardDecksMap,
  loadStoredPhraseListsMap,
} from "@/lib/content/load-pool-files";
import { buildPhraseResolver } from "@/lib/content/resolve-phrase-id";
import type {
  Flashcard,
  Phrase,
  VignetteFillBlankQuiz,
  VignetteFlashcardDeck,
  VignettePhraseList,
} from "@/lib/lesson-content-types";
import type { StoredFlashcard } from "@/lib/content/stored-flashcard-deck-types";
import type { CorridorId } from "@/lib/types";

async function resolveFlashcardFactory(corridorId: CorridorId) {
  const conversations = await loadStoredConversationsMap(corridorId);
  const resolvePhrase = await buildPhraseResolver(corridorId, conversations);

  return function resolveFlashcard(card: StoredFlashcard): Flashcard | null {
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
  };
}

export async function compileStoredFillBlankQuiz(
  corridorId: CorridorId,
  quizId: string,
): Promise<VignetteFillBlankQuiz | null> {
  const map = await loadStoredFillBlankQuizzesMap(corridorId);
  const quiz = map.get(quizId);
  if (!quiz) return null;

  const conversations = await loadStoredConversationsMap(corridorId);
  const resolvePhrase = await buildPhraseResolver(corridorId, conversations);
  const questions = [];
  for (const q of quiz.questions) {
    const compiled = compileFillBlankQuestion(q, resolvePhrase, quiz.questions);
    if (compiled) questions.push(compiled);
  }
  if (!questions.length) return null;
  return { id: quiz.id, title: quiz.title, questions };
}

export async function compileStoredFlashcardDeck(
  corridorId: CorridorId,
  deckId: string,
): Promise<VignetteFlashcardDeck | null> {
  const map = await loadStoredFlashcardDecksMap(corridorId);
  const deck = map.get(deckId);
  if (!deck) return null;

  const resolveFlashcard = await resolveFlashcardFactory(corridorId);
  const cards: Flashcard[] = [];
  for (const card of deck.cards) {
    const resolved = resolveFlashcard(card);
    if (resolved) cards.push(resolved);
  }
  if (!cards.length) return null;
  return { id: deck.id, title: deck.title, cards };
}

export async function compileStoredPhraseDrill(
  corridorId: CorridorId,
  listId: string,
): Promise<VignettePhraseList | null> {
  const map = await loadStoredPhraseListsMap(corridorId);
  const pl = map.get(listId);
  if (!pl) return null;

  const conversations = await loadStoredConversationsMap(corridorId);
  const resolvePhrase = await buildPhraseResolver(corridorId, conversations);
  const phrases: Phrase[] = [];
  for (const pid of pl.phraseIds) {
    const p = resolvePhrase(pid);
    if (p) phrases.push({ ...p, id: pid });
  }
  if (!phrases.length) return null;
  return { id: pl.id, title: pl.title, phrases };
}
