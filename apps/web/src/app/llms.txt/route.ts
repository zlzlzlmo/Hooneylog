import { getAllPosts } from '@/lib/notion';

// Speculative, low-cost AI-discovery convention (llmstxt.org). Generated from
// Notion like feed.xml/sitemap so it never goes stale. No major AI vendor has
// confirmed they read it as of 2026 — treat as a bonus, not a ranking factor.
const SITE = 'https://hooneylog.com';

export async function GET(): Promise<Response> {
  const posts = await getAllPosts();

  // Group posts under their category for a scannable, sectioned index.
  const byCategory = new Map<string, typeof posts>();
  for (const post of posts) {
    const key = post.category || '기타';
    const list = byCategory.get(key) ?? [];
    list.push(post);
    byCategory.set(key, list);
  }

  const sections = Array.from(byCategory.entries())
    .map(([category, list]) => {
      const items = list
        .map((post) => {
          const desc = post.description?.trim();
          return `- [${post.title}](${SITE}/post/${post.id})${desc ? `: ${desc}` : ''}`;
        })
        .join('\n');
      return `## ${category}\n\n${items}`;
    })
    .join('\n\n');

  const md = `# HooneyLog

> 막힌 지점부터 되짚는 기술 기록. 프론트엔드·백엔드·AI/RAG 개발 로그.

저자: Seunghoon Shin (Hooney) · 언어: 한국어

${sections}

## 더 보기

- [RSS 피드](${SITE}/feed.xml)
- [사이트맵](${SITE}/sitemap.xml)
`;

  return new Response(md, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
