"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { adminCorridorPath } from "@/lib/admin/admin-path";
import type { CorridorId, Locale } from "@/lib/types";

const links = [
  { href: "", labelKey: "overview" as const },
  { href: "/phrases", labelKey: "phrases" as const },
  { href: "/conversations", labelKey: "conversations" as const },
  { href: "/mini-lessons", labelKey: "miniLessons" as const },
  { href: "/quizzes", labelKey: "quizzes" as const },
  { href: "/lessons", labelKey: "lessons" as const },
  { href: "/cheatsheet", labelKey: "cheatsheet" as const },
  { href: "/situations", labelKey: "situations" as const },
];

type AdminCorridorNavProps = {
  corridorId: CorridorId;
};

export function AdminCorridorNav({ corridorId }: AdminCorridorNavProps) {
  const t = useTranslations("admin.nav");
  const locale = useLocale() as Locale;
  const currentPath = usePathname() ?? "";
  const base = adminCorridorPath(locale, corridorId);

  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      {links.map((link) => {
        const path = link.href ? `${base}${link.href}` : base;
        const active =
          link.href === ""
            ? currentPath === base || currentPath === `${base}/`
            : currentPath.startsWith(`${base}${link.href}`);
        return (
          <Link
            key={link.href || "overview"}
            href={path}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              active
                ? "bg-teal-800 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t(link.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
