import GithubSlugger from 'github-slugger';

export type TocItem = { depth: 2 | 3; text: string; slug: string };

function stripCodeBlocks(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, '');
}

export function extractToc(markdown: string): TocItem[] {
  const body = stripCodeBlocks(markdown);
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  for (const line of body.split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match || match[1] === undefined || match[2] === undefined) continue;
    const depth = match[1].length as 2 | 3;
    const text = match[2].trim();
    items.push({ depth, text, slug: slugger.slug(text) });
  }

  return items;
}

export function readingTime(markdown: string): number {
  const text = stripCodeBlocks(markdown);
  const chars = text.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(chars / 500));
}
