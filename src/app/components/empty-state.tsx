type Props = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-8 py-16 text-center shadow-[var(--shadow-soft)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
        Nothing here yet
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}
