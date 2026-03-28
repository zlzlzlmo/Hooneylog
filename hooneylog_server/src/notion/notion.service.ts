import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { INotionPost } from 'src/common/interface';
import NotionBlock from 'src/common/notionBlock';

@Injectable()
export class NotionService {
  private readonly notion: Client;
  private readonly databaseId = process.env.PUBLIC_NOTION_DATABASE ?? '';

  constructor() {
    this.notion = new Client({
      auth: process.env.PUBLIC_NOTION_KEY,
    });
  }

  async getDatabase(): Promise<INotionPost[]> {
    // const status =
    //   process.env.NODE_ENV === 'production' ? 'published' : 'ready';
    const response = await this.notion.databases.query({
      database_id: this.databaseId,
      filter: {
        property: 'status',
        select: {
          equals: 'published',
        },
      },
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    });

    return response.results as unknown as INotionPost[];
  }

  async getAllPost() {
    const notionList = await this.getDatabase();
    const result = notionList.map(({ id, properties }) => {
      const block = new NotionBlock(properties);
      const { title, tags, createdAt, category, description } = block;
      return {
        id,
        title,
        tags,
        createdAt,
        category,
        description,
      };
    });
    return result;
  }

  async getPostById(postId: string) {
    return (await this.getAllPost()).find(({ id }) => id === postId);
  }

  async getBlocksById(id: string) {
    const blocks = [];
    let cursor: any;

    while (true) {
      const { results, next_cursor } = await this.notion.blocks.children.list({
        block_id: id,
        start_cursor: cursor,
      });
      blocks.push(...results);
      if (!next_cursor) {
        break;
      }

      cursor = next_cursor;
    }

    const result = blocks.map((block) => {
      const { id, type } = block;

      return {
        id,
        type,
        [type]: block[type],
      };
    });

    return result;
  }
}
