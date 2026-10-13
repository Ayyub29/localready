"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CorridorId } from "@/lib/types";

const links = [
  { href: "", label: "Overview" },
  { href: "/phrases", label: "Phrases" },
  { href: "/conversations", label: "Conversations" },
  { href: "/mini-lessons", label: "Mini lessons" },
  { href: "/quizzes", label: "Quizzes & decks" },
  { href: "/lessons", label: "Lessons" },
  { href: "/cheatsheet", label: "Cheatsheet" },
] as const;

type AdminCorridorNavProps = {
  corridorId: CorridorId;
};

export function AdminCorridorNav({ corridorId }: AdminCorridorNavProps) {
  const currentPath = usePathname() ?? "";
  const base = `/admin/${corridorId}`;
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
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
