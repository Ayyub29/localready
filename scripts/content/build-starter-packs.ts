/**
 * Build minimal corridor packs (basics + emergency) from phrase pools.
 * Usage: npx tsx scripts/content/build-starter-packs.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CorridorContentPack, LessonContent, LessonVignette, Phrase } from "../../src/lib/lesson-content-types";
import { phrasesFromLesson } from "../../src/lib/content/extract-phrases";
import { readPhrasePool } from "../../src/lib/content-pipeline/pool-store";
import type { PhrasePoolItem } from "../../src/lib/content-pipeline/types";
import { glossIdFromMeaningEn } from "../../src/lib/content/gloss-id-from-en";
import type { CorridorId, SituationKey } from "../../src/lib/types";
import { situationOrder } from "../../src/lib/situations";
import {
  emergencyScene,
  greetingsScene,
  politeScene,
} from "./conversation-templates";

const CORRIDORS: CorridorId[] = ["ja-jp", "ko-kr", "th-th", "vi-vn", "id-id"];

const LESSON_TITLES: Record<SituationKey, { en: string; id: string }> = {
  script: { en: "Letters & first words", id: "Huruf & kata penting" },
  basics: { en: "First hour & greetings", id: "Jam pertama & sapaan" },
  train: { en: "Transit & tickets", id: "Transportasi & tiket" },
  money: { en: "Paying & convenience stores", id: "Bayar & minimarket" },
  restaurant: { en: "Ordering & the bill", id: "Pesan makan & bon" },
  hotel: { en: "Check-in & your room", id: "Check-in & kamar" },
  directions: { en: "Lost & maps", id: "Tersesat & peta" },
  culture: { en: "Etiquette & temples", id: "Etiket & tempat suci" },
  emergency: { en: "Help, health & allergies", id: "Bantuan, kesehatan & alergi" },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function cleanTarget(target: string): string {
  return target
    .replace(/\s*\(\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isTravelPhrase(item: PhrasePoolItem): boolean {
  if (!item.romanization?.trim()) return false;
  if (/^like ['"]/i.test(item.meaningEn)) return false;
  if (item.meaningEn.length < 3 || item.meaningEn.length > 100) return false;
  if (/\bin\s+["']/i.test(item.meaningEn) && item.meaningEn.includes("like")) return false;
  const target = cleanTarget(item.target);
  if (target.length < 2 || target.length > 120) return false;
  return true;
}

function hasCjkOrHangulOrThai(target: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9fff\uac00-\ud7af\u0e00-\u0e7f]/.test(target);
}

function isLatinScriptPhrase(target: string): boolean {
  return /[a-zA-Z\u00c0-\u024f\u1e00-\u1eff]/.test(target);
}

function isUsefulForCorridor(item: PhrasePoolItem, corridorId: CorridorId): boolean {
  const target = cleanTarget(item.target);
  if (corridorId === "id-id" || corridorId === "vi-vn") {
    return isLatinScriptPhrase(target) && !hasCjkOrHangulOrThai(target);
  }
  return hasCjkOrHangulOrThai(target);
}

function pickFromPool(
  items: PhrasePoolItem[],
  corridorId: CorridorId,
  filter: (item: PhrasePoolItem) => boolean,
  limit: number,
): PhrasePoolItem[] {
  const seen = new Set<string>();
  const out: PhrasePoolItem[] = [];
  for (const item of items) {
    if (!isTravelPhrase(item) || !isUsefulForCorridor(item, corridorId)) continue;
    if (!filter(item)) continue;
    const key = `${cleanTarget(item.target)}|${item.meaningEn.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

function poolPhraseToPhrase(
  corridorId: CorridorId,
  situation: SituationKey,
  item: PhrasePoolItem,
  index: number,
): Phrase {
  const slug = slugify(item.meaningEn) || `p${index}`;
  return {
    id: `${corridorId}-${situation}-${slug}-${index}`,
    target: cleanTarget(item.target),
    romanization: item.romanization?.replace(/\s*\(\)\s*/g, " ").trim(),
    meaning: {
      en: item.meaningEn.replace(/\s+/g, " ").trim(),
      id:
        item.meaningId?.trim() ||
        glossIdFromMeaningEn(item.meaningEn) ||
        "",
    },
    wvSource: item.wvSource,
  };
}

