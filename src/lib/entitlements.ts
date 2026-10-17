import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { entitlements } from "@/db/schema";
import { PASS_DURATION_DAYS, type SkuId } from "@/lib/pricing";
import type { CorridorId } from "@/lib/types";

export type EntitlementType = "trip_pass" | "subscription";

export type ActiveEntitlement = {
  id: string;
  type: EntitlementType;
  corridorId: CorridorId | null;
  validUntil: Date;
  providerRef: string | null;
};

export async function listActiveEntitlements(
  userId: string,
  now = new Date(),
): Promise<ActiveEntitlement[]> {
  try {
    const rows = await db
      .select({
        id: entitlements.id,
        type: entitlements.type,
        corridorId: entitlements.corridorId,
        validUntil: entitlements.validUntil,
        providerRef: entitlements.providerRef,
      })
      .from(entitlements)
      .where(
        and(eq(entitlements.userId, userId), gt(entitlements.validUntil, now)),
      );
    return rows.map((row) => ({
      id: row.id,
      type: row.type as EntitlementType,
      corridorId: row.corridorId as CorridorId | null,
      validUntil: row.validUntil,
      providerRef: row.providerRef,
    }));
  } catch {
    return [];
  }
}

export function hasActiveSubscription(
  items: ActiveEntitlement[],
  now = new Date(),
): boolean {
  return items.some(
    (e) => e.type === "subscription" && e.validUntil > now,
  );
}

export function hasTripPassForCorridor(
  items: ActiveEntitlement[],
  corridorId: CorridorId,
  now = new Date(),
): boolean {
  return items.some(
    (e) =>
      e.type === "trip_pass" &&
      e.corridorId === corridorId &&
      e.validUntil > now,
  );
}

export function userHasCorridorAccess(
  items: ActiveEntitlement[],
  corridorId: CorridorId,
  now = new Date(),
): boolean {
  return (
    hasActiveSubscription(items, now) ||
    hasTripPassForCorridor(items, corridorId, now)
  );
}

export async function grantEntitlement(params: {
  userId: string;
  type: EntitlementType;
  corridorId: CorridorId | null;
  providerRef: string | null;
  validUntil: Date;
}): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(entitlements).values({
    id,
    userId: params.userId,
    type: params.type,
    corridorId: params.corridorId,
    validUntil: params.validUntil,
    providerRef: params.providerRef,
  });
  return id;
}

export function validUntilFromNow(days = PASS_DURATION_DAYS): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function skuToEntitlement(
  sku: SkuId,
  corridorId: CorridorId | null,
): { type: EntitlementType; corridorId: CorridorId | null } {
  if (sku === "subscription") {
    return { type: "subscription", corridorId: null };
  }
  if (!corridorId) {
    throw new Error("trip_pass requires corridorId");
  }
  return { type: "trip_pass", corridorId };
}
