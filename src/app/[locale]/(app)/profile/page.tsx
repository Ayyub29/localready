import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { loginWithGoogle, logout } from "@/app/[locale]/login/actions";
import { getDestination } from "@/data/catalog";
import { pickLocalized } from "@/lib/locale";
import { getLastCorridor } from "@/lib/last-corridor";
import { Button } from "@/components/Button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations("profile");

  const session = await auth();
  const lastCorridor = await getLastCorridor();
  const destination = lastCorridor ? getDestination(lastCorridor) : null;

  if (!session?.user) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("guestSubtitle")}</p>
        </header>

        {destination && (
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t("trip")}
            </h2>
            <p className="mt-2 font-medium">
              {pickLocalized(destination.name, loc)} ·{" "}
              {pickLocalized(destination.targetLanguage, loc)}
            </p>
            <p className="mt-2 text-xs text-slate-500">{t("guestTripHint")}</p>
          </section>
        )}

        <form action={loginWithGoogle.bind(null, locale)}>
          <Button type="submit" className="w-full">
            {t("signInGoogle")}
          </Button>
        </form>
        <p className="text-center text-xs text-slate-500">{t("guestHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </header>

      <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="h-14 w-14 rounded-full border border-border object-cover"
          />
        ) : (
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-800"
            aria-hidden
          >
            {(session.user.name?.[0] ?? session.user.email?.[0] ?? "?").toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {session.user.name ?? t("noName")}
          </p>
          <p className="truncate text-sm text-slate-600">{session.user.email}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("trip")}
        </h2>
        {destination ? (
          <p className="mt-2 font-medium">
            {pickLocalized(destination.name, loc)} ·{" "}
            {pickLocalized(destination.targetLanguage, loc)}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">{t("noDestination")}</p>
        )}
        <Link
          href="/destinations"
          className="mt-3 inline-block text-sm font-medium text-teal-700 underline"
        >
          {t("changeDestination")}
        </Link>
      </section>

      <section className="rounded-2xl border border-dashed border-border p-4 text-sm text-slate-600">
        {t("stub")}
      </section>

      <form action={logout.bind(null, locale)}>
        <Button type="submit" variant="secondary" className="w-full">
          {t("signOut")}
        </Button>
      </form>
    </div>
  );
}