function buildBasicsLesson(
  corridorId: CorridorId,
  items: PhrasePoolItem[],
  order: number,
): LessonContent {
  const greetings = pickFromPool(
    items,
    corridorId,
    (i) => i.tags.some((t) => /^basics$/i.test(t.trim())) && /hello|good (morning|afternoon|evening)|name|meet|how are/i.test(i.meaningEn),
    5,
  );
  const polite = pickFromPool(
    items,
    corridorId,
    (i) =>
      i.tags.some((t) => /^basics$/i.test(t.trim())) &&
      /thank|excuse|sorry|please|yes|no/i.test(i.meaningEn),
    5,
  );

  const vignettes: LessonVignette[] = [];
  const conversations = [];

  if (greetings.length >= 2) {
    const phrases = greetings.map((item, idx) =>
      poolPhraseToPhrase(corridorId, "basics", item, idx),
    );
    conversations.push(
      greetingsScene(`${corridorId}-basics-conv-greetings`, "basics", phrases),
    );
  }

  if (polite.length >= 2) {
    const phrases = polite.map((item, idx) =>
      poolPhraseToPhrase(corridorId, "basics", item, idx + 10),
    );
    conversations.push(
      politeScene(`${corridorId}-basics-conv-polite`, "basics", phrases),
    );
  }

  if (conversations.length > 0) {
    vignettes.push({
      id: `${corridorId}-basics-first-hour`,
      title: { en: "Hotel & shop", id: "Hotel & toko" },
      culture: [
        {
          id: `${corridorId}-basics-culture-polite`,
          title: { en: "Politeness first", id: "Sopan dulu" },
          body: {
            en: "Short polite phrases matter more than perfect grammar when traveling.",
            id: "Frasa sopan yang singkat lebih penting daripada grammar sempurna saat jalan-jalan.",
          },
        },
      ],
      conversations,
    });
  }

  return {
    id: `${corridorId}-basics`,
    corridorId,
    situation: "basics",
    order,
    title: LESSON_TITLES.basics,
    free: true,
    vignettes,
  };
}

function buildEmergencyLesson(
  corridorId: CorridorId,
  items: PhrasePoolItem[],
  order: number,
): LessonContent {
  const urgent = pickFromPool(
    items,
    corridorId,
    (i) =>
      i.situationHints.includes("emergency") &&
      /help|police|lost|sick|doctor|emergency|hurt|injur|hospital|allerg/i.test(i.meaningEn),
    6,
  );

  const phrases = urgent.map((item, idx) =>
    poolPhraseToPhrase(corridorId, "emergency", item, idx),
  );

  const vignettes: LessonVignette[] = [];
  if (phrases.length >= 2) {
    vignettes.push({
      id: `${corridorId}-emergency-street`,
      title: { en: "Urgent help", id: "Bantuan darurat" },
      conversations: [
        emergencyScene(`${corridorId}-emergency-conv-help`, "emergency", phrases),
      ],
    });
  }

  return {
    id: `${corridorId}-emergency`,
    corridorId,
    situation: "emergency",
    order,
    title: LESSON_TITLES.emergency,
    free: true,
    vignettes,
  };
}

function stubScriptLesson(corridorId: CorridorId, order: number): LessonContent {
  const hasNonLatinScript = corridorId !== "id-id";
  return {
    id: `${corridorId}-script`,
    corridorId,
    situation: "script",
    order,
    title: LESSON_TITLES.script,
    free: true,
    vignettes: [],
    scriptBlocks: hasNonLatinScript ? [] : undefined,
  };
}

function stubLesson(
  corridorId: CorridorId,
  situation: SituationKey,
  order: number,
): LessonContent {
  return {
    id: `${corridorId}-${situation}`,
    corridorId,
    situation,
    order,
    title: LESSON_TITLES[situation],
    free: situation === "basics" || situation === "script",
    vignettes: [],
  };
}

async function buildPack(corridorId: CorridorId): Promise<CorridorContentPack> {
  const pool = await readPhrasePool(corridorId);
  const basics = buildBasicsLesson(
    corridorId,
    pool.items,
    situationOrder.indexOf("basics") + 1,
  );
  const emergency = buildEmergencyLesson(
    corridorId,
    pool.items,
    situationOrder.indexOf("emergency") + 1,
  );

  const lessons: LessonContent[] = situationOrder.map((situation, idx) => {
    if (situation === "script") {
      return stubScriptLesson(corridorId, 0);
    }
    if (situation === "basics") return { ...basics, order: idx };
    if (situation === "emergency") return { ...emergency, order: idx };
    return stubLesson(corridorId, situation, idx);
  });

  const emergencyPhrases = phrasesFromLesson(emergency).slice(0, 12);

  return {
    corridorId,
    lessons,
    emergencyPhrases,
  };
}

async function main() {
  const outDir = path.join(process.cwd(), "content", "packs");
  await mkdir(outDir, { recursive: true });

  for (const corridorId of CORRIDORS) {
    const pack = await buildPack(corridorId);
    const filePath = path.join(outDir, `${corridorId}.json`);
    await writeFile(filePath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
    const convCount = pack.lessons
      .flatMap((l) => l.vignettes)
      .reduce((n, v) => n + v.conversations.length, 0);
    console.log(`${corridorId}: ${convCount} conversations in pack`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
