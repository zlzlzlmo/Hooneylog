import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt?: string } & Record<string, unknown>) =>
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ''} {...props} />,
}));

import NotFound from './not-found';

describe('NotFound', () => {
  it('treats the illustration as decorative (empty alt)', () => {
    const { container } = render(<NotFound />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('');
  });

  it('offers home and all-posts recovery links', () => {
    render(<NotFound />);
    expect(screen.getByRole('link', { name: '홈으로 돌아가기' })).toHaveAttribute('href', '/');
  });
});
