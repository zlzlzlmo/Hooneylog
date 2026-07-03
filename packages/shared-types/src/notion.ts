import { BlockObjectResponse, RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

// Re-export specific Notion types for use across the monorepo
export type { BlockObjectResponse, RichTextItemResponse };

// DTOs for client-server communication
export interface ITag {
  id: string;
  name: string;
}

export interface NotionPost {
  id: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  tags: ITag[];
  title: string;
}

// Raw Notion API Types (used mainly in server or server-components).
// Fields are optional because the mapper reads every one defensively with
// optional chaining — the type should not claim a presence it never verifies.
export interface INotionProperties {
  category?: {
    multi_select: { name: string }[];
  };
  tag?: {
    multi_select: { id: string; name: string }[];
  };
  created_date?: {
    created_time: string;
  };
  description?: {
    rich_text: {
      plain_text: string;
    }[];
  };
  이름?: {
    title: { plain_text: string }[];
  };
}

export interface IRawNotionPost {
  id: string;
  last_edited_time: string;
  properties: INotionProperties;
}
