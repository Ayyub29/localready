import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { isCorridorId } from "@/data/catalog";
import { setLastCorridor } from "@/lib/last-corridor";

type CorridorRedirectProps = {
  params: Promise<{ locale: string; corridorId: string }>;
};

export default async function CorridorRedirectPage({
  params,
}: CorridorRedirectProps) {
  const { locale, corridorId } = await params;
  setRequestLocale(locale);

  if (isCorridorId(corridorId)) {
    await setLastCorridor(corridorId);
  }

  redirect(`/${locale}`);
}
