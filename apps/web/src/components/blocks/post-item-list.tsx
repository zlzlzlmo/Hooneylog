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

  // The official Notion blog uses a CSS grid with 1fr columns, no visible border around the card, 
  // just the image and text flowing naturally.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12 pb-20 w-full">
      {posts.map((post, index) => {
        const imageSrc = getCategoryImageSrc(post.category);
        const isDefault = imageSrc === '/images/default.png';

        return (
          <article key={post.id} className="group flex flex-col w-full relative">
            <Link
              href={`/post/${post.id}`}
              className="flex flex-col flex-1 rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
            >
              {/* Cover Image */}
              {/* Notion uses a simple container without borders, and the image spans full width of the grid cell */}
              <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-[6px] overflow-hidden mb-4 bg-notion-gray-bg ring-1 ring-inset ring-notion-border">
                {isDefault ? (
                  <CategoryFallbackImage category={post.category} />
                ) : (
                  <Image
                    src={imageSrc}
                    alt={post.title || '대표 이미지'}
                    fill
                    priority={index < 2}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02] group-focus-within:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}
              </div>
              
              {/* Content */}
              <div className="flex flex-col flex-1">
                {/* Eyebrow / Category */}
                <div className="mb-2">
                  <span className="text-[13px] font-medium text-notion-secondary">
                    {post.category || '미분류'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[18px] sm:text-[20px] font-bold text-notion-text leading-[1.3] mb-2 group-hover:text-accent group-focus-within:text-accent transition-colors line-clamp-3">
                  {post.title}
                </h3>
                
                {/* Description */}
                <p className="text-[15px] text-notion-secondary line-clamp-2 leading-[1.5] mb-4">
                  {post.description}
                </p>
                
                {/* Footer (Views & Date) */}
                <div className="flex items-center justify-between mt-auto pt-4 text-[13px] text-notion-secondary font-mono">
                  <span className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {viewsMap[post.id] ?? 0}
                  </span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
