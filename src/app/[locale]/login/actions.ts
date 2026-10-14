"use server";

import { signIn, signOut } from "@/auth";

export async function loginWithGoogle(locale: string): Promise<void> {
  await signIn("google", { redirectTo: `/${locale}` });
}

export async function logout(locale: string): Promise<void> {
  await signOut({ redirectTo: `/${locale}` });
}
