"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import {
  adminDeleteFlashcardDeck,
  adminSaveFlashcardDeck,
} from "@/lib/admin/server-actions";
import type { PhrasePoolItem } from "@/lib/content-pipeline/types";
import type {
  StoredFlashcard,
  StoredFlashcardDeck,
} from "@/lib/content/stored-flashcard-deck-types";

type AdminFlashcardDeckEditorProps = {
  corridorId: string;
  initial: StoredFlashcardDeck;
  listHref: string;
  phraseItems: PhrasePoolItem[];
};

function newCardId(deckId: string, n: number): string {
  return `${deckId}-c${n}`;
}

export function AdminFlashcardDeckEditor({
  corridorId,
  initial,
  listHref,
  phraseItems,
}: AdminFlashcardDeckEditorProps) {
  const t = useTranslations("admin");
  const [doc, setDoc] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const phraseOptions = useMemo(
    () =>
      phraseItems
        .filter((p) => p.status === "approved" || p.status === "pending")
        .sort((a, b) => a.target.localeCompare(b.target)),
    [phraseItems],
  );

  function updateCard(index: number, patch: Partial<StoredFlashcard>) {
    setDoc((d) => {
      const cards = [...d.cards];
      cards[index] = { ...cards[index], ...patch };
      return { ...d, cards };
    });
  }

  function updateFront(index: number, field: "en" | "id", value: string) {
    setDoc((d) => {
      const cards = [...d.cards];
      const c = cards[index];
      cards[index] = {
        ...c,
        front:
          field === "en" ? { en: value, id: c.front.id } : { en: c.front.en, id: value },
      };
      return { ...d, cards };
    });
  }

  function addCard() {
    setDoc((d) => {
      const n = d.cards.length + 1;
      const card: StoredFlashcard = {
        id: newCardId(d.id, n),
        front: { en: "", id: "" },
      };
      return { ...d, cards: [...d.cards, card] };
    });
  }

  function removeCard(index: number) {
    setDoc((d) => ({ ...d, cards: d.cards.filter((_, i) => i !== index) }));
  }

  function save() {
    startTransition(async () => {
      await adminSaveFlashcardDeck(corridorId, doc);
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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("flashcardCards")}</h2>
          <button
            type="button"
            onClick={addCard}
            className="rounded-lg ring-1 ring-slate-300 px-3 py-1.5 text-sm"
          >
            {t("addCard")}
          </button>
        </div>
        {doc.cards.map((card, index) => (
          <div key={card.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-mono text-xs text-slate-500">{card.id}</span>
              <button
                type="button"
                onClick={() => removeCard(index)}
                className="text-sm text-red-700 hover:underline"
              >
                {t("remove")}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-sm">
                {t("frontEn")}
                <input
                  value={card.front.en}
                  onChange={(e) => updateFront(index, "en", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                {t("frontId")}
                <input
                  value={card.front.id}
                  onChange={(e) => updateFront(index, "id", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                {t("phraseIdOptional")}
                <select
                  value={card.phraseId ?? ""}
                  onChange={(e) =>
                    updateCard(index, { phraseId: e.target.value || undefined })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-xs"
                >
                  <option value="">—</option>
                  {phraseOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.target} — {p.id}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
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
          onDelete={() => adminDeleteFlashcardDeck(corridorId, initial.id)}
        />
      </div>
    </div>
  );
}
