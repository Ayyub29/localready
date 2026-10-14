import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

type DestinationsPageProps = {
  params: Promise<{ locale: string }>;
};

/** Trip selection moved to Profile — keep URL for old links. */
export default async function DestinationsPage({ params }: DestinationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/profile`);
}
