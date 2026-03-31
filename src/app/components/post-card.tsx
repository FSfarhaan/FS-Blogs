import Link from "next/link";
import type { BlogPostSummary } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

type Props = {
  post: BlogPostSummary;
  priority?: "featured" | "default" | "compact";
};

export function PostCard({ post, priority = "default" }: Props) {
  const isCompact = priority === "compact";
  const isFeatured = priority === "featured";

  return (
    <article
      className={`group overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-strong)] ${
        isCompact ? "p-5" : ""
      }`}
    >
      {!isCompact && (
        <div className="aspect-[16/10] overflow-hidden bg-[var(--surface-strong)]">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- Notion cover URLs are remote and may be signed, so we keep rendering flexible here.
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="relative flex h-full w-full items-end overflow-hidden bg-[linear-gradient(135deg,#fff4ea,#fde1d4_45%,#efe7ff)] p-6">
              <div className="absolute right-6 top-6 h-24 w-24 rounded-[2rem] bg-[color:rgba(107,91,210,0.12)]" />
              <div className="absolute bottom-4 right-10 h-28 w-28 rounded-full bg-[color:rgba(239,109,67,0.15)] blur-xl" />
              <span className="relative rounded-full border border-white/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {post.tags[0] ?? "Latest"}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={isCompact ? "space-y-3" : "space-y-4 p-6"}>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          <span>{formatDate(post.publishedAt)}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
          <span>{post.author}</span>
        </div>

        <div>
          <h2
            className={`font-semibold tracking-tight text-[var(--foreground)] ${
              isFeatured ? "text-[2rem] leading-tight" : isCompact ? "text-lg" : "text-[1.75rem]"
            }`}
          >
            <Link href={`/blog/${post.slug}`} className="transition hover:text-[var(--accent)]">
              {post.title}
            </Link>
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] md:text-base">
            {post.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(post.tags.length ? post.tags : ["Published"]).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--accent)]"
        >
          Continue reading
        </Link>
      </div>
    </article>
  );
}
