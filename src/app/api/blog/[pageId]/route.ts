import { getBlogContentByPageId } from "@/lib/notion-content-service";

export const runtime = "nodejs";
export const revalidate = 300;

type RouteProps = {
  params: Promise<{ pageId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { pageId } = await params;
    const content = await getBlogContentByPageId(pageId.trim());

    return Response.json(content, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Blog content route error", error);

    return Response.json(
      { error: "Unable to load this blog post right now." },
      { status: 500 },
    );
  }
}
