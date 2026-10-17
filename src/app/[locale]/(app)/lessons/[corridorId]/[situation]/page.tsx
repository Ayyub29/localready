import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { PageHeader } from "@/components/PageHeader";
import { setRequestLocale } from "next-intl/server";
import { LessonPlayer } from "@/components/LessonPlayer";
import { getDestination, isCorridorId } from "@/data/catalog";
import { getContentAccess } from "@/lib/access/content-access";
import { ContentPaywall } from "@/components/ContentPaywall";
import { getLessonAccessMode } from "@/lib/lessons/access";
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
  const backLabel = loc === "id" ? "Pelajaran" : "Lessons";
  const access = await getContentAccess(c);
  const lessonLocked =
    getLessonAccessMode(
      situationKey,
      access.isSignedIn,
      access.hasCorridorAccess,
    ) === "locked";
  const saved = access.canSaveProgress
    ? await getItemProgress(corridorId, "lesson", situationKey)
    : null;
  const stepCount = buildLessonSteps(lesson).length;
  const initialStepIndex =
    saved?.completed && stepCount > 0
      ? stepCount - 1
      : saved?.stepIndex ?? 0;

  return (
    <div className="space-y-6">
      <BackLink href="/">{backLabel}</BackLink>
      <PageHeader
        eyebrow={lesson.situation}
        title={pickLocalized(lesson.title, loc)}
        subtitle={pickLocalized(destination.name, loc)}
      />
      {lessonLocked ? (
        <ContentPaywall
          locale={loc}
          corridorId={c}
          variant={access.isSignedIn ? "subscribe" : "signIn"}
        />
      ) : hasContent ? (
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
          maxVignetteIndex={null}
          isSignedIn={access.isSignedIn}
        />
      ) : (
        <p className="lr-card border-dashed px-4 py-8 text-center text-sm text-slate-600">
          {loc === "id"
            ? "Pelajaran ini belum diisi — fokus dulu ke Dasar & Darurat."
            : "This lesson is not filled yet — start with Basics & Emergency."}
        </p>
      )}
    </div>
  );
}
