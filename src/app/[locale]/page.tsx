import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const jar = await cookies();
  const loggedIn = jar.get("lr_session")?.value === "1";
  redirect(loggedIn ? `/${locale}/destinations` : `/${locale}/login`);
}
