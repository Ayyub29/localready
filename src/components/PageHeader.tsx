import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function PageHeader({ eyebrow, title, subtitle, trailing }: PageHeaderProps) {
  return (
    <header className="lr-page-header">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {eyebrow && <p className="lr-eyebrow">{eyebrow}</p>}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-sm leading-relaxed text-slate-600">{subtitle}</p>
          )}
        </div>
        {trailing}
      </div>
    </header>
  );
}
