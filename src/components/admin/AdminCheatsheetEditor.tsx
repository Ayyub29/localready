"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import type { PhrasePoolItem } from "@/lib/content-pipeline/types";
import {
  adminBuildCheatsheetCatalog,
  adminSaveCheatsheet,
} from "@/lib/admin/server-actions";
import { situationOrder } from "@/lib/situations";
import type { SituationKey } from "@/lib/types";

type AdminCheatsheetEditorProps = {
  corridorId: string;
  initialSituations: Partial<Record<SituationKey, string[]>>;
  phraseItems: PhrasePoolItem[];
};

export function AdminCheatsheetEditor({
  corridorId,
  initialSituations,
  phraseItems,
}: AdminCheatsheetEditorProps) {
  const t = useTranslations("admin");
  const [situations, setSituations] = useState(initialSituations);
  const [activeSituation, setActiveSituation] = useState<SituationKey>("basics");
  const [phraseSearch, setPhraseSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const phraseById = useMemo(() => {
    const m = new Map<string, PhrasePoolItem>();
    for (const p of phraseItems) m.set(p.id, p);
    return m;
  }, [phraseItems]);

  const activeIds = situations[activeSituation] ?? [];

  const searchResults = useMemo(() => {
    const q = phraseSearch.trim().toLowerCase();
    let list = phraseItems.filter((p) => p.status === "approved" || p.status === "pending");
    if (q) {
      list = list.filter(
        (p) =>
          p.target.toLowerCase().includes(q) ||
          p.meaningEn.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      );
    }
    return list.slice(0, 40);
  }, [phraseItems, phraseSearch]);

  function addPhrase(phraseId: string) {
    setSituations((prev) => {
      const list = [...(prev[activeSituation] ?? [])];
      if (!list.includes(phraseId)) list.push(phraseId);
      return { ...prev, [activeSituation]: list };
    });
  }

  function removePhrase(phraseId: string) {
    setSituations((prev) => ({
      ...prev,
      [activeSituation]: (prev[activeSituation] ?? []).filter((id) => id !== phraseId),
    }));
  }

  function move(phraseId: string, dir: -1 | 1) {
    setSituations((prev) => {
      const list = [...(prev[activeSituation] ?? [])];
      const i = list.indexOf(phraseId);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= list.length) return prev;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...prev, [activeSituation]: list };
    });
  }

  function save() {
    startTransition(async () => {
      await adminSaveCheatsheet(corridorId, situations);
      setMessage("Cheatsheet manifest saved.");
    });
  }

  function buildCatalog() {
    startTransition(async () => {
      const { stdout } = await adminBuildCheatsheetCatalog(corridorId);
      setMessage(`Built cheatsheet catalog.\n${stdout.trim()}`);
    });
  }

  return (
    <div className="space-y-6">
      {message ? (
        <pre className="whitespace-pre-wrap rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">
          {message}
        </pre>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {situationOrder.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSituation(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              activeSituation === s
                ? "bg-teal-800 text-white"
                : "bg-white ring-1 ring-slate-200 text-slate-700"
            }`}
          >
            {s} ({(situations[s] ?? []).length})
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">{t("pickedFor", { situation: activeSituation })}</h2>
          <ul className="mt-3 space-y-2">
            {activeIds.length === 0 ? (
              <li className="text-sm text-slate-500">{t("noPhrasesYet")}</li>
            ) : (
              activeIds.map((id) => {
                const p = phraseById.get(id);
                return (
                  <li
                    key={id}
                    className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{p?.target ?? id}</p>
                      <p className="text-xs text-slate-600">{p?.meaningEn}</p>
                      <p className="font-mono text-[10px] text-slate-400">{id}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button type="button" className="text-xs" onClick={() => move(id, -1)}>
                        ↑
                      </button>
                      <button type="button" className="text-xs" onClick={() => move(id, 1)}>
                        ↓
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-700"
                        onClick={() => removePhrase(id)}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">{t("addFromPool")}</h2>
          <input
            placeholder={t("search")}
            value={phraseSearch}
            onChange={(e) => setPhraseSearch(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto">
            {searchResults.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => addPhrase(p.id)}
                  className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-medium">{p.target}</span>
                  <span className="ml-2 text-slate-500">{p.meaningEn}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {t("saveManifest")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={buildCatalog}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {t("buildCatalog")}
        </button>
      </div>
    </div>
  );
}
