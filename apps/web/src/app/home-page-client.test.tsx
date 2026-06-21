import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { HomePageClient } from './home-page-client';
import { viewsService } from '@/services/views';
import { ALL } from '@/utils/category';
import React from 'react';

// Mock the dependencies
vi.mock('@/services/views', () => ({
  viewsService: {
    getStats: vi.fn(),
    getMultipleCounts: vi.fn(),
  },
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img {...props} />
  ), // Simple mock for next/image
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('HomePageClient', () => {
  const mockInitialPosts = [
    {
      id: 'post-1',
      title: 'Test Post 1',
      category: 'React',
      createdAt: '2024-03-28T00:00:00Z',
      description: 'A test post',
      tags: [],
    },
  ];

  const initialStats = { total: 100, today: 10 };
  const initialViewsMap = { 'post-1': 5 };

  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom doesn't implement scrollIntoView; child components (Sidebar) may use it.
    Element.prototype.scrollIntoView = vi.fn();
    (viewsService.getStats as Mock).mockResolvedValue({ total: 100, today: 10 });
    (viewsService.getMultipleCounts as Mock).mockResolvedValue({ 'post-1': 5 });
  });

  it('fetches global stats without incrementing on mount', async () => {
    (viewsService.getStats as Mock).mockResolvedValue({ total: 100, today: 10 });
    (viewsService.getMultipleCounts as Mock).mockResolvedValue({ 'post-1': 5 });

    render(
      <HomePageClient
        initialPosts={mockInitialPosts}
        stats={initialStats}
        viewsMap={initialViewsMap}
      />
    );

    await waitFor(() => {
      // It should call getStats once, with { increment: false }
      expect(viewsService.getStats).toHaveBeenCalledTimes(1);
      expect(viewsService.getStats).toHaveBeenCalledWith({ increment: false });
    });

    await waitFor(() => {
      expect(viewsService.getMultipleCounts).toHaveBeenCalledTimes(1);
      expect(viewsService.getMultipleCounts).toHaveBeenCalledWith(['post-1']);
    });
  });

  it('does not crash and keeps rendering when the sync fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (viewsService.getStats as Mock).mockRejectedValue(new Error('network down'));
    (viewsService.getMultipleCounts as Mock).mockRejectedValue(new Error('network down'));

    render(
      <HomePageClient
        initialPosts={mockInitialPosts}
        stats={initialStats}
        viewsMap={initialViewsMap}
      />
    );

    // The hero heading should still render (component did not crash).
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('renders a single h1 hero heading', () => {
    render(
      <HomePageClient
        initialPosts={mockInitialPosts}
        stats={initialStats}
        viewsMap={initialViewsMap}
      />
    );

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('HooneyLog');
  });

  describe('debounced search count announcement', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('debounces the announced search result count', async () => {
      render(
        <HomePageClient
          initialPosts={mockInitialPosts}
          stats={initialStats}
          viewsMap={initialViewsMap}
        />
      );

      const input = screen.getByRole('searchbox');

      // The announced count is seeded from the initial filtered length (1).
      expect(screen.queryByText(/검색 결과 0개/)).not.toBeInTheDocument();

      act(() => {
        // Type a query that matches nothing -> filtered length becomes 0.
        fireEvent.change(input, { target: { value: 'zzzznomatch' } });
      });

      // Filtering is instant, but the announced count is still the pre-debounce value.
      expect(screen.queryByText(/검색 결과 0개/)).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(250);
      });

      // After the debounce settles, the announced count updates.
      expect(screen.getByText(/검색 결과 0개/)).toBeInTheDocument();
    });
  });

  describe('reset behavior', () => {
    it('resets both search and category via onReset', async () => {
      // Use a post set where filtering to an empty result is possible,
      // so PostItemList renders its empty-state reset button.
      const posts = [
        {
          id: 'post-1',
          title: 'Test Post 1',
          category: 'React',
          createdAt: '2024-03-28T00:00:00Z',
          description: 'A test post',
          tags: [],
        },
      ];

      render(
        <HomePageClient
          initialPosts={posts}
          stats={initialStats}
          viewsMap={initialViewsMap}
        />
      );

      const input = screen.getByRole('searchbox') as HTMLInputElement;

      // Type a query that matches nothing -> empty state with reset button.
      fireEvent.change(input, { target: { value: 'zzzznomatch' } });
      expect(input.value).toBe('zzzznomatch');

      // Find the reset button (rendered by PostItemList empty state).
      const resetButton = screen.getByText('전체 글 보기');
      fireEvent.click(resetButton);

      // Search input should be cleared (onReset clears search; it also resets category).
      await waitFor(() => {
        expect(input.value).toBe('');
      });

      // Empty state should be gone now that filters are reset.
      expect(screen.queryByText('전체 글 보기')).not.toBeInTheDocument();
    });
  });

  it('exports ALL as 전체 (contract sanity)', () => {
    expect(ALL).toBe('전체');
  });
});
