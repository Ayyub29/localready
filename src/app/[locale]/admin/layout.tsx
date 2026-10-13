import { AdminBilingualNotice } from "@/components/admin/AdminBilingualNotice";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { adminDevBypassEnabled } from "@/lib/admin/access";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { getLocale, getTranslations } from "next-intl/server";

export const metadata = {
  title: "LocalReady Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();
  const locale = await getLocale();
  const t = await getTranslations("admin");

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900" lang={locale}>
      <AdminHeader />
      {adminDevBypassEnabled() ? (
        <p className="mx-auto max-w-5xl px-4 pt-4 text-xs text-amber-900">
          <span className="rounded-lg bg-amber-50 px-3 py-2">{t("devBypass")}</span>
        </p>
      ) : null}
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <AdminBilingualNotice />
        {children}
      </main>
    </div>
  );
}
