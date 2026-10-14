import type { PhrasePoolItem } from "@/lib/content-pipeline/types";
import { readPhrasePool } from "@/lib/content-pipeline/pool-store";
import type { CorridorContentPack } from "@/lib/lesson-content-types";
import { glossIdFromMeaningEn } from "@/lib/content/gloss-id-from-en";
import type { CorridorId } from "@/lib/types";

function localizedLineNeedsWork(line: { en: string; id: string }): boolean {
  const en = line.en?.trim() ?? "";
  if (!en) return false;
  const id = line.id?.trim() ?? "";
  return !id || id === en;
}

/** True when any conversation line or phrase meaning still mirrors English into `id`. */
export function packNeedsGlossEnrichment(pack: CorridorContentPack): boolean {
  for (const lesson of pack.lessons) {
    for (const vignette of lesson.vignettes) {
      for (const conv of vignette.conversations ?? []) {
        for (const turn of conv.turns) {
          if (turn.line && localizedLineNeedsWork(turn.line)) return true;
        }
      }
      for (const list of vignette.phraseLists ?? []) {
        for (const phrase of list.phrases) {
          if (phrase.meaning && localizedLineNeedsWork(phrase.meaning)) return true;
        }
      }
    }
  }
  return false;
}

function packNeedsPhrasePool(pack: CorridorContentPack): boolean {
  for (const lesson of pack.lessons) {
    for (const vignette of lesson.vignettes) {
      for (const conv of vignette.conversations ?? []) {
        for (const turn of conv.turns) {
          if (
            turn.phraseId &&
            turn.line &&
            localizedLineNeedsWork(turn.line)
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function applyLineIdFromPool(
  line: { en: string; id: string },
  item: PhrasePoolItem,
): { en: string; id: string } {
  const en = item.meaningEn.trim();
  const id =
    item.meaningId?.trim() ||
    glossIdFromMeaningEn(en) ||
    (line.id?.trim() && line.id.trim() !== en ? line.id.trim() : "");
  return {
    en: en || line.en,
    id: id || glossIdFromMeaningEn(line.en) || line.id,
  };
}

function normalizeTurnLine(line: { en: string; id: string }): { en: string; id: string } {
  const en = line.en?.trim() ?? "";
  let id = line.id?.trim() ?? "";
  if (!id || id === en) {
    const translated = glossIdFromMeaningEn(en);
    if (translated) id = translated;
  }
  return { en, id };
}

/** Ensure conversation turn glosses have distinct Bahasa Indonesia where possible. */
export async function enrichPackGlosses(
  pack: CorridorContentPack,
): Promise<CorridorContentPack> {
  if (!packNeedsGlossEnrichment(pack)) {
    return pack;
  }

  const byPhraseId = new Map<string, PhrasePoolItem>();
  if (packNeedsPhrasePool(pack)) {
    const pool = await readPhrasePool(pack.corridorId as CorridorId);
    for (const item of pool.items) {
      byPhraseId.set(item.id, item);
    }
  }

  for (const lesson of pack.lessons) {
    for (const vignette of lesson.vignettes) {
      for (const conv of vignette.conversations ?? []) {
        for (const turn of conv.turns) {
          if (!turn.line) continue;
          if (!localizedLineNeedsWork(turn.line)) continue;
          if (turn.phraseId) {
            const item = byPhraseId.get(turn.phraseId);
            if (item) {
              turn.line = applyLineIdFromPool(turn.line, item);
              continue;
            }
          }
          turn.line = normalizeTurnLine(turn.line);
        }
      }
      for (const list of vignette.phraseLists ?? []) {
        for (const phrase of list.phrases) {
          if (!phrase.meaning) continue;
          const en = phrase.meaning.en?.trim() ?? "";
          const id = phrase.meaning.id?.trim() ?? "";
          if (!id || id === en) {
            const translated = glossIdFromMeaningEn(en);
            if (translated) phrase.meaning = { en, id: translated };
          }
        }
      }
    }
  }

  return pack;
}
