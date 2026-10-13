export function AdminBilingualNotice() {
  return (
    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
      <strong className="font-medium text-slate-800">EN + ID:</strong> Learners use{" "}
      <code className="rounded bg-slate-100 px-1">/en/…</code> or{" "}
      <code className="rounded bg-slate-100 px-1">/id/…</code>. Fill both English and
      Indonesian fields on titles, descriptions, glosses, and prompts — not only English.
    </p>
  );
}
