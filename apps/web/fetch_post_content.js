/* eslint-disable */
const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');

const NOTION_API_KEY = process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) {
  console.error('NOTION_API_KEY is not set');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

async function fetchPost(pageId) {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    
    const title = page.properties['이름']?.title[0]?.plain_text || 'Untitled';
    const category = page.properties['category']?.multi_select[0]?.name || 'Uncategorized';
    const tags = page.properties['tag']?.multi_select.map(t => t.name) || [];

    console.log(JSON.stringify({
      title,
      category,
      tags,
      content: mdString.parent
    }, null, 2));
  } catch (error) {
    console.error('Error fetching post:', error.message);
    process.exit(1);
  }
}

const pageId = process.argv[2];
if (!pageId) {
  console.error('Usage: node fetch_post_content.js <pageId>');
  process.exit(1);
}

fetchPost(pageId);
