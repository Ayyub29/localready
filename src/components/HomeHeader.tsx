import { PageHeader } from "@/components/PageHeader";

type HomeHeaderProps = {
  title?: string;
};

export function HomeHeader({ title }: HomeHeaderProps) {
  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="lr-brand-mark" aria-hidden>LR</span>
        <div>
          <p className="lr-eyebrow">LocalReady</p>
          <p className="text-xs text-slate-500">
            Get locally ready before you land
          </p>
        </div>
      </div>
      {title ? <PageHeader title={title} /> : null}
    </div>
  );
}
