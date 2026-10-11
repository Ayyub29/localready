import { cookies } from "next/headers";
import { auth } from "@/auth";
import { isCorridorId } from "@/data/catalog";
import {
  getUserLastCorridor,
  setUserLastCorridor,
} from "@/lib/user-destination";
import type { CorridorId } from "@/lib/types";

const GUEST_CORRIDOR_COOKIE = "lr_corridor";
const ONE_YEAR = 60 * 60 * 24 * 365;

async function getGuestCorridorCookie(): Promise<CorridorId | null> {
  const jar = await cookies();
  const value = jar.get(GUEST_CORRIDOR_COOKIE)?.value;
  if (!value || !isCorridorId(value)) {
    return null;
  }
  return value;
}

async function setGuestCorridorCookie(corridorId: CorridorId): Promise<void> {
  const jar = await cookies();
  jar.set(GUEST_CORRIDOR_COOKIE, corridorId, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
}

async function clearGuestCorridorCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(GUEST_CORRIDOR_COOKIE);
}

/** Logged-in: Neon. Guest: cookie. Migrates guest pick to DB on first read after login. */
export async function getLastCorridor(): Promise<CorridorId | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    const fromDb = await getUserLastCorridor(userId);
    if (fromDb) {
      return fromDb;
    }
    const fromGuest = await getGuestCorridorCookie();
    if (fromGuest) {
      await setUserLastCorridor(userId, fromGuest);
      await clearGuestCorridorCookie();
      return fromGuest;
    }
    return null;
  }

  return getGuestCorridorCookie();
}

export async function setLastCorridor(corridorId: CorridorId): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    await setUserLastCorridor(userId, corridorId);
    await clearGuestCorridorCookie();
    return;
  }

  await setGuestCorridorCookie(corridorId);
}
