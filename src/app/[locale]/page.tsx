import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { DestinationPicker } from "@/components/DestinationPicker";
import { HomeHeader } from "@/components/HomeHeader";
import { LessonListView } from "@/components/LessonListView";
import { getUserLastCorridor } from "@/lib/user-destination";
import type { Locale } from "@/lib/types";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const userId = session.user.id;
  const lastCorridor = await getUserLastCorridor(userId);

  return (
    <>
      <HomeHeader locale={locale} email={session.user.email} />
      {lastCorridor ? (
        <LessonListView locale={loc} corridorId={lastCorridor} />
      ) : (
        <DestinationPicker locale={loc} />
      )}
    </>
  );
}
