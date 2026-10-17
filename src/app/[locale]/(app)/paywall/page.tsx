import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { PaywallView } from "@/components/PaywallView";
import { getDestination } from "@/data/catalog";
import { getContentAccess } from "@/lib/access/content-access";
import { getLastCorridor } from "@/lib/last-corridor";
import { isCorridorId } from "@/lib/pricing";
import type { CorridorId, Locale } from "@/lib/types";

type PaywallPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ corridor?: string }>;
};

export default async function PaywallPage({ params, searchParams }: PaywallPageProps) {
  const { locale } = await params;
  const { corridor: corridorParam } = await searchParams;
  setRequestLocale(locale);
  const loc = locale as Locale;

  let corridor: CorridorId | null = null;
  if (corridorParam && isCorridorId(corridorParam)) {
    corridor = corridorParam;
  } else {
    const last = await getLastCorridor();
    if (last) corridor = last;
  }

  const t = await getTranslations({ locale: loc, namespace: "paywall" });
  const session = await auth();
  const access = await getContentAccess(corridor ?? undefined);

  const destination = corridor ? getDestination(corridor) : null;
  const hasUnlockedAccess = corridor
    ? access.hasCorridorAccess
    : access.hasFullAccess;

  const messages = {
    title: t("title"),
    subtitle: t("subtitle"),
    tripPassTitle: t("tripPassTitle"),
    tripPassDesc: t("tripPassDesc"),
    subscriptionTitle: t("subscriptionTitle"),
    subscriptionDesc: t("subscriptionDesc"),
    duration: t("duration"),
    includesLessons: t("includesLessons"),
    includesCheatsheet: t("includesCheatsheet"),
    includesQuizzes: t("includesQuizzes"),
    includesAllCorridors: t("includesAllCorridors"),
    recommended: t("recommended"),
    checkoutCta: t("checkoutCta"),
    checkoutHint: t("checkoutHint"),
    checkoutProcessing: t("checkoutProcessing"),
    checkoutError: t("checkoutError"),
    qrisTitle: t("qrisTitle"),
    devSimulate: t("devSimulate"),
    devSimulateHint: t("devSimulateHint"),
    refreshAfterPay: t("refreshAfterPay"),
    signInFirst: t("signInFirst"),
    signInCta: t("signInCta"),
    alreadyUnlocked: t("alreadyUnlocked"),
    backHome: t("backHome"),
    freeReminder: t("freeReminder"),
    tripPassNeedsCorridor: t("tripPassNeedsCorridor"),
  };

  return (
    <PaywallView
      locale={loc}
      corridor={corridor}
      destination={destination ?? null}
      isSignedIn={Boolean(session?.user)}
      hasUnlockedAccess={hasUnlockedAccess}
      messages={messages}
    />
  );
}
