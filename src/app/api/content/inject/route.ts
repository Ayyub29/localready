import { isCorridorId } from "@/data/catalog";
import {
  contentInjectUnauthorizedResponse,
  verifyContentInjectSecret,
} from "@/lib/content-pipeline/auth";
import { appendPoolItems } from "@/lib/content-pipeline/pool-store";
import type { ManualPhraseInput } from "@/lib/content-pipeline/types";

type InjectBody = {
  corridorId: string;
  phrases: ManualPhraseInput[];
  /** Manual injections default to approved; set false to keep pending review. */
  approve?: boolean;
};

export async function POST(request: Request) {
  if (!verifyContentInjectSecret(request)) {
    return contentInjectUnauthorizedResponse();
  }

  let body: InjectBody;
  try {
    body = (await request.json()) as InjectBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isCorridorId(body.corridorId)) {
    return Response.json({ error: "Invalid corridorId" }, { status: 400 });
  }
  if (!Array.isArray(body.phrases) || body.phrases.length === 0) {
    return Response.json({ error: "phrases must be a non-empty array" }, { status: 400 });
  }

  for (const p of body.phrases) {
    if (!p.target?.trim() || !p.meaningEn?.trim()) {
      return Response.json(
        { error: "Each phrase needs target and meaningEn" },
        { status: 400 },
      );
    }
  }

  const status = body.approve === false ? "pending" : "approved";
  const { added, skipped } = await appendPoolItems(
    body.corridorId,
    body.phrases,
    "manual",
    { status },
  );

  return Response.json({
    corridorId: body.corridorId,
    added: added.length,
    skipped,
    items: added,
  });
}
