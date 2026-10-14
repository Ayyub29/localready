import { mkdir, readdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CorridorId } from "@/lib/types";

export type ContentSegment =
  | "conversations"
  | "mini-lessons"
  | "phrase-lists"
  | "fill-blank"
  | "flashcard-decks"
  | "lessons";

function segmentDir(corridorId: CorridorId, segment: ContentSegment): string {
  return path.join(process.cwd(), "content", segment, corridorId);
}

export function contentFilePath(
  corridorId: CorridorId,
  segment: ContentSegment,
  id: string,
): string {
  const fileName = segment === "lessons" ? `${id}.json` : `${id}.json`;
  return path.join(segmentDir(corridorId, segment), fileName);
}

export async function listContentIds(
  corridorId: CorridorId,
  segment: ContentSegment,
): Promise<string[]> {
  const dir = segmentDir(corridorId, segment);
  try {
    const files = await readdir(dir);
    return files
      .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
  } catch {
    return [];
  }
}

export async function readContentJson<T>(
  corridorId: CorridorId,
  segment: ContentSegment,
  id: string,
): Promise<T | null> {
  try {
    const raw = await readFile(contentFilePath(corridorId, segment, id), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeContentJson<T extends { id: string }>(
  corridorId: CorridorId,
  segment: ContentSegment,
  doc: T,
): Promise<void> {
  const dir = segmentDir(corridorId, segment);
  await mkdir(dir, { recursive: true });
  const filePath = contentFilePath(corridorId, segment, doc.id);
  const tmp = `${filePath}.tmp`;
  await writeFile(tmp, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  await rename(tmp, filePath);
}

export async function deleteContentJson(
  corridorId: CorridorId,
  segment: ContentSegment,
  id: string,
): Promise<void> {
  try {
    await unlink(contentFilePath(corridorId, segment, id));
  } catch {
    // ignore missing
  }
}

export type CheatsheetManifest = {
  schemaVersion: number;
  corridorId: CorridorId;
  notes?: string;
  situations: Partial<Record<string, string[]>>;
};

function cheatsheetPath(corridorId: CorridorId): string {
  return path.join(process.cwd(), "content", "cheatsheets", `${corridorId}.json`);
}

export async function readCheatsheetManifest(
  corridorId: CorridorId,
): Promise<CheatsheetManifest | null> {
  try {
    const raw = await readFile(cheatsheetPath(corridorId), "utf8");
    return JSON.parse(raw) as CheatsheetManifest;
  } catch {
    return null;
  }
}

export async function writeCheatsheetManifest(manifest: CheatsheetManifest): Promise<void> {
  const dir = path.join(process.cwd(), "content", "cheatsheets");
  await mkdir(dir, { recursive: true });
  const filePath = cheatsheetPath(manifest.corridorId);
  const tmp = `${filePath}.tmp`;
  await writeFile(tmp, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await rename(tmp, filePath);
}
