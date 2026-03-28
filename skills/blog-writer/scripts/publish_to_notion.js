const { Client } = require('@notionhq/client');
const { markdownToBlocks } = require('@tryfabric/martian');

// Fetch environment variables from the environment
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY || !DATABASE_ID) {
  console.error('❌ Error: NOTION_API_KEY or NOTION_DATABASE_ID is not set.');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

async function publish(title, markdownContent, category, tagsJson) {
  try {
    const tags = JSON.parse(tagsJson || '[]');
    const blocks = markdownToBlocks(markdownContent);
    const tagOptions = tags.map(tag => ({ name: tag }));

    // Clean up markdown for the description (strip #, *, >)
    const cleanDescription = markdownContent
      .replace(/[#*>`]/g, '') // Remove MD markers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Keep link text, remove URL
      .substring(0, 160)
      .trim()
      .replace(/\n/g, ' ') + '...';

    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
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
      children: blocks,
    });

    console.log(`✅ Successfully published to Notion! URL: ${response.url}`);
  } catch (error) {
    console.error('❌ Error publishing to Notion:', error.message);
    process.exit(1);
  }
}

const [,, title, content, category, tags] = process.argv;
publish(title, content, category, tags);
