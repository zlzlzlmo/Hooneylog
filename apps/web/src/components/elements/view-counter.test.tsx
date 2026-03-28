import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { ViewCounter } from './view-counter';

// Mock fetch
global.fetch = vi.fn();

describe('ViewCounter Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders initial views correctly', () => {
    render(<ViewCounter slug="test-post" initialViews={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calls increment API exactly once on mount and updates the view count optimistically', async () => {
    const mockResponse = { views: 11 };
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<ViewCounter slug="test-post" initialViews={10} />);

    // API should be called once with POST
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/views/test-post', {
      method: 'POST',
    });

    // We optimistically update to 11 right away in the UI
    await waitFor(() => {
      expect(screen.getByText('11')).toBeInTheDocument();
    });
  });

  it('does not increment multiple times on re-render (Strict Mode simulation)', () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ views: 11 }),
    });

    const { rerender } = render(<ViewCounter slug="test-post" initialViews={10} />);
    
    // Simulate a re-render like Strict Mode does
    rerender(<ViewCounter slug="test-post" initialViews={10} />);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to initial view count if API fails', async () => {
    (global.fetch as Mock).mockRejectedValueOnce(new Error('Network Error'));

    // Console.error will be called, let's mock it to keep test output clean
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ViewCounter slug="test-post" initialViews={10} />);

    // Should still show 10 (since optimistic update might have changed it, we should revert it if failed, or just assume it stays 10 if we increment AFTER success or just catch the error and do nothing)
    // Actually, optimistic UI usually adds 1, and if it fails, reverts to initial.
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
