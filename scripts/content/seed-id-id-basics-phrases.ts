/**
 * Merge hand-authored basics phrase rows (stable ids) into id-id phrases pool.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PhrasePoolFile, PhrasePoolItem } from "../../src/lib/content-pipeline/types";

const seedPath = path.join(
  process.cwd(),
  "content",
  "open",
  "id-id",
  "basics-phrases-seed.json",
);

async function main() {
  const poolPath = path.join(
    process.cwd(),
    "content",
    "open",
    "id-id",
    "phrases-pool.json",
  );
  const pool = JSON.parse(await readFile(poolPath, "utf8")) as PhrasePoolFile;
  const seed = JSON.parse(await readFile(seedPath, "utf8")) as {
    items: PhrasePoolItem[];
  };

  const byId = new Map(pool.items.map((i) => [i.id, i]));
  let added = 0;
  for (const item of seed.items) {
    if (byId.has(item.id)) continue;
    byId.set(item.id, item);
    added++;
  }

  pool.items = [...byId.values()];
  pool.updatedAt = new Date().toISOString();
  await writeFile(poolPath, `${JSON.stringify(pool, null, 2)}\n`, "utf8");
  console.log(`Merged ${added} basics seed phrases into ${poolPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
