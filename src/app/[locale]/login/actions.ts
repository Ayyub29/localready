"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "lr_session";

export async function signIn(locale: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    httpOnly: true,
  });
  redirect(`/${locale}/destinations`);
}

export async function signOut(locale: string): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect(`/${locale}/login`);
}
