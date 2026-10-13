import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminPhrasesPanel } from "@/components/admin/AdminPhrasesPanel";
import { isCorridorId } from "@/data/catalog";
import { readPhrasePool } from "@/lib/content-pipeline/pool-store";
import {
  loadSituationsForCorridor,
  situationKeysInOrder,
} from "@/lib/content/load-situations";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string }> };

export default async function AdminPhrasesPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;
  const [pool, situationDefs] = await Promise.all([
    readPhrasePool(c),
    loadSituationsForCorridor(c),
  ]);
  const situationKeys = situationKeysInOrder(situationDefs);
  const t = await getTranslations("admin");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("phrasesTitle")}</h1>
      <AdminPhrasesPanel
        corridorId={corridorId}
        initialItems={pool.items}
        situationKeys={situationKeys}
      />
    </div>
  );
}
