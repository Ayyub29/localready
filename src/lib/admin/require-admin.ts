import { notFound } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { adminDevBypassEnabled, isAdminEmail } from "@/lib/admin/access";

/** Use in `/admin` layouts and server actions. Returns session when allowed. */
export async function requireAdminSession(): Promise<Session> {
  const session = await auth();
  const email = session?.user?.email;

  if (adminDevBypassEnabled()) {
    if (session?.user) return session;
    return {
      user: { id: "dev-admin", email: "dev@localready", name: "Dev admin" },
      expires: new Date(Date.now() + 86400_000).toISOString(),
    };
  }

  if (!session?.user || !isAdminEmail(email)) {
    notFound();
  }
  return session;
}
