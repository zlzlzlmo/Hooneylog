import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render, cleanup } from 'vitest-browser-react';

import { AppLayout } from '@/components/layout/app-layout';
import { Blog37, type Blog37Post } from '@/components/blog37';
import { Blogpost4 } from '@/components/blogpost4';
import { MarkdownRenderer } from '@/components/blocks/post-detail/markdown-renderer';
import { ShareButtons } from '@/components/blocks/post-detail/share-buttons';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { extractToc } from '@/utils/toc';
import { formatDate } from '@/utils/date';
import { auditLayout } from './layout-assertions';
import { MARKDOWN, POSTS } from './fixtures';

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

function Feed(props: { onSelectCategory?: () => void; onSearchChange?: () => void }) {
  return (
    <Blog37
      heading="막힌 지점부터 되짚는 기술 기록."
      description="풀스택 개발자"
      categories={[
        { label: '전체', value: '전체', count: 8 },
        { label: 'Frontend', value: 'Frontend', count: 3 },
      ]}
      selectedCategory="전체"
      onSelectCategory={props.onSelectCategory ?? (() => {})}
      searchValue=""
      onSearchChange={props.onSearchChange ?? (() => {})}
      posts={feedPosts}
      resultCount={feedPosts.length}
      remaining={4}
      onLoadMore={() => {}}
      onReset={() => {}}
      stats={{ total: 1234567, today: 890 }}
    />
  );
}

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('theme');
});

describe('홈 피드', () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
  });

  test('카테고리 버튼이 선택을 올려보낸다', async () => {
    const onSelectCategory = vi.fn();
    render(<Feed onSelectCategory={onSelectCategory} />);

    await userEvent.click(page.getByRole('button', { name: /Frontend/ }));

    expect(onSelectCategory).toHaveBeenCalledWith('Frontend');
  });

  test('검색 입력이 상위로 전달된다', async () => {
    const onSearchChange = vi.fn();
    render(<Feed onSearchChange={onSearchChange} />);

    await userEvent.fill(page.getByRole('searchbox', { name: '포스트 검색' }), '스트리밍');

    expect(onSearchChange).toHaveBeenCalled();
  });

  test('활성 카테고리는 aria-pressed 로 노출된다', async () => {
    render(<Feed />);

    await expect
      .element(page.getByRole('button', { name: /전체/ }))
      .toHaveAttribute('aria-pressed', 'true');
  });
});

describe('헤더', () => {
  test('모바일에서 메뉴를 열면 카테고리 링크가 보이고 레이아웃이 버틴다', async () => {
    await page.viewport(375, 812);
    render(<AppLayout>본문</AppLayout>);

    await userEvent.click(page.getByRole('button', { name: '메뉴 열기' }));

    // The menu renders in a portal, and the footer repeats the same links, so
    // scope the assertion to the popover itself.
    await expect
      .element(page.getByRole('dialog').getByRole('link', { name: 'Frontend' }))
      .toBeVisible();
    auditLayout(document.body, 375);
  });

  test('데스크톱에서는 카테고리가 항상 보인다', async () => {
    await page.viewport(1280, 800);
    render(<AppLayout>본문</AppLayout>);

    await expect
      .element(page.getByRole('banner').getByRole('link', { name: 'Backend' }))
      .toBeVisible();
  });
});

describe('테마 토글', () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
  });

  test('다크를 고르면 html 에 dark 클래스가 붙고 저장된다', async () => {
    render(<ThemeToggle />);

    await userEvent.click(page.getByRole('radio', { name: '다크 모드' }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('시스템을 고르면 저장값이 지워진다', async () => {
    render(<ThemeToggle />);

    await userEvent.click(page.getByRole('radio', { name: '다크 모드' }));
    await userEvent.click(page.getByRole('radio', { name: '시스템 설정 따르기' }));

    expect(localStorage.getItem('theme')).toBeNull();
  });
});

describe('포스트 상세', () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
  });

  test('목차 링크가 본문 heading 의 id 와 맞물린다', async () => {
    const post = POSTS[0]!;
    const toc = extractToc(MARKDOWN);

    render(
      <Blogpost4
        crumbs={[{ label: post.category, href: '/' }, { label: post.title }]}
        title={post.title}
        author={{ name: 'Seunghoon Shin', avatar: '/images/profile.png', fallback: '승훈' }}
        meta={<span>meta</span>}
        toc={toc}
        share={<ShareButtons title={post.title} slug={post.id} />}
      >
        <MarkdownRenderer content={MARKDOWN} />
      </Blogpost4>,
    );

    for (const item of toc) {
      await expect.element(page.getByRole('heading', { name: item.text })).toBeInTheDocument();
      expect(document.getElementById(item.slug), `heading #${item.slug} is missing`).not.toBeNull();
    }
  });

  test('본문에 typography(prose) 스타일이 실제로 적용된다', async () => {
    render(<MarkdownRenderer content={MARKDOWN} />);

    // Not the first child: prose zeroes the leading margin there.
    const heading = page.getByRole('heading', { name: '결론' });
    await expect.element(heading).toBeInTheDocument();

    // Registering @tailwindcss/typography is easy to lose; without it the post
    // body renders as unstyled HTML and nothing else in the suite would notice.
    const el = heading.element() as HTMLElement;
    const style = getComputedStyle(el);
    expect(Number(style.fontWeight), 'prose heading weight').toBeGreaterThan(400);
    expect(parseFloat(style.marginTop), 'prose heading rhythm').toBeGreaterThan(0);

    const quote = document.querySelector('blockquote');
    expect(quote, 'blockquote rendered').not.toBeNull();
    expect(
      parseFloat(getComputedStyle(quote!).borderLeftWidth),
      'prose blockquote rule',
    ).toBeGreaterThan(0);
  });

  test('링크 복사 버튼이 글 주소를 클립보드에 넣는다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      'navigator',
      new Proxy(navigator, {
        get: (target, key) => (key === 'clipboard' ? { writeText } : Reflect.get(target, key)),
      }),
    );

    render(<ShareButtons title="제목" slug="post-0" />);
    await userEvent.click(page.getByRole('button', { name: '링크 복사' }));

    expect(writeText).toHaveBeenCalledWith('https://hooneylog.com/post/post-0');
    vi.unstubAllGlobals();
  });
});
