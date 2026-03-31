import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type {
  BlogContentBlock,
  BlogContentResponse,
  BlogHeadingBlock,
} from "@/lib/blog-content";
import { notion } from "@/lib/notion";
import { getHostedImageUrl, getNotionFileUrl } from "@/lib/notion-assets";

type BlockNode = BlockObjectResponse & {
  children: BlockNode[];
};

type PendingListItemBlock =
  | {
      type: "bulleted_list_item";
      content: string;
    }
  | {
      type: "numbered_list_item";
      content: string;
    };

type PendingBlogBlock = BlogContentBlock | PendingListItemBlock;

const CONTENT_CACHE_TTL_MS = 5 * 60 * 1000;
const blogContentCache = new Map<
  string,
  {
    expiresAt: number;
    response: Promise<BlogContentResponse> | BlogContentResponse;
  }
>();

function isFullBlock(
  block: BlockObjectResponse | PartialBlockObjectResponse,
): block is BlockObjectResponse {
  return "type" in block;
}

function richTextToPlainText(richText: RichTextItemResponse[] = []) {
  return richText.map((item) => item.plain_text).join("").trim();
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatReadingTime(words: number, imageCount: number) {
  const estimatedMinutes = Math.max(1, Math.ceil(words / 215 + imageCount * 0.2));
  return `${estimatedMinutes} min read`;
}

async function fetchBlockChildren(blockId: string): Promise<BlockNode[]> {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });

    blocks.push(...response.results.filter(isFullBlock));
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return Promise.all(
    blocks.map(async (block) => ({
      ...block,
      children: block.has_children ? await fetchBlockChildren(block.id) : [],
    })),
  );
}

function createHeadingBlock(
  level: BlogHeadingBlock["level"],
  content: string,
): BlogHeadingBlock | null {
  if (!content) {
    return null;
  }

  return {
    type: "heading",
    level,
    content,
  };
}

async function transformBlockNode(node: BlockNode): Promise<PendingBlogBlock[]> {
  const blocks: PendingBlogBlock[] = [];

  switch (node.type) {
    case "paragraph": {
      const content = richTextToPlainText(node.paragraph.rich_text);

      if (content) {
        blocks.push({
          type: "text",
          content,
        });
      }
      break;
    }
    case "heading_1": {
      const heading = createHeadingBlock(
        1,
        richTextToPlainText(node.heading_1.rich_text),
      );

      if (heading) {
        blocks.push(heading);
      }
      break;
    }
    case "heading_2": {
      const heading = createHeadingBlock(
        2,
        richTextToPlainText(node.heading_2.rich_text),
      );

      if (heading) {
        blocks.push(heading);
      }
      break;
    }
    case "heading_3": {
      const heading = createHeadingBlock(
        3,
        richTextToPlainText(node.heading_3.rich_text),
      );

      if (heading) {
        blocks.push(heading);
      }
      break;
    }
    case "bulleted_list_item": {
      const content = richTextToPlainText(node.bulleted_list_item.rich_text);

      if (content) {
        blocks.push({
          type: "bulleted_list_item",
          content,
        });
      }
      break;
    }
    case "numbered_list_item": {
      const content = richTextToPlainText(node.numbered_list_item.rich_text);

      if (content) {
        blocks.push({
          type: "numbered_list_item",
          content,
        });
      }
      break;
    }
    case "code": {
      const code = richTextToPlainText(node.code.rich_text);

      if (code) {
        const caption = richTextToPlainText(node.code.caption);
        blocks.push({
          type: "code",
          code,
          language: node.code.language,
          caption: caption || undefined,
        });
      }
      break;
    }
    case "image": {
      const sourceUrl = getNotionFileUrl(node.image);
      const hostedUrl = await getHostedImageUrl(sourceUrl);

      if (hostedUrl) {
        const caption = richTextToPlainText(node.image.caption);
        blocks.push({
          type: "image",
          url: hostedUrl,
          alt: caption || "Blog image",
          caption: caption || undefined,
        });
      }
      break;
    }
    default:
      break;
  }

  for (const child of node.children) {
    blocks.push(...(await transformBlockNode(child)));
  }

  return blocks;
}

function groupListBlocks(blocks: PendingBlogBlock[]): BlogContentBlock[] {
  const groupedBlocks: BlogContentBlock[] = [];
  let currentListType: PendingListItemBlock["type"] | null = null;
  let currentItems: string[] = [];

  const flushList = () => {
    if (!currentListType || currentItems.length === 0) {
      currentListType = null;
      currentItems = [];
      return;
    }

    groupedBlocks.push({
      type:
        currentListType === "bulleted_list_item"
          ? "bulleted_list"
          : "numbered_list",
      items: currentItems,
    });
    currentListType = null;
    currentItems = [];
  };

  for (const block of blocks) {
    if (
      block.type === "bulleted_list_item" ||
      block.type === "numbered_list_item"
    ) {
      if (!currentListType || currentListType === block.type) {
        currentListType = block.type;
        currentItems.push(block.content);
        continue;
      }

      flushList();
      currentListType = block.type;
      currentItems.push(block.content);
      continue;
    }

    flushList();
    groupedBlocks.push(block);
  }

  flushList();

  return groupedBlocks;
}

async function buildBlogContentResponse(pageId: string): Promise<BlogContentResponse> {
  const rootBlocks = await fetchBlockChildren(pageId);
  const pendingBlocks: PendingBlogBlock[] = [];

  for (const block of rootBlocks) {
    pendingBlocks.push(...(await transformBlockNode(block)));
  }

  const blocks = groupListBlocks(pendingBlocks);
  const wordCount = blocks.reduce((total, block) => {
    if (block.type === "text" || block.type === "heading") {
      return total + countWords(block.content);
    }

    if (
      block.type === "bulleted_list" ||
      block.type === "numbered_list"
    ) {
      return total + block.items.reduce((sum, item) => sum + countWords(item), 0);
    }

    if (block.type === "code") {
      return total + countWords(block.code);
    }

    return total;
  }, 0);
  const imageCount = blocks.filter((block) => block.type === "image").length;

  return {
    pageId,
    blocks,
    wordCount,
    readingTime: formatReadingTime(wordCount, imageCount),
    generatedAt: new Date().toISOString(),
  };
}

export async function getBlogContentByPageId(pageId: string) {
  const now = Date.now();
  const cachedEntry = blogContentCache.get(pageId);

  if (cachedEntry && cachedEntry.expiresAt > now) {
    return await cachedEntry.response;
  }

  const responsePromise = buildBlogContentResponse(pageId);
  blogContentCache.set(pageId, {
    expiresAt: now + CONTENT_CACHE_TTL_MS,
    response: responsePromise,
  });

  try {
    const response = await responsePromise;

    blogContentCache.set(pageId, {
      expiresAt: now + CONTENT_CACHE_TTL_MS,
      response,
    });

    return response;
  } catch (error) {
    blogContentCache.delete(pageId);
    throw error;
  }
}
