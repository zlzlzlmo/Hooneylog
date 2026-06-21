import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Search } from './search';

describe('Search', () => {
  it('exposes the input as a labelled searchbox', () => {
    render(<Search searchValue="" handleSearchValue={vi.fn()} />);
    expect(screen.getByRole('searchbox', { name: '포스트 검색' })).toBeInTheDocument();
  });

  it('shows a clear button only when there is a value and clears on click', async () => {
    const handle = vi.fn();
    const { rerender } = render(<Search searchValue="" handleSearchValue={handle} />);
    expect(screen.queryByRole('button', { name: '검색어 지우기' })).toBeNull();

    rerender(<Search searchValue="react" handleSearchValue={handle} />);
    await userEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));
    expect(handle).toHaveBeenCalledWith('');
  });
});
