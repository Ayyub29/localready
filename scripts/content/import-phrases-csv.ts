/**
 * Import phrases from CSV into content/open/{corridor}/phrases-pool.json
 * Usage: npx tsx scripts/content/import-phrases-csv.ts id-id path/to/file.csv
 *
 * Columns: target,romanization,meaning_en,meaning_id,situation_hints,status,notes
 * situation_hints: semicolon-separated (e.g. basics;airport)
 */
import { readFile } from "node:fs/promises";
import { appendPoolItems } from "../../src/lib/content-pipeline/pool-store";
import type { CorridorId } from "../../src/lib/types";
import type { PhrasePoolStatus } from "../../src/lib/content-pipeline/types";

const corridorId = process.argv[2] as CorridorId | undefined;
const csvPath = process.argv[3];

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

async function main() {
  if (!corridorId || !csvPath) {
    console.error(
      "Usage: npx tsx scripts/content/import-phrases-csv.ts <corridorId> <csvPath>",
    );
    process.exit(1);
  }

  const raw = await readFile(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"));
  if (lines.length < 2) {
    console.error("CSV needs a header row and at least one data row");
    process.exit(1);
  }

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const phrases = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const target = cols[idx("target")] ?? "";
    const meaningEn = cols[idx("meaning_en")] ?? cols[idx("meaningen")] ?? "";
    if (!target || !meaningEn) continue;

    const statusRaw = cols[idx("status")]?.toLowerCase();
    const status: PhrasePoolStatus =
      statusRaw === "pending" || statusRaw === "rejected" || statusRaw === "archived"
        ? statusRaw
        : "approved";

    const hintsRaw = cols[idx("situation_hints")] ?? cols[idx("situationhints")] ?? "basics";
    phrases.push({
      target,
      romanization: cols[idx("romanization")] || undefined,
      meaningEn,
      meaningId: cols[idx("meaning_id")] || cols[idx("meaningid")] || undefined,
      situationHints: hintsRaw.split(";").map((s) => s.trim()).filter(Boolean),
      tags: [],
      notes: cols[idx("notes")] || undefined,
    });
  }

  const { added, skipped } = await appendPoolItems(corridorId, phrases, "manual", {
    status: "approved",
  });

  console.log(`Imported ${added.length} phrases (${skipped} skipped duplicates)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
