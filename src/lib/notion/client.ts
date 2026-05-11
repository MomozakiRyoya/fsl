import { Client } from "@notionhq/client";

const apiKey = process.env.NOTION_API_KEY;
if (!apiKey) {
  throw new Error("NOTION_API_KEY is not configured");
}

export const notion = new Client({
  auth: apiKey,
});
