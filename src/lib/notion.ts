import { Client } from "@notionhq/client";
import { getRequiredEnv } from "@/lib/env";

export const notion = new Client({
  auth: getRequiredEnv("NOTION_API_KEY"),
});

export const NOTION_DATA_SOURCE_ID = getRequiredEnv("NOTION_DATA_SOURCE_ID");
