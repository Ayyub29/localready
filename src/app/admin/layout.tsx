import { requireAdminSession } from "@/lib/admin/require-admin";

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

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">LocalReady Admin</span>
          <span className="text-xs text-slate-500">Content authoring (preview)</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
