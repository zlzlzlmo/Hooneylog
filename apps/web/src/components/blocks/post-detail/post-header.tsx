import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { ITag } from '@hooneylog/shared-types';
import { ViewCounter } from '@/components/elements/view-counter';
import { AuthorBadge } from '@/components/elements/author-badge';
import { TagList } from '@/components/elements/tag-list';

interface PostHeaderProps {
  title: string;
  category: string;
  createdAt: string;
  tags: ITag[];
  slug: string;
  initialViews: number;
  readingMinutes: number;
}

// Trace category color, keyed by category. Values are theme-aware CSS vars.
const CATEGORY_COLOR: Record<string, string> = {
  Frontend: 'var(--color-cat-fe)',
  Backend: 'var(--color-cat-be)',
  'Artificial Intelligence': 'var(--color-cat-ai)',
};

function categoryColor(category?: string): string {
  return (category && CATEGORY_COLOR[category]) || 'var(--color-accent)';
}

export function PostHeader({ title, category, createdAt, tags, slug, initialViews, readingMinutes }: PostHeaderProps) {
  const catStyle = { '--cat': categoryColor(category) } as CSSProperties;

  return (
    <header className="w-full" style={catStyle}>
      {/* Back link — quiet, mono */}
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.04em] text-notion-secondary hover:text-notion-text hover:bg-notion-hover px-2 py-1 -ml-2 rounded-[3px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          모든 게시글
        </Link>
      </div>

      <div className="w-full">
        {/* Category — colored by its category */}
        <div className="mb-3">
          <Link
            href="/"
            className="inline-block font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--cat)] border-b border-transparent hover:border-[var(--cat)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg rounded-[3px]"
          >
            {category || '미분류'}
          </Link>
        </div>

        {/* Meta line — eyebrow row, mono */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-[12px] tracking-[0.02em] text-notion-secondary mb-6">
          <span className="tabular-nums">{formatDate(createdAt)}</span>
          <span className="opacity-40">·</span>
          <ViewCounter slug={slug} initialViews={initialViews} />
          <span className="opacity-40">·</span>
          <span className="tabular-nums">약 {readingMinutes}분</span>
        </div>

        {/* Title */}
        <h1 className="text-[36px] sm:text-[48px] font-extrabold leading-[1.15] text-notion-text tracking-[-0.02em] break-keep mb-8">
          {title}
        </h1>

        {/* Author Info */}
        <AuthorBadge />
        <TagList tags={tags} className="mt-6" />
      </div>
    </header>
  );
}
