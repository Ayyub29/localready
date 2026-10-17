import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { fulfillPaidPayment } from "@/lib/payments/fulfill";

type Body = { paymentId?: string };

export async function POST(request: Request) {
  if (process.env.PAYMENT_DEV_SIMULATE !== "true") {
    return Response.json({ error: "Not enabled" }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paymentId = body.paymentId;
  if (!paymentId) {
    return Response.json({ error: "paymentId required" }, { status: 400 });
  }

  const rows = await db
    .select({ userId: payments.userId })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);
  if (!rows[0] || rows[0].userId !== session.user.id) {
    return Response.json({ error: "Payment not found" }, { status: 404 });
  }

  const ok = await fulfillPaidPayment(paymentId);
  return Response.json({ ok, paymentId });
}
