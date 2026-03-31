import { cache } from "react";
import { getBlogContentByPageId } from "@/lib/notion-content-service";
import { notion, NOTION_DATA_SOURCE_ID } from "@/lib/notion";
import {
  getHostedImageUrl,
  getNotionFileUrl,
  type NotionFileObject,
} from "@/lib/notion-assets";
import { siteConfig } from "@/lib/site-config";

type PlainTextFragment = {
  plain_text: string;
};

type TitleProperty = {
  type: "title";
  title: PlainTextFragment[];
};

type RichTextProperty = {
  type: "rich_text";
  rich_text: PlainTextFragment[];
};

type UrlProperty = {
  type: "url";
  url: string | null;
};

type EmailProperty = {
  type: "email";
  email: string | null;
};

type CheckboxProperty = {
  type: "checkbox";
  checkbox: boolean;
};

type DateProperty = {
  type: "date";
  date: {
    start: string;
  } | null;
};

type MultiSelectProperty = {
  type: "multi_select";
  multi_select: Array<{ name: string }>;
};

type SelectProperty = {
  type: "select";
  select: { name: string } | null;
};

type PeopleProperty = {
  type: "people";
  people: Array<{ name?: string | null }>;
};

type UnknownProperty = {
  type: string;
  [key: string]: unknown;
};

type NotionProperty =
  | TitleProperty
  | RichTextProperty
  | UrlProperty
  | EmailProperty
  | CheckboxProperty
  | DateProperty
  | MultiSelectProperty
  | SelectProperty
  | PeopleProperty
  | UnknownProperty;

type NotionIconObject =
  | { type: "emoji"; emoji: string }
  | { type: "custom_emoji"; custom_emoji: { url: string } }
  | { type: "icon"; icon: { name: string; color?: string } }
  | { type: "external"; external: { url: string } }
  | { type: "file"; file: { url: string } }
  | null
  | undefined;

type DataSourceQueryParameters = Parameters<typeof notion.dataSources.query>[0];
type DataSourceFilter = NonNullable<DataSourceQueryParameters["filter"]>;

type NotionPage = {
  id: string;
  url?: string;
  created_time: string;
  last_edited_time: string;
  cover?: NotionFileObject;
  icon?: NotionIconObject;
  properties: Record<string, NotionProperty>;
};

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  coverImage: string | null;
  icon: string | null;
  author: string;
  tags: string[];
  featured: boolean;
};

export type BlogPost = BlogPostSummary & {
  readingTime: string;
  canonicalUrl: string;
};

function isTitleProperty(
  property: NotionProperty | undefined,
): property is TitleProperty {
  return property?.type === "title" && Array.isArray(property.title);
}

function isRichTextProperty(
  property: NotionProperty | undefined,
): property is RichTextProperty {
  return property?.type === "rich_text" && Array.isArray(property.rich_text);
}

function isUrlProperty(property: NotionProperty | undefined): property is UrlProperty {
  return property?.type === "url";
}

function isEmailProperty(
  property: NotionProperty | undefined,
): property is EmailProperty {
  return property?.type === "email";
}

function isCheckboxProperty(
  property: NotionProperty | undefined,
): property is CheckboxProperty {
  return property?.type === "checkbox";
}

function isDateProperty(
  property: NotionProperty | undefined,
): property is DateProperty {
  return property?.type === "date";
}

function isMultiSelectProperty(
  property: NotionProperty | undefined,
): property is MultiSelectProperty {
  return property?.type === "multi_select" && Array.isArray(property.multi_select);
}

function isSelectProperty(
  property: NotionProperty | undefined,
): property is SelectProperty {
  return property?.type === "select";
}

function isPeopleProperty(
  property: NotionProperty | undefined,
): property is PeopleProperty {
  return property?.type === "people" && Array.isArray(property.people);
}

function getPlainTextProperty(
  properties: Record<string, NotionProperty>,
  names: string[],
): string {
  for (const name of names) {
    const property = properties[name];

    if (!property) {
      continue;
    }

    if (isTitleProperty(property)) {
      return property.title.map((item) => item.plain_text).join("");
    }

    if (isRichTextProperty(property)) {
      return property.rich_text.map((item) => item.plain_text).join("");
    }

    if (isUrlProperty(property)) {
      return property.url ?? "";
    }

    if (isEmailProperty(property)) {
      return property.email ?? "";
    }
  }

  for (const property of Object.values(properties)) {
    if (isTitleProperty(property)) {
      return property.title.map((item) => item.plain_text).join("");
    }
  }

  return "";
}

