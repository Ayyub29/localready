"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import {
  adminDeleteMiniLesson,
  adminSaveMiniLesson,
} from "@/lib/admin/server-actions";
import type {
  MiniLessonWord,
  StoredMiniLesson,
} from "@/lib/content/stored-mini-lesson-types";
import type { SituationKey } from "@/lib/types";

type AdminMiniLessonEditorProps = {
  corridorId: string;
  initial: StoredMiniLesson;
  listHref: string;
  situationKeys: SituationKey[];
};

function newWordId(docId: string, n: number): string {
  return `${docId}-w${n}`;
}

export function AdminMiniLessonEditor({
  corridorId,
  initial,
  listHref,
  situationKeys,
}: AdminMiniLessonEditorProps) {
  const t = useTranslations("admin");
  const [doc, setDoc] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function updateWord(index: number, patch: Partial<MiniLessonWord>) {
    setDoc((d) => {
      const words = [...d.words];
      words[index] = { ...words[index], ...patch };
      return { ...d, words };
    });
  }

  function updateWordMeaning(index: number, field: "en" | "id", value: string) {
    setDoc((d) => {
      const words = [...d.words];
      const w = words[index];
      words[index] = {
        ...w,
        meaning:
          field === "en"
            ? { en: value, id: w.meaning.id }
            : { en: w.meaning.en, id: value },
      };
      return { ...d, words };
    });
  }

  function addWord() {
    setDoc((d) => {
      const n = d.words.length + 1;
      const word: MiniLessonWord = {
        id: newWordId(d.id, n),
        target: "",
        meaning: { en: "", id: "" },
      };
      return { ...d, words: [...d.words, word] };
    });
  }

  function removeWord(index: number) {
    setDoc((d) => ({ ...d, words: d.words.filter((_, i) => i !== index) }));
  }

  function toggleSituation(key: SituationKey) {
    setDoc((d) => {
      const set = new Set(d.relatedSituations ?? []);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { ...d, relatedSituations: [...set] };
    });
  }

  function save() {
    startTransition(async () => {
      await adminSaveMiniLesson(corridorId, doc);
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
          <span className="text-slate-600">{t("docId")}</span>
          <input
            value={doc.id}
            onChange={(e) => setDoc({ ...doc, id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">{t("topicOptional")}</span>
          <input
            value={doc.topic ?? ""}
            onChange={(e) => setDoc({ ...doc, topic: e.target.value || undefined })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">{t("descriptionEn")}</span>
          <textarea
            value={doc.description.en}
            onChange={(e) =>
              setDoc({
                ...doc,
                description: { en: e.target.value, id: doc.description.id },
              })
            }
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">{t("descriptionId")}</span>
          <textarea
            value={doc.description.id}
            onChange={(e) =>
              setDoc({
                ...doc,
                description: { en: doc.description.en, id: e.target.value },
              })
            }
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm text-slate-600">{t("relatedSituations")}</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {situationKeys.map((key) => (
              <label key={key} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={(doc.relatedSituations ?? []).includes(key)}
                  onChange={() => toggleSituation(key)}
                />
                {key}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("miniLessonWords")}</h2>
          <button
            type="button"
            onClick={addWord}
            className="rounded-lg ring-1 ring-slate-300 px-3 py-1.5 text-sm"
          >
            {t("addWord")}
          </button>
        </div>
        {doc.words.map((word, index) => (
          <div
            key={word.id}
            className="space-y-2 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-500">{word.id}</span>
              <button
                type="button"
                onClick={() => removeWord(index)}
                className="text-sm text-red-700 hover:underline"
              >
                {t("remove")}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-sm">
                {t("target")}
                <input
                  value={word.target}
                  onChange={(e) => updateWord(index, { target: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                {t("romanization")}
                <input
                  value={word.romanization ?? ""}
                  onChange={(e) =>
                    updateWord(index, { romanization: e.target.value || undefined })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                {t("meaningEn")}
                <input
                  value={word.meaning.en}
                  onChange={(e) => updateWordMeaning(index, "en", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                {t("meaningId")}
                <input
                  value={word.meaning.id}
                  onChange={(e) => updateWordMeaning(index, "id", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                {t("phraseId")}
                <input
                  value={word.phraseId ?? ""}
                  onChange={(e) =>
                    updateWord(index, { phraseId: e.target.value || undefined })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
                />
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
          onDelete={() => adminDeleteMiniLesson(corridorId, initial.id)}
        />
      </div>
    </div>
  );
}
