import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Client } from '@notionhq/client';
import { createPost } from './lib/publish.js';
import { parseInput } from './lib/input.js';

function loadEnv() {
  // Resolve apps/web/.env.local from the repo root (assumes invocation from repo root).
  const envPath = path.resolve(process.cwd(), 'apps/web/.env.local');
  try {
    process.loadEnvFile(envPath);
  } catch {
    // Fall back to whatever is already in process.env.
  }
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node publish_to_notion.js <input.json>');
    process.exit(1);
  }

  loadEnv();
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!apiKey || !databaseId) {
    console.error('NOTION_API_KEY / NOTION_DATABASE_ID not found (checked apps/web/.env.local and process.env).');
    process.exit(1);
  }

  const input = parseInput(fs.readFileSync(inputPath, 'utf8'));
  const notion = new Client({ auth: apiKey });

  try {
    const result = await createPost(notion, databaseId, input);
    console.log(JSON.stringify(result));
  } catch (err) {
    if (err.pageUrl) {
      console.error(`Publish partially failed: page created at ${err.pageUrl} but ${err.message}. Fix or delete it in Notion.`);
    } else {
      console.error(`Publish failed: ${err.message}`);
    }
    process.exit(1);
  }
}

main();
