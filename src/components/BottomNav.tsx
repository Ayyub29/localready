"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  NavIconCheatsheet,
  NavIconHome,
  NavIconProfile,
  NavIconQuiz,
} from "@/components/icons/NavIcons";

type Tab = "home" | "cheatsheet" | "quiz" | "profile";

function tabFromPath(pathname: string): Tab {
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/quiz")) return "quiz";
  if (pathname.startsWith("/cheatsheet")) return "cheatsheet";
  return "home";
}

const TAB_ICONS: Record<Tab, typeof NavIconHome> = {
  home: NavIconHome,
  cheatsheet: NavIconCheatsheet,
  quiz: NavIconQuiz,
  profile: NavIconProfile,
};

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const active = tabFromPath(pathname);

  const item = (
    key: Tab,
    href: "/" | "/cheatsheet" | "/quiz" | "/profile",
  ) => {
    const on = active === key;
    const Icon = TAB_ICONS[key];
    return (
      <Link
        href={href}
        className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors ${
          on ? "text-teal-700" : "text-slate-500"
        }`}
      >
        <span
          className={`flex h-8 w-12 items-center justify-center rounded-xl transition-all ${
            on ? "bg-teal-50 text-teal-600" : "text-current"
          }`}
          aria-hidden
        >
          <Icon className="h-6 w-6" />
        </span>
        {t(key)}
      </Link>
    );
  };

  return (
    <nav
      className="lr-nav-fab fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-white/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg px-3 pt-1.5">
        {item("home", "/")}
        {item("cheatsheet", "/cheatsheet")}
        {item("quiz", "/quiz")}
        {item("profile", "/profile")}
      </div>
    </nav>
  );
}
