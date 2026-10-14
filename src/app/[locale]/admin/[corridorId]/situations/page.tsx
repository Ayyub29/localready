import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminSituationsEditor } from "@/components/admin/AdminSituationsEditor";
import { isCorridorId } from "@/data/catalog";
import { loadSituationsForCorridor } from "@/lib/content/load-situations";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string }> };

export default async function AdminCorridorSituationsPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;

  const situations = await loadSituationsForCorridor(c);
  const t = await getTranslations("admin");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("situationsTitle")}</h1>
      <p className="text-sm text-slate-600">{t("situationsCorridorHint")}</p>
      <AdminSituationsEditor mode="corridor" corridorId={c} initial={situations} />
    </div>
  );
}
