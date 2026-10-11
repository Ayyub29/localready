import { setRequestLocale } from "next-intl/server";
import { DestinationPicker } from "@/components/DestinationPicker";
import { HomeHeader } from "@/components/HomeHeader";
import type { Locale } from "@/lib/types";

type DestinationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DestinationsPage({ params }: DestinationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HomeHeader />
      <DestinationPicker locale={locale as Locale} />
    </>
  );
}
