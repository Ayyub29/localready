import { AppShell } from "@/components/AppShell";
import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

/** Main app chrome (bottom nav) for guests and signed-in users. */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-5 sm:px-5">
      <AppShell>{children}</AppShell>
    </div>
  );
}
