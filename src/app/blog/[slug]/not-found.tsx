import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-6 py-20 md:px-10">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          404
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          That post could not be found.
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--muted)]">
          Check the slug in Notion, or head back to the homepage to browse the latest articles.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex w-fit items-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent)]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
