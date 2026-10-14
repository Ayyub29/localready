"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import {
  adminDeleteFillBlank,
  adminSaveFillBlank,
} from "@/lib/admin/server-actions";
import type { PhrasePoolItem } from "@/lib/content-pipeline/types";
import type {
  StoredFillBlankQuestion,
  StoredFillBlankQuiz,
} from "@/lib/content/stored-fill-blank-types";

type AdminFillBlankEditorProps = {
  corridorId: string;
  initial: StoredFillBlankQuiz;
  listHref: string;
  phraseItems: PhrasePoolItem[];
};

function newQuestionId(quizId: string, n: number): string {
  return `${quizId}-q${n}`;
}

export function AdminFillBlankEditor({
  corridorId,
  initial,
  listHref,
  phraseItems,
}: AdminFillBlankEditorProps) {
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

  function updateQuestion(index: number, patch: Partial<StoredFillBlankQuestion>) {
    setDoc((d) => {
      const questions = [...d.questions];
      questions[index] = { ...questions[index], ...patch };
      return { ...d, questions };
    });
  }

  function updatePrompt(index: number, field: "en" | "id", value: string) {
    setDoc((d) => {
      const questions = [...d.questions];
      const q = questions[index];
      questions[index] = {
        ...q,
        prompt:
          field === "en"
            ? { en: value, id: q.prompt.id }
            : { en: q.prompt.en, id: value },
      };
      return { ...d, questions };
    });
  }

  function addQuestion() {
    setDoc((d) => {
      const n = d.questions.length + 1;
      const q: StoredFillBlankQuestion = {
        id: newQuestionId(d.id, n),
        kind: "situation",
        prompt: { en: "", id: "" },
        correctPhraseId: phraseOptions[0]?.id ?? "",
      };
      return { ...d, questions: [...d.questions, q] };
    });
  }

  function removeQuestion(index: number) {
    setDoc((d) => ({
      ...d,
      questions: d.questions.filter((_, i) => i !== index),
    }));
  }

  function toggleDistractor(qIndex: number, phraseId: string) {
    setDoc((d) => {
      const questions = [...d.questions];
      const q = questions[qIndex];
      const list = [...(q.distractorPhraseIds ?? [])];
      const i = list.indexOf(phraseId);
      if (i >= 0) list.splice(i, 1);
      else list.push(phraseId);
      questions[qIndex] = { ...q, distractorPhraseIds: list };
      return { ...d, questions };
    });
  }

  function save() {
    startTransition(async () => {
      await adminSaveFillBlank(corridorId, doc);
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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("fillBlankQuestions")}</h2>
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg ring-1 ring-slate-300 px-3 py-1.5 text-sm"
          >
            {t("addQuestion")}
          </button>
        </div>
        {doc.questions.map((q, index) => (
          <div key={q.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-500">{q.id}</span>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-sm text-red-700 hover:underline"
              >
                {t("remove")}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="text-sm">
                {t("promptKind")}
                <select
                  value={q.kind}
                  onChange={(e) =>
                    updateQuestion(index, {
                      kind: e.target.value as StoredFillBlankQuestion["kind"],
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                >
                  <option value="situation">situation</option>
                  <option value="reply">reply</option>
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                {t("correctPhrase")}
                <select
                  value={q.correctPhraseId}
                  onChange={(e) =>
                    updateQuestion(index, { correctPhraseId: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-xs"
                >
                  {phraseOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.target} — {p.meaningEn}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm">
              {t("promptEn")}
              <textarea
                value={q.prompt.en}
                onChange={(e) => updatePrompt(index, "en", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              {t("promptId")}
              <textarea
                value={q.prompt.id}
                onChange={(e) => updatePrompt(index, "id", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            {q.kind === "reply" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-sm">
                  {t("cueTarget")}
                  <input
                    value={q.cueTarget ?? ""}
                    onChange={(e) => updateQuestion(index, { cueTarget: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm">
                  {t("cuePhraseId")}
                  <select
                    value={q.cuePhraseId ?? ""}
                    onChange={(e) =>
                      updateQuestion(index, { cuePhraseId: e.target.value || undefined })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-xs"
                  >
                    <option value="">—</option>
                    {phraseOptions.map((p) => (
                      <option key={p.id} value={p.id}>{p.id}</option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
            <fieldset>
              <legend className="text-sm text-slate-600">{t("distractors")}</legend>
              <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                {phraseOptions.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={(q.distractorPhraseIds ?? []).includes(p.id)}
                      onChange={() => toggleDistractor(index, p.id)}
                    />
                    <span className="font-mono">{p.id}</span>
                    <span className="text-slate-500">{p.target}</span>
                  </label>
                ))}
              </div>
            </fieldset>
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
          onDelete={() => adminDeleteFillBlank(corridorId, initial.id)}
        />
      </div>
    </div>
  );
}
