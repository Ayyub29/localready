import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <div className="pb-24">{children}</div>
      <BottomNav />
    </>
  );
}
