import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { loginWithGoogle, logout } from "@/app/[locale]/login/actions";
import { DestinationPicker } from "@/components/DestinationPicker";
import { PageHeader } from "@/components/PageHeader";
import { getDestination } from "@/data/catalog";
import { pickLocalized } from "@/lib/locale";
import { getLastCorridor } from "@/lib/last-corridor";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/Button";
import { getContentAccess } from "@/lib/access/content-access";
import { CORRIDOR_FLAG, CORRIDOR_GRADIENT } from "@/lib/corridor-visuals";
import type { CorridorId, Locale } from "@/lib/types";

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
  const access = await getContentAccess(lastCorridor ?? undefined);
  const destination = lastCorridor ? getDestination(lastCorridor) : null;
  const paywallHref = lastCorridor
    ? `/paywall?corridor=${lastCorridor}`
    : "/paywall";

  const tripSection = (
    <section className="lr-card space-y-4 p-4">
      <div>
        <p className="lr-eyebrow">{t("trip")}</p>
        {destination && lastCorridor ? (
          <div
            className={`mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-br p-3 ${CORRIDOR_GRADIENT[lastCorridor as CorridorId]}`}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-xl"
              aria-hidden
            >
              {CORRIDOR_FLAG[lastCorridor as CorridorId]}
            </span>
            <p className="font-semibold text-slate-900">
              {pickLocalized(destination.name, loc)} ·{" "}
              {pickLocalized(destination.targetLanguage, loc)}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">{t("noDestination")}</p>
        )}
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{t("tripHint")}</p>
      </div>
      <DestinationPicker locale={loc} embedded />
    </section>
  );

  if (!session?.user) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("title")} subtitle={t("guestSubtitle")} />
        {tripSection}
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
      <PageHeader title={t("title")} />

      <section className="lr-card flex items-center gap-4 p-4">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="h-14 w-14 rounded-2xl border border-border object-cover shadow-sm"
          />
        ) : (
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-xl font-bold text-white shadow-md shadow-teal-700/25"
            aria-hidden
          >
            {(session.user.name?.[0] ?? session.user.email?.[0] ?? "?").toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {session.user.name ?? t("noName")}
          </p>
          <p className="truncate text-sm text-slate-600">{session.user.email}</p>
        </div>
      </section>

      {tripSection}

      {!(lastCorridor ? access.hasCorridorAccess : access.hasFullAccess) && (
        <section className="lr-hero-panel space-y-3 p-5">
          <h2 className="text-base font-bold">{t("upgradeTitle")}</h2>
          <p className="text-sm leading-relaxed text-teal-50/95">{t("upgradeHint")}</p>
          <Link
            href={paywallHref}
            className="inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-teal-900 shadow-sm"
          >
            {t("viewPlans")}
          </Link>
        </section>
      )}

      <form action={logout.bind(null, locale)}>
        <Button type="submit" variant="secondary" className="w-full">
          {t("signOut")}
        </Button>
      </form>
    </div>
  );
}
