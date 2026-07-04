import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from './header';

describe('Header', () => {
  it('home link is labelled for the blog, not Notion', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /hooneylog/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('links category nav to the home category filter (not the tag route)', () => {
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: '카테고리' });
    expect(nav).toBeInTheDocument();
    // Categories are a home-page filter, not tags. Nav must point at the home
    // filter via ?category=<real category name>, or it lands on an empty page.
    expect(screen.getByRole('link', { name: 'frontend' })).toHaveAttribute('href', '/?category=Frontend');
    expect(screen.getByRole('link', { name: 'backend' })).toHaveAttribute('href', '/?category=Backend');
    expect(screen.getByRole('link', { name: 'ai' })).toHaveAttribute('href', '/?category=Artificial%20Intelligence');
  });
});
