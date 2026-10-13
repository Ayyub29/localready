"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import type { SituationDefinition } from "@/lib/content/situations-manifest-types";
import {
  adminSaveCorridorSituations,
  adminSaveDefaultSituations,
} from "@/lib/admin/server-actions";
import type { CorridorId, SituationKey } from "@/lib/types";

const ALL_KEYS: SituationKey[] = [
  "script",
  "basics",
  "train",
  "money",
  "restaurant",
  "hotel",
  "directions",
  "culture",
  "emergency",
];

type AdminSituationsEditorProps = {
  mode: "default" | "corridor";
  corridorId?: CorridorId;
  initial: SituationDefinition[];
};

export function AdminSituationsEditor({
  mode,
  corridorId,
  initial,
}: AdminSituationsEditorProps) {
  const t = useTranslations("admin");
  const [rows, setRows] = useState<SituationDefinition[]>(
    [...initial].sort((a, b) => a.order - b.order),
  );
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function updateRow(index: number, patch: Partial<SituationDefinition>) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function updateTitle(index: number, field: "en" | "id", value: string) {
    setRows((prev) => {
      const next = [...prev];
      const title = next[index].title;
      next[index] = {
        ...next[index],
        title: field === "en" ? { en: value, id: title.id } : { en: title.en, id: value },
      };
      return next;
    });
  }

  function addMissingKeys() {
    const have = new Set(rows.map((r) => r.key));
    const missing = ALL_KEYS.filter((k) => !have.has(k));
    if (!missing.length) return;
    const maxOrder = rows.reduce((m, r) => Math.max(m, r.order), 0);
    setRows((prev) => [
      ...prev,
      ...missing.map((key, i) => ({
        key,
        order: maxOrder + 1 + i,
        enabled: true,
        title: { en: key, id: key },
      })),
    ]);
  }

  function save() {
    startTransition(async () => {
      const sorted = [...rows].sort((a, b) => a.order - b.order);
      if (mode === "default") {
        await adminSaveDefaultSituations(sorted);
      } else if (corridorId) {
        await adminSaveCorridorSituations(corridorId, sorted);
      }
      setMessage(t("saved"));
    });
  }

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-teal-800">{message}</p>}
      <p className="text-sm text-slate-600">{t("situationsIntro")}</p>
      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li
            key={row.key}
            className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700">
                {row.key}
              </span>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) => updateRow(index, { enabled: e.target.checked })}
                />
                {t("situationEnabled")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                {t("situationOrder")}
                <input
                  type="number"
                  className="w-16 rounded border border-slate-200 px-2 py-1"
                  value={row.order}
                  onChange={(e) =>
                    updateRow(index, { order: Number.parseInt(e.target.value, 10) || 0 })
                  }
                />
              </label>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-slate-500">{t("titleEn")}</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={row.title.en}
                  onChange={(e) => updateTitle(index, "en", e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-500">{t("titleId")}</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={row.title.id}
                  onChange={(e) => updateTitle(index, "id", e.target.value)}
                />
              </label>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addMissingKeys}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
        >
          {t("situationAddMissing")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? t("saving") : t("save")}
        </button>
      </div>
    </div>
  );
}
