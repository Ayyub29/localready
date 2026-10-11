import { getTranslations, setRequestLocale } from "next-intl/server";
import { signIn } from "./actions";
import { Button } from "@/components/Button";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("login");

  return (
    <div className="flex min-h-[70dvh] flex-col justify-center gap-8">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          LocalReady
        </p>
        <h1 className="mt-2 text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("subtitle")}</p>
      </header>
      <form action={signIn.bind(null, locale)}>
        <Button type="submit" className="w-full">
          {t("continue")}
        </Button>
      </form>
      <p className="text-center text-xs text-slate-500">{t("stub")}</p>
    </div>
  );
}
