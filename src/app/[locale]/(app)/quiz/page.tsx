import Link from "next/link";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { destinations } from "@/data/catalog";
import { getLastCorridor } from "@/lib/last-corridor";
import { pickLocalized } from "@/lib/locale";
import type { Locale } from "@/lib/types";

type QuizIndexProps = {
  params: Promise<{ locale: string }>;
};

export default async function QuizIndexPage({ params }: QuizIndexProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const last = await getLastCorridor();
  if (last) {
    redirect(`/${loc}/quiz/${last}`);
  }

  const t = await getTranslations({ locale: loc, namespace: "quiz" });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-slate-600">{t("pickDestination")}</p>
      </header>
      <ul className="space-y-2">
        {destinations.map((d) => (
          <li key={d.id}>
            <Link
              href={`/${loc}/quiz/${d.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 font-medium text-slate-900 hover:border-teal-300"
            >
              <span>{pickLocalized(d.name, loc)}</span>
              <span className="text-sm text-slate-500">
                {pickLocalized(d.targetLanguage, loc)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
