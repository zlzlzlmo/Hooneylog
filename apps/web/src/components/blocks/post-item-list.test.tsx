import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NotionPost } from '@hooneylog/shared-types';

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt?: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ''} {...props} />
  ),
}));

import { PostItemList } from './post-item-list';

describe('PostItemList empty state', () => {
  it('echoes the active query and offers a reset action', async () => {
    const onReset = vi.fn();
    render(<PostItemList posts={[]} query="그래프큐엘" onReset={onReset} />);
    expect(screen.getByText(/그래프큐엘'에 대한 검색 결과가 없어요\./)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '전체 글 보기' }));
    expect(onReset).toHaveBeenCalled();
  });

  it('shows a friendly message when there are no posts and no query', () => {
    render(<PostItemList posts={[]} />);
    expect(screen.getByText('아직 글이 없어요.')).toBeInTheDocument();
  });

  it('renders posts without errors', () => {
    const posts = [
      {
        id: 'test-id-1',
        title: 'Test Post',
        category: 'Tech',
        description: 'A test post description',
        createdAt: '2024-01-01',
        slug: 'test-post',
      },
    ] as unknown as NotionPost[];
    render(<PostItemList posts={posts} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('falls back to 미분류 when a post has no category', () => {
    const posts = [
      {
        id: 'test-id-2',
        title: 'Uncategorized Post',
        category: '',
        description: 'No category here',
        createdAt: '2024-01-01',
        slug: 'uncategorized-post',
      },
    ] as unknown as NotionPost[];
    render(<PostItemList posts={posts} />);
    expect(screen.getByText('미분류')).toBeInTheDocument();
  });
});
