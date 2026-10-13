"use client";

import { useState, useTransition } from "react";
import type { StoredConversation } from "@/lib/content/stored-conversation-types";
import type { ConversationTurn } from "@/lib/lesson-content-types";
import { adminSaveConversation } from "@/lib/admin/server-actions";
import { situationOrder } from "@/lib/situations";

type AdminConversationEditorProps = {
  corridorId: string;
  initial: StoredConversation;
};

function newTurnId(convId: string, n: number): string {
  return `${convId}-t${n}`;
}

export function AdminConversationEditor({ corridorId, initial }: AdminConversationEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function updateTurn(index: number, patch: Partial<ConversationTurn>) {
    setDoc((d) => {
      const turns = [...d.turns];
      turns[index] = { ...turns[index], ...patch };
      return { ...d, turns };
    });
  }

  function addTurn() {
    setDoc((d) => {
      const n = d.turns.length + 1;
      const turn: ConversationTurn = {
        id: newTurnId(d.id, n),
        role: "traveler",
        target: "",
        line: { en: "", id: "" },
      };
      return { ...d, turns: [...d.turns, turn] };
    });
  }

  function removeTurn(index: number) {
    setDoc((d) => ({
      ...d,
      turns: d.turns.filter((_, i) => i !== index),
    }));
  }

  function save() {
    startTransition(async () => {
      await adminSaveConversation(corridorId, doc);
      setMessage("Conversation saved.");
    });
  }

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">{message}</p>
      ) : null}

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">ID</span>
          <input
            value={doc.id}
            onChange={(e) => setDoc({ ...doc, id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Situation</span>
          <select
            value={doc.situation}
            onChange={(e) =>
              setDoc({ ...doc, situation: e.target.value as StoredConversation["situation"] })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {situationOrder.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Source</span>
          <select
            value={doc.source}
            onChange={(e) =>
              setDoc({ ...doc, source: e.target.value as StoredConversation["source"] })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="manual">manual</option>
            <option value="generated">generated</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Title (EN)</span>
          <input
            value={doc.title?.en ?? ""}
            onChange={(e) =>
              setDoc({
                ...doc,
                title: { en: e.target.value, id: doc.title?.id ?? "" },
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Title (ID)</span>
          <input
            value={doc.title?.id ?? ""}
            onChange={(e) =>
              setDoc({
                ...doc,
                title: { en: doc.title?.en ?? "", id: e.target.value },
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">Description (EN)</span>
          <textarea
            value={doc.description.en}
            onChange={(e) =>
              setDoc({
                ...doc,
                description: { en: e.target.value, id: doc.description.id },
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            rows={2}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">Description (ID)</span>
          <textarea
            value={doc.description.id}
            onChange={(e) =>
              setDoc({
                ...doc,
                description: { en: doc.description.en, id: e.target.value },
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            rows={2}
          />
        </label>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Turns</h2>
          <button
            type="button"
            onClick={addTurn}
            className="rounded-lg ring-1 ring-slate-300 px-3 py-1.5 text-sm"
          >
            Add turn
          </button>
        </div>
        {doc.turns.map((turn, index) => (
          <div
            key={turn.id}
            className="space-y-2 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-500">{turn.id}</span>
              <button
                type="button"
                onClick={() => removeTurn(index)}
                className="text-xs text-red-700 hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="text-sm">
                Role
                <select
                  value={turn.role}
                  onChange={(e) =>
                    updateTurn(index, { role: e.target.value as ConversationTurn["role"] })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                >
                  <option value="local">local</option>
                  <option value="traveler">traveler</option>
                  <option value="narrator">narrator</option>
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                phraseId
                <input
                  value={turn.phraseId ?? ""}
                  onChange={(e) => updateTurn(index, { phraseId: e.target.value || undefined })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-xs"
                />
              </label>
            </div>
            <label className="block text-sm">
              Target
              <input
                value={turn.target ?? ""}
                onChange={(e) => updateTurn(index, { target: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-sm">
              Line gloss (EN)
              <input
                value={turn.line?.en ?? ""}
                onChange={(e) =>
                  updateTurn(index, {
                    line: { en: e.target.value, id: turn.line?.id ?? "" },
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-sm">
              Line gloss (ID)
              <input
                value={turn.line?.id ?? ""}
                onChange={(e) =>
                  updateTurn(index, {
                    line: { en: turn.line?.en ?? "", id: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        ))}
      </section>

      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save conversation"}
      </button>
    </div>
  );
}
