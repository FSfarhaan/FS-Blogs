import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { Block, ExtendedRecordMap } from "notion-types";
import { notion } from "@/lib/notion";

type BlockNode = BlockObjectResponse & {
  children: BlockNode[];
};

type RecordMapPage = {
  id: string;
  title: string;
  coverImage: string | null;
  icon: string | null;
};

const DEFAULT_SPACE_ID = "blog-space";
const EMPTY_RECORD_MAP: ExtendedRecordMap = {
  block: {},
  collection: {},
  collection_view: {},
  notion_user: {},
  collection_query: {},
  signed_urls: {},
};

function isFullBlock(
  block: BlockObjectResponse | PartialBlockObjectResponse,
): block is BlockObjectResponse {
  return "type" in block;
}

function toTimestamp(dateString: string) {
  return new Date(dateString).getTime();
}

function toUserId(user?: { id: string } | null) {
  return user?.id ?? "notion-user";
}

function toColor(color?: string) {
  return color && color !== "default" ? color : undefined;
}

function getFileUrl(
  file?:
    | { type: "external"; external: { url: string } }
    | { type: "file"; file: { url: string } }
    | null,
) {
  if (!file) {
    return null;
  }

  if (file.type === "external") {
    return file.external.url;
  }

  return file.file.url;
}

function extractPageIcon(
  icon?:
    | { type: "emoji"; emoji: string }
    | { type: "custom_emoji"; custom_emoji: { url: string } }
    | { type: "icon"; icon: { name: string; color?: string } }
    | { type: "external"; external: { url: string } }
    | { type: "file"; file: { url: string } }
    | null,
) {
  if (!icon) {
    return null;
  }

  if (icon.type === "emoji") {
    return icon.emoji;
  }

  if (icon.type === "custom_emoji") {
    return icon.custom_emoji.url;
  }

  if (icon.type === "icon") {
    return null;
  }

  return getFileUrl(icon);
}

function richTextToDecorations(richText: RichTextItemResponse[] = []) {
  if (!richText.length) {
    return [[""]];
  }

  return richText.map((item) => {
    const text =
      item.type === "equation"
        ? item.equation.expression
        : (item.plain_text ?? "");

    const annotations: Array<[string, string?]> = [];

    if (item.annotations.bold) annotations.push(["b"]);
    if (item.annotations.italic) annotations.push(["i"]);
    if (item.annotations.strikethrough) annotations.push(["s"]);
    if (item.annotations.underline) annotations.push(["_"]);
    if (item.annotations.code) annotations.push(["c"]);

    const color = toColor(item.annotations.color);
    if (color) annotations.push(["h", color]);

    const href =
      item.href ?? (item.type === "text" ? item.text.link?.url : undefined);
    if (href) annotations.push(["a", href]);

    if (item.type === "equation") {
      annotations.push(["e", item.equation.expression]);
    }

    return annotations.length ? [text, annotations] : [text];
  });
}

async function fetchBlockChildren(blockId: string): Promise<BlockNode[]> {
  const nodes: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });

    nodes.push(...response.results.filter(isFullBlock));
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return Promise.all(
    nodes.map(async (node) => ({
      ...node,
      children: node.has_children ? await fetchBlockChildren(node.id) : [],
    })),
  );
}

function addPageBlock(recordMap: ExtendedRecordMap, page: RecordMapPage) {
  recordMap.block[page.id] = {
    role: "reader",
    value: {
      id: page.id,
      type: "page",
      parent_id: DEFAULT_SPACE_ID,
      parent_table: "space",
      space_id: DEFAULT_SPACE_ID,
      version: 1,
      created_time: Date.now(),
      last_edited_time: Date.now(),
      alive: true,
      created_by_table: "notion_user",
      created_by_id: "notion-user",
      last_edited_by_table: "notion_user",
      last_edited_by_id: "notion-user",
      properties: {
        title: [[page.title]],
      },
      content: [],
      format: {
        page_cover: page.coverImage ?? undefined,
        page_cover_position: 0.5,
        page_icon: page.icon ?? undefined,
      },
      permissions: [{ role: "reader", type: "user_permission" }],
    },
  };
}

function pushChildContent(
  recordMap: ExtendedRecordMap,
  parentId: string,
  childIds: string[],
) {
  const parent = recordMap.block[parentId];

  if (!parent || !("value" in parent)) {
    return;
  }

  const parentValue: Block =
    "role" in parent.value && "value" in parent.value
      ? parent.value.value
      : parent.value;

  parentValue.content = childIds;
}

