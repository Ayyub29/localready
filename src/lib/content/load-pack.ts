import { readFile } from "node:fs/promises";
import path from "node:path";
import { enrichPackGlosses } from "@/lib/content/enrich-pack-glosses";
import type { CorridorContentPack, LessonContent } from "@/lib/lesson-content-types";
import type { CorridorId, SituationKey } from "@/lib/types";

function packPath(corridorId: CorridorId): string {
  return path.join(process.cwd(), "content", "packs", `${corridorId}.json`);
}

export async function loadCorridorPack(
  corridorId: CorridorId,
): Promise<CorridorContentPack | null> {
  try {
    const raw = await readFile(packPath(corridorId), "utf8");
    const pack = JSON.parse(raw) as CorridorContentPack;
    return await enrichPackGlosses(pack);
  } catch {
    return null;
  }
}

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
