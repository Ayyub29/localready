import { setRequestLocale } from "next-intl/server";
import { HomeHeader } from "@/components/HomeHeader";
import { LessonListView } from "@/components/LessonListView";
import { Link } from "@/i18n/navigation";
import { getLastCorridor } from "@/lib/last-corridor";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/types";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const lastCorridor = await getLastCorridor();
  const t = await getTranslations({ locale: loc, namespace: "profile" });

  return (
    <>
      <HomeHeader />
      {lastCorridor ? (
        <LessonListView locale={loc} corridorId={lastCorridor} />
      ) : (
        <div className="lr-card space-y-4 border-dashed px-4 py-10 text-center">
          <p className="text-sm text-slate-600">{t("noDestination")}</p>
          <Link
            href="/profile"
            className="inline-flex rounded-xl bg-gradient-to-b from-teal-600 to-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-700/20"
          >
            {t("setTripInProfile")}
          </Link>
        </div>
      )}
    </>
  );
}
