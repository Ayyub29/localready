import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { fulfillPaidPayment } from "@/lib/payments/fulfill";
import { verifyMidtransWebhookSignature } from "@/lib/payments/midtrans";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function verifyDevWebhook(request: Request): boolean {
  if (process.env.PAYMENT_DEV_SIMULATE !== "true") return false;
  const secret = process.env.PAYMENT_WEBHOOK_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

type DevWebhookBody = {
  paymentId?: string;
  simulate?: boolean;
};

type MidtransNotification = {
  order_id?: string;
  transaction_status?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
};

export async function POST(request: Request) {
  const raw = await request.text();
  let payload: DevWebhookBody & MidtransNotification;
  try {
    payload = JSON.parse(raw) as DevWebhookBody & MidtransNotification;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.simulate === true && verifyDevWebhook(request)) {
    const paymentId = payload.paymentId;
    if (!paymentId) {
      return Response.json({ error: "paymentId required" }, { status: 400 });
    }
    const ok = await fulfillPaidPayment(paymentId);
    return Response.json({ ok, paymentId });
  }

  const orderId = payload.order_id;
  const status = payload.transaction_status;
  if (!orderId) {
    return Response.json({ error: "Missing order_id" }, { status: 400 });
  }

  if (
    payload.signature_key &&
    payload.status_code &&
    payload.gross_amount &&
    !verifyMidtransWebhookSignature(
      orderId,
      payload.status_code,
      payload.gross_amount,
      payload.signature_key,
    )
  ) {
    return unauthorized();
  }

  const paidStatuses = new Set(["capture", "settlement"]);
  if (!status || !paidStatuses.has(status)) {
    return Response.json({ ok: true, ignored: true, status });
  }

  const rows = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.id, orderId))
    .limit(1);
  if (!rows[0]) {
    return Response.json({ error: "Unknown payment" }, { status: 404 });
  }

  const ok = await fulfillPaidPayment(orderId);
  return Response.json({ ok, paymentId: orderId });
}
