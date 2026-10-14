"use server";

import { redirect } from "next/navigation";
import { isCorridorId } from "@/data/catalog";
import { setLastCorridor } from "@/lib/last-corridor";

export async function selectDestination(
  locale: string,
  corridorId: string,
): Promise<void> {
  if (!isCorridorId(corridorId)) {
    return;
  }

  await setLastCorridor(corridorId);
  redirect(`/${locale}/profile`);
}
