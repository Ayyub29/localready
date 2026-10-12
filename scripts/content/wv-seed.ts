/**
 * Seed phrase pool from Wikivoyage phrasebook wikitext.
 * Usage: npx tsx scripts/content/wv-seed.ts ja-jp
 */
import { mkdir, writeFile } from "node:fs/promises";
import type { CorridorId } from "../../src/lib/types";
import { appendPoolItems } from "../../src/lib/content-pipeline/pool-store";
import { wvRawPath } from "../../src/lib/content-pipeline/paths";
import { parseWikivoyagePhrasebook } from "../../src/lib/content-pipeline/wv-parse";
import {
  fetchWikivoyageWikitext,
  WV_PHRASEBOOKS,
} from "../../src/lib/content-pipeline/wv-fetch";

const corridorArg = process.argv[2] as CorridorId | undefined;

async function main() {
  if (!corridorArg || !WV_PHRASEBOOKS[corridorArg]) {
    console.error("Usage: npx tsx scripts/content/wv-seed.ts <corridorId>");
    console.error("Corridors:", Object.keys(WV_PHRASEBOOKS).join(", "));
    process.exit(1);
  }

  const config = WV_PHRASEBOOKS[corridorArg];
  console.log(`Fetching ${config.pageTitle}…`);
  const wikitext = await fetchWikivoyageWikitext(config.pageTitle);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rawPath = wvRawPath(corridorArg, `${config.pageTitle}-${stamp}.wikitext`);
  await mkdir(rawPath.replace(/\/[^/]+$/, ""), { recursive: true });
  await writeFile(rawPath, wikitext, "utf8");
  console.log(`Saved raw wikitext → ${rawPath}`);

  const parsed = parseWikivoyagePhrasebook(wikitext, corridorArg, config.pageUrl);
  console.log(`Parsed ${parsed.length} candidate phrases`);

  const inputs = parsed.map((p) => ({
    target: p.target,
    romanization: p.romanization,
    meaningEn: p.meaningEn,
    wvSource: p.wvSource,
    situationHints: p.situationHints,
    tags: p.tags,
  }));

  const { added, skipped } = await appendPoolItems(corridorArg, inputs, "wikivoyage", {
    status: "pending",
  });

  console.log(`Pool: added ${added.length}, skipped duplicates ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
