"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/types";

export function AdminHeader() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const pathname = usePathname() ?? "";

  const otherLocale: Locale = locale === "en" ? "id" : "en";
  const switchHref = pathname.replace(`/${locale}/`, `/${otherLocale}/`);

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-sm font-semibold tracking-tight">{t("title")}</span>
          <span className="ml-2 text-xs text-slate-500">{t("subtitle")}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">
            {locale === "en" ? t("localeEn") : t("localeId")}
          </span>
          <Link
            href={switchHref}
            className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-200"
          >
            {otherLocale === "en" ? t("localeEn") : t("localeId")}
          </Link>
          <Link
            href={`/${locale}/profile`}
            className="rounded-lg px-2.5 py-1 text-teal-800 hover:underline"
          >
            {t("backToApp")}
          </Link>
        </div>
      </div>
    </header>
  );
}
