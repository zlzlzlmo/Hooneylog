import type { CSSProperties } from 'react';
import Link from 'next/link';
import { NotionPost } from '@hooneylog/shared-types';
import { formatDate } from '@/utils/date';

// Trace node color, keyed by category. Values are theme-aware CSS vars.
const CATEGORY_COLOR: Record<string, string> = {
  Frontend: 'var(--color-cat-fe)',
  Backend: 'var(--color-cat-be)',
  'Artificial Intelligence': 'var(--color-cat-ai)',
};

function categoryColor(category?: string): string {
  return (category && CATEGORY_COLOR[category]) || 'var(--color-accent)';
}

export function RelatedPosts({ posts }: { posts: NotionPost[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="my-12">
      <h2
        id="related-heading"
        className="flex items-center gap-3 font-mono text-[11.5px] uppercase tracking-[0.16em] text-notion-secondary mb-5"
      >
        관련 글
        <span aria-hidden="true" className="flex-1 h-px bg-notion-border" />
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 m-0 p-0 list-none">
        {posts.map((post) => {
          const style = { '--cat': categoryColor(post.category) } as CSSProperties;
          return (
            <li key={post.id}>
              <Link
                href={`/post/${post.id}`}
                style={style}
                className="group flex flex-col h-full p-4 rounded-[4px] border border-notion-border hover:bg-notion-hover transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
              >
                <span className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.04em] font-semibold text-[var(--cat)] mb-1.5">
                  <span
                    aria-hidden="true"
                    className="w-2 h-2 rotate-45 border-2 border-[var(--cat)] bg-notion-bg transition-colors group-hover:bg-[var(--cat)]"
                  />
                  {post.category || '미분류'}
                </span>
                <span className="text-[15px] font-bold tracking-[-0.01em] text-notion-text leading-snug line-clamp-2 text-balance group-hover:text-[var(--cat)] transition-colors">
                  {post.title}
                </span>
                <span className="mt-auto pt-3 text-[11.5px] text-notion-secondary font-mono tracking-[0.02em]">
                  {formatDate(post.createdAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
