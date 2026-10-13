import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { destinations } from "@/data/catalog";
import { adminCorridorPath } from "@/lib/admin/admin-path";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { pickLocalized } from "@/lib/locale";
import type { Locale } from "@/lib/types";

export default async function AdminHomePage() {
  const session = await requireAdminSession();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("admin");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("homeTitle")}</h1>
        <p className="max-w-2xl text-sm text-slate-600">{t("homeIntro")}</p>
        <p className="text-xs text-slate-500">
          {t("signedInAs", { email: session.user?.email ?? "—" })}
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {destinations.map((d) => (
          <li key={d.id}>
            <Link
              href={adminCorridorPath(locale, d.id)}
              className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 hover:border-teal-300"
            >
              <span className="font-semibold text-slate-900">
                {pickLocalized(d.name, locale)}
              </span>
              <span className="font-mono text-sm text-slate-500">{d.id}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500">{t("accessHint")}</p>
    </div>
  );
}
