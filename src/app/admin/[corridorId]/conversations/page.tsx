import Link from "next/link";
import { notFound } from "next/navigation";
import { isCorridorId } from "@/data/catalog";
import { listContentIds } from "@/lib/admin/content-io";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string }> };

export default async function AdminConversationsPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;
  const ids = await listContentIds(c, "conversations");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Conversations</h1>
        <Link
          href={`/admin/${c}/conversations/new`}
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white"
        >
          New conversation
        </Link>
      </div>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {ids.map((id) => (
          <li key={id}>
            <Link
              href={`/admin/${c}/conversations/${id}`}
              className="block px-4 py-3 font-mono text-sm hover:bg-slate-50"
            >
              {id}
            </Link>
          </li>
        ))}
        {ids.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-slate-500">No conversations yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
