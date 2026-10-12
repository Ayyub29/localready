/**
 * Build minimal corridor packs (basics + emergency) from phrase pools.
 * Usage: npx tsx scripts/content/build-starter-packs.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultLessonUnitOrder } from "../../src/lib/lesson-content-types";
import type { CorridorContentPack, LessonContent, LessonVignette, Phrase } from "../../src/lib/lesson-content-types";
import { readPhrasePool } from "../../src/lib/content-pipeline/pool-store";
import type { PhrasePoolItem } from "../../src/lib/content-pipeline/types";
import type { CorridorId, SituationKey } from "../../src/lib/types";
import { situationOrder } from "../../src/lib/situations";
import {
  emergencyConversation,
  greetingsConversation,
  politeConversation,
} from "./conversation-templates";

const CORRIDORS: CorridorId[] = ["ja-jp", "ko-kr", "th-th", "vi-vn", "id-id"];

const LESSON_TITLES: Record<SituationKey, { en: string; id: string }> = {
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
      // Starter packs: Indonesian gloss TBD in review; mirror EN for now.
      id: item.meaningId?.trim() || item.meaningEn.replace(/\s+/g, " ").trim(),
    },
    wvSource: item.wvSource,
  };
}

function makePickPhraseQuiz(
  corridorId: CorridorId,
  situation: SituationKey,
  vignetteSlug: string,
  phrases: Phrase[],
  correctIndex: number,
) {
  const correct = phrases[correctIndex];
  return {
    id: `${corridorId}-${situation}-${vignetteSlug}-q1`,
    type: "pick-phrase" as const,
    prompt: {
      en: "Which phrase matches the situation?",
      id: "Frasa mana yang cocok?",
    },
    phraseIds: phrases.map((p) => p.id),
    correctPhraseId: correct.id,
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

  if (greetings.length >= 2) {
    const phrases = greetings.map((item, idx) =>
      poolPhraseToPhrase(corridorId, "basics", item, idx),
    );
    const vid = `${corridorId}-basics-greetings`;
    vignettes.push({
      id: vid,
      title: { en: "Greetings", id: "Sapaan" },
      conversation: greetingsConversation(vid, phrases),
      phrases,
      quiz: [makePickPhraseQuiz(corridorId, "basics", "greetings", phrases, 0)],
    });
  }

  if (polite.length >= 2) {
    const phrases = polite.map((item, idx) =>
      poolPhraseToPhrase(corridorId, "basics", item, idx + 10),
    );
    const pid = `${corridorId}-basics-polite`;
    vignettes.push({
      id: pid,
      title: { en: "Thanks & excuse me", id: "Terima kasih & permisi" },
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
      conversation: politeConversation(pid, phrases),
      phrases,
      quiz: [makePickPhraseQuiz(corridorId, "basics", "polite", phrases, 0)],
    });
  }

  return {
    id: `${corridorId}-basics`,
    corridorId,
    situation: "basics",
    order,
    title: LESSON_TITLES.basics,
    free: true,
    unitOrder: defaultLessonUnitOrder,
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
    const eid = `${corridorId}-emergency-core`;
    vignettes.push({
      id: eid,
      title: { en: "Urgent help", id: "Bantuan darurat" },
      conversation: emergencyConversation(eid, phrases),
      phrases,
      quiz: [makePickPhraseQuiz(corridorId, "emergency", "core", phrases, 0)],
    });
  }

  return {
    id: `${corridorId}-emergency`,
    corridorId,
    situation: "emergency",
    order,
    title: LESSON_TITLES.emergency,
    free: true,
    unitOrder: defaultLessonUnitOrder,
    vignettes,
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
    free: situation === "basics",
    unitOrder: defaultLessonUnitOrder,
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
    if (situation === "basics") return basics;
    if (situation === "emergency") return emergency;
    return stubLesson(corridorId, situation, idx + 1);
  });

  const emergencyPhrases = emergency.vignettes[0]?.phrases.slice(0, 8) ?? [];

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
    const basicsCount = pack.lessons.find((l) => l.situation === "basics")?.vignettes
      .reduce((n, v) => n + v.phrases.length, 0);
    const emergCount = pack.lessons.find((l) => l.situation === "emergency")?.vignettes
      .reduce((n, v) => n + v.phrases.length, 0);
    console.log(
      `${corridorId}: basics ${basicsCount ?? 0} phrases, emergency ${emergCount ?? 0} phrases`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
