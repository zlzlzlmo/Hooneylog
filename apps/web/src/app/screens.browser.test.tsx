import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import { render, cleanup } from 'vitest-browser-react';

import { AppLayout } from '@/components/layout/app-layout';
import { Blog37, type Blog37Post } from '@/components/blog37';
import { Blog29, type Blog29Post } from '@/components/blog29';
import { Blog19, type Blog19Item } from '@/components/blog19';
import { Blogpost4 } from '@/components/blogpost4';
import { MarkdownRenderer } from '@/components/blocks/post-detail/markdown-renderer';
import { MoveToAnotherPost } from '@/components/blocks/post-detail/move-to-another-post';
import { ShareButtons } from '@/components/blocks/post-detail/share-buttons';
import { TagList } from '@/components/elements/tag-list';
import NotFound from './not-found';
import HomeLoading from './loading';
import PostLoading from './post/[slug]/loading';
import { extractToc, readingTime } from '@/utils/toc';
import { formatDate } from '@/utils/date';
import { auditLayout, pageColors, VIEWPORTS } from '@/test/layout-assertions';
import { MARKDOWN, POSTS } from '@/test/fixtures';

const toc = extractToc(MARKDOWN);

const feedPosts: Blog37Post[] = POSTS.map((post, index) => ({
  id: post.id,
  title: post.title,
  summary: post.description,
  label: post.category,
  published: formatDate(post.createdAt),
  url: `/post/${post.id}`,
  image: '/images/react.png',
  imageIsFallback: index % 3 === 0,
  views: index * 1234,
}));

const feedCategories = [
  { label: '전체', value: '전체', count: POSTS.length },
  { label: 'Frontend', value: 'Frontend', count: 3 },
  { label: 'Backend', value: 'Backend', count: 3 },
  { label: 'Artificial Intelligence', value: 'Artificial Intelligence', count: 2 },
];

const tagPosts: Blog29Post[] = POSTS.map((post) => ({
  href: `/post/${post.id}`,
  date: formatDate(post.createdAt),
  title: post.title,
  content: post.description,
  tags: post.tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    href: `/tag/${encodeURIComponent(tag.name)}`,
  })),
}));

const relatedItems: Blog19Item[] = POSTS.slice(0, 4).map((post) => ({
  id: post.id,
  title: post.title,
  description: post.description,
  date: formatDate(post.createdAt),
  category: post.category,
  link: `/post/${post.id}`,
}));

function Home({ empty = false, searching = false }: { empty?: boolean; searching?: boolean }) {
  return (
    <AppLayout>
      <Blog37
        heading="막힌 지점부터 되짚는 기술 기록."
        description="프론트엔드에서 백엔드·인프라까지, 제품을 끝까지 만드는 풀스택 개발자"
        categories={feedCategories}
        selectedCategory="전체"
        onSelectCategory={() => {}}
        searchValue={searching ? '스트리밍' : ''}
        onSearchChange={() => {}}
        posts={empty ? [] : feedPosts}
        resultCount={empty ? 0 : feedPosts.length}
        remaining={empty ? 0 : 4}
        onLoadMore={() => {}}
        onReset={() => {}}
        stats={{ total: 1234567, today: 890 }}
      />
    </AppLayout>
  );
}

function PostDetail() {
  const post = POSTS[0]!;
  return (
    <AppLayout>
      <Blogpost4
        crumbs={[
          { label: post.category, href: `/?category=${encodeURIComponent(post.category)}` },
          { label: post.title },
        ]}
        title={post.title}
        author={{ name: 'Seunghoon Shin', avatar: '/images/profile.png', fallback: '승훈' }}
        meta={
          <>
            <span className="tabular-nums">{formatDate(post.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">12,345 views</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">약 {readingTime(MARKDOWN)}분</span>
          </>
        }
        tags={<TagList tags={post.tags} />}
        toc={toc}
        share={<ShareButtons title={post.title} slug={post.id} />}
        footer={
          <>
            <MoveToAnotherPost previousPost={POSTS[1]!} nextPost={POSTS[2]!} />
            <Blog19 items={relatedItems} />
          </>
        }
      >
        <MarkdownRenderer content={MARKDOWN} />
      </Blogpost4>
    </AppLayout>
  );
}

const SCREENS = [
  { name: '홈 — 목록', ui: <Home /> },
  { name: '홈 — 검색 결과 없음', ui: <Home empty searching /> },
  {
    name: '홈 — 로딩 스켈레톤',
    ui: (
      <AppLayout>
        <HomeLoading />
      </AppLayout>
    ),
  },
  { name: '포스트 상세', ui: <PostDetail /> },
  {
    name: '포스트 — 로딩 스켈레톤',
    ui: (
      <AppLayout>
        <PostLoading />
      </AppLayout>
    ),
  },
  {
    name: '태그 페이지',
    ui: (
      <AppLayout>
        <Blog29
          eyebrow="tag / React"
          heading="#React"
          meta={`${tagPosts.length}개`}
          posts={tagPosts}
        />
      </AppLayout>
    ),
  },
  {
    name: '태그 페이지 — 빈 목록',
    ui: (
      <AppLayout>
        <Blog29 eyebrow="tag / Rust" heading="#Rust" meta="0개" posts={[]} />
      </AppLayout>
    ),
  },
  {
    name: '404',
    ui: (
      <AppLayout>
        <NotFound />
      </AppLayout>
    ),
  },
];

describe.each(VIEWPORTS)('$name ($width px)', ({ width, height }) => {
  beforeEach(async () => {
    await page.viewport(width, height);
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove('dark');
  });

  test.each(SCREENS)('$name — 잘림·넘침 없음', async ({ ui }) => {
    render(ui);
    await expect.element(page.getByRole('main')).toBeInTheDocument();
    auditLayout(document.body, width);
  });

  test.each(SCREENS)('$name — 다크 모드에서도 동일', async ({ ui }) => {
    render(ui);
    await expect.element(page.getByRole('main')).toBeInTheDocument();
    const light = pageColors();

    document.documentElement.classList.add('dark');
    const dark = pageColors();

    // `.dark` and `:root` have equal specificity, so a bad rule order silently
    // leaves the site in light mode. Prove the tokens actually swap.
    expect(dark.background, 'dark background must differ from light').not.toBe(light.background);
    expect(dark.foreground, 'dark foreground must differ from light').not.toBe(light.foreground);

    auditLayout(document.body, width);
  });
});
