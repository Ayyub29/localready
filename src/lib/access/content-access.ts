import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { PlayerStep } from "@/lib/content/lesson-player-steps";

/**
 * Inclusive vignette index guests and preview accounts may play (0 = first vignette only).
 * “First few vignettes” preview before sign-in / purchase.
 */
export const PREVIEW_MAX_VIGNETTE_INDEX = 1;

export type ContentAccess = {
  isSignedIn: boolean;
  hasFullAccess: boolean;
  /** False for guests — progress is account-only. */
  canSaveProgress: boolean;
  /** `null` = all vignettes; otherwise cap at this index (inclusive). */
  maxVignetteIndex: number | null;
};

export async function userHasFullAccess(userId: string): Promise<boolean> {
  if (process.env.DEV_FULL_ACCESS === "true") return true;
  try {
    const rows = await db
      .select({ fullAccess: users.fullAccess })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return rows[0]?.fullAccess === 1;
  } catch {
    return false;
  }
}

export async function getContentAccess(): Promise<ContentAccess> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      isSignedIn: false,
      hasFullAccess: false,
      canSaveProgress: false,
      maxVignetteIndex: PREVIEW_MAX_VIGNETTE_INDEX,
    };
  }

  const hasFullAccess = await userHasFullAccess(userId);
  if (hasFullAccess) {
    return {
      isSignedIn: true,
      hasFullAccess: true,
      canSaveProgress: true,
      maxVignetteIndex: null,
    };
  }

  return {
    isSignedIn: true,
    hasFullAccess: false,
    canSaveProgress: true,
    maxVignetteIndex: PREVIEW_MAX_VIGNETTE_INDEX,
  };
}

export function filterLessonSteps(
  steps: PlayerStep[],
  maxVignetteIndex: number | null,
): PlayerStep[] {
  if (maxVignetteIndex === null) return steps;
  return steps.filter((s) => s.vignetteIndex <= maxVignetteIndex);
}

export function lessonPreviewIsLimited(
  allSteps: PlayerStep[],
  visibleSteps: PlayerStep[],
): boolean {
  return visibleSteps.length < allSteps.length;
}

/** Quizzes require a signed-in account with full (paid) access. */
export function canAccessQuizzes(access: ContentAccess): boolean {
  return access.isSignedIn && access.hasFullAccess;
}
