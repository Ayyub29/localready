import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <div className="lr-app-bg" aria-hidden />
      <div className="lr-shell pb-24">{children}</div>
      <BottomNav />
    </>
  );
}
