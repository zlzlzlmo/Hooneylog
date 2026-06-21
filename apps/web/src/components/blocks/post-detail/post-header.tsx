import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { ITag } from '@hooneylog/shared-types';
import { ViewCounter } from '@/components/elements/view-counter';
import { AuthorBadge } from '@/components/elements/author-badge';

interface PostHeaderProps {
  title: string;
  category: string;
  createdAt: string;
  tags: ITag[];
  slug: string;
  initialViews: number;
}

export function PostHeader({ title, category, createdAt, slug, initialViews }: PostHeaderProps) {
  return (
    <header className="w-full">
      {/* Back button */}
      <div className="mb-10">
        <Link 
          href="/" 
          className="inline-flex items-center text-[15px] text-notion-secondary hover:text-notion-text hover:bg-notion-hover px-2 py-1 -ml-2 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          모든 게시글
        </Link>
      </div>

      <div className="w-full">
        {/* Category & Date & Views */}
        <div className="flex items-center gap-4 text-[14px] mb-4">
          <Link 
            href="/" 
            className="text-notion-text font-medium border-b border-transparent hover:border-notion-text transition-colors"
          >
            {category || '미분류'}
          </Link>
          <div className="flex items-center gap-2 text-notion-secondary font-mono">
            <span>{formatDate(createdAt)}</span>
            <span className="text-notion-border">•</span>
            <ViewCounter slug={slug} initialViews={initialViews} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[36px] sm:text-[48px] font-bold leading-[1.15] text-notion-text tracking-tight break-keep mb-8">
          {title}
        </h1>

        {/* Author Info */}
        <AuthorBadge />
      </div>
    </header>
  );
}
