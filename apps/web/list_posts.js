const { Client } = require('@notionhq/client');

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const notion = new Client({ auth: NOTION_API_KEY });

async function listPosts() {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    page_size: 10,
  });

  const posts = response.results.map(page => ({
    id: page.id,
    title: page.properties['이름']?.title[0]?.plain_text || 'Untitled',
    category: page.properties['category']?.multi_select[0]?.name || 'Uncategorized',
    tags: page.properties['tag']?.multi_select.map(t => t.name) || [],
  }));

  console.log(JSON.stringify(posts, null, 2));
}

listPosts();
