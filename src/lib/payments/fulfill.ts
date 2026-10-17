import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import {
  grantEntitlement,
  skuToEntitlement,
  validUntilFromNow,
  type EntitlementType,
} from "@/lib/entitlements";
import type { SkuId } from "@/lib/pricing";
import { isCorridorId } from "@/lib/pricing";
import type { CorridorId } from "@/lib/types";

export async function fulfillPaidPayment(paymentId: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);
  const payment = rows[0];
  if (!payment || payment.status === "paid") {
    return false;
  }

  const sku = payment.sku as SkuId;
  let corridorId: CorridorId | null = null;
  if (payment.corridorId) {
    if (!isCorridorId(payment.corridorId)) {
      throw new Error("Invalid corridor on payment");
    }
    corridorId = payment.corridorId;
  }

  const { type, corridorId: passCorridor } = skuToEntitlement(sku, corridorId);
  const entitlementCorridor: CorridorId | null =
    type === "trip_pass" ? passCorridor : null;

  await grantEntitlement({
    userId: payment.userId,
    type: type as EntitlementType,
    corridorId: entitlementCorridor,
    providerRef: payment.providerRef ?? payment.id,
    validUntil: validUntilFromNow(),
  });

  await db
    .update(payments)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(payments.id, paymentId));

  return true;
}
