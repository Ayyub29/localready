import { createHash } from "node:crypto";
import type { SkuId } from "@/lib/pricing";
import type { CorridorId } from "@/lib/types";

type MidtransChargeResult = {
  provider: string;
  providerRef: string | null;
  qrisString: string | null;
  devSimulate: boolean;
};

/**
 * Creates a QRIS charge when Midtrans is configured; otherwise returns a dev placeholder.
 */
export async function createMidtransQrisCharge(params: {
  paymentId: string;
  amountIdr: number;
  sku: SkuId;
  corridorId: CorridorId | null;
}): Promise<MidtransChargeResult> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const devSimulate = process.env.PAYMENT_DEV_SIMULATE === "true";

  if (!serverKey) {
    return {
      provider: devSimulate ? "dev_simulate" : "unconfigured",
      providerRef: params.paymentId,
      qrisString: null,
      devSimulate,
    };
  }

  const baseUrl = isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";

  const body = {
    payment_type: "qris",
    transaction_details: {
      order_id: params.paymentId,
      gross_amount: params.amountIdr,
    },
    item_details: [
      {
        id: params.sku,
        price: params.amountIdr,
        quantity: 1,
        name: params.sku === "trip_pass"
          ? `LocalReady trip pass (${params.corridorId ?? "?"})`
          : "LocalReady all destinations pass",
      },
    ],
  };

  const res = await fetch(`${baseUrl}/v2/charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Midtrans charge failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    transaction_id?: string;
    actions?: { name: string; url: string }[];
    qr_string?: string;
  };

  const qrisString =
    data.qr_string ??
    data.actions?.find((a) => a.name === "generate-qr-code")?.url ??
    null;

  return {
    provider: "midtrans",
    providerRef: data.transaction_id ?? params.paymentId,
    qrisString,
    devSimulate: false,
  };
}

export function verifyMidtransWebhookSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  if (!serverKey) return false;
  const payload = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const expected = createHash("sha512").update(payload).digest("hex");
  return expected === signatureKey;
}
