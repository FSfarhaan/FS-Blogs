export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-32 animate-pulse rounded-full bg-[var(--surface-strong)]" />
      <div className="h-12 w-full animate-pulse rounded-3xl bg-[var(--surface-strong)]" />
      <div className="h-56 w-full animate-pulse rounded-[2rem] bg-[var(--surface-strong)]" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-[2rem] bg-[var(--surface-strong)]" />
        <div className="h-48 animate-pulse rounded-[2rem] bg-[var(--surface-strong)]" />
      </div>
    </div>
  );
}
