import { AppShell } from "@/components/AppShell";
import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

/** Main app chrome (bottom nav) for guests and signed-in users. */
export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
