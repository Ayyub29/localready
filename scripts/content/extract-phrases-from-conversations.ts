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
import type { CorridorId } from "../../src/lib/types";
import { storedToVignetteConversation } from "../../src/lib/content/stored-conversation-types";

const corridorArg = process.argv[2] as CorridorId | undefined;

const CORRIDORS: CorridorId[] = ["ja-jp", "ko-kr", "th-th", "vi-vn", "id-id"];

function dedupePhrases(items: Phrase[]): Phrase[] {
  const out: Phrase[] = [];
  const seen = new Set<string>();
  for (const p of items) {
    const key = `${p.target.trim().toLowerCase()}|${p.meaning.en.trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
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
  const fromConv: Phrase[] = [];
  for (const s of stored) {
    fromConv.push(...phrasesFromConversation(storedToVignetteConversation(s)));
  }

  const pool = await readPhrasePool(corridorId);
  const fromPool: Phrase[] = pool.items
    .filter((i) => i.status === "approved" || i.status === "pending")
    .map((item, idx) => ({
      id: item.id,
      target: item.target,
      romanization: item.romanization,
      meaning: {
        en: item.meaningEn,
        id: item.meaningId ?? item.meaningEn,
      },
      wvSource: item.wvSource,
    }));

  const phrases = dedupePhrases([...fromConv, ...fromPool]);
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
