import { notFound } from "next/navigation";
import { AdminCorridorNav } from "@/components/admin/AdminCorridorNav";
import { isCorridorId } from "@/data/catalog";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { adminDevBypassEnabled } from "@/lib/admin/access";
import type { CorridorId } from "@/lib/types";

type AdminCorridorLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ corridorId: string }>;
};

export default async function AdminCorridorLayout({
  children,
  params,
}: AdminCorridorLayoutProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();

  return (
    <div className="space-y-6">
      {adminDevBypassEnabled() ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          ADMIN_DEV_BYPASS is on — do not use in production.
        </p>
      ) : null}
      <AdminCorridorNav corridorId={corridorId as CorridorId} />
      {children}
    </div>
  );
}
