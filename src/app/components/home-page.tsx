import Link from "next/link";
import { EmptyState } from "@/app/components/empty-state";
import { PostCard } from "@/app/components/post-card";
import { SubscribeSection } from "@/app/components/subscribe-section";
import type { BlogPostSummary } from "@/lib/blog";
import { categoryList, siteConfig } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";

type Props = {
  posts: BlogPostSummary[];
};

export function HomePage({ posts }: Props) {
  const [featuredPost, ...latestPosts] = posts;
  const spotlightPosts = latestPosts.slice(0, 6);
  const recentPosts = posts.slice(0, 5);
  const archivePosts = posts.slice(0, 4);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8 md:px-10 md:py-10">
      <section className="grid gap-7">
        <div className="space-y-7">
          <div className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,250,244,0.97),rgba(252,238,228,0.94),rgba(246,240,255,0.9))] p-8 shadow-[var(--shadow-soft)] md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Hi there,
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--foreground)] md:text-[4.5rem]">
                  Developer writing,
                  <span className="block text-[var(--accent)]">
                    cleanly published from Notion.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                  {siteConfig.intro}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="#latest-posts"
                    className="inline-flex items-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
                  >
                    Start reading
                  </Link>
                  <Link
                    href="#subscribe"
                    className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    Join the newsletter
                  </Link>
                </div>
              </div>

              {/* <div className="relative mx-auto h-[22rem] w-full max-w-[22rem]">
                <div className="absolute inset-0 rounded-[2.5rem] bg-[linear-gradient(160deg,#ef6d43,#ffb087_48%,#fff4ea)] shadow-[var(--shadow-strong)]" />
                <div className="absolute inset-[14px] rounded-[2.2rem] border border-white/60 bg-[linear-gradient(160deg,#2c221c_10%,#46352d_52%,#5e4b42_100%)] p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                    Editorial system
                  </p>

                  <div className="mt-8 rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.02))] p-5 backdrop-blur">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                      Stack
                    </p>
                    <div className="mt-4 space-y-3">
                      {["Notion CMS", "Resend Email", "Firestore Subs"].map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <div className="h-20 flex-1 rounded-[1.7rem] bg-[color:rgba(255,255,255,0.09)]" />
                    <div className="h-20 w-20 rounded-[1.7rem] bg-[color:rgba(255,255,255,0.16)]" />
                  </div>
                </div>
              </div> */}
            </div>

            {/* <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "CMS", value: "Notion" },
                { label: "Subscriptions", value: "Firestore" },
                { label: "Notifications", value: "Resend" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.6rem] border border-[var(--border)] bg-[color:rgba(255,250,244,0.82)] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div> */}
          </div>

          <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Categories
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                  Writing lanes that keep the archive focused
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Static for now, but styled like a deliberate editorial taxonomy instead of placeholder filters.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categoryList.map((category, index) => (
                <div
                  key={category}
                  className="rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(160deg,#fffaf4,#f8ede2)] p-5"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-sm font-semibold text-[var(--foreground)]">
                    0{index + 1}
                  </div>
                  <p className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                    {category}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Practical notes and sharp takes on {category.toLowerCase()}.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* <aside className="space-y-6">
          {featuredPost ? (
            <PostCard post={featuredPost} priority="featured" />
          ) : (
            <EmptyState
              title="Your first article will appear here"
              description="Publish a post from Notion and it will show up as the featured story on the homepage."
            />
          )}

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              About this blog
            </p>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(160deg,#ef6d43,#ffb087)] text-xl font-semibold text-white">
                DN
              </div>
              <div>
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {siteConfig.author}
                </p>
                <p className="text-sm text-[var(--muted)]">{siteConfig.role}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
              A clean, low-maintenance publishing setup for developer essays, code notes, and product thinking.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Recent posts
            </p>
            <div className="mt-5 space-y-4">
              {recentPosts.length ? (
                recentPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex gap-4 rounded-[1.5rem] border border-transparent p-3 transition hover:border-[var(--border)] hover:bg-[var(--surface-strong)]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-sm font-semibold text-[var(--foreground)]">
                      0{index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {formatDate(post.publishedAt)}
                      </p>
                      <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                        {post.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                        {post.description}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-[var(--muted)]">
                  No published posts yet. Mark a Notion entry as published to populate this list.
                </p>
              )}
            </div>
          </div>

          <SubscribeSection compact />
        </aside> */}
      </section>

      <section
        id="latest-posts"
        className="rounded-[2.25rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)] md:p-10"
      >
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Latest blogs & news
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              Recent writing from Notion
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Published entries are fetched from the data source, rendered cleanly, and arranged like a proper archive instead of a default card grid.
          </p>
        </div>

        {spotlightPosts.length ? (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-6 md:grid-cols-2">
              {spotlightPosts.slice(0, 4).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <div className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(160deg,#fff8f1,#f4e7da)] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Archive snapshot
              </p>
              <div className="mt-5 space-y-3">
                {archivePosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="block rounded-[1.4rem] border border-[var(--border)] bg-[color:rgba(255,250,244,0.84)] px-5 py-4 transition hover:border-[var(--accent)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          {formatDate(post.publishedAt)}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                          {post.title}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">
                        {post.tags[0] ?? "Post"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No published posts yet"
            description="Once your Notion data source has published posts, they will appear here automatically."
          />
        )}
      </section>
    </main>
  );
}
