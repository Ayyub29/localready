import path from "node:path";
import type { CorridorId } from "@/lib/types";

export function contentRoot(): string {
  return path.join(process.cwd(), "content");
}

export function phrasePoolPath(corridorId: CorridorId): string {
  return path.join(contentRoot(), "open", corridorId, "phrases-pool.json");
}

export function wvRawPath(corridorId: CorridorId, filename: string): string {
  return path.join(contentRoot(), "open", corridorId, "wv-raw", filename);
}
