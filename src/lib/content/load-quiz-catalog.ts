import { loadCorridorPack } from "@/lib/content/load-pack";
import {
  loadStoredFillBlankQuizzesMap,
  loadStoredFlashcardDecksMap,
  loadStoredPhraseListsMap,
} from "@/lib/content/load-pool-files";
import { situationFromContentId, type QuizKind } from "@/lib/content/quiz-situation";
import { situationOrder } from "@/lib/situations";
import type { CorridorId, LocalizedString, SituationKey } from "@/lib/types";

export type QuizCatalogEntry = {
  id: string;
  corridorId: CorridorId;
  situation: SituationKey;
  kind: QuizKind;
  title: LocalizedString;
  itemCount: number;
};

function entryKey(kind: QuizKind, id: string): string {
  return `${kind}:${id}`;
}

function addEntry(
  map: Map<string, QuizCatalogEntry>,
  entry: QuizCatalogEntry,
): void {
  map.set(entryKey(entry.kind, entry.id), entry);
}

export async function loadQuizCatalog(
  corridorId: CorridorId,
): Promise<QuizCatalogEntry[]> {
  const byKey = new Map<string, QuizCatalogEntry>();

  const [fillBlank, flashcards, phraseLists, pack] = await Promise.all([
    loadStoredFillBlankQuizzesMap(corridorId),
    loadStoredFlashcardDecksMap(corridorId),
    loadStoredPhraseListsMap(corridorId),
    loadCorridorPack(corridorId),
  ]);

  for (const quiz of fillBlank.values()) {
    const situation =
      situationFromContentId(quiz.id, corridorId) ?? ("basics" as SituationKey);
    addEntry(byKey, {
      id: quiz.id,
      corridorId,
      situation,
      kind: "fillBlank",
      title: quiz.title,
      itemCount: quiz.questions.length,
    });
  }

  for (const deck of flashcards.values()) {
    const situation =
      situationFromContentId(deck.id, corridorId) ?? ("basics" as SituationKey);
    addEntry(byKey, {
      id: deck.id,
      corridorId,
      situation,
      kind: "flashcards",
      title: deck.title,
      itemCount: deck.cards.length,
    });
  }

  for (const list of phraseLists.values()) {
    const situation =
      situationFromContentId(list.id, corridorId) ?? ("basics" as SituationKey);
    addEntry(byKey, {
      id: list.id,
      corridorId,
      situation,
      kind: "phraseDrill",
      title: list.title,
      itemCount: list.phraseIds.length,
    });
  }

  if (pack) {
    for (const lesson of pack.lessons) {
      for (const vignette of lesson.vignettes) {
        for (const q of vignette.fillBlankQuizzes ?? []) {
          addEntry(byKey, {
            id: q.id,
            corridorId,
            situation: lesson.situation,
            kind: "fillBlank",
            title: q.title,
            itemCount: q.questions.length,
          });
        }
        for (const d of vignette.flashcardDecks ?? []) {
          addEntry(byKey, {
            id: d.id,
            corridorId,
            situation: lesson.situation,
            kind: "flashcards",
            title: d.title,
            itemCount: d.cards.length,
          });
        }
        for (const pl of vignette.phraseLists ?? []) {
          addEntry(byKey, {
            id: pl.id,
            corridorId,
            situation: lesson.situation,
            kind: "phraseDrill",
            title: pl.title,
            itemCount: pl.phrases.length,
          });
        }
      }
    }
  }

  return [...byKey.values()].sort((a, b) => {
    const si = situationOrder.indexOf(a.situation) - situationOrder.indexOf(b.situation);
    if (si !== 0) return si;
    return a.title.en.localeCompare(b.title.en);
  });
}

export function situationsWithQuizzes(
  entries: QuizCatalogEntry[],
): SituationKey[] {
  const set = new Set<SituationKey>();
  for (const e of entries) set.add(e.situation);
  return situationOrder.filter((s) => set.has(s));
}

export function quizzesForSituation(
  entries: QuizCatalogEntry[],
  situation: SituationKey,
): QuizCatalogEntry[] {
  return entries.filter((e) => e.situation === situation);
}
