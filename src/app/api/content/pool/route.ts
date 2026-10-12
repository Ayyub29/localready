import { isCorridorId } from "@/data/catalog";
import {
  contentInjectUnauthorizedResponse,
  verifyContentInjectSecret,
} from "@/lib/content-pipeline/auth";
import {
  filterPoolItems,
  readPhrasePool,
  updatePoolItems,
} from "@/lib/content-pipeline/pool-store";
import type {
  PhrasePoolSource,
  PhrasePoolStatus,
  PhrasePoolUpdate,
} from "@/lib/content-pipeline/types";

export async function GET(request: Request) {
  if (!verifyContentInjectSecret(request)) {
    return contentInjectUnauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const corridorId = searchParams.get("corridorId");
  if (!corridorId || !isCorridorId(corridorId)) {
    return Response.json({ error: "corridorId query param required" }, { status: 400 });
  }

  const status = searchParams.get("status") as PhrasePoolStatus | null;
  const source = searchParams.get("source") as PhrasePoolSource | null;
  const situation = searchParams.get("situation");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  const pool = await readPhrasePool(corridorId);
  const { items, total } = filterPoolItems(pool, {
    status: status ?? undefined,
    source: source ?? undefined,
    situation: situation ?? undefined,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  });

  return Response.json({
    corridorId,
    updatedAt: pool.updatedAt,
    total,
    items,
  });
}

type PatchBody = {
  corridorId: string;
  updates: PhrasePoolUpdate[];
};

export async function PATCH(request: Request) {
  if (!verifyContentInjectSecret(request)) {
    return contentInjectUnauthorizedResponse();
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isCorridorId(body.corridorId)) {
    return Response.json({ error: "Invalid corridorId" }, { status: 400 });
  }
  if (!Array.isArray(body.updates) || body.updates.length === 0) {
    return Response.json({ error: "updates must be a non-empty array" }, { status: 400 });
  }

  const { updated, notFound } = await updatePoolItems(body.corridorId, body.updates);

  return Response.json({
    corridorId: body.corridorId,
    updated: updated.length,
    notFound,
    items: updated,
  });
}
