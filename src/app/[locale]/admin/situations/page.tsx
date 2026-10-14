import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { AdminSituationsEditor } from "@/components/admin/AdminSituationsEditor";
import { readDefaultSituationsManifest } from "@/lib/content/load-situations";
import { requireAdminSession } from "@/lib/admin/require-admin";
import type { Locale } from "@/lib/types";

export default async function AdminDefaultSituationsPage() {
  await requireAdminSession();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin");
  const manifest = await readDefaultSituationsManifest();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Link
          href={`/${locale}/admin`}
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          ← {t("homeTitle")}
        </Link>
        <h1 className="text-2xl font-bold">{t("situationsTitle")}</h1>
        <p className="text-sm text-slate-600">{t("situationsGlobalHint")}</p>
      </div>
      <AdminSituationsEditor mode="default" initial={manifest.situations} />
    </div>
  );
}
