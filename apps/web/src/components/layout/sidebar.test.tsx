import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt?: string } & Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt ?? ''} {...props} />;
  },
}));

import { Sidebar } from './sidebar';

const categories: [string, number][] = [['React', 12], ['CSS', 3]];

describe('Sidebar', () => {
  it('marks the active category with aria-pressed=true', () => {
    render(
      <Sidebar categories={categories} currentActiveCategory="React"
        handleCurrentActiveCategory={vi.fn()} />
    );
    const active = screen.getByRole('button', { name: /React/ });
    expect(active).toHaveAttribute('aria-pressed', 'true');
    const inactive = screen.getByRole('button', { name: /CSS/ });
    expect(inactive).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows the post count for each category', () => {
    render(
      <Sidebar categories={categories} currentActiveCategory="React"
        handleCurrentActiveCategory={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /React/ })).toHaveTextContent('12');
  });

  it('labels the category list as a group', () => {
    render(
      <Sidebar categories={categories} currentActiveCategory="React"
        handleCurrentActiveCategory={vi.fn()} />
    );
    expect(screen.getByRole('list', { name: '카테고리 필터' })).toBeInTheDocument();
  });

  it('uses Korean labels for the category section heading', () => {
    render(
      <Sidebar categories={categories} currentActiveCategory="React"
        handleCurrentActiveCategory={vi.fn()} />
    );
    expect(screen.getByText('카테고리')).toBeInTheDocument();
  });

  it('uses Korean labels for the blog stats', () => {
    render(
      <Sidebar categories={categories} currentActiveCategory="React"
        handleCurrentActiveCategory={vi.fn()} stats={{ total: 1234, today: 56 }} />
    );
    expect(screen.getByText('총 조회수')).toBeInTheDocument();
    expect(screen.getByText('오늘')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+56')).toBeInTheDocument();
  });

  it('gives the active category an accent indicator distinct from hover', () => {
    render(
      <Sidebar categories={categories} currentActiveCategory="React"
        handleCurrentActiveCategory={vi.fn()} />
    );
    const active = screen.getByRole('button', { name: /React/ });
    expect(active.className).toMatch(/border-accent/);
    expect(active.className).toMatch(/text-accent/);
    const inactive = screen.getByRole('button', { name: /CSS/ });
    expect(inactive.className).not.toMatch(/border-accent/);
  });

  it('gives category buttons a visible focus ring (a11y)', () => {
    render(
      <Sidebar categories={categories} currentActiveCategory="React"
        handleCurrentActiveCategory={vi.fn()} />
    );
    const active = screen.getByRole('button', { name: /React/ });
    expect(active.className).toMatch(/focus-visible:ring-accent/);
  });
});
