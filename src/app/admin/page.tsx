import Link from "next/link";
import { adminAccessConfigured } from "@/lib/admin/access";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { destinations } from "@/data/catalog";

const plannedSections = [
  {
    title: "Phrases",
    description: "Inject lines, approve/reject pool rows (API exists today).",
    path: "phrases",
  },
  {
    title: "Conversations",
    description: "Multi-turn scenes with phraseId links.",
    path: "conversations",
  },
  {
    title: "Mini lessons",
    description: "Description + words[] micro-topics.",
    path: "mini-lessons",
  },
  {
    title: "Quizzes",
    description: "Fill-blank MCQ, flashcard decks, phrase lists.",
    path: "quizzes",
  },
  {
    title: "Lessons",
    description: "Vignettes and sequence refs from pools.",
    path: "lessons",
  },
  {
    title: "Cheatsheet",
    description: "Per-situation phrase picks → build cheatsheet catalog.",
    path: "cheatsheet",
  },
] as const;

export default async function AdminHomePage() {
  const session = await requireAdminSession();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Content admin</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Hub for manual inject, lesson assembly, and cheatsheet curation. Full editors
          are not built yet—see{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">content/ADMIN.md</code> for
          the route plan.
        </p>
        <p className="text-xs text-slate-500">
          Signed in as {session.user?.email}
          {!adminAccessConfigured() ? " (allowlist empty — should not reach here)" : null}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Corridor
        </h2>
        <ul className="flex flex-wrap gap-2">
          {destinations.map((c) => (
            <li key={c.id}>
              <span
                className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium"
              >
                {c.id}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">
          Per-corridor routes will live at{" "}
          <code className="rounded bg-slate-100 px-1">/admin/[corridorId]/…</code>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Planned sections
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {plannedSections.map((section) => (
            <li
              key={section.path}
              className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3"
            >
              <p className="font-medium text-slate-900">{section.title}</p>
              <p className="mt-1 text-sm text-slate-600">{section.description}</p>
              <p className="mt-2 text-xs text-slate-400">Coming soon</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <p className="font-medium text-slate-900">Scripts & API today</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>
            Phrases:{" "}
            <code className="rounded bg-slate-100 px-1">POST /api/content/inject</code>,{" "}
            <code className="rounded bg-slate-100 px-1">GET/PATCH /api/content/pool</code>{" "}
            (Bearer <code className="rounded bg-slate-100 px-1">CONTENT_INJECT_SECRET</code>)
          </li>
          <li>
            Cheatsheet manifest:{" "}
            <code className="rounded bg-slate-100 px-1">content/cheatsheets/</code> +{" "}
            <code className="rounded bg-slate-100 px-1">npm run content:build:cheatsheet</code>
          </li>
          <li>
            Lessons:{" "}
            <code className="rounded bg-slate-100 px-1">content/lessons/</code> + compile
            scripts in <code className="rounded bg-slate-100 px-1">PIPELINE.md</code>
          </li>
        </ul>
        <p className="mt-3 text-xs">
          <Link href="/en/profile" className="text-teal-800 hover:underline">
            Back to learner app
          </Link>
        </p>
      </section>
    </div>
  );
}
