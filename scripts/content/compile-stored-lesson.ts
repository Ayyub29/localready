/**
 * Merge stored conversations for one lesson into content/packs/{corridor}.json
 * Usage: npx tsx scripts/content/compile-stored-lesson.ts id-id basics
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { phrasesFromLesson } from "../../src/lib/content/extract-phrases";
import type { CorridorContentPack, LessonContent, LessonVignette } from "../../src/lib/lesson-content-types";
import { loadStoredConversationsForLesson } from "../../src/lib/content/load-stored-conversations";
import { storedToVignetteConversation } from "../../src/lib/content/stored-conversation-types";
import type { CorridorId, SituationKey } from "../../src/lib/types";
import { situationOrder } from "../../src/lib/situations";

const corridorId = process.argv[2] as CorridorId | undefined;
const situation = process.argv[3] as SituationKey | undefined;

async function main() {
  if (!corridorId || !situation) {
    console.error("Usage: npx tsx scripts/content/compile-stored-lesson.ts <corridorId> <situation>");
    process.exit(1);
  }

  const stored = await loadStoredConversationsForLesson(corridorId, situation);
  if (stored.length === 0) {
    console.error(`No stored conversations for ${corridorId} / ${situation}`);
    process.exit(1);
  }

  const conversations = stored
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(storedToVignetteConversation);

  const vignette: LessonVignette = {
    id: `${corridorId}-${situation}-sample-v1`,
    title: {
      en: situation === "basics" ? "Arrival day" : situation,
      id: situation === "basics" ? "Hari pertama tiba" : situation,
    },
    culture:
      situation === "basics"
        ? [
            {
              id: `${corridorId}-basics-culture-smile`,
              title: { en: "Smile first", id: "Senyum dulu" },
              body: {
                en: "A friendly tone and a smile go a long way in shops and with drivers.",
                id: "Nada ramah dan senyum sangat membantu di warung dan dengan supir.",
              },
            },
          ]
        : undefined,
    conversations,
  };

  const packPath = path.join(process.cwd(), "content", "packs", `${corridorId}.json`);
  const raw = await readFile(packPath, "utf8");
  const pack = JSON.parse(raw) as CorridorContentPack;

  const order = situationOrder.indexOf(situation);
  const lessonIndex = pack.lessons.findIndex((l) => l.situation === situation);
  const lesson: LessonContent = {
    id: `${corridorId}-${situation}`,
    corridorId,
    situation,
    order,
    title: pack.lessons[lessonIndex]?.title ?? {
      en: situation,
      id: situation,
    },
    free: situation === "basics" || situation === "script" || situation === "emergency",
    vignettes: [vignette],
  };

  if (lessonIndex >= 0) {
    pack.lessons[lessonIndex] = lesson;
  } else {
    pack.lessons.push(lesson);
  }

  if (situation === "emergency") {
    pack.emergencyPhrases = phrasesFromLesson(lesson).slice(0, 12);
  }

  await writeFile(packPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  console.log(
    `Updated ${packPath}: ${conversations.length} conversations, ${conversations.reduce((n, c) => n + c.turns.length, 0)} turns`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
