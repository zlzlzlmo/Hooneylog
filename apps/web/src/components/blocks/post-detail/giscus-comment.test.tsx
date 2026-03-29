import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GiscusComment } from './giscus-comment';
import { CommentProvider } from './comment-context';

// @giscus/react 모킹
vi.mock('@giscus/react', () => ({
  default: (props: any) => <div data-testid="giscus-mock" data-props={JSON.stringify(props)} />
}));

describe('GiscusComment', () => {
  it('CommentContext로부터 설정을 가져와 Giscus 컴포넌트에 전달해야 한다', () => {
    const config = {
      repo: 'zlzlzlmo/Hooneylog',
      repoId: 'REPO_ID_123',
      category: 'Comments',
      categoryId: 'CAT_ID_123',
      theme: 'light',
      lang: 'ko'
    };

    render(
      <CommentProvider {...config}>
        <GiscusComment />
      </CommentProvider>
    );

    const giscusMock = screen.getByTestId('giscus-mock');
    const passedProps = JSON.parse(giscusMock.getAttribute('data-props') || '{}');

    expect(passedProps.repo).toBe(config.repo);
    expect(passedProps.repoId).toBe(config.repoId);
    expect(passedProps.category).toBe(config.category);
    expect(passedProps.categoryId).toBe(config.categoryId);
    expect(passedProps.theme).toBe(config.theme);
    expect(passedProps.lang).toBe(config.lang);
  });
});
