import { notFound } from "next/navigation";
import { AdminPhrasesPanel } from "@/components/admin/AdminPhrasesPanel";
import { isCorridorId } from "@/data/catalog";
import { readPhrasePool } from "@/lib/content-pipeline/pool-store";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string }> };

export default async function AdminPhrasesPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const pool = await readPhrasePool(corridorId as CorridorId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Phrase pool</h1>
      <AdminPhrasesPanel corridorId={corridorId} initialItems={pool.items} />
    </div>
  );
}
