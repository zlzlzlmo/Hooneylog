import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppLayout } from './app-layout';

// SiteFooter is an async, cached server component — it can't render in jsdom, and
// this suite only cares about the skip link and the main landmark.
vi.mock('@/components/layout/site-footer', () => ({ SiteFooter: () => <footer /> }));

describe('AppLayout', () => {
  it('renders a skip link targeting the main content', () => {
    render(<AppLayout>hi</AppLayout>);
    const link = screen.getByRole('link', { name: '본문으로 건너뛰기' });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('main landmark has the matching id', () => {
    render(<AppLayout>hi</AppLayout>);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });
});
