import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppLayout } from './app-layout';

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
