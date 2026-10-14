import type { CorridorContentPack } from "@/lib/lesson-content-types";
import type {
  SituationDefinition,
  SituationsManifestFile,
} from "@/lib/content/situations-manifest-types";
import type { CorridorId } from "@/lib/types";

import defaultSituationsDoc from "../../../content/situations/default.json";
import packIdId from "../../../content/packs/id-id.json";
import packJaJp from "../../../content/packs/ja-jp.json";
import packKoKr from "../../../content/packs/ko-kr.json";
import packThTh from "../../../content/packs/th-th.json";
import packViVn from "../../../content/packs/vi-vn.json";

const PACKS: Record<CorridorId, CorridorContentPack> = {
  "id-id": packIdId as CorridorContentPack,
  "ja-jp": packJaJp as CorridorContentPack,
  "ko-kr": packKoKr as CorridorContentPack,
  "th-th": packThTh as CorridorContentPack,
  "vi-vn": packViVn as CorridorContentPack,
};

export function getBundledCorridorPack(
  corridorId: CorridorId,
): CorridorContentPack | null {
  return PACKS[corridorId] ?? null;
}

export function getBundledDefaultSituations(): SituationDefinition[] {
  const doc = defaultSituationsDoc as SituationsManifestFile;
  if (doc.schemaVersion === 1 && Array.isArray(doc.situations)) {
    return doc.situations;
  }
  return [];
}
