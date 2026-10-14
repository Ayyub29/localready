import { eq } from "drizzle-orm";
import { isCorridorId } from "@/data/catalog";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { CorridorId } from "@/lib/types";

export async function getUserLastCorridor(
  userId: string,
): Promise<CorridorId | null> {
  const [row] = await db
    .select({ lastCorridorId: users.lastCorridorId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const id = row?.lastCorridorId;
  if (!id || !isCorridorId(id)) {
    return null;
  }
  return id;
}

export async function setUserLastCorridor(
  userId: string,
  corridorId: CorridorId,
): Promise<void> {
  await db
    .update(users)
    .set({ lastCorridorId: corridorId })
    .where(eq(users.id, userId));
}
