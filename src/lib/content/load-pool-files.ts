import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { StoredConversation } from "@/lib/content/stored-conversation-types";
import type { StoredLessonManifest } from "@/lib/content/stored-lesson-manifest-types";
import type { StoredMiniLesson } from "@/lib/content/stored-mini-lesson-types";
import type { StoredFillBlankQuiz } from "@/lib/content/stored-fill-blank-types";
import type { StoredFlashcardDeck } from "@/lib/content/stored-flashcard-deck-types";
import type { StoredPhraseList } from "@/lib/content/stored-phrase-list-types";
import type { CorridorId } from "@/lib/types";

async function readJsonDir<T>(
  dir: string,
  skipPrefix = "_",
): Promise<Map<string, T>> {
  const map = new Map<string, T>();
  try {
    const files = await readdir(dir);
    for (const file of files) {
      if (!file.endsWith(".json") || file.startsWith(skipPrefix)) continue;
      const raw = await readFile(path.join(dir, file), "utf8");
      const doc = JSON.parse(raw) as T & { id: string };
      map.set(doc.id, doc);
    }
  } catch {
    // missing dir
  }
  return map;
}

export async function loadStoredConversationsMap(
  corridorId: CorridorId,
): Promise<Map<string, StoredConversation>> {
  const dir = path.join(process.cwd(), "content", "conversations", corridorId);
  return readJsonDir<StoredConversation>(dir);
}

export async function loadStoredMiniLessonsMap(
  corridorId: CorridorId,
): Promise<Map<string, StoredMiniLesson>> {
  const dir = path.join(process.cwd(), "content", "mini-lessons", corridorId);
  return readJsonDir<StoredMiniLesson>(dir);
}

export async function loadStoredPhraseListsMap(
  corridorId: CorridorId,
): Promise<Map<string, StoredPhraseList>> {
  const dir = path.join(process.cwd(), "content", "phrase-lists", corridorId);
  return readJsonDir<StoredPhraseList>(dir);
}

export async function loadStoredFillBlankQuizzesMap(
  corridorId: CorridorId,
): Promise<Map<string, StoredFillBlankQuiz>> {
  const dir = path.join(process.cwd(), "content", "fill-blank", corridorId);
  return readJsonDir<StoredFillBlankQuiz>(dir);
}

export async function loadStoredFlashcardDecksMap(
  corridorId: CorridorId,
): Promise<Map<string, StoredFlashcardDeck>> {
  const dir = path.join(process.cwd(), "content", "flashcard-decks", corridorId);
  return readJsonDir<StoredFlashcardDeck>(dir);
}

export async function loadStoredLessonManifest(
  corridorId: CorridorId,
  lessonId: string,
): Promise<StoredLessonManifest | null> {
  const file = path.join(
    process.cwd(),
    "content",
    "lessons",
    corridorId,
    `${lessonId}.json`,
  );
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as StoredLessonManifest;
  } catch {
    return null;
  }
}

export async function listStoredLessonManifests(
  corridorId: CorridorId,
): Promise<string[]> {
  const dir = path.join(process.cwd(), "content", "lessons", corridorId);
  try {
    const files = await readdir(dir);
    return files
      .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}
