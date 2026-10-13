import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminCheatsheetEditor } from "@/components/admin/AdminCheatsheetEditor";
import { isCorridorId } from "@/data/catalog";
import { readCheatsheetManifest } from "@/lib/admin/content-io";
import { readPhrasePool } from "@/lib/content-pipeline/pool-store";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { situationOrder } from "@/lib/situations";
import type { CorridorId, SituationKey } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string }> };

export default async function AdminCheatsheetPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;

  const manifest = await readCheatsheetManifest(c);
  const pool = await readPhrasePool(c);

  const initialSituations: Partial<Record<SituationKey, string[]>> = {};
  for (const s of situationOrder) {
    initialSituations[s] = manifest?.situations?.[s] ?? [];
  }
  const t = await getTranslations("admin");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("cheatsheetTitle")}</h1>
      <p className="text-sm text-slate-600">{t("cheatsheetIntro")}</p>
      <AdminCheatsheetEditor
        corridorId={c}
        initialSituations={initialSituations}
        phraseItems={pool.items}
      />
    </div>
  );
}
