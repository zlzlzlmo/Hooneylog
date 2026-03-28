import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock, afterEach } from 'vitest';
import { ViewCounter } from './view-counter';
import { viewsService } from '@/services/views';
import React from 'react';

// Mock useLayoutEffect to be a normal useEffect for Node/jsdom environments
// to prevent "useLayoutEffect does nothing on the server" warnings in test output
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof React>('react');
  return {
    ...actual,
    useLayoutEffect: actual.useEffect,
  };
});

// Mock the services
vi.mock('@/services/views', () => ({
  viewsService: {
    incrementPostView: vi.fn(),
    getPostView: vi.fn(),
  },
}));

describe('ViewCounter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('optimistically increments UI immediately (no blinking) if post is unread', async () => {
    (viewsService.incrementPostView as Mock).mockResolvedValueOnce(11);
    
    // Mount the component
    render(<ViewCounter slug="test-post" initialViews={10} />);

    // IMMEDIATELY on mount, before API resolves, it should show 11 (because useLayoutEffect applied +1)
    expect(screen.getByText('11')).toBeInTheDocument();

    // Eventually API finishes
    await waitFor(() => {
      expect(viewsService.incrementPostView).toHaveBeenCalledTimes(1);
    });
  });

  it('does NOT optimistically increment if post is already in sessionStorage', async () => {
    sessionStorage.setItem('viewed_posts', JSON.stringify(['test-post']));
    (viewsService.getPostView as Mock).mockResolvedValueOnce(15);

    render(<ViewCounter slug="test-post" initialViews={10} />);

    // IMMEDIATELY on mount, it should NOT add 1. It should stay 10 initially.
    expect(screen.getByText('10')).toBeInTheDocument();

    // Then, after GET API finishes, it updates to true latest (15)
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
    });
    
    expect(viewsService.incrementPostView).not.toHaveBeenCalled();
  });

  it('rolls back to initial views if increment API fails', async () => {
    // Make API return null (simulate failure)
    (viewsService.incrementPostView as Mock).mockResolvedValueOnce(null);

    render(<ViewCounter slug="test-post" initialViews={10} />);

    // Immediately shows 11 (optimistic)
    expect(screen.getByText('11')).toBeInTheDocument();

    // After API fails, rolls back to 10
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('handles strict mode double-firing safely', async () => {
    (viewsService.incrementPostView as Mock).mockResolvedValue(12);

    const { rerender } = render(<ViewCounter slug="strict-post" initialViews={10} />);
    rerender(<ViewCounter slug="strict-post" initialViews={10} />);

    expect(viewsService.incrementPostView).toHaveBeenCalledTimes(1);
  });
});
