import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type BackLinkProps = {
  href: string;
  children: ReactNode;
};

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800 transition hover:text-teal-950"
    >
      <span aria-hidden className="text-base leading-none">←</span>
      {children}
    </Link>
  );
}
