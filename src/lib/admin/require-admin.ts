import { notFound } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin/access";

/** Use in `/admin` layouts and server actions. Returns session when allowed. */
export async function requireAdminSession(): Promise<Session> {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user || !isAdminEmail(email)) {
    notFound();
  }
  return session;
}
