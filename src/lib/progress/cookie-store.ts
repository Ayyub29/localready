import { cookies } from "next/headers";
import { isCorridorId } from "@/data/catalog";
import type { CorridorId } from "@/lib/types";
import {
  emptyCorridorProgress,
  type CorridorProgress,
  type LearningProgressStore,
  type ProgressItemState,
  type ProgressItemType,
} from "./types";

const COOKIE_NAME = "lr_learning_progress";
const ONE_YEAR = 60 * 60 * 24 * 365;

function parseStore(raw: string | undefined): LearningProgressStore {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as LearningProgressStore;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export async function readGuestProgressStore(): Promise<LearningProgressStore> {
  const jar = await cookies();
  return parseStore(jar.get(COOKIE_NAME)?.value);
}

export async function writeGuestProgressStore(store: LearningProgressStore): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, JSON.stringify(store), {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
}

export async function readGuestCorridorProgress(
  corridorId: CorridorId,
): Promise<CorridorProgress> {
  const store = await readGuestProgressStore();
  return store[corridorId] ?? emptyCorridorProgress();
}

export async function writeGuestItemProgress(
  corridorId: CorridorId,
  itemType: ProgressItemType,
  itemId: string,
  state: ProgressItemState,
): Promise<void> {
  const store = await readGuestProgressStore();
  const corridor = store[corridorId] ?? emptyCorridorProgress();
  if (itemType === "lesson") {
    corridor.lessons[itemId] = state;
  } else {
    corridor.quizzes[itemId] = state;
  }
  store[corridorId] = corridor;
  await writeGuestProgressStore(store);
}

export async function clearGuestProgressStore(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function removeGuestCorridorProgress(corridorId: CorridorId): Promise<void> {
  const store = await readGuestProgressStore();
  if (!store[corridorId]) return;
  delete store[corridorId];
  await writeGuestProgressStore(store);
}

export function sanitizeStore(raw: unknown): LearningProgressStore {
  if (!raw || typeof raw !== "object") return {};
  const store: LearningProgressStore = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isCorridorId(key) || !value || typeof value !== "object") continue;
    const corridor = value as CorridorProgress;
    store[key] = {
      lessons: corridor.lessons ?? {},
      quizzes: corridor.quizzes ?? {},
    };
  }
  return store;
}
