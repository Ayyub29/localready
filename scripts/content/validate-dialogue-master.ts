/**
 * Validate master dialogue JSON under content/dialogue-master/en/
 * Usage: npx tsx scripts/content/validate-dialogue-master.ts
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { MasterDialogue } from "../../src/lib/content/dialogue-master-types";

const enDir = path.join(process.cwd(), "content", "dialogue-master", "en");

async function main() {
  const files = (await readdir(enDir)).filter((f) => f.endsWith(".json"));
  let errors = 0;

  for (const file of files) {
    const raw = await readFile(path.join(enDir, file), "utf8");
    const data = JSON.parse(raw) as MasterDialogue;
    const prefix = file;

    if (data.schemaVersion !== 1) {
      console.error(`${prefix}: schemaVersion must be 1`);
      errors += 1;
    }
    if (!data.id || !data.multiwozDomain || !data.situation) {
      console.error(`${prefix}: missing id, multiwozDomain, or situation`);
      errors += 1;
    }
    if (!data.turns?.length) {
      console.error(`${prefix}: no turns`);
      errors += 1;
    }
    const ids = new Set<string>();
    for (const turn of data.turns ?? []) {
      if (ids.has(turn.id)) {
        console.error(`${prefix}: duplicate turn id ${turn.id}`);
        errors += 1;
      }
      ids.add(turn.id);
      if (!turn.utterance?.en?.trim()) {
        console.error(`${prefix}: turn ${turn.id} missing utterance.en`);
        errors += 1;
      }
      if (turn.speaker !== "user" && turn.speaker !== "system") {
        console.error(`${prefix}: turn ${turn.id} invalid speaker`);
        errors += 1;
      }
    }
    if (errors === 0) {
      console.log(`OK ${file} (${data.turns.length} turns, domain=${data.multiwozDomain})`);
    }
  }

  if (files.length === 0) {
    console.log("No master dialogues in dialogue-master/en/");
  }
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
