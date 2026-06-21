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
});
