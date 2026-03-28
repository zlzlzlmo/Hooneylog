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
  description: string;
  tags: ITag[];
  title: string;
}

// Raw Notion API Types (used mainly in server or server-components)
export interface INotionImage {
  files: {
    name: string;
    file?: { url: string };
    external?: { url: string };
  }[];
}

export interface INotionProperties {
  category: {
    multi_select: { name: string }[];
  };
  tag: {
    multi_select: { id: string; name: string }[];
  };
  created_date: {
    created_time: string;
  };
  description: {
    rich_text: {
      plain_text: string;
    }[];
  };
  image?: INotionImage;
  slug?: {
    rich_text: { plain_text: string }[];
  };
  이름: {
    title: { plain_text: string }[];
  };
}

export interface IRawNotionPost {
  id: string;
  properties: INotionProperties;
  results?: object[];
}
