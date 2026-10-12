/**
 * Compile one lesson manifest into content/packs/{corridor}.json
 * Usage: npx tsx scripts/content/compile-lesson-manifest.ts id-id id-id-basics
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { compileLessonManifest } from "../../src/lib/content/compile-lesson-manifest";
import { loadStoredLessonManifest } from "../../src/lib/content/load-pool-files";
import { phrasesFromLesson } from "../../src/lib/content/extract-phrases";
import type { CorridorContentPack } from "../../src/lib/lesson-content-types";
import type { CorridorId } from "../../src/lib/types";

const corridorId = process.argv[2] as CorridorId | undefined;
const lessonId = process.argv[3];

async function main() {
  if (!corridorId || !lessonId) {
    console.error(
      "Usage: npx tsx scripts/content/compile-lesson-manifest.ts <corridorId> <lessonId>",
    );
    process.exit(1);
  }

  const manifest = await loadStoredLessonManifest(corridorId, lessonId);
  if (!manifest) {
    console.error(`No manifest at content/lessons/${corridorId}/${lessonId}.json`);
    process.exit(1);
  }

  const { lesson, warnings } = await compileLessonManifest(manifest);
  warnings.forEach((w) => console.warn("warn:", w));

  const packPath = path.join(process.cwd(), "content", "packs", `${corridorId}.json`);
  let pack: CorridorContentPack;
  try {
    const raw = await readFile(packPath, "utf8");
    pack = JSON.parse(raw) as CorridorContentPack;
  } catch {
    pack = { corridorId, lessons: [], emergencyPhrases: [] };
  }

  const lessonIndex = pack.lessons.findIndex((l) => l.situation === lesson.situation);
  if (lessonIndex >= 0) {
    pack.lessons[lessonIndex] = lesson;
  } else {
    pack.lessons.push(lesson);
    pack.lessons.sort((a, b) => a.order - b.order);
  }

  if (lesson.situation === "emergency") {
    pack.emergencyPhrases = phrasesFromLesson(lesson).slice(0, 12);
  }

  await writeFile(packPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  const stepCount = lesson.vignettes.reduce((n, v) => {
    const conv = v.conversations.reduce((c, x) => c + 1 + x.turns.length, 0);
    const ml =
      (v.miniLessons?.reduce((m, x) => m + 1 + x.examples.length, 0) ?? 0);
    const pl = v.phraseLists?.reduce((p, x) => p + x.phrases.length, 0) ?? 0;
    return n + conv + ml + pl + (v.culture?.length ?? 0);
  }, 0);

  console.log(`Updated ${packPath} lesson ${lesson.id} (~${stepCount} player units)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
