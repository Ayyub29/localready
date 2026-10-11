import { AppShell } from "@/components/AppShell";
import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
