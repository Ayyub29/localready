import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type SituationCardLinkProps = {
  href: string;
  title: string;
  trailing?: ReactNode;
};

export function SituationCardLink({ href, title, trailing }: SituationCardLinkProps) {
  return (
    <Link
      href={href}
      className="lr-card lr-card-interactive flex items-center justify-between gap-3 px-4 py-3.5 border-l-4 border-l-teal-500/80"
    >
      <span className="font-semibold text-slate-900">{title}</span>
      {trailing ? (
        <div className="shrink-0 text-right text-sm text-slate-500">{trailing}</div>
      ) : null}
    </Link>
  );
}
