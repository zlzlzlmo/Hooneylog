import { describe, it, expect } from 'vitest';
import GithubSlugger from 'github-slugger';
import { extractToc, readingTime } from './toc';

describe('extractToc', () => {
  it('extracts h2 and h3 with text and depth, ignoring h1 and h4', () => {
    const md = '# Title\n\n## 설치\n\ntext\n\n### 옵션\n\n#### 무시\n';
    const toc = extractToc(md);
    expect(toc).toEqual([
      { depth: 2, text: '설치', slug: '설치' },
      { depth: 3, text: '옵션', slug: '옵션' },
    ]);
  });

  it('generates slugs matching github-slugger for duplicate headings', () => {
    const md = '## Setup\n\n## Setup\n';
    const slugger = new GithubSlugger();
    const expected = [slugger.slug('Setup'), slugger.slug('Setup')];
    expect(extractToc(md).map((t) => t.slug)).toEqual(expected);
  });

  it('ignores headings inside fenced code blocks', () => {
    const md = '## Real\n\n```\n## NotAHeading\n```\n';
    expect(extractToc(md).map((t) => t.text)).toEqual(['Real']);
  });
});

describe('readingTime', () => {
  it('returns at least 1 minute for short content', () => {
    expect(readingTime('짧은 글')).toBe(1);
  });

  it('computes ~500 chars per minute, excluding code blocks', () => {
    const prose = '가'.repeat(1000);
    const code = '\n```js\n' + 'x'.repeat(5000) + '\n```\n';
    expect(readingTime(prose + code)).toBe(2);
  });
});
