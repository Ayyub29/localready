"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

type Tab = "home" | "destinations" | "cheatsheet" | "profile";

function tabFromPath(pathname: string): Tab {
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/cheatsheet")) return "cheatsheet";
  if (pathname.startsWith("/destinations")) return "destinations";
  return "home";
}

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const active = tabFromPath(pathname);

  const item = (
    key: Tab,
    href: "/" | "/destinations" | "/cheatsheet" | "/profile",
    icon: string,
  ) => {
    const on = active === key;
    return (
      <Link
        href={href}
        className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
          on ? "text-accent" : "text-slate-500"
        }`}
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-2xl text-lg ${
            on ? "bg-teal-50" : ""
          }`}
          aria-hidden
        >
          {icon}
        </span>
        {t(key)}
      </Link>
    );
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg px-2 pt-1">
        {item("home", "/", "🏠")}
        {item("destinations", "/destinations", "🌏")}
        {item("cheatsheet", "/cheatsheet", "📋")}
        {item("profile", "/profile", "👤")}
      </div>
    </nav>
  );
}
