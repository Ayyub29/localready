"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import type { PhrasePoolItem, PhrasePoolStatus } from "@/lib/content-pipeline/types";
import {
  adminInjectPhrases,
  adminUpdatePhraseStatus,
} from "@/lib/admin/server-actions";
import { situationOrder } from "@/lib/situations";

type AdminPhrasesPanelProps = {
  corridorId: string;
  initialItems: PhrasePoolItem[];
};

export function AdminPhrasesPanel({ corridorId, initialItems }: AdminPhrasesPanelProps) {
  const t = useTranslations("admin");
  const [items, setItems] = useState(initialItems);
  const [statusFilter, setStatusFilter] = useState<PhrasePoolStatus | "all">("pending");
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = items;
    if (statusFilter !== "all") {
      list = list.filter((i) => i.status === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.target.toLowerCase().includes(q) ||
          i.meaningEn.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q),
      );
    }
    return list.slice(0, 200);
  }, [items, statusFilter, search]);

  function setStatus(ids: string[], status: PhrasePoolStatus) {
    startTransition(async () => {
      await adminUpdatePhraseStatus(
        corridorId,
        ids.map((id) => ({ id, status })),
      );
      setItems((prev) =>
        prev.map((i) => (ids.includes(i.id) ? { ...i, status } : i)),
      );
      setMessage(`Updated ${ids.length} row(s) → ${status}`);
    });
  }

  function onInject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const target = String(fd.get("target") ?? "").trim();
    const meaningEn = String(fd.get("meaningEn") ?? "").trim();
    const meaningId = String(fd.get("meaningId") ?? "").trim();
    const romanization = String(fd.get("romanization") ?? "").trim();
    const situations = situationOrder.filter((s) => fd.get(`sit-${s}`) === "on");
    const approve = fd.get("approve") === "on";
    if (!target || !meaningEn) {
      setMessage("Target and English meaning are required.");
      return;
    }
    startTransition(async () => {
      const { added, skipped } = await adminInjectPhrases(
        corridorId,
        [
          {
            target,
            meaningEn,
            meaningId: meaningId || undefined,
            romanization: romanization || undefined,
            situationHints: situations,
          },
        ],
        approve ? "approved" : "pending",
      );
      if (added.length) {
        setItems((prev) => [...added, ...prev]);
      }
      setMessage(
        added.length
          ? `Added ${added.length} phrase(s).${skipped ? ` Skipped ${skipped} duplicate(s).` : ""}`
          : `No new rows (${skipped} duplicate).`,
      );
      (e.target as HTMLFormElement).reset();
    });
  }

  return (
    <div className="space-y-8">
      {message ? (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">{message}</p>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">{t("injectTitle")}</h2>
        <form onSubmit={onInject} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-600">{t("target")}</span>
            <input
              name="target"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">{t("meaningEn")}</span>
            <input
              name="meaningEn"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">{t("meaningId")}</span>
            <input
              name="meaningId"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-600">{t("romanization")}</span>
            <input
              name="romanization"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm text-slate-600">{t("situationHints")}</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {situationOrder.map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name={`sit-${s}`} className="rounded" />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="approve" className="rounded" />
            {t("approveImmediately")}
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 sm:col-span-2"
          >
            {pending ? t("saving") : t("addToPool")}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">{t("poolTitle")}</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PhrasePoolStatus | "all")}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="all">{t("allStatuses")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="approved">{t("approve")}</option>
            <option value="rejected">{t("reject")}</option>
          </select>
          <input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[12rem] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
          <span className="text-xs text-slate-500">{t("shown", { count: filtered.length })}</span>
        </div>

        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {filtered.map((item) => (
            <li key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{item.target}</p>
                <p className="text-sm text-slate-600">{item.meaningEn}</p>
                <p className="mt-1 font-mono text-xs text-slate-400">{item.id}</p>
                <p className="text-xs text-slate-500">
                  {item.status} · {item.situationHints.join(", ") || "no situations"}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {item.status !== "approved" ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setStatus([item.id], "approved")}
                    className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-medium text-white"
                  >
                    {t("approve")}
                  </button>
                ) : null}
                {item.status !== "rejected" ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setStatus([item.id], "rejected")}
                    className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-medium text-slate-800"
                  >
                    {t("reject")}
                  </button>
                ) : null}
                {item.status !== "pending" ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setStatus([item.id], "pending")}
                    className="rounded-lg ring-1 ring-slate-300 px-3 py-1 text-xs font-medium"
                  >
                    {t("pending")}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
