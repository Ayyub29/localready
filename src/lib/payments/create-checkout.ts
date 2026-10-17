import { db } from "@/db";
import { payments } from "@/db/schema";
import { assertDatabaseConfigured } from "@/db";
import { SKUS, type SkuId, isCorridorId } from "@/lib/pricing";
import type { CorridorId } from "@/lib/types";
import { createMidtransQrisCharge } from "@/lib/payments/midtrans";

export type CheckoutResult = {
  paymentId: string;
  status: "pending";
  amountIdr: number;
  qrisString: string | null;
  devSimulate: boolean;
};

export async function createCheckoutSession(params: {
  userId: string;
  sku: SkuId;
  corridorId: CorridorId | null;
}): Promise<CheckoutResult> {
  assertDatabaseConfigured();

  if (params.sku === "trip_pass") {
    if (!params.corridorId || !isCorridorId(params.corridorId)) {
      throw new Error("trip_pass requires a valid corridorId");
    }
  }

  const amountIdr = SKUS[params.sku].priceIdr;
  const paymentId = crypto.randomUUID();

  const midtrans = await createMidtransQrisCharge({
    paymentId,
    amountIdr,
    sku: params.sku,
    corridorId: params.corridorId,
  });

  await db.insert(payments).values({
    id: paymentId,
    userId: params.userId,
    sku: params.sku,
    corridorId: params.corridorId,
    amountIdr,
    status: "pending",
    provider: midtrans.provider,
    providerRef: midtrans.providerRef,
    qrisString: midtrans.qrisString,
    updatedAt: new Date(),
  });

  return {
    paymentId,
    status: "pending",
    amountIdr,
    qrisString: midtrans.qrisString,
    devSimulate: midtrans.devSimulate,
  };
}
