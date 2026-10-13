import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { LessonListItem } from "@/data/catalog";
import { pickLocalized } from "@/lib/locale";
import type {
  CorridorSituationsManifestFile,
  SituationDefinition,
  SituationsManifestFile,
} from "@/lib/content/situations-manifest-types";
import type { CorridorId, Locale, LocalizedString, SituationKey } from "@/lib/types";

const DEFAULT_PATH = path.join(process.cwd(), "content", "situations", "default.json");

function corridorPath(corridorId: CorridorId): string {
  return path.join(process.cwd(), "content", "situations", `${corridorId}.json`);
}

const BUILTIN_DEFAULTS: SituationDefinition[] = [
  {
    key: "script",
    order: 0,
    enabled: true,
    title: { en: "Letters & first words", id: "Huruf & kata penting" },
  },
  {
    key: "basics",
    order: 1,
    enabled: true,
    title: { en: "First hour & greetings", id: "Jam pertama & sapaan" },
  },
  {
    key: "train",
    order: 2,
    enabled: true,
    title: { en: "Transit & tickets", id: "Transportasi & tiket" },
  },
  {
    key: "money",
    order: 3,
    enabled: true,
    title: { en: "Paying & convenience stores", id: "Bayar & minimarket" },
  },
  {
    key: "restaurant",
    order: 4,
    enabled: true,
    title: { en: "Ordering & the bill", id: "Pesan makan & bon" },
  },
  {
    key: "hotel",
    order: 5,
    enabled: true,
    title: { en: "Check-in & your room", id: "Check-in & kamar" },
  },
  {
    key: "directions",
    order: 6,
    enabled: true,
    title: { en: "Lost & maps", id: "Tersesat & peta" },
  },
  {
    key: "culture",
    order: 7,
    enabled: true,
    title: { en: "Etiquette & temples", id: "Etiket & tempat suci" },
  },
  {
    key: "emergency",
    order: 8,
    enabled: true,
    title: { en: "Help, health & allergies", id: "Bantuan, kesehatan & alergi" },
  },
];

type SituationsCacheEntry = {
  mtimeDefault: number;
  mtimeCorridor: number;
  situations: SituationDefinition[];
};

const cacheByCorridor = new Map<CorridorId, SituationsCacheEntry>();

function mergeSituations(
  base: SituationDefinition[],
  overrides: SituationDefinition[],
): SituationDefinition[] {
  const byKey = new Map<SituationKey, SituationDefinition>();
  for (const s of base) {
    byKey.set(s.key, { ...s });
  }
  for (const o of overrides) {
    const prev = byKey.get(o.key);
    byKey.set(o.key, prev ? { ...prev, ...o, title: { ...prev.title, ...o.title } } : o);
  }
  return [...byKey.values()].sort((a, b) => a.order - b.order);
}

async function readDefaultManifest(): Promise<SituationDefinition[]> {
  try {
    const raw = await readFile(DEFAULT_PATH, "utf8");
    const doc = JSON.parse(raw) as SituationsManifestFile;
    if (doc.schemaVersion === 1 && Array.isArray(doc.situations)) {
      return doc.situations;
    }
  } catch {
    // use builtin
  }
  return BUILTIN_DEFAULTS;
}

async function loadSituationsUncached(
  corridorId: CorridorId,
): Promise<SituationDefinition[]> {
  const defaultStat = await stat(DEFAULT_PATH).catch(() => null);
  const corridorStat = await stat(corridorPath(corridorId)).catch(() => null);
  const mtimeDefault = defaultStat?.mtimeMs ?? 0;
  const mtimeCorridor = corridorStat?.mtimeMs ?? 0;

  const hit = cacheByCorridor.get(corridorId);
  if (
    hit &&
    hit.mtimeDefault === mtimeDefault &&
    hit.mtimeCorridor === mtimeCorridor
  ) {
    return hit.situations;
  }

  const base = await readDefaultManifest();
  let merged = base;
  if (corridorStat) {
    const raw = await readFile(corridorPath(corridorId), "utf8");
    const doc = JSON.parse(raw) as CorridorSituationsManifestFile;
    if (doc.schemaVersion === 1 && Array.isArray(doc.situations)) {
      merged = mergeSituations(base, doc.situations);
    }
  }

  cacheByCorridor.set(corridorId, {
    mtimeDefault,
    mtimeCorridor,
    situations: merged,
  });
  return merged;
}

