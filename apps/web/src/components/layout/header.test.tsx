import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from './header';

describe('Header', () => {
  it('home link is labelled for the blog, not Notion', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /hooneylog/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('exposes labelled category navigation', () => {
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: '카테고리' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'frontend' })).toHaveAttribute('href', '/tag/frontend');
    expect(screen.getByRole('link', { name: 'backend' })).toHaveAttribute('href', '/tag/backend');
    expect(screen.getByRole('link', { name: 'ai' })).toHaveAttribute('href', '/tag/ai');
  });
});
