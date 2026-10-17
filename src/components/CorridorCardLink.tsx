import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { CORRIDOR_FLAG, CORRIDOR_GRADIENT } from "@/lib/corridor-visuals";
import type { CorridorId } from "@/lib/types";

type CorridorCardLinkProps = {
  corridorId: CorridorId;
  href: string;
  title: string;
  subtitle: string;
  trailing?: ReactNode;
};

export function CorridorCardLink({
  corridorId,
  href,
  title,
  subtitle,
  trailing,
}: CorridorCardLinkProps) {
  return (
    <Link
      href={href}
      className={`lr-card lr-card-interactive flex items-center gap-3 bg-gradient-to-br px-4 py-3.5 ${CORRIDOR_GRADIENT[corridorId]}`}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/90 text-2xl shadow-sm"
        aria-hidden
      >
        {CORRIDOR_FLAG[corridorId]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      {trailing}
    </Link>
  );
}
