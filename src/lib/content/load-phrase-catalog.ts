import { readFile } from "node:fs/promises";
import path from "node:path";
import { phrasesFromLesson } from "@/lib/content/extract-phrases";
import type { Phrase } from "@/lib/lesson-content-types";
import { loadCorridorPack } from "@/lib/content/load-pack";
import type { CorridorId, SituationKey } from "@/lib/types";
import { situationOrder } from "@/lib/situations";

export type PhraseCatalogEntry = Phrase & { situations: SituationKey[] };

export type PhraseCatalog = {
  corridorId: CorridorId;
  phrases: PhraseCatalogEntry[];
};

function catalogPath(corridorId: CorridorId): string {
  return path.join(
    process.cwd(),
    "content",
    "derived",
    corridorId,
    "phrase-catalog.json",
  );
}

function mergeEntries(entries: PhraseCatalogEntry[]): PhraseCatalogEntry[] {
  const byKey = new Map<string, PhraseCatalogEntry>();
  for (const entry of entries) {
    const key = `${entry.target.trim().toLowerCase()}|${entry.meaning.en.trim().toLowerCase()}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...entry, situations: [...entry.situations] });
      continue;
    }
    for (const s of entry.situations) {
      if (!existing.situations.includes(s)) existing.situations.push(s);
    }
  }
  return [...byKey.values()];
}

async function catalogFromPack(corridorId: CorridorId): Promise<PhraseCatalogEntry[]> {
  const pack = await loadCorridorPack(corridorId);
  if (!pack) return [];

  const raw: PhraseCatalogEntry[] = [];
  for (const lesson of pack.lessons) {
    for (const p of phrasesFromLesson(lesson)) {
      raw.push({ ...p, situations: [lesson.situation] });
    }
  }
  for (const p of pack.emergencyPhrases) {
    raw.push({ ...p, situations: ["emergency"] });
  }
  return mergeEntries(raw);
}

export async function loadPhraseCatalog(
  corridorId: CorridorId,
): Promise<PhraseCatalog> {
  try {
    const raw = await readFile(catalogPath(corridorId), "utf8");
    const doc = JSON.parse(raw) as PhraseCatalog;
    if (doc.corridorId === corridorId && Array.isArray(doc.phrases)) {
      return doc;
    }
  } catch {
    // fall through
  }

  const phrases = await catalogFromPack(corridorId);
  return { corridorId, phrases };
}

export function phrasesForSituation(
  catalog: PhraseCatalog,
  situation: SituationKey,
): PhraseCatalogEntry[] {
  return catalog.phrases.filter((p) => p.situations.includes(situation));
}

export function situationsWithPhrases(catalog: PhraseCatalog): SituationKey[] {
  return situationOrder.filter((situation) =>
    catalog.phrases.some((p) => p.situations.includes(situation)),
  );
}
