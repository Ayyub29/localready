import type { CorridorId, LocalizedString, SituationKey } from "@/lib/types";

export type SituationDefinition = {
  key: SituationKey;
  order: number;
  title: LocalizedString;
  enabled: boolean;
};

export type SituationsManifestFile = {
  schemaVersion: 1;
  situations: SituationDefinition[];
};

export type CorridorSituationsManifestFile = {
  schemaVersion: 1;
  corridorId: CorridorId;
  /** Merged over `content/situations/default.json` by `key`. */
  situations: SituationDefinition[];
};
