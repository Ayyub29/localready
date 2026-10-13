import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { isCorridorId } from "@/data/catalog";
import { adminSectionPath } from "@/lib/admin/admin-path";
import { listContentIds } from "@/lib/admin/content-io";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { CorridorId, Locale } from "@/lib/types";

type PageProps = { params: Promise<{ corridorId: string }> };

export default async function AdminLessonsPage({ params }: PageProps) {
  await requireAdminSession();
  const { corridorId } = await params;
  if (!isCorridorId(corridorId)) notFound();
  const c = corridorId as CorridorId;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin");
  const ids = await listContentIds(c, "lessons");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("lessonsTitle")}</h1>
        <Link
          href={adminSectionPath(locale, c, "lessons", "new")}
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white"
        >
          {t("new")}
        </Link>
      </div>
      <ul className="divide-y rounded-xl border border-slate-200 bg-white">
        {ids.map((id) => (
          <li key={id}>
            <Link
              href={adminSectionPath(locale, c, "lessons", id)}
              className="block px-4 py-3 font-mono text-sm hover:bg-slate-50"
            >
              {id}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
