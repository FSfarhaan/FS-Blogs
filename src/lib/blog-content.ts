export type BlogTextBlock = {
  type: "text";
  content: string;
};

export type BlogHeadingBlock = {
  type: "heading";
  level: 1 | 2 | 3;
  content: string;
};

export type BlogImageBlock = {
  type: "image";
  url: string;
  alt: string;
  caption?: string;
};

export type BlogBulletedListBlock = {
  type: "bulleted_list";
  items: string[];
};

export type BlogNumberedListBlock = {
  type: "numbered_list";
  items: string[];
};

export type BlogCodeBlock = {
  type: "code";
  code: string;
  language: string;
  caption?: string;
};

export type BlogContentBlock =
  | BlogTextBlock
  | BlogHeadingBlock
  | BlogImageBlock
  | BlogBulletedListBlock
  | BlogNumberedListBlock
  | BlogCodeBlock;

export type BlogContentResponse = {
  pageId: string;
  blocks: BlogContentBlock[];
  wordCount: number;
  readingTime: string;
  generatedAt: string;
};
