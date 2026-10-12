import type { CorridorId } from "@/lib/types";
import type { PhrasePoolItem } from "./types";
import { newPoolItemId } from "./pool-store";

/** Map Wikivoyage ==section== titles to situation hints for the phrase pool. */
const SECTION_TO_SITUATIONS: Record<string, string[]> = {
  basics: ["basics"],
  problems: ["emergency", "directions"],
  "medical emergencies": ["emergency"],
  allergies: ["dietary", "emergency"],
  "explaining symptoms": ["emergency"],
  eating: ["restaurant", "food_stalls"],
  "bars, clubs & drinking": ["nightlife", "restaurant"],
  shopping: ["shopping", "money"],
  money: ["money"],
  driving: ["driving", "taxi"],
  lodging: ["hotel"],
  "border crossing": ["immigration", "airport"],
  authority: ["emergency", "immigration"],
  transportation: ["train", "bus", "taxi", "airport"],
  directions: ["directions"],
  "place names": ["directions", "attractions"],
  communication: ["basics", "sim"],
  time: ["basics"],
  numbers: ["money", "shopping"],
};

function stripWikiMarkup(text: string): string {
  return text
    .replace(/\{\{[^{}|]*\|[^{}]*\}\}/g, (m) => {
      const pipe = m.lastIndexOf("|");
      if (pipe >= 0) {
        return m.slice(pipe + 1, -2).trim();
      }
      return "";
    })
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/''+/g, "")
    .trim();
}

function extractRomanization(chunk: string): { target: string; romanization?: string } {
  const romaMatch = chunk.match(/''([^']+)''/);
  const romanization = romaMatch?.[1]?.trim();
  let target = chunk.replace(/''[^']+''/g, "").trim();
  target = stripWikiMarkup(target);
  return { target, romanization };
}

function isLikelyPhrase(english: string, target: string): boolean {
  if (english.length < 2 || english.length > 140) return false;
  if (target.length < 1 || target.length > 200) return false;
  const lower = english.toLowerCase();
  if (lower.includes("like '") || lower.startsWith("note on")) return false;
  if (/^[\d\s.;:?]+$/.test(target)) return false;
  if (english.includes("{{") || target.includes("{{")) return false;
  // Skip pure grammar particle glosses
  if (/^(no|de|ni|kara|to|ka)\b/i.test(english) && target.length < 8) return false;
  return true;
}

function sectionKey(title: string): string {
  return title.trim().toLowerCase();
}

function situationsForSection(sectionTitle: string): string[] {
  const key = sectionKey(sectionTitle);
  if (SECTION_TO_SITUATIONS[key]) {
    return SECTION_TO_SITUATIONS[key];
  }
  for (const [pattern, hints] of Object.entries(SECTION_TO_SITUATIONS)) {
    if (key.includes(pattern)) {
      return hints;
    }
  }
  return ["basics"];
}

/**
 * Parse Wikivoyage phrasebook wikitext (`; English : target ''romaji''` lines).
 */
export function parseWikivoyagePhrasebook(
  wikitext: string,
  corridorId: CorridorId,
  wvPageUrl: string,
): PhrasePoolItem[] {
  const sections = wikitext.split(/\n==+([^=\n]+)==+/);
  const items: PhrasePoolItem[] = [];
  const now = new Date().toISOString();
  const lineRe = /^;\s*([^:]+):\s*(.+)$/gm;

  for (let i = 1; i < sections.length; i += 2) {
    const sectionTitle = sections[i] ?? "";
    const body = sections[i + 1] ?? "";
    if (sectionKey(sectionTitle).includes("pronunciation")) {
      continue;
    }
    if (sectionKey(sectionTitle).includes("grammar")) {
      continue;
    }
    const hints = situationsForSection(sectionTitle);

    let match: RegExpExecArray | null;
    const re = new RegExp(lineRe.source, lineRe.flags);
    while ((match = re.exec(body)) !== null) {
      const meaningEn = stripWikiMarkup(match[1]);
      const { target, romanization } = extractRomanization(match[2]);
      if (!isLikelyPhrase(meaningEn, target)) {
        continue;
      }
      const fragment = encodeURIComponent(sectionTitle.trim().replace(/\s+/g, "_"));
      items.push({
        id: newPoolItemId(corridorId),
        corridorId,
        target,
        romanization,
        meaningEn,
        wvSource: `${wvPageUrl}#${fragment}`,
        source: "wikivoyage",
        situationHints: hints,
        tags: [sectionTitle.trim()],
        status: "pending",
        createdAt: now,
      });
    }
  }

  return items;
}
