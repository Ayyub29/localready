type HomeHeaderProps = {
  title?: string;
};

export function HomeHeader({ title }: HomeHeaderProps) {
  return (
    <header className="mb-6 border-b border-border pb-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
        LocalReady
      </p>
      {title && <h1 className="mt-1 text-xl font-bold">{title}</h1>}
    </header>
  );
}
