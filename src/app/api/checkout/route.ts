import { auth } from "@/auth";
import { createCheckoutSession } from "@/lib/payments/create-checkout";
import { isCorridorId, type SkuId } from "@/lib/pricing";
import type { CorridorId } from "@/lib/types";

type CheckoutBody = {
  sku?: string;
  corridorId?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sku = body.sku as SkuId | undefined;
  if (sku !== "trip_pass" && sku !== "subscription") {
    return Response.json({ error: "Invalid sku" }, { status: 400 });
  }

  let corridorId: CorridorId | null = null;
  if (body.corridorId) {
    if (!isCorridorId(body.corridorId)) {
      return Response.json({ error: "Invalid corridorId" }, { status: 400 });
    }
    corridorId = body.corridorId;
  }

  try {
    const result = await createCheckoutSession({
      userId: session.user.id,
      sku,
      corridorId: sku === "trip_pass" ? corridorId : null,
    });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
