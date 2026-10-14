"use client";

import { useState, useTransition } from "react";

type AdminJsonSavePanelProps = {
  title: string;
  initialJson: string;
  onSave: (parsed: unknown) => Promise<void>;
  deleteLabel?: string;
  onDelete?: () => Promise<void>;
};

export function AdminJsonSavePanel({
  title,
  initialJson,
  onSave,
  deleteLabel,
  onDelete,
}: AdminJsonSavePanelProps) {
  const [text, setText] = useState(initialJson);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setOk(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      return;
    }
    startTransition(async () => {
      try {
        await onSave(parsed);
        setOk("Saved.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function remove() {
    if (!onDelete) return;
    if (!confirm("Delete this file from content/?")) return;
    startTransition(async () => {
      try {
        await onDelete();
        setOk("Deleted.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Delete failed");
      }
    });
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}
      {ok ? (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">{ok}</p>
      ) : null}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="h-[min(70vh,32rem)] w-full rounded-xl border border-slate-300 font-mono text-xs leading-relaxed p-3"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save JSON"}
        </button>
        {onDelete ? (
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-900 disabled:opacity-50"
          >
            {deleteLabel ?? "Delete"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
