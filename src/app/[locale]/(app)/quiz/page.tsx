import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { destinations } from "@/data/catalog";
import { CorridorCardLink } from "@/components/CorridorCardLink";
import { PageHeader } from "@/components/PageHeader";
import { getLastCorridor } from "@/lib/last-corridor";
import { pickLocalized } from "@/lib/locale";
import type { CorridorId, Locale } from "@/lib/types";

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
      <PageHeader title={t("title")} subtitle={t("pickDestination")} />
      <ul className="space-y-2.5">
        {destinations.map((d) => (
          <li key={d.id}>
            <CorridorCardLink
              corridorId={d.id as CorridorId}
              href={`/quiz/${d.id}`}
              title={pickLocalized(d.name, loc)}
              subtitle={pickLocalized(d.targetLanguage, loc)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