function addUserShell(recordMap: ExtendedRecordMap, userId: string) {
  if (recordMap.notion_user[userId]) {
    return;
  }

  recordMap.notion_user[userId] = {
    role: "reader",
    value: {
      id: userId,
      version: 1,
      given_name: "",
      family_name: "",
      email: "",
      profile_photo: "",
      onboarding_completed: true,
      mobile_onboarding_completed: true,
    },
  };
}

function createBaseBlock(
  node: BlockNode,
  parentId: string,
  notionType: string,
  extra: Record<string, unknown> = {},
) {
  const createdById = toUserId(node.created_by);
  const editedById = toUserId(node.last_edited_by);

  return {
    id: node.id,
    type: notionType,
    parent_id: parentId,
    parent_table: "block",
    space_id: DEFAULT_SPACE_ID,
    version: 1,
    created_time: toTimestamp(node.created_time),
    last_edited_time: toTimestamp(node.last_edited_time),
    alive: node.archived !== true,
    created_by_table: "notion_user",
    created_by_id: createdById,
    last_edited_by_table: "notion_user",
    last_edited_by_id: editedById,
    content: node.children.length ? node.children.map((child) => child.id) : undefined,
    ...extra,
  };
}

function addBlockToRecordMap(
  recordMap: ExtendedRecordMap,
  node: BlockNode,
  parentId: string,
) {
  addUserShell(recordMap, toUserId(node.created_by));
  addUserShell(recordMap, toUserId(node.last_edited_by));

  let blockValue: Record<string, unknown> | null = null;
  let signedUrl: string | null = null;

  switch (node.type) {
    case "paragraph":
      blockValue = createBaseBlock(node, parentId, "text", {
        properties: {
          title: richTextToDecorations(node.paragraph.rich_text),
        },
        format: {
          block_color: toColor(node.paragraph.color),
        },
      });
      break;
    case "heading_1":
      blockValue = createBaseBlock(node, parentId, "header", {
        properties: {
          title: richTextToDecorations(node.heading_1.rich_text),
        },
        format: {
          block_color: toColor(node.heading_1.color),
          toggleable: node.heading_1.is_toggleable,
        },
      });
      break;
    case "heading_2":
      blockValue = createBaseBlock(node, parentId, "sub_header", {
        properties: {
          title: richTextToDecorations(node.heading_2.rich_text),
        },
        format: {
          block_color: toColor(node.heading_2.color),
          toggleable: node.heading_2.is_toggleable,
        },
      });
      break;
    case "heading_3":
      blockValue = createBaseBlock(node, parentId, "sub_sub_header", {
        properties: {
          title: richTextToDecorations(node.heading_3.rich_text),
        },
        format: {
          block_color: toColor(node.heading_3.color),
          toggleable: node.heading_3.is_toggleable,
        },
      });
      break;
    case "bulleted_list_item":
      blockValue = createBaseBlock(node, parentId, "bulleted_list", {
        properties: {
          title: richTextToDecorations(node.bulleted_list_item.rich_text),
        },
      });
      break;
    case "numbered_list_item":
      blockValue = createBaseBlock(node, parentId, "numbered_list", {
        properties: {
          title: richTextToDecorations(node.numbered_list_item.rich_text),
        },
      });
      break;
    case "quote":
      blockValue = createBaseBlock(node, parentId, "quote", {
        properties: {
          title: richTextToDecorations(node.quote.rich_text),
        },
      });
      break;
    case "divider":
      blockValue = createBaseBlock(node, parentId, "divider");
      break;
    case "toggle":
      blockValue = createBaseBlock(node, parentId, "toggle", {
        properties: {
          title: richTextToDecorations(node.toggle.rich_text),
        },
      });
      break;
    case "to_do":
      blockValue = createBaseBlock(node, parentId, "to_do", {
        properties: {
          title: richTextToDecorations(node.to_do.rich_text),
          checked: [[node.to_do.checked ? "Yes" : "No"]],
        },
      });
      break;
    case "callout":
      blockValue = createBaseBlock(node, parentId, "callout", {
        properties: {
          title: richTextToDecorations(node.callout.rich_text),
        },
        format: {
          page_icon: extractPageIcon(node.callout.icon) ?? "💡",
          block_color: toColor(node.callout.color),
        },
      });
      break;
    case "code":
      blockValue = createBaseBlock(node, parentId, "code", {
        properties: {
          title: richTextToDecorations(node.code.rich_text),
          language: [[node.code.language]],
          caption: richTextToDecorations(node.code.caption),
        },
      });
      break;
    case "bookmark":
      blockValue = createBaseBlock(node, parentId, "bookmark", {
        properties: {
          link: [[node.bookmark.url]],
          title: [[node.bookmark.url]],
          description: [[""]],
        },
        format: {
          bookmark_icon: "",
          bookmark_cover: "",
        },
      });
      break;
    case "embed":
      signedUrl = node.embed.url;
      blockValue = createBaseBlock(node, parentId, "embed", {
        properties: {
          source: [[node.embed.url]],
          caption: richTextToDecorations(node.embed.caption),
          alt_text: richTextToDecorations(node.embed.caption),
        },
        format: {
          display_source: node.embed.url,
          block_width: 720,
          block_height: 420,
          block_full_width: false,
          block_page_width: true,
          block_aspect_ratio: 16 / 9,
          block_preserve_scale: true,
          block_alignment: "center",
        },
      });
      break;
    case "image": {
      const url = getFileUrl(node.image);
      signedUrl = url;
      blockValue = createBaseBlock(node, parentId, "image", {
        properties: {
          source: [[url ?? ""]],
          caption: richTextToDecorations(node.image.caption),
          alt_text: richTextToDecorations(node.image.caption),
        },
        format: {
          display_source: url ?? "",
          block_width: 960,
          block_height: 640,
          block_full_width: false,
          block_page_width: true,
          block_aspect_ratio: 1.5,
          block_preserve_scale: true,
          block_alignment: "center",
        },
      });
      break;
    }
    case "video": {
      const url = getFileUrl(node.video);
      signedUrl = url;
      blockValue = createBaseBlock(node, parentId, "video", {
        properties: {
          source: [[url ?? ""]],
          caption: richTextToDecorations(node.video.caption),
          alt_text: richTextToDecorations(node.video.caption),
        },
        format: {
          display_source: url ?? "",
          block_width: 720,
          block_height: 420,
          block_full_width: false,
          block_page_width: true,
          block_aspect_ratio: 16 / 9,
          block_preserve_scale: true,
          block_alignment: "center",
        },
      });
      break;
    }
    case "pdf": {
      const url = getFileUrl(node.pdf);
      signedUrl = url;
      blockValue = createBaseBlock(node, parentId, "pdf", {
        properties: {
          source: [[url ?? ""]],
          caption: richTextToDecorations(node.pdf.caption),
          alt_text: richTextToDecorations(node.pdf.caption),
        },
        format: {
          display_source: url ?? "",
          block_width: 720,
          block_height: 420,
          block_full_width: false,
          block_page_width: true,
          block_aspect_ratio: 16 / 9,
          block_preserve_scale: true,
          block_alignment: "center",
        },
      });
      break;
    }
    case "file": {
      const url = getFileUrl(node.file);
      signedUrl = url;
      blockValue = createBaseBlock(node, parentId, "file", {
        properties: {
          title: [[node.file.name]],
          size: [[""]],
          source: [[url ?? ""]],
        },
      });
      break;
    }
    default: {
      const fallbackText = `${node.type.replaceAll("_", " ")} block`;
      blockValue = createBaseBlock(node, parentId, "text", {
        properties: {
          title: [[fallbackText]],
        },
      });
      break;
    }
  }

  recordMap.block[node.id] = {
    role: "reader",
    value: blockValue as unknown as Block,
  };

  if (signedUrl) {
    recordMap.signed_urls[node.id] = signedUrl;
  }

  for (const child of node.children) {
    addBlockToRecordMap(recordMap, child, node.id);
  }
}

export async function getPageRecordMap(page: RecordMapPage) {
  const recordMap: ExtendedRecordMap = structuredClone(EMPTY_RECORD_MAP);
  const children = await fetchBlockChildren(page.id);

  addPageBlock(recordMap, page);
  pushChildContent(
    recordMap,
    page.id,
    children.map((child) => child.id),
  );

  for (const child of children) {
    addBlockToRecordMap(recordMap, child, page.id);
  }

  return recordMap;
}
