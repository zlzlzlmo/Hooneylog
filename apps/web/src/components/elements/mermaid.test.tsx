import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
  },
}));

import { Mermaid } from './mermaid';

describe('Mermaid', () => {
  it('exposes an accessible name on the expand button', () => {
    render(<Mermaid content="graph TD; A-->B" />);
    expect(screen.getByRole('button', { name: '다이어그램 확대' })).toBeInTheDocument();
  });

  it('reserves vertical space on the diagram container to avoid layout shift', () => {
    const { container } = render(<Mermaid content="graph TD; A-->B" />);
    const reserved = container.querySelector('.min-h-\\[200px\\]');
    expect(reserved).not.toBeNull();
  });
});
