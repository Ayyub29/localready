"use client";

import { useState, useTransition } from "react";
import type { StoredLessonManifest, StoredSequenceItem } from "@/lib/content/stored-lesson-manifest-types";
import { adminSaveLessonManifest } from "@/lib/admin/server-actions";
import { situationOrder } from "@/lib/situations";

type PoolRefs = {
  conversations: string[];
  miniLessons: string[];
  phraseLists: string[];
  fillBlank: string[];
  flashcardDecks: string[];
};

type AdminLessonEditorProps = {
  corridorId: string;
  initial: StoredLessonManifest;
  poolRefs: PoolRefs;
};

const sequenceKinds: StoredSequenceItem["kind"][] = [
  "conversation",
  "miniLesson",
  "phraseList",
  "fillBlank",
  "flashcards",
];

function refsForKind(kind: StoredSequenceItem["kind"], poolRefs: PoolRefs): string[] {
  switch (kind) {
    case "conversation":
      return poolRefs.conversations;
    case "miniLesson":
      return poolRefs.miniLessons;
    case "phraseList":
      return poolRefs.phraseLists;
    case "fillBlank":
      return poolRefs.fillBlank;
    case "flashcards":
      return poolRefs.flashcardDecks;
    default:
      return [];
  }
}

export function AdminLessonEditor({
  corridorId,
  initial,
  poolRefs,
}: AdminLessonEditorProps) {
  const [doc, setDoc] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function save() {
    startTransition(async () => {
      await adminSaveLessonManifest(corridorId, doc);
      setMessage("Lesson manifest saved.");
    });
  }

  function updateVignetteTitle(vIndex: number, en: string) {
    setDoc((d) => {
      const vignettes = [...d.vignettes];
      const v = vignettes[vIndex];
      vignettes[vIndex] = {
        ...v,
        title: { en, id: v.title.id },
      };
      return { ...d, vignettes };
    });
  }

  function addSequenceItem(vIndex: number) {
    setDoc((d) => {
      const vignettes = [...d.vignettes];
      const v = vignettes[vIndex];
      const ref = refsForKind("conversation", poolRefs)[0] ?? "";
      vignettes[vIndex] = {
        ...v,
        sequence: [...v.sequence, { kind: "conversation", ref }],
      };
      return { ...d, vignettes };
    });
  }

  function updateSequenceItem(
    vIndex: number,
    sIndex: number,
    patch: Partial<StoredSequenceItem>,
  ) {
    setDoc((d) => {
      const vignettes = [...d.vignettes];
      const v = vignettes[vIndex];
      const sequence = [...v.sequence];
      const current = sequence[sIndex];
      const next = { ...current, ...patch } as StoredSequenceItem;
      sequence[sIndex] = next;
      vignettes[vIndex] = { ...v, sequence };
      return { ...d, vignettes };
    });
  }

  function removeSequenceItem(vIndex: number, sIndex: number) {
    setDoc((d) => {
      const vignettes = [...d.vignettes];
      const v = vignettes[vIndex];
      vignettes[vIndex] = {
        ...v,
        sequence: v.sequence.filter((_, i) => i !== sIndex),
      };
      return { ...d, vignettes };
    });
  }

  function addVignette() {
    setDoc((d) => ({
      ...d,
      vignettes: [
        ...d.vignettes,
        {
          id: `${d.id}-v${d.vignettes.length + 1}`,
          title: { en: "New vignette", id: "Vignette baru" },
          sequence: [],
        },
      ],
    }));
  }

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">{message}</p>
      ) : null}

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          Lesson ID
          <input
            value={doc.id}
            onChange={(e) => setDoc({ ...doc, id: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="text-sm">
          Situation
          <select
            value={doc.situation}
            onChange={(e) =>
              setDoc({ ...doc, situation: e.target.value as StoredLessonManifest["situation"] })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {situationOrder.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Order
          <input
            type="number"
            value={doc.order}
            onChange={(e) => setDoc({ ...doc, order: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Title (EN)
          <input
            value={doc.title.en}
            onChange={(e) =>
              setDoc({ ...doc, title: { en: e.target.value, id: doc.title.id } })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={doc.free}
            onChange={(e) => setDoc({ ...doc, free: e.target.checked })}
          />
          Free lesson
        </label>
      </div>

      {doc.vignettes.map((vignette, vIndex) => (
        <section
          key={vignette.id}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
        >
          <h2 className="font-semibold">Vignette: {vignette.id}</h2>
          <label className="block text-sm">
            Title (EN)
            <input
              value={vignette.title.en}
              onChange={(e) => updateVignetteTitle(vIndex, e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <ol className="space-y-2">
            {vignette.sequence.map((item, sIndex) => (
              <li
                key={`${vIndex}-${sIndex}`}
                className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-end"
              >
                <label className="text-sm">
                  Kind
                  <select
                    value={item.kind}
                    onChange={(e) => {
                      const kind = e.target.value as StoredSequenceItem["kind"];
                      const ref = refsForKind(kind, poolRefs)[0] ?? "";
                      updateSequenceItem(vIndex, sIndex, { kind, ref } as StoredSequenceItem);
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    {sequenceKinds.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </label>
                <label className="min-w-0 flex-1 text-sm">
                  Ref
                  <select
                    value={item.ref}
                    onChange={(e) =>
                      updateSequenceItem(vIndex, sIndex, { ref: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-xs"
                  >
                    {refsForKind(item.kind, poolRefs).map((id) => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                </label>
                {item.kind === "miniLesson" ? (
                  <label className="min-w-0 flex-1 text-sm">
                    Anchor after turn
                    <input
                      placeholder="conversationRef|afterTurnId"
                      value={
                        item.anchor
                          ? `${item.anchor.conversationRef}|${item.anchor.afterTurnId}`
                          : ""
                      }
                      onChange={(e) => {
                        const [conversationRef, afterTurnId] = e.target.value.split("|");
                        if (conversationRef && afterTurnId) {
                          updateSequenceItem(vIndex, sIndex, {
                            anchor: { conversationRef, afterTurnId },
                          });
                        }
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-xs"
                    />
                  </label>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeSequenceItem(vIndex, sIndex)}
                  className="text-sm text-red-700 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => addSequenceItem(vIndex)}
            className="rounded-lg ring-1 ring-slate-300 px-3 py-1.5 text-sm"
          >
            Add step to sequence
          </button>
        </section>
      ))}

      <button
        type="button"
        onClick={addVignette}
        className="rounded-lg ring-1 ring-slate-300 px-3 py-1.5 text-sm"
      >
        Add vignette
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save lesson manifest"}
      </button>
    </div>
  );
}
