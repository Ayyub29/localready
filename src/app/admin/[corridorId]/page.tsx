import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestination, isCorridorId } from "@/data/catalog";
import { listContentIds } from "@/lib/admin/content-io";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type AdminCorridorPageProps = {
  params: Promise<{ corridorId: string }>;
};

export default async function AdminCorridorPage({ params }: AdminCorridorPageProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;
  const destination = getDestination(c);

  const [conversations, miniLessons, phraseLists, fillBlank, flashcards, lessons] =
    await Promise.all([
      listContentIds(c, "conversations"),
      listContentIds(c, "mini-lessons"),
      listContentIds(c, "phrase-lists"),
      listContentIds(c, "fill-blank"),
      listContentIds(c, "flashcard-decks"),
      listContentIds(c, "lessons"),
    ]);

  const stats = [
    { label: "Phrases", href: "phrases", count: "pool" },
    { label: "Conversations", href: "conversations", count: conversations.length },
    { label: "Mini lessons", href: "mini-lessons", count: miniLessons.length },
    { label: "Quizzes & decks", href: "quizzes", count: phraseLists.length + fillBlank.length + flashcards.length },
    { label: "Lessons", href: "lessons", count: lessons.length },
    { label: "Cheatsheet", href: "cheatsheet", count: "manifest" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {destination?.name.en ?? c} <span className="text-slate-500">({c})</span>
      </h1>
      <p className="text-sm text-slate-600">
        Author content for this corridor. Changes write to <code className="text-xs">content/</code>{" "}
        on disk (local dev).
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {stats.map((s) => (
          <li key={s.href}>
            <Link
              href={`/admin/${c}/${s.href}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-teal-300"
            >
              <span className="font-medium">{s.label}</span>
              <span className="text-sm text-slate-500">{s.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
