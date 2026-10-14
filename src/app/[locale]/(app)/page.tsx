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
        <div className="space-y-4 rounded-2xl border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-slate-600">{t("noDestination")}</p>
          <Link
            href="/profile"
            className="inline-block text-sm font-semibold text-teal-800 underline"
          >
            {t("setTripInProfile")}
          </Link>
        </div>
      )}
    </>
  );
}
