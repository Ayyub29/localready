import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminFlashcardDeckEditor } from "@/components/admin/AdminFlashcardDeckEditor";
import { isCorridorId } from "@/data/catalog";
import { adminSectionPath } from "@/lib/admin/admin-path";
import { readContentJson } from "@/lib/admin/content-io";
import { readPhrasePool } from "@/lib/content-pipeline/pool-store";
import type { StoredFlashcardDeck } from "@/lib/content/stored-flashcard-deck-types";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId, Locale } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string; id: string }> };

export default async function AdminFlashcardEditPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId, id } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;
  const locale = (await getLocale()) as Locale;

  const doc =
    id === "new"
      ? {
          schemaVersion: 1 as const,
          id: `${c}-flash-${Date.now()}`,
          corridorId: c,
          title: { en: "Flashcards", id: "Kartu kata" },
          cards: [],
          source: "manual" as const,
        }
      : await readContentJson<StoredFlashcardDeck>(c, "flashcard-decks", id);
  if (!doc) notFound();

  const pool = await readPhrasePool(c);
  const t = await getTranslations("admin");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("editFlashcards")}</h1>
      <AdminFlashcardDeckEditor
        corridorId={c}
        initial={doc}
        listHref={adminSectionPath(locale, c, "quizzes")}
        phraseItems={pool.items}
      />
    </div>
  );
}
