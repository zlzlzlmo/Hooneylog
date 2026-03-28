import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock, afterEach } from 'vitest';
import { ViewCounter } from './view-counter';
import { viewsService } from '@/services/views';

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
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders initial views correctly', () => {
    render(<ViewCounter slug="test-post" initialViews={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calls increment API when slug is not in sessionStorage and updates views', async () => {
    (viewsService.incrementPostView as Mock).mockResolvedValueOnce(11);

    render(<ViewCounter slug="test-post" initialViews={10} />);

    // API should be called to increment
    expect(viewsService.incrementPostView).toHaveBeenCalledTimes(1);
    expect(viewsService.incrementPostView).toHaveBeenCalledWith('test-post');
    
    // getPostView should NOT be called
    expect(viewsService.getPostView).not.toHaveBeenCalled();

    // UI should update to 11
    await waitFor(() => {
      expect(screen.getByText('11')).toBeInTheDocument();
    });

    // Session storage should now contain the slug
    expect(JSON.parse(sessionStorage.getItem('viewed_posts') || '[]')).toContain('test-post');
  });

  it('does NOT call increment API if slug is already in sessionStorage, but fetches current count', async () => {
    // Setup session storage as if user already visited
    sessionStorage.setItem('viewed_posts', JSON.stringify(['test-post']));
    
    // Setup mock for getPostView (maybe someone else incremented it, so we fetch latest)
    (viewsService.getPostView as Mock).mockResolvedValueOnce(15);

    render(<ViewCounter slug="test-post" initialViews={10} />);

    // Increment API should NOT be called
    expect(viewsService.incrementPostView).not.toHaveBeenCalled();

    // GET API should be called instead to get fresh count
    expect(viewsService.getPostView).toHaveBeenCalledTimes(1);
    expect(viewsService.getPostView).toHaveBeenCalledWith('test-post');

    // UI should update to the fetched count (15)
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  it('handles strict mode double-firing without duplicate increment calls', async () => {
    (viewsService.incrementPostView as Mock).mockResolvedValue(12);

    const { rerender } = render(<ViewCounter slug="strict-post" initialViews={10} />);
    
    // Simulate React Strict Mode double render
    rerender(<ViewCounter slug="strict-post" initialViews={10} />);

    // Should only call increment once
    expect(viewsService.incrementPostView).toHaveBeenCalledTimes(1);
  });
});
