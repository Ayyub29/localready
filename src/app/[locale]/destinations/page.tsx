import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { destinations } from "@/data/catalog";
import { pickLocalized } from "@/lib/locale";
import { logout } from "../login/actions";
import type { Locale } from "@/lib/types";

type DestinationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DestinationsPage({ params }: DestinationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("destinations");
  const loc = locale as Locale;
  const session = await auth();

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
          {session?.user?.email && (
            <p className="mt-2 text-xs text-slate-500">{session.user.email}</p>
          )}
        </div>
        <form action={logout.bind(null, locale)}>
          <button
            type="submit"
            className="text-sm font-medium text-slate-500 underline"
          >
            {t("signOut")}
          </button>
        </form>
      </header>
      <ul className="space-y-3">
        {destinations.map((dest) => (
          <li key={dest.id}>
            <Link
              href={`/destinations/${dest.id}`}
              className="block rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-teal-300"
            >
              <p className="font-semibold">{pickLocalized(dest.name, loc)}</p>
              <p className="text-sm text-slate-600">
                {pickLocalized(dest.targetLanguage, loc)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
