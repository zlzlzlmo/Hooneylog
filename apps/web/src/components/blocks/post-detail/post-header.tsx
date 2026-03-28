import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/utils/date';
import { ITag } from '@hooneylog/shared-types';

interface PostHeaderProps {
  title: string;
  category: string;
  createdAt: string;
  tags: ITag[];
}

export function PostHeader({ title, category, createdAt }: PostHeaderProps) {
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
        {/* Category & Date */}
        <div className="flex items-center gap-3 text-[14px] mb-4">
          <Link 
            href="/" 
            className="text-notion-text font-medium border-b border-transparent hover:border-notion-text transition-colors"
          >
            {category || '미분류'}
          </Link>
          <span className="text-notion-secondary font-mono">{formatDate(createdAt)}</span>
        </div>

        {/* Title */}
        <h1 className="text-[36px] sm:text-[48px] font-bold leading-[1.15] text-notion-text tracking-tight break-keep mb-8">
          {title}
        </h1>

        {/* Author Info */}
        <div className="flex items-center gap-3">
          <div className="w-[48px] h-[48px] rounded-full bg-notion-gray-bg border border-notion-border flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/profile.png" alt="Seunghoon Shin" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-medium text-notion-text">
              작성자 Seunghoon Shin
            </span>
            <span className="text-[13px] text-notion-secondary">
              풀스택 개발자
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
