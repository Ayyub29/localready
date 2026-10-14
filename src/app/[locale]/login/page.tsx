import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

/** Login lives on Profile; keep this route as a redirect. */
export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/profile`);
}
