import Link from "next/link";
import type { BlogPostSummary } from "@/lib/blog";
import { formatDate, formatViewCount, getNotionTagTone } from "@/lib/utils";

type Props = {
  post: BlogPostSummary;
  priority?: "featured" | "default" | "compact";
};

function PlaceholderBadge({ label }: { label: string }) {
  return (
    <span className="relative rounded-full border border-[var(--border-strong)] bg-[var(--surface-pill)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
      {label}
    </span>
  );
}

function ViewStat({ views }: { views: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-pill)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="3.1" />
      </svg>
      <span>{formatViewCount(views)}</span>
    </span>
  );
}

export function PostCard({ post, priority = "default" }: Props) {
  const isCompact = priority === "compact";
  const isFeatured = priority === "featured";
  const displayImage = post.thumbnailImage ?? post.coverImage;
  const href = `/blog/${post.slug}`;
  const primaryTagLabel = post.primaryTag ?? post.tags[0] ?? "Article";
  const primaryTagTone = getNotionTagTone(post.primaryTagColor, primaryTagLabel);

  return (
    <Link href={href} className="group block h-full">
      <article
        className={`h-full overflow-hidden rounded-[2rem] border border-[var(--border)] [background:var(--post-card-gradient)] transition duration-300 group-hover:-translate-y-1 group-hover:border-[var(--accent)] group-hover:shadow-[var(--shadow-soft)] ${
          isCompact ? "p-3" : "p-3"
        }`}
      >
        {isCompact ? (
          <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-4">
            <div className="overflow-hidden rounded-[1.35rem] border border-[var(--border-strong)] bg-[var(--surface-strong)]">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- Blog thumbnails are CMS-managed remote images and we intentionally keep the card rendering simple.
                <img
                  src={displayImage}
                  alt={post.title}
                  className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="relative flex aspect-square items-end overflow-hidden [background:var(--placeholder-gradient)] p-4">
                  <div className="absolute right-3 top-3 h-12 w-12 rounded-[1.25rem] bg-[var(--secondary-soft)]" />
                  <PlaceholderBadge label={primaryTagLabel} />
                </div>
              )}
            </div>

            <div className="min-w-0 py-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  <span
                    className="rounded-full border px-2.5 py-1 text-[9px] leading-none sm:text-[10px]"
                    style={primaryTagTone}
                  >
                    {primaryTagLabel}
                  </span>
                  <span className="whitespace-nowrap">{formatDate(post.publishedAt)}</span>
                </div>
                <ViewStat views={post.views} />
              </div>
              <h2 className="mt-2 line-clamp-2 text-[1.05rem] font-semibold leading-7 tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)] sm:text-lg">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                {post.description}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-[1.55rem] border border-[var(--border-strong)] bg-[var(--surface-strong)]">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- Blog thumbnails are CMS-managed remote images and we intentionally keep the card rendering simple.
                <img
                  src={displayImage}
                  alt={post.title}
                  className="aspect-[16/10] h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="relative flex aspect-[16/10] items-end overflow-hidden [background:var(--placeholder-gradient)] p-6">
                  <div className="absolute right-6 top-6 h-20 w-20 rounded-[2rem] bg-[var(--secondary-soft)]" />
                  <div className="absolute bottom-4 right-10 h-24 w-24 rounded-full bg-[var(--accent-glow)] blur-xl" />
                  <PlaceholderBadge label={primaryTagLabel} />
                </div>
              )}
            </div>

            <div className="space-y-4 px-2 pb-2 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] sm:text-[11px]">
                  <span
                    className="rounded-full border px-2.5 py-1 text-[9px] leading-none sm:text-[10px]"
                    style={primaryTagTone}
                  >
                    {primaryTagLabel}
                  </span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <ViewStat views={post.views} />
              </div>

              <div>
                <h2
                  className={`line-clamp-2 font-semibold tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)] ${
                    isFeatured ? "text-[2rem] leading-tight" : "text-xl leading-8"
                  }`}
                >
                  {post.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)]">
                  {post.description}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                Open article
                <span aria-hidden="true">→</span>
              </div>
            </div>
          </>
        )}
      </article>
    </Link>
  );
}
