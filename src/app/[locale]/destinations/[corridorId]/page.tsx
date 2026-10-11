import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { isCorridorId } from "@/data/catalog";
import { setUserLastCorridor } from "@/lib/user-destination";

type CorridorRedirectProps = {
  params: Promise<{ locale: string; corridorId: string }>;
};

/** Legacy/deep link: set last destination and go to home lesson list. */
export default async function CorridorRedirectPage({
  params,
}: CorridorRedirectProps) {
  const { locale, corridorId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  if (isCorridorId(corridorId)) {
    await setUserLastCorridor(session.user.id, corridorId);
  }

  redirect(`/${locale}`);
}
