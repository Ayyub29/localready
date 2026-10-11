import { setRequestLocale } from "next-intl/server";
import { DestinationPicker } from "@/components/DestinationPicker";
import { HomeHeader } from "@/components/HomeHeader";
import { LessonListView } from "@/components/LessonListView";
import { getLastCorridor } from "@/lib/last-corridor";
import type { Locale } from "@/lib/types";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const lastCorridor = await getLastCorridor();

  return (
    <>
      <HomeHeader />
      {lastCorridor ? (
        <LessonListView locale={loc} corridorId={lastCorridor} />
      ) : (
        <DestinationPicker locale={loc} />
      )}
    </>
  );
}
