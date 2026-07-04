import type { CSSProperties } from 'react';
import { NotionPost } from '@hooneylog/shared-types';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryImageSrc } from '@/utils/category-image';
import { formatDate } from '@/utils/date';
import { CategoryFallbackImage } from '@/components/elements/category-fallback-image';

interface PostItemListProps {
  posts: NotionPost[];
  viewsMap?: Record<string, number>;
  query?: string;
  onReset?: () => void;
}

// Trace-rail node color, keyed by category. Values are theme-aware CSS vars.
const CATEGORY_COLOR: Record<string, string> = {
  Frontend: 'var(--color-cat-fe)',
  Backend: 'var(--color-cat-be)',
  'Artificial Intelligence': 'var(--color-cat-ai)',
};

function categoryColor(category?: string): string {
  return (category && CATEGORY_COLOR[category]) || 'var(--color-accent)';
}

export function PostItemList({ posts, viewsMap = {}, query, onReset }: PostItemListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-notion-secondary col-span-full">
        <span className="text-[24px] mb-2">📄</span>
        <p className="text-[15px]">
          {query ? `'${query}'에 대한 검색 결과가 없어요.` : '아직 글이 없어요.'}
        </p>
        {onReset && (
          <button
            type="button"
            onClick={() => onReset?.()}
            className="mt-4 px-4 py-2 text-[14px] rounded-[4px] border border-notion-border text-notion-text hover:bg-notion-hover active:bg-notion-gray-bg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
          >
            전체 글 보기
          </button>
        )}
      </div>
    );
  }

  // TRACE: a vertical "trace rail" with a category-colored node per entry — the blog
  // read as a developer's log. Boldness lives here; entries stay quiet and scannable.
  return (
    <div className="relative pl-8 pb-20 w-full">
      <span
        aria-hidden="true"
        className="absolute left-[7px] top-3 bottom-8 w-[2px] bg-notion-border"
      />
      {posts.map((post, index) => {
        const imageSrc = getCategoryImageSrc(post.category, post.tags);
        const isDefault = imageSrc === '/images/default.png';
        const style = {
          '--cat': categoryColor(post.category),
          animationDelay: `${Math.min(index, 6) * 60}ms`,
        } as CSSProperties;

        return (
          <article
            key={post.id}
            style={style}
            className="group relative border-b border-notion-border last:border-b-0 motion-safe:animate-[rise_0.5s_cubic-bezier(0.2,0.7,0.2,1)_both]"
          >
            {/* Rail node (diamond), filled on hover/focus */}
            <span
              aria-hidden="true"
              className="absolute -left-[30px] top-[27px] w-3 h-3 rotate-45 bg-notion-bg border-2 border-[var(--cat)] transition-all duration-200 group-hover:bg-[var(--cat)] group-focus-within:bg-[var(--cat)]"
            />
            <Link
              href={`/post/${post.id}`}
              className="flex items-start gap-4 py-5 rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
            >
              <div className="flex-1 min-w-0">
                {/* Meta line (mono) */}
                <div className="flex items-center gap-2 flex-wrap font-mono text-[11.5px] text-notion-secondary mb-1.5">
                  <span className="uppercase font-semibold text-[var(--cat)] tracking-[0.02em]">
                    {post.category || '미분류'}
                  </span>
                  <span className="opacity-40">·</span>
                  <span className="tabular-nums">{viewsMap[post.id] ?? 0} views</span>
                  <span className="opacity-40">·</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>

                {/* Headline */}
                <h3 className="text-[18px] sm:text-[20px] font-bold leading-[1.3] tracking-[-0.01em] text-notion-text line-clamp-2 mb-1.5 text-balance transition-colors group-hover:text-[var(--cat)] group-focus-within:text-[var(--cat)]">
                  {post.title}
                </h3>

                {/* Dek */}
                <p className="text-[14px] text-notion-secondary line-clamp-2 leading-[1.5]">
                  {post.description}
                </p>
              </div>

              {/* Side thumbnail (tag cover) */}
              <div className="relative w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] flex-shrink-0 rounded-[4px] overflow-hidden bg-notion-gray-bg ring-1 ring-inset ring-notion-border">
                {isDefault ? (
                  <CategoryFallbackImage category={post.category} />
                ) : (
                  <Image
                    src={imageSrc}
                    alt={post.title || '대표 이미지'}
                    fill
                    priority={index < 2}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
                    sizes="88px"
                  />
                )}
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
