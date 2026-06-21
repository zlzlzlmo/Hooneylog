import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MoveToAnotherPost } from './move-to-another-post';
import { NotionPost } from '@hooneylog/shared-types';

const post = (id: string, title: string) => ({ id, title } as unknown as NotionPost);

describe('MoveToAnotherPost', () => {
  it('renders only the next link when there is no previous post', () => {
    render(<MoveToAnotherPost previousPost={null} nextPost={post('2', 'Next One')} />);
    expect(screen.getByText('Next One')).toBeInTheDocument();
    expect(screen.queryByText('이전 글')).toBeNull();
  });

  it('renders both links when both neighbors exist', () => {
    render(<MoveToAnotherPost previousPost={post('1', 'Prev')} nextPost={post('2', 'Next')} />);
    expect(screen.getByText('Prev')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});
