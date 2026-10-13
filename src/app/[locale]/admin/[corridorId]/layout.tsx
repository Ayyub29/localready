import { notFound } from "next/navigation";
import { AdminCorridorNav } from "@/components/admin/AdminCorridorNav";
import { isCorridorId } from "@/data/catalog";
import { requireAdminSession } from "@/lib/admin/require-admin";
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
      <AdminCorridorNav corridorId={corridorId as CorridorId} />
      {children}
    </div>
  );
}
