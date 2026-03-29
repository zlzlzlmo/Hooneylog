import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CommentProvider, useComment } from './comment-context';

const TestComponent = () => {
  const { repo, categoryId } = useComment();
  return (
    <div>
      <span data-testid="repo">{repo}</span>
      <span data-testid="categoryId">{categoryId}</span>
    </div>
  );
};

describe('CommentContext', () => {
  it('CommentProvider는 자식 컴포넌트에 올바른 설정을 제공해야 한다', () => {
    const mockRepo = 'zlzlzlmo/Hooneylog';
    const mockCategoryId = 'DIC_kwDNX8_888';

    render(
      <CommentProvider repo={mockRepo} categoryId={mockCategoryId}>
        <TestComponent />
      </CommentProvider>
    );

    expect(screen.getByTestId('repo').textContent).toBe(mockRepo);
    expect(screen.getByTestId('categoryId').textContent).toBe(mockCategoryId);
  });

  it('CommentProvider 없이 useComment를 사용하면 에러를 던져야 한다', () => {
    // console.error를 일시적으로 숨김 (의도된 에러 테스트)
    const originalError = console.error;
    console.error = () => {};

    expect(() => render(<TestComponent />)).toThrow('useComment must be used within a CommentProvider');

    console.error = originalError;
  });
});
