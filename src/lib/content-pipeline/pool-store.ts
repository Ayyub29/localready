import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CorridorId } from "@/lib/types";
import { phrasePoolPath } from "./paths";
import type {
  ManualPhraseInput,
  PhrasePoolFile,
  PhrasePoolItem,
  PhrasePoolSource,
  PhrasePoolStatus,
  PhrasePoolUpdate,
} from "./types";

function emptyPool(corridorId: CorridorId): PhrasePoolFile {
  return {
    version: 1,
    corridorId,
    updatedAt: new Date().toISOString(),
    items: [],
  };
}

export async function readPhrasePool(
  corridorId: CorridorId,
): Promise<PhrasePoolFile> {
  const filePath = phrasePoolPath(corridorId);
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as PhrasePoolFile;
  } catch {
    return emptyPool(corridorId);
  }
}

export async function writePhrasePool(file: PhrasePoolFile): Promise<void> {
  const filePath = phrasePoolPath(file.corridorId);
  await mkdir(path.dirname(filePath), { recursive: true });
  const next: PhrasePoolFile = {
    ...file,
    updatedAt: new Date().toISOString(),
  };
  const tmp = `${filePath}.tmp`;
  await writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await rename(tmp, filePath);
}

export function newPoolItemId(corridorId: CorridorId): string {
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${corridorId}-pool-${suffix}`;
}

function normalizeKey(target: string, meaningEn: string): string {
  return `${target.trim().toLowerCase()}|${meaningEn.trim().toLowerCase()}`;
}

export function findDuplicateIndex(
  items: PhrasePoolItem[],
  target: string,
  meaningEn: string,
): number {
  const key = normalizeKey(target, meaningEn);
  return items.findIndex((i) => normalizeKey(i.target, i.meaningEn) === key);
}

export async function appendPoolItems(
  corridorId: CorridorId,
  inputs: ManualPhraseInput[],
  source: PhrasePoolSource,
  defaults: { status?: PhrasePoolStatus } = {},
): Promise<{ added: PhrasePoolItem[]; skipped: number }> {
  const pool = await readPhrasePool(corridorId);
  const status = defaults.status ?? "pending";
  const added: PhrasePoolItem[] = [];
  let skipped = 0;
  const now = new Date().toISOString();

  for (const input of inputs) {
    if (findDuplicateIndex(pool.items, input.target, input.meaningEn) >= 0) {
      skipped += 1;
      continue;
    }
    const item: PhrasePoolItem = {
      id: newPoolItemId(corridorId),
      corridorId,
      target: input.target.trim(),
      romanization: input.romanization?.trim(),
      meaningEn: input.meaningEn.trim(),
      meaningId: input.meaningId?.trim(),
      wvSource: input.wvSource,
      source,
      situationHints: input.situationHints ?? [],
      tags: input.tags ?? [],
      status,
      notes: input.notes,
      createdAt: now,
    };
    pool.items.push(item);
    added.push(item);
  }

  if (added.length > 0) {
    await writePhrasePool(pool);
  }

  return { added, skipped };
}

export async function updatePoolItems(
  corridorId: CorridorId,
  updates: PhrasePoolUpdate[],
): Promise<{ updated: PhrasePoolItem[]; notFound: string[] }> {
  const pool = await readPhrasePool(corridorId);
  const updated: PhrasePoolItem[] = [];
  const notFound: string[] = [];
  const now = new Date().toISOString();

  for (const patch of updates) {
    const idx = pool.items.findIndex((i) => i.id === patch.id);
    if (idx < 0) {
      notFound.push(patch.id);
      continue;
    }
    const current = pool.items[idx];
    const next: PhrasePoolItem = {
      ...current,
      ...stripUndefined(patch),
      updatedAt: now,
    };
    pool.items[idx] = next;
    updated.push(next);
  }

  if (updated.length > 0) {
    await writePhrasePool(pool);
  }

  return { updated, notFound };
}

export async function deletePoolItems(
  corridorId: CorridorId,
  ids: string[],
): Promise<{ deleted: number; notFound: string[] }> {
  const pool = await readPhrasePool(corridorId);
  const wanted = new Set(ids);
  const notFound: string[] = [];
  for (const id of ids) {
    if (!pool.items.some((i) => i.id === id)) notFound.push(id);
  }
  const before = pool.items.length;
  pool.items = pool.items.filter((i) => !wanted.has(i.id));
  const deleted = before - pool.items.length;
  if (deleted > 0) {
    await writePhrasePool(pool);
  }
  return { deleted, notFound };
}

function stripUndefined(patch: PhrasePoolUpdate): Partial<PhrasePoolItem> {
  const out: Partial<PhrasePoolItem> = {};
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.meaningId !== undefined) out.meaningId = patch.meaningId;
  if (patch.meaningEn !== undefined) out.meaningEn = patch.meaningEn;
  if (patch.romanization !== undefined) out.romanization = patch.romanization;
  if (patch.target !== undefined) out.target = patch.target;
  if (patch.situationHints !== undefined) out.situationHints = patch.situationHints;
  if (patch.tags !== undefined) out.tags = patch.tags;
  if (patch.notes !== undefined) out.notes = patch.notes;
  return out;
}

export type PoolListQuery = {
  status?: PhrasePoolStatus;
  source?: PhrasePoolSource;
  situation?: string;
  limit?: number;
  offset?: number;
};

export function filterPoolItems(
  pool: PhrasePoolFile,
  query: PoolListQuery,
): { items: PhrasePoolItem[]; total: number } {
  let items = pool.items;
  if (query.status) {
    items = items.filter((i) => i.status === query.status);
  }
  if (query.source) {
    items = items.filter((i) => i.source === query.source);
  }
  if (query.situation) {
    items = items.filter((i) => i.situationHints.includes(query.situation!));
  }
  const total = items.length;
  const offset = query.offset ?? 0;
  const limit = query.limit ?? 100;
  return { items: items.slice(offset, offset + limit), total };
}
