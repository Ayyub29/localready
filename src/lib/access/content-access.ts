import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  listActiveEntitlements,
  userHasCorridorAccess,
  hasActiveSubscription,
} from "@/lib/entitlements";
import type { PlayerStep } from "@/lib/content/lesson-player-steps";
import type { CorridorId } from "@/lib/types";
import { eq } from "drizzle-orm";

export type ContentAccess = {
  isSignedIn: boolean;
  /** Subscription or admin `fullAccess` — all corridors. */
  hasFullAccess: boolean;
  /** Paid or admin access for the requested corridor (or any if no corridor passed). */
  hasCorridorAccess: boolean;
  canSaveProgress: boolean;
  /** `null` = all vignettes for the current lesson context. */
  maxVignetteIndex: number | null;
};

export async function userHasAdminFullAccess(userId: string): Promise<boolean> {
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

/** @deprecated Use userHasAdminFullAccess or corridor checks. */
export async function userHasFullAccess(userId: string): Promise<boolean> {
  if (await userHasAdminFullAccess(userId)) return true;
  const entitlements = await listActiveEntitlements(userId);
  return hasActiveSubscription(entitlements);
}

export async function getContentAccess(
  corridorId?: CorridorId,
): Promise<ContentAccess> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      isSignedIn: false,
      hasFullAccess: false,
      hasCorridorAccess: false,
      canSaveProgress: false,
      maxVignetteIndex: null,
    };
  }

  const admin = await userHasAdminFullAccess(userId);
  const active = await listActiveEntitlements(userId);
  const subscription = admin || hasActiveSubscription(active);
  const corridorAccess =
    admin ||
    subscription ||
    (corridorId ? userHasCorridorAccess(active, corridorId) : false);

  return {
    isSignedIn: true,
    hasFullAccess: subscription,
    hasCorridorAccess: corridorId ? corridorAccess : subscription,
    canSaveProgress: true,
    maxVignetteIndex: null,
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

export function canAccessQuizzes(access: ContentAccess): boolean {
  return access.isSignedIn && access.hasCorridorAccess;
}
