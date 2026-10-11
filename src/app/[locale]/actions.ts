"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isCorridorId } from "@/data/catalog";
import { setUserLastCorridor } from "@/lib/user-destination";

export async function selectDestination(
  locale: string,
  corridorId: string,
): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect(`/${locale}/login`);
  }
  if (!isCorridorId(corridorId)) {
    return;
  }

  await setUserLastCorridor(userId, corridorId);
  redirect(`/${locale}`);
}
