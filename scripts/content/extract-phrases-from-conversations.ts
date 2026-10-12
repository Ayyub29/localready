/**
 * Build phrase catalog from stored conversations + phrase pool.
 * Usage: npx tsx scripts/content/extract-phrases-from-conversations.ts ja-jp
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { phrasesFromConversation } from "../../src/lib/content/extract-phrases";
import type { StoredConversation } from "../../src/lib/content/stored-conversation-types";
import { readPhrasePool } from "../../src/lib/content-pipeline/pool-store";
import type { Phrase } from "../../src/lib/lesson-content-types";
import type { CorridorId, SituationKey } from "../../src/lib/types";
import { storedToVignetteConversation } from "../../src/lib/content/stored-conversation-types";

const corridorArg = process.argv[2] as CorridorId | undefined;

const CORRIDORS: CorridorId[] = ["ja-jp", "ko-kr", "th-th", "vi-vn", "id-id"];

type CatalogEntry = Phrase & { situations: SituationKey[] };

function mergeCatalog(entries: CatalogEntry[]): CatalogEntry[] {
  const byKey = new Map<string, CatalogEntry>();
  for (const entry of entries) {
    const key = `${entry.target.trim().toLowerCase()}|${entry.meaning.en.trim().toLowerCase()}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, entry);
      continue;
    }
    for (const s of entry.situations) {
      if (!existing.situations.includes(s)) existing.situations.push(s);
    }
  }
  return [...byKey.values()];
}

async function loadStoredConversations(corridorId: CorridorId): Promise<StoredConversation[]> {
  const dir = path.join(process.cwd(), "content", "conversations", corridorId);
  try {
    const files = await readdir(dir);
    const out: StoredConversation[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = await readFile(path.join(dir, file), "utf8");
      out.push(JSON.parse(raw) as StoredConversation);
    }
    return out;
  } catch {
    return [];
  }
}

async function main() {
  const corridorId = corridorArg;
  if (!corridorId || !CORRIDORS.includes(corridorId)) {
    console.error("Usage: npm run content:extract:phrases -- <corridorId>");
    process.exit(1);
  }

  const stored = await loadStoredConversations(corridorId);
  const fromConv: CatalogEntry[] = [];
  for (const s of stored) {
    const vignetteConv = storedToVignetteConversation(s);
    for (const p of phrasesFromConversation(vignetteConv)) {
      fromConv.push({ ...p, situations: [s.situation] });
    }
  }

  const pool = await readPhrasePool(corridorId);
  const fromPool: CatalogEntry[] = pool.items
    .filter((i) => i.status === "approved" || i.status === "pending")
    .map((item) => ({
      id: item.id,
      target: item.target,
      romanization: item.romanization,
      meaning: {
        en: item.meaningEn,
        id: item.meaningId ?? item.meaningEn,
      },
      wvSource: item.wvSource,
      situations: item.situationHints.filter(
        (h): h is SituationKey =>
          [
            "script",
            "basics",
            "train",
            "money",
            "restaurant",
            "hotel",
            "directions",
            "culture",
            "emergency",
          ].includes(h),
      ),
    }));

  const phrases = mergeCatalog([...fromConv, ...fromPool]);
  const outDir = path.join(process.cwd(), "content", "derived", corridorId);
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "phrase-catalog.json");
  await writeFile(
    outPath,
    `${JSON.stringify({ corridorId, updatedAt: new Date().toISOString(), phrases }, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `${corridorId}: ${fromConv.length} from ${stored.length} conversations, ${fromPool.length} from pool → ${phrases.length} catalog entries → ${outPath}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
