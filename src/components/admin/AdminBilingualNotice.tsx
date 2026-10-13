"use client";

import { useTranslations } from "next-intl";

export function AdminBilingualNotice() {
  const t = useTranslations("admin");
  return (
    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
      <strong className="font-medium text-slate-800">{t("bilingualStrong")}:</strong>{" "}
      {t("bilingualNotice")}
    </p>
  );
}
