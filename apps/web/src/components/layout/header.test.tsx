import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from './header';

describe('Header', () => {
  it('home link is labelled for the blog, not Notion', () => {
    render(<Header />);
    const link = screen.getByRole('link', { name: /HooneyLog/ });
    expect(link).toHaveAttribute('href', '/');
  });

  it('uses a monogram mark with accessible text', () => {
    render(<Header />);
    expect(screen.getByText('H')).toBeInTheDocument();
  });
});
