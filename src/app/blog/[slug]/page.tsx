import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NotionContent } from "@/app/components/notion-content";
import { PostCard } from "@/app/components/post-card";
import { SubscribeSection } from "@/app/components/subscribe-section";
import { getPostBySlug, getPublishedPosts, getRecentPosts } from "@/lib/blog";
import { getBlogContentByPageId } from "@/lib/notion-content-service";
import { formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getPublishedPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [recentPosts, content] = await Promise.all([
    getRecentPosts(3, post.slug),
    getBlogContentByPageId(post.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="min-w-0">
          <div className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(140deg,rgba(255,255,255,0.97),rgba(255,245,235,0.9),rgba(242,239,255,0.86))] p-8 shadow-[var(--shadow-soft)] md:p-10">
            <Link
              href="/"
              className="inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Back to blog
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              <span>{formatDate(post.publishedAt)}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
              <span>{post.author}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
              <span>{post.readingTime}</span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-6xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)] md:text-lg">
              {post.description}
            </p>

            {post.coverImage ? (
              <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/70">
                {/* eslint-disable-next-line @next/next/no-img-element -- Notion image URLs can be signed and time-bound, so we intentionally avoid image optimization here. */}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : null}
          </div>

          <div className="mt-8 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-5 py-8 shadow-[var(--shadow-soft)] md:px-8 md:py-10">
            <div className="mx-auto max-w-[48rem]">
              <NotionContent content={content} />
            </div>
          </div>

          <div className="mt-8">
            <SubscribeSection
              title="Enjoyed the read?"
              description="Subscribe to get the next post as soon as it is published from Notion."
            />
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Post details
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--muted)]">
              <div>
                <p className="font-semibold text-[var(--foreground)]">Published</p>
                <p>{formatDate(post.publishedAt)}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Updated</p>
                <p>{formatDate(post.updatedAt)}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Read time</p>
                <p>{post.readingTime}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(post.tags.length ? post.tags : ["Article"]).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {recentPosts.length ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Keep reading
              </p>
              {recentPosts.map((recentPost) => (
                <PostCard key={recentPost.id} post={recentPost} priority="compact" />
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
