import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { DestinationPicker } from "@/components/DestinationPicker";
import { HomeHeader } from "@/components/HomeHeader";
import type { Locale } from "@/lib/types";

type DestinationsPageProps = {
  params: Promise<{ locale: string }>;
};

/** Always show destination picker (e.g. “change destination” from home). */
export default async function DestinationsPage({ params }: DestinationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return (
    <>
      <HomeHeader />
      <DestinationPicker locale={locale as Locale} />
    </>
  );
}
