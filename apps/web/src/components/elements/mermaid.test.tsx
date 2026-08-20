import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const { initializeMock, renderMock } = vi.hoisted(() => ({
  initializeMock: vi.fn(),
  renderMock: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
}));

vi.mock('mermaid', () => ({
  default: {
    initialize: initializeMock,
    render: renderMock,
  },
}));

import { Mermaid } from './mermaid';

describe('Mermaid', () => {
  // NOTE: keep this first — it asserts that importing the module did NOT eagerly
  // run mermaid.initialize() at module scope (the library is now lazy-loaded).
  it('does not initialize mermaid at import time', () => {
    expect(initializeMock).not.toHaveBeenCalled();
  });

  it('lazily loads and initializes mermaid once a diagram renders', async () => {
    const { container } = render(<Mermaid content="graph TD; A-->B" />);
    await waitFor(() => {
      expect(initializeMock).toHaveBeenCalled();
      expect(container.querySelector('svg')).not.toBeNull();
    });
  });

  it('exposes an accessible name on the expand button', () => {
    render(<Mermaid content="graph TD; A-->B" />);
    expect(screen.getByRole('button', { name: '다이어그램 확대' })).toBeInTheDocument();
  });

  it('only rewrites width/height on the opening <svg>, not on inner shapes', async () => {
    renderMock.mockResolvedValueOnce({
      svg: '<svg id="d" width="640" height="480" style="max-width: 640px;"><rect width="10" height="20"/><foreignObject width="8" height="9"/></svg>',
    });

    const { container } = render(<Mermaid content="graph TD; A-->B" />);

    // Scope by id: the expand button renders a lucide <svg> of its own.
    await waitFor(() => expect(container.querySelector('svg#d')).not.toBeNull());
    const svg = container.querySelector('svg#d')!;
    expect(svg.getAttribute('width')).toBe('100%');
    expect(svg.getAttribute('height')).toBe('auto');
    // `height="auto"` is invalid on these, and Chrome drops the whole diagram.
    expect(container.querySelector('rect')!.getAttribute('height')).toBe('20');
    expect(container.querySelector('foreignObject')!.getAttribute('height')).toBe('9');
  });

  it('reserves vertical space on the diagram container to avoid layout shift', () => {
    const { container } = render(<Mermaid content="graph TD; A-->B" />);
    const reserved = container.querySelector('.min-h-\\[200px\\]');
    expect(reserved).not.toBeNull();
  });
});
