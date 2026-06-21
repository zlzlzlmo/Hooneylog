/**
 * Next.js Data Cache tags for Notion-backed content.
 * Shared by the cached data accessors (lib/notion.ts) and the
 * on-demand revalidation route (app/api/revalidate) so they stay in sync.
 */
export const POSTS_TAG = 'notion-posts';
export const POST_BLOCKS_TAG = 'notion-post-blocks';
