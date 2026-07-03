import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyButton } from './copy-button';

describe('CopyButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('writes the code to the clipboard and shows a copied state on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<CopyButton code="const x = 1;" />);

    const button = screen.getByRole('button', { name: '코드 복사' });
    await userEvent.click(button);

    expect(writeText).toHaveBeenCalledWith('const x = 1;');
    expect(screen.getByRole('button', { name: '복사됨' })).toBeInTheDocument();
  });
});
