import Link from "next/link";
import { notFound } from "next/navigation";
import { isCorridorId } from "@/data/catalog";
import { listContentIds } from "@/lib/admin/content-io";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string }> };

function EntityList({
  title,
  basePath,
  ids,
  newHref,
}: {
  title: string;
  basePath: string;
  ids: string[];
  newHref: string;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link href={newHref} className="text-sm font-medium text-teal-800 hover:underline">
          + New
        </Link>
      </div>
      <ul className="divide-y rounded-xl border border-slate-200 bg-white">
        {ids.map((id) => (
          <li key={id}>
            <Link href={`${basePath}/${id}`} className="block px-4 py-2 font-mono text-sm hover:bg-slate-50">
              {id}
            </Link>
          </li>
        ))}
        {ids.length === 0 ? (
          <li className="px-4 py-4 text-sm text-slate-500">None yet.</li>
        ) : null}
      </ul>
    </section>
  );
}

export default async function AdminQuizzesPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;

  const [fillBlank, phraseLists, flashcards] = await Promise.all([
    listContentIds(c, "fill-blank"),
    listContentIds(c, "phrase-lists"),
    listContentIds(c, "flashcard-decks"),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Quizzes & decks</h1>
      <EntityList
        title="Fill-blank quizzes"
        basePath={`/admin/${c}/quizzes/fill-blank`}
        ids={fillBlank}
        newHref={`/admin/${c}/quizzes/fill-blank/new`}
      />
      <EntityList
        title="Phrase lists"
        basePath={`/admin/${c}/quizzes/phrase-lists`}
        ids={phraseLists}
        newHref={`/admin/${c}/quizzes/phrase-lists/new`}
      />
      <EntityList
        title="Flashcard decks"
        basePath={`/admin/${c}/quizzes/flashcards`}
        ids={flashcards}
        newHref={`/admin/${c}/quizzes/flashcards/new`}
      />
    </div>
  );
}
