import type { CorridorId } from "@/lib/types";

export type PhrasePoolStatus =
  | "pending"
  | "approved"
  | "rejected"
  /** No longer present in latest upstream sync (e.g. Wikivoyage). */
  | "archived";

export type PhrasePoolSource = "wikivoyage" | "ai" | "manual";

export type PhrasePoolItem = {
  id: string;
  corridorId: CorridorId;
  target: string;
  romanization?: string;
  meaningEn: string;
  meaningId?: string;
  wvSource?: string;
  source: PhrasePoolSource;
  /** Situation keys or future lesson keys, e.g. basics, airport */
  situationHints: string[];
  tags: string[];
  status: PhrasePoolStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type PhrasePoolFile = {
  version: 1;
  corridorId: CorridorId;
  updatedAt: string;
  items: PhrasePoolItem[];
};

export type ManualPhraseInput = {
  target: string;
  romanization?: string;
  meaningEn: string;
  meaningId?: string;
  situationHints?: string[];
  tags?: string[];
  notes?: string;
  wvSource?: string;
};

export type PhrasePoolUpdate = {
  id: string;
  status?: PhrasePoolStatus;
  meaningId?: string;
  meaningEn?: string;
  romanization?: string;
  target?: string;
  situationHints?: string[];
  tags?: string[];
  notes?: string;
};
