import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { HomePageClient } from './home-page-client';
import { viewsService } from '@/services/views';
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
});
