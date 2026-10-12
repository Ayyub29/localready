/**
 * Compile all lesson manifests for a corridor into content/packs/{corridor}.json
 * Usage: npx tsx scripts/content/compile-pack.ts id-id
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { compileLessonManifest } from "../../src/lib/content/compile-lesson-manifest";
import {
  listStoredLessonManifests,
  loadStoredLessonManifest,
} from "../../src/lib/content/load-pool-files";
import { phrasesFromLesson } from "../../src/lib/content/extract-phrases";
import type { CorridorContentPack } from "../../src/lib/lesson-content-types";
import type { CorridorId } from "../../src/lib/types";

const corridorId = process.argv[2] as CorridorId | undefined;

async function main() {
  if (!corridorId) {
    console.error("Usage: npx tsx scripts/content/compile-pack.ts <corridorId>");
    process.exit(1);
  }

  const lessonIds = await listStoredLessonManifests(corridorId);
  if (lessonIds.length === 0) {
    console.error(`No manifests in content/lessons/${corridorId}/`);
    process.exit(1);
  }

  const packPath = path.join(process.cwd(), "content", "packs", `${corridorId}.json`);
  let pack: CorridorContentPack;
  try {
    const raw = await readFile(packPath, "utf8");
    pack = JSON.parse(raw) as CorridorContentPack;
  } catch {
    pack = { corridorId, lessons: [], emergencyPhrases: [] };
  }

  for (const lessonId of lessonIds) {
    const manifest = await loadStoredLessonManifest(corridorId, lessonId);
    if (!manifest) continue;
    const { lesson, warnings } = await compileLessonManifest(manifest);
    warnings.forEach((w) => console.warn(`${lessonId}:`, w));

    const idx = pack.lessons.findIndex((l) => l.situation === lesson.situation);
    if (idx >= 0) pack.lessons[idx] = lesson;
    else pack.lessons.push(lesson);

    if (lesson.situation === "emergency") {
      pack.emergencyPhrases = phrasesFromLesson(lesson).slice(0, 12);
    }
  }

  pack.lessons.sort((a, b) => a.order - b.order);
  await writeFile(packPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  console.log(`Compiled ${lessonIds.length} lesson(s) → ${packPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