export const loadSituationsForCorridor = cache(
  async (corridorId: CorridorId): Promise<SituationDefinition[]> => {
    return loadSituationsUncached(corridorId);
  },
);

export async function loadEnabledSituations(
  corridorId: CorridorId,
): Promise<SituationDefinition[]> {
  const all = await loadSituationsForCorridor(corridorId);
  return all.filter((s) => s.enabled);
}

export async function isSituationKeyForCorridor(
  corridorId: CorridorId,
  value: string,
): Promise<boolean> {
  const all = await loadSituationsForCorridor(corridorId);
  return all.some((s) => s.enabled && s.key === value);
}

export function situationTitle(
  definitions: SituationDefinition[],
  situation: SituationKey,
  locale: Locale,
): string {
  const def = definitions.find((s) => s.key === situation);
  if (!def) return situation;
  return pickLocalized(def.title, locale);
}

export async function resolveSituationTitle(
  corridorId: CorridorId,
  situation: SituationKey,
  locale: Locale,
): Promise<string> {
  const defs = await loadSituationsForCorridor(corridorId);
  return situationTitle(defs, situation, locale);
}

export function situationKeysInOrder(definitions: SituationDefinition[]): SituationKey[] {
  return [...definitions]
    .sort((a, b) => a.order - b.order)
    .map((s) => s.key);
}

export function enabledSituationKeysInOrder(
  definitions: SituationDefinition[],
): SituationKey[] {
  return definitions
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)
    .map((s) => s.key);
}

export function titleMapFromDefinitions(
  definitions: SituationDefinition[],
): Record<SituationKey, LocalizedString> {
  const map = {} as Record<SituationKey, LocalizedString>;
  for (const s of definitions) {
    map[s.key] = s.title;
  }
  return map;
}

export async function getLessonsForCorridor(
  corridorId: CorridorId,
): Promise<LessonListItem[]> {
  const situations = await loadEnabledSituations(corridorId);
  return situations.map((s) => ({
    id: `${corridorId}-${s.key}`,
    corridorId,
    situation: s.key,
    order: s.order,
    title: s.title,
  }));
}

export function invalidateSituationsCache(corridorId?: CorridorId): void {
  if (corridorId) {
    cacheByCorridor.delete(corridorId);
    return;
  }
  cacheByCorridor.clear();
}

export async function readCorridorSituationsOverrides(
  corridorId: CorridorId,
): Promise<CorridorSituationsManifestFile> {
  try {
    const raw = await readFile(corridorPath(corridorId), "utf8");
    return JSON.parse(raw) as CorridorSituationsManifestFile;
  } catch {
    return { schemaVersion: 1, corridorId, situations: [] };
  }
}

export async function readDefaultSituationsManifest(): Promise<SituationsManifestFile> {
  try {
    const raw = await readFile(DEFAULT_PATH, "utf8");
    return JSON.parse(raw) as SituationsManifestFile;
  } catch {
    return { schemaVersion: 1, situations: BUILTIN_DEFAULTS };
  }
}

export async function writeDefaultSituationsManifest(
  manifest: SituationsManifestFile,
): Promise<void> {
  const dir = path.join(process.cwd(), "content", "situations");
  const { mkdir, writeFile, rename } = await import("node:fs/promises");
  await mkdir(dir, { recursive: true });
  const filePath = DEFAULT_PATH;
  const tmp = `${filePath}.tmp`;
  await writeFile(tmp, `${JSON.stringify({ ...manifest, schemaVersion: 1 }, null, 2)}\n`, "utf8");
  await rename(tmp, filePath);
  invalidateSituationsCache();
}

export async function writeCorridorSituationsManifest(
  manifest: CorridorSituationsManifestFile,
): Promise<void> {
  const dir = path.join(process.cwd(), "content", "situations");
  const { mkdir, writeFile, rename } = await import("node:fs/promises");
  await mkdir(dir, { recursive: true });
  const filePath = corridorPath(manifest.corridorId);
  const tmp = `${filePath}.tmp`;
  await writeFile(
    tmp,
    `${JSON.stringify({ ...manifest, schemaVersion: 1 }, null, 2)}\n`,
    "utf8",
  );
  await rename(tmp, filePath);
  invalidateSituationsCache(manifest.corridorId);
}
