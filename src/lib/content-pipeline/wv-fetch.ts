import type { CorridorId } from "@/lib/types";

export type WvPhrasebookConfig = {
  pageTitle: string;
  pageUrl: string;
};

export const WV_PHRASEBOOKS: Record<CorridorId, WvPhrasebookConfig> = {
  "ja-jp": {
    pageTitle: "Japanese_phrasebook",
    pageUrl: "https://en.wikivoyage.org/wiki/Japanese_phrasebook",
  },
  "ko-kr": {
    pageTitle: "Korean_phrasebook",
    pageUrl: "https://en.wikivoyage.org/wiki/Korean_phrasebook",
  },
  "th-th": {
    pageTitle: "Thai_phrasebook",
    pageUrl: "https://en.wikivoyage.org/wiki/Thai_phrasebook",
  },
  "vi-vn": {
    pageTitle: "Vietnamese_phrasebook",
    pageUrl: "https://en.wikivoyage.org/wiki/Vietnamese_phrasebook",
  },
  "id-id": {
    pageTitle: "Indonesian_phrasebook",
    pageUrl: "https://en.wikivoyage.org/wiki/Indonesian_phrasebook",
  },
};

export async function fetchWikivoyageWikitext(pageTitle: string): Promise<string> {
  const params = new URLSearchParams({
    action: "query",
    titles: pageTitle,
    prop: "revisions",
    rvslots: "main",
    rvprop: "content",
    format: "json",
    origin: "*",
  });
  const res = await fetch(
    `https://en.wikivoyage.org/w/api.php?${params.toString()}`,
    { headers: { "User-Agent": "LocalReady/0.1 (content-pipeline; contact: localready)" } },
  );
  if (!res.ok) {
    throw new Error(`Wikivoyage API HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    query?: { pages?: Record<string, { revisions?: { slots?: { main?: { "*"?: string } } }[] }> };
  };
  const pages = data.query?.pages;
  if (!pages) {
    throw new Error("Wikivoyage API: missing pages");
  }
  const page = Object.values(pages)[0];
  const wikitext = page?.revisions?.[0]?.slots?.main?.["*"];
  if (!wikitext) {
    throw new Error("Wikivoyage API: empty wikitext");
  }
  return wikitext;
}