function getCheckboxProperty(
  properties: Record<string, NotionProperty>,
  names: string[],
): boolean {
  for (const name of names) {
    const property = properties[name];

    if (isCheckboxProperty(property)) {
      return property.checkbox ?? false;
    }
  }

  return false;
}

function getDateProperty(
  properties: Record<string, NotionProperty>,
  names: string[],
) {
  for (const name of names) {
    const property = properties[name];

    if (isDateProperty(property) && property.date?.start) {
      return property.date.start;
    }
  }

  return "";
}

function getMultiSelectProperty(
  properties: Record<string, NotionProperty>,
  names: string[],
): string[] {
  for (const name of names) {
    const property = properties[name];

    if (isMultiSelectProperty(property)) {
      return property.multi_select.map((item) => item.name);
    }

    if (isSelectProperty(property) && property.select?.name) {
      return [property.select.name];
    }
  }

  return [];
}

function getPeopleProperty(
  properties: Record<string, NotionProperty>,
  names: string[],
) {
  for (const name of names) {
    const property = properties[name];

    if (isPeopleProperty(property) && property.people.length > 0) {
      return property.people
        .map((person) => person.name)
        .filter(Boolean)
        .join(", ");
    }
  }

  return "";
}

function getIconValue(icon?: NotionIconObject) {
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

  if (icon.type === "external") {
    return icon.external.url;
  }

  if (icon.type === "file") {
    return icon.file.url;
  }

  return null;
}

async function mapPageToSummary(page: NotionPage): Promise<BlogPostSummary | null> {
  const slug = getPlainTextProperty(page.properties, ["Slug"]).trim();
  const title = getPlainTextProperty(page.properties, ["Title", "Name"]).trim();

  if (!slug || !title) {
    return null;
  }

  return {
    id: page.id,
    slug,
    title,
    description:
      getPlainTextProperty(page.properties, [
        "Description",
        "Summary",
        "Excerpt",
      ]).trim() || "Fresh writing from Notion, published straight to the site.",
    publishedAt:
      getDateProperty(page.properties, ["Date", "Published At", "Publish Date"]) ||
      page.created_time,
    updatedAt: page.last_edited_time,
    coverImage: await getHostedImageUrl(getNotionFileUrl(page.cover)),
    icon: getIconValue(page.icon),
    author:
      getPeopleProperty(page.properties, ["Author"]) ||
      getPlainTextProperty(page.properties, ["Author"]) ||
      siteConfig.author,
    tags: getMultiSelectProperty(page.properties, ["Tags", "Category", "Categories"]),
    featured: getCheckboxProperty(page.properties, ["Featured"]),
  };
}

async function queryPublishedPosts(filter?: DataSourceFilter) {
  const baseFilter: DataSourceFilter = {
    property: "Published",
    checkbox: {
      equals: true,
    },
  };
  const composedFilter = filter
    ? ({ and: [baseFilter, filter] } as DataSourceFilter)
    : baseFilter;

  return notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_ID,
    filter: composedFilter,
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });
}

export const getPublishedPosts = cache(async () => {
  const response = await queryPublishedPosts();
  const posts = await Promise.all(
    response.results.map((page) => mapPageToSummary(page as NotionPage)),
  );

  return posts.filter((post): post is BlogPostSummary => Boolean(post));
});

export const getPosts = getPublishedPosts;

export const getPostBySlug = cache(async (slug: string) => {
  const response = await queryPublishedPosts({
    property: "Slug",
    rich_text: {
      equals: slug,
    },
  });

  const page = response.results[0] as NotionPage | undefined;

  if (!page) {
    return null;
  }

  const summary = await mapPageToSummary(page);

  if (!summary) {
    return null;
  }

  const content = await getBlogContentByPageId(summary.id);

  return {
    ...summary,
    readingTime: content.readingTime,
    canonicalUrl: `${siteConfig.url}/blog/${summary.slug}`,
  } satisfies BlogPost;
});

export async function getRecentPosts(limit = 4, excludeSlug?: string) {
  const posts = await getPublishedPosts();

  return posts
    .filter((post) => post.slug !== excludeSlug)
    .slice(0, limit);
}
