const { Client } = require('@notionhq/client');
const { markdownToBlocks } = require('@tryfabric/martian');

const NOTION_API_KEY = process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) {
  console.error('❌ Error: NOTION_API_KEY is not set.');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

async function updatePost(pageId, title, markdownContent, category, tagsJson) {
  try {
    const tags = JSON.parse(tagsJson || '[]');
    const blocks = markdownToBlocks(markdownContent);
    const tagOptions = tags.map(tag => ({ name: tag }));

    // 1. Update properties
    const cleanDescription = markdownContent
      .replace(/[#*>`]/g, '') // Remove MD markers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Keep link text, remove URL
      .substring(0, 160)
      .trim()
      .replace(/\n/g, ' ') + '...';

    await notion.pages.update({
      page_id: pageId,
      properties: {
        '이름': {
          title: [{ text: { content: title } }],
        },
        'status': {
          select: { name: 'published' },
        },
        'category': {
          multi_select: category ? [{ name: category }] : [],
        },
        'tag': {
          multi_select: tagOptions,
        },
        'description': {
          rich_text: [{ text: { content: cleanDescription } }],
        }
      },
    });

    // 2. Delete existing blocks
    const existingBlocks = await notion.blocks.children.list({ block_id: pageId });
    for (const block of existingBlocks.results) {
      await notion.blocks.delete({ block_id: block.id });
    }

    // 3. Append new blocks
    // Notion has a limit of 100 blocks per request
    for (let i = 0; i < blocks.length; i += 100) {
      const batch = blocks.slice(i, i + 100);
      await notion.blocks.children.append({
        block_id: pageId,
        children: batch,
      });
    }

    console.log(`✅ Successfully updated Notion page: ${pageId}`);
  } catch (error) {
    console.error('❌ Error updating Notion page:', error.message);
    process.exit(1);
  }
}

const [,, pageId, title, content, category, tags] = process.argv;
if (!pageId || !title || !content) {
  console.error('Usage: node update_notion_post.js <pageId> <title> <content> [category] [tags]');
  process.exit(1);
}

updatePost(pageId, title, content, category, tags);
