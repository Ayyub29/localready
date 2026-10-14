import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LessonPlayer } from "@/components/LessonPlayer";
import { getDestination, isCorridorId } from "@/data/catalog";
import { filterLessonSteps, getContentAccess } from "@/lib/access/content-access";
import { buildLessonSteps } from "@/lib/content/lesson-player-steps";
import { lessonHasContent, loadLesson } from "@/lib/content/load-pack";
import { getItemProgress } from "@/lib/progress";
import { pickLocalized } from "@/lib/locale";
import {
  isSituationKeyForCorridor,
  titleMapFromDefinitions,
  loadSituationsForCorridor,
} from "@/lib/content/load-situations";
import type { CorridorId, Locale, SituationKey } from "@/lib/types";

type LessonPageProps = {
  params: Promise<{ locale: string; corridorId: string; situation: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { locale, corridorId, situation } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  if (!isCorridorId(corridorId)) {
    notFound();
  }
  const c = corridorId as CorridorId;
  if (!(await isSituationKeyForCorridor(c, situation))) {
    notFound();
  }

  const situationDefs = await loadSituationsForCorridor(c);
  const situationTitles = titleMapFromDefinitions(situationDefs);

  const destination = getDestination(corridorId);
  const situationKey = situation as SituationKey;
  const lesson = await loadLesson(corridorId, situationKey);
  if (!destination || !lesson) {
    notFound();
  }

  const hasContent = lessonHasContent(lesson);
  const backLabel = loc === "id" ? "Kembali" : "Back";
  const access = await getContentAccess();
  const saved = access.canSaveProgress
    ? await getItemProgress(corridorId, "lesson", situationKey)
    : null;
  const stepCount = filterLessonSteps(
    buildLessonSteps(lesson),
    access.maxVignetteIndex,
  ).length;
  const initialStepIndex =
    saved?.completed && stepCount > 0
      ? stepCount - 1
      : saved?.stepIndex ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${loc}`}
          className="text-sm font-medium text-teal-800 hover:underline"
        >
          ← {backLabel}
        </Link>
      </div>
      <header>
        <h1 className="text-2xl font-bold">{pickLocalized(lesson.title, loc)}</h1>
        <p className="text-sm text-slate-600">
          {pickLocalized(destination.name, loc)} · {lesson.situation}
        </p>
      </header>
      {hasContent ? (
        <LessonPlayer
          locale={loc}
          corridorId={corridorId}
          situation={situation as SituationKey}
          situationTitles={situationTitles}
          lesson={lesson}
          homeHref={`/${loc}`}
          initialStepIndex={initialStepIndex}
          initiallyCompleted={saved?.completed ?? false}
          canSaveProgress={access.canSaveProgress}
          maxVignetteIndex={access.maxVignetteIndex}
          isSignedIn={access.isSignedIn}
        />
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-slate-600">
          {loc === "id"
            ? "Pelajaran ini belum diisi — fokus dulu ke Dasar & Darurat."
            : "This lesson is not filled yet — start with Basics & Emergency."}
        </p>
      )}
    </div>
  );
}
