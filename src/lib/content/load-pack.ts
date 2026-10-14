import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { getBundledCorridorPack } from "@/lib/content/bundled-content";
import { isBundledContentMode } from "@/lib/content/content-fs";
import { enrichPackGlosses } from "@/lib/content/enrich-pack-glosses";
import type { CorridorContentPack, LessonContent } from "@/lib/lesson-content-types";
import type { CorridorId, SituationKey } from "@/lib/types";

function packPath(corridorId: CorridorId): string {
  return path.join(process.cwd(), "content", "packs", `${corridorId}.json`);
}

type PackCacheEntry = {
  mtimeMs: number;
  pack: CorridorContentPack;
};

/** Process-local cache keyed by pack file mtime (dev + warm server). */
const packByMtime = new Map<CorridorId, PackCacheEntry>();
const packBundled = new Map<CorridorId, CorridorContentPack>();

async function readPackFromDisk(corridorId: CorridorId): Promise<CorridorContentPack | null> {
  if (await isBundledContentMode()) {
    const hit = packBundled.get(corridorId);
    if (hit) return hit;
    const raw = getBundledCorridorPack(corridorId);
    if (!raw) return null;
    const pack = await enrichPackGlosses(raw);
    packBundled.set(corridorId, pack);
    return pack;
  }

  const filePath = packPath(corridorId);
  try {
    const fileStat = await stat(filePath);
    const mtimeMs = fileStat.mtimeMs;
    const hit = packByMtime.get(corridorId);
    if (hit && hit.mtimeMs === mtimeMs) {
      return hit.pack;
    }

    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as CorridorContentPack;
    const pack = await enrichPackGlosses(parsed);
    packByMtime.set(corridorId, { mtimeMs, pack });
    return pack;
  } catch {
    return null;
  }
}

/** Load corridor pack JSON; gloss enrich is skipped when `id` glosses are already set. */
export const loadCorridorPack = cache(
  async (corridorId: CorridorId): Promise<CorridorContentPack | null> => {
    return readPackFromDisk(corridorId);
  },
);

export async function loadLesson(
  corridorId: CorridorId,
  situation: SituationKey,
): Promise<LessonContent | null> {
  const pack = await loadCorridorPack(corridorId);
  if (!pack) return null;
  return pack.lessons.find((l) => l.situation === situation) ?? null;
}

export function lessonHasContent(lesson: LessonContent): boolean {
  if (lesson.situation === "script") {
    return (lesson.scriptBlocks?.length ?? 0) > 0;
  }
  return lesson.vignettes.some((v) =>
    (v.conversations?.some((c) => c.turns.length > 0) ?? false) ||
    (v.miniLessons?.some((m) => m.words.length > 0) ?? false) ||
    (v.phraseLists?.some((p) => p.phrases.length > 0) ?? false) ||
    (v.fillBlankQuizzes?.some((q) => q.questions.length > 0) ?? false) ||
    (v.flashcardDecks?.some((d) => d.cards.length > 0) ?? false) ||
    (v.phrases?.length ?? 0) > 0,
  );
}

/** Clear in-memory pack cache (e.g. after admin rewrites pack on disk). */
export function invalidateCorridorPackCache(corridorId?: CorridorId): void {
  if (corridorId) {
    packByMtime.delete(corridorId);
    packBundled.delete(corridorId);
    return;
  }
  packByMtime.clear();
  packBundled.clear();
}
