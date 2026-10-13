import Link from "next/link";
import { destinations } from "@/data/catalog";
import { requireAdminSession } from "@/lib/admin/require-admin";

export default async function AdminHomePage() {
  const session = await requireAdminSession();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Content admin</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Pick a corridor to inject phrases, edit conversations and quizzes, assemble lessons,
          and curate cheatsheets. Writes go to <code className="text-xs">content/</code> on this
          machine.
        </p>
        <p className="text-xs text-slate-500">Signed in as {session.user?.email}</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {destinations.map((d) => (
          <li key={d.id}>
            <Link
              href={`/admin/${d.id}`}
              className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 hover:border-teal-300"
            >
              <span className="font-semibold text-slate-900">{d.name.en}</span>
              <span className="font-mono text-sm text-slate-500">{d.id}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500">
        Access: <code className="rounded bg-slate-100 px-1">ADMIN_ALLOWLIST</code> or local{" "}
        <code className="rounded bg-slate-100 px-1">ADMIN_DEV_BYPASS=true</code>. See{" "}
        <code className="rounded bg-slate-100 px-1">content/ADMIN.md</code>.
      </p>
    </div>
  );
}
