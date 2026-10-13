"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin/require-admin";
import {
  deleteContentJson,
  readCheatsheetManifest,
  readContentJson,
  writeCheatsheetManifest,
  writeContentJson,
  type CheatsheetManifest,
} from "@/lib/admin/content-io";
import {
  appendPoolItems,
  readPhrasePool,
  updatePoolItems,
} from "@/lib/content-pipeline/pool-store";
import type { ManualPhraseInput, PhrasePoolStatus } from "@/lib/content-pipeline/types";
import type { StoredConversation } from "@/lib/content/stored-conversation-types";
import type { StoredFillBlankQuiz } from "@/lib/content/stored-fill-blank-types";
import type { StoredFlashcardDeck } from "@/lib/content/stored-flashcard-deck-types";
import type { StoredLessonManifest } from "@/lib/content/stored-lesson-manifest-types";
import type { StoredMiniLesson } from "@/lib/content/stored-mini-lesson-types";
import type { StoredPhraseList } from "@/lib/content/stored-phrase-list-types";
import { isCorridorId } from "@/data/catalog";
import { routing } from "@/i18n/routing";
import type { CorridorId, SituationKey } from "@/lib/types";

const execFileAsync = promisify(execFile);

async function assertAdmin() {
  await requireAdminSession();
}

function assertCorridor(corridorId: string): CorridorId {
  if (!isCorridorId(corridorId)) {
    throw new Error("Invalid corridor");
  }
  return corridorId;
}

function revalidateAdmin(corridorId: CorridorId) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/${corridorId}`);
  }
}

export async function adminGetPhrasePool(corridorId: string) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  const pool = await readPhrasePool(c);
  return pool.items;
}

export async function adminInjectPhrases(
  corridorId: string,
  phrases: ManualPhraseInput[],
  status: PhrasePoolStatus = "pending",
) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  const result = await appendPoolItems(c, phrases, "manual", { status });
  revalidateAdmin(c);
  return result;
}

export async function adminUpdatePhraseStatus(
  corridorId: string,
  updates: { id: string; status: PhrasePoolStatus }[],
) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  const result = await updatePoolItems(c, updates);
  revalidateAdmin(c);
  return result;
}

export async function adminSaveConversation(
  corridorId: string,
  doc: StoredConversation,
) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  if (doc.corridorId !== c) throw new Error("corridor mismatch");
  const now = new Date().toISOString();
  const next: StoredConversation = {
    ...doc,
    schemaVersion: 1,
    updatedAt: now,
    createdAt: doc.createdAt ?? now,
  };
  await writeContentJson(c, "conversations", next);
  revalidateAdmin(c);
}

export async function adminDeleteConversation(corridorId: string, id: string) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  await deleteContentJson(c, "conversations", id);
  revalidateAdmin(c);
}

export async function adminSaveMiniLesson(corridorId: string, doc: StoredMiniLesson) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  if (doc.corridorId !== c) throw new Error("corridor mismatch");
  const now = new Date().toISOString();
  await writeContentJson(c, "mini-lessons", {
    ...doc,
    schemaVersion: 1,
    updatedAt: now,
    createdAt: doc.createdAt ?? now,
  });
  revalidateAdmin(c);
}

export async function adminSavePhraseList(corridorId: string, doc: StoredPhraseList) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  if (doc.corridorId !== c) throw new Error("corridor mismatch");
  const now = new Date().toISOString();
  await writeContentJson(c, "phrase-lists", {
    ...doc,
    schemaVersion: 1,
    updatedAt: now,
    createdAt: doc.createdAt ?? now,
  });
  revalidateAdmin(c);
}

export async function adminSaveFillBlank(corridorId: string, doc: StoredFillBlankQuiz) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  if (doc.corridorId !== c) throw new Error("corridor mismatch");
  await writeContentJson(c, "fill-blank", { ...doc, schemaVersion: 1 });
  revalidateAdmin(c);
}

export async function adminSaveFlashcardDeck(
  corridorId: string,
  doc: StoredFlashcardDeck,
) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  if (doc.corridorId !== c) throw new Error("corridor mismatch");
  await writeContentJson(c, "flashcard-decks", { ...doc, schemaVersion: 1 });
  revalidateAdmin(c);
}

export async function adminSaveLessonManifest(
  corridorId: string,
  doc: StoredLessonManifest,
) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  if (doc.corridorId !== c) throw new Error("corridor mismatch");
  await writeContentJson(c, "lessons", { ...doc, schemaVersion: 1 });
  revalidateAdmin(c);
}

export async function adminSaveCheatsheet(
  corridorId: string,
  situations: Partial<Record<SituationKey, string[]>>,
) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  const existing = await readCheatsheetManifest(c);
  const manifest: CheatsheetManifest = {
    schemaVersion: 1,
    corridorId: c,
    notes: existing?.notes,
    situations,
  };
  await writeCheatsheetManifest(manifest);
  revalidateAdmin(c);
}

export async function adminBuildCheatsheetCatalog(corridorId: string) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  const { stdout, stderr } = await execFileAsync(
    "npm",
    ["run", "content:build:cheatsheet", "--", c],
    { cwd: process.cwd(), env: process.env },
  );
  revalidateAdmin(c);
  return { stdout, stderr };
}

export async function adminLoadConversation(corridorId: string, id: string) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  return readContentJson<StoredConversation>(c, "conversations", id);
}

export async function adminLoadMiniLesson(corridorId: string, id: string) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  return readContentJson<StoredMiniLesson>(c, "mini-lessons", id);
}

export async function adminLoadPhraseList(corridorId: string, id: string) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  return readContentJson<StoredPhraseList>(c, "phrase-lists", id);
}

export async function adminLoadFillBlank(corridorId: string, id: string) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  return readContentJson<StoredFillBlankQuiz>(c, "fill-blank", id);
}

export async function adminLoadFlashcardDeck(corridorId: string, id: string) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  return readContentJson<StoredFlashcardDeck>(c, "flashcard-decks", id);
}

export async function adminLoadLessonManifest(corridorId: string, lessonId: string) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  return readContentJson<StoredLessonManifest>(c, "lessons", lessonId);
}

export async function adminLoadCheatsheet(corridorId: string) {
  await assertAdmin();
  const c = assertCorridor(corridorId);
  return readCheatsheetManifest(c);
}
