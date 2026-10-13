"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import {
  adminDeletePhraseList,
  adminSavePhraseList,
} from "@/lib/admin/server-actions";
import type { PhrasePoolItem } from "@/lib/content-pipeline/types";
import type { StoredPhraseList } from "@/lib/content/stored-phrase-list-types";

type AdminPhraseListEditorProps = {
  corridorId: string;
  initial: StoredPhraseList;
  listHref: string;
  phraseItems: PhrasePoolItem[];
};

export function AdminPhraseListEditor({
  corridorId,
  initial,
  listHref,
  phraseItems,
}: AdminPhraseListEditorProps) {
  const t = useTranslations("admin");
  const [doc, setDoc] = useState(initial);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const phraseById = useMemo(() => {
    const m = new Map<string, PhrasePoolItem>();
    for (const p of phraseItems) m.set(p.id, p);
    return m;
  }, [phraseItems]);

  const searchHits = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = phraseItems.filter((p) => p.status === "approved" || p.status === "pending");
    if (q) {
      list = list.filter(
        (p) =>
          p.target.toLowerCase().includes(q) ||
          p.meaningEn.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      );
    }
    return list.slice(0, 30);
  }, [phraseItems, search]);

  function addPhraseId(id: string) {
    setDoc((d) => {
      if (d.phraseIds.includes(id)) return d;
      return { ...d, phraseIds: [...d.phraseIds, id] };
    });
  }

  function removePhraseId(id: string) {
    setDoc((d) => ({ ...d, phraseIds: d.phraseIds.filter((x) => x !== id) }));
  }

  function move(id: string, dir: -1 | 1) {
    setDoc((d) => {
      const list = [...d.phraseIds];
      const i = list.indexOf(id);
      if (i < 0) return d;
      const j = i + dir;
      if (j < 0 || j >= list.length) return d;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...d, phraseIds: list };
    });
  }

  function save() {
    startTransition(async () => {
      await adminSavePhraseList(corridorId, doc);
      setMessage(t("saved"));
    });
  }

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">{message}</p>
      ) : null}

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          {t("docId")}
          <input
            value={doc.id}
            onChange={(e) => setDoc({ ...doc, id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="text-sm">
          {t("titleEn")}
          <input
            value={doc.title.en}
            onChange={(e) => setDoc({ ...doc, title: { en: e.target.value, id: doc.title.id } })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          {t("titleId")}
          <input
            value={doc.title.id}
            onChange={(e) => setDoc({ ...doc, title: { en: doc.title.en, id: e.target.value } })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">{t("phraseListOrder")}</h2>
          <ol className="space-y-2">
            {doc.phraseIds.map((id) => {
              const p = phraseById.get(id);
              return (
                <li
                  key={id}
                  className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{p?.target ?? id}</p>
                    <p className="text-xs text-slate-500">{p?.meaningEn ?? "—"}</p>
                    <p className="font-mono text-xs text-slate-400">{id}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button type="button" onClick={() => move(id, -1)} className="text-xs">
                      ↑
                    </button>
                    <button type="button" onClick={() => move(id, 1)} className="text-xs">
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhraseId(id)}
                      className="text-xs text-red-700"
                    >
                      {t("remove")}
                    </button>
                  </div>
                </li>
              );
            })}
            {doc.phraseIds.length === 0 ? (
              <li className="text-sm text-slate-500">{t("noneYet")}</li>
            ) : null}
          </ol>
        </div>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">{t("addFromPool")}</h2>
          <input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {searchHits.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => addPhraseId(p.id)}
                  className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-medium">{p.target}</span>
                  <span className="text-slate-500"> · {p.meaningEn}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? t("saving") : t("save")}
        </button>
        <AdminDeleteButton
          redirectTo={listHref}
          onDelete={() => adminDeletePhraseList(corridorId, initial.id)}
        />
      </div>
    </div>
  );
}
