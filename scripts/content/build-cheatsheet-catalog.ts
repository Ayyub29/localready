/**
 * Build learner-facing cheatsheet catalog from content/cheatsheets/{corridor}.json.
 * Usage: npm run content:build:cheatsheet -- id-id
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readPhrasePool } from "../../src/lib/content-pipeline/pool-store";
import type { Phrase } from "../../src/lib/lesson-content-types";
import { loadCorridorPack } from "../../src/lib/content/load-pack";
import type { CorridorId, SituationKey } from "../../src/lib/types";
import { situationOrder } from "../../src/lib/situations";

const corridorArg = process.argv[2] as CorridorId | undefined;
const CORRIDORS: CorridorId[] = ["ja-jp", "ko-kr", "th-th", "vi-vn", "id-id"];

type CheatsheetManifest = {
  schemaVersion: number;
  corridorId: CorridorId;
  situations: Partial<Record<SituationKey, string[]>>;
};

type CatalogEntry = Phrase & { situations: SituationKey[] };

function manifestPath(corridorId: CorridorId): string {
  return path.join(process.cwd(), "content", "cheatsheets", `${corridorId}.json`);
}

function fullCatalogPath(corridorId: CorridorId): string {
  return path.join(
    process.cwd(),
    "content",
    "derived",
    corridorId,
    "phrase-catalog.json",
  );
}

function cheatsheetCatalogPath(corridorId: CorridorId): string {
  return path.join(
    process.cwd(),
    "content",
    "derived",
    corridorId,
    "phrase-catalog-cheatsheet.json",
  );
}

function poolItemToPhrase(item: {
  id: string;
  target: string;
  romanization?: string;
  meaningEn: string;
  meaningId?: string;
  wvSource?: string;
}): Phrase {
  return {
    id: item.id,
    target: item.target,
    romanization: item.romanization,
    meaning: {
      en: item.meaningEn,
      id: item.meaningId ?? item.meaningEn,
    },
    wvSource: item.wvSource,
  };
}

async function loadIndex(corridorId: CorridorId): Promise<Map<string, Phrase>> {
  const byId = new Map<string, Phrase>();

  try {
    const raw = await readFile(fullCatalogPath(corridorId), "utf8");
    const doc = JSON.parse(raw) as { phrases: CatalogEntry[] };
    for (const entry of doc.phrases ?? []) {
      byId.set(entry.id, {
        id: entry.id,
        target: entry.target,
        romanization: entry.romanization,
        meaning: entry.meaning,
        usageNote: entry.usageNote,
        audioUrl: entry.audioUrl,
        wvSource: entry.wvSource,
      });
    }
  } catch {
    // optional full catalog
  }

  const pool = await readPhrasePool(corridorId);
  for (const item of pool.items) {
    if (!byId.has(item.id)) {
      byId.set(item.id, poolItemToPhrase(item));
    }
  }

  const pack = await loadCorridorPack(corridorId);
  if (pack) {
    for (const p of pack.emergencyPhrases) {
      if (!byId.has(p.id)) byId.set(p.id, p);
    }
  }

  return byId;
}

async function main() {
  const corridorId = corridorArg;
  if (!corridorId || !CORRIDORS.includes(corridorId)) {
    console.error("Usage: npm run content:build:cheatsheet -- <corridorId>");
    process.exit(1);
  }

  const raw = await readFile(manifestPath(corridorId), "utf8");
  const manifest = JSON.parse(raw) as CheatsheetManifest;
  if (manifest.corridorId !== corridorId) {
    throw new Error(`Manifest corridorId ${manifest.corridorId} !== ${corridorId}`);
  }

  const index = await loadIndex(corridorId);
  const situationToIds = manifest.situations ?? {};

  const phraseSituations = new Map<string, SituationKey[]>();
  for (const situation of situationOrder) {
    const ids = situationToIds[situation];
    if (!ids?.length) continue;
    for (const id of ids) {
      const list = phraseSituations.get(id) ?? [];
      if (!list.includes(situation)) list.push(situation);
      phraseSituations.set(id, list);
    }
  }

  const missing: string[] = [];
  const phrases: CatalogEntry[] = [];
  for (const [id, situations] of phraseSituations) {
    const phrase = index.get(id);
    if (!phrase) {
      missing.push(id);
      continue;
    }
    phrases.push({ ...phrase, situations });
  }

  phrases.sort((a, b) => a.target.localeCompare(b.target, "id"));

  const outDir = path.dirname(cheatsheetCatalogPath(corridorId));
  await mkdir(outDir, { recursive: true });
  const outPath = cheatsheetCatalogPath(corridorId);
  await writeFile(
    outPath,
    `${JSON.stringify(
      {
        corridorId,
        source: "cheatsheet-manifest",
        updatedAt: new Date().toISOString(),
        phrases,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const perSituation = situationOrder
    .map((s) => `${s}:${phrases.filter((p) => p.situations.includes(s)).length}`)
    .join(", ");

  console.log(
    `${corridorId}: ${phrases.length} phrases → ${outPath} (${perSituation})`,
  );
  if (missing.length) {
    console.warn(`Missing ${missing.length} id(s): ${missing.join(", ")}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
