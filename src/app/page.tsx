import { HomePage } from "@/app/components/home-page";
import { getPublishedPosts } from "@/lib/blog";

export default async function Home() {
  const posts = await getPublishedPosts();

  return <HomePage posts={posts} />;
}
