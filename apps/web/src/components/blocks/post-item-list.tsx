import { NotionPost } from '@hooneylog/shared-types';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryImageSrc } from '@/utils/category-image';
import { formatDate } from '@/utils/date';

interface PostItemListProps {
  posts: NotionPost[];
}

export function PostItemList({ posts }: PostItemListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-notion-secondary col-span-full">
        <span className="text-[24px] mb-2">📄</span>
        <p className="text-[15px]">검색 결과가 없습니다.</p>
      </div>
    );
  }

  // The official Notion blog uses a CSS grid with 1fr columns, no visible border around the card, 
  // just the image and text flowing naturally.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12 pb-20 w-full">
      {posts.map((post) => (
        <article key={post.id} className="group flex flex-col w-full relative">
          <Link 
            href={`/post/${post.id}`} 
            className="flex flex-col flex-1"
          >
            {/* Cover Image */}
            {/* Notion uses a simple container without borders, and the image spans full width of the grid cell */}
            <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-[6px] overflow-hidden mb-4 bg-notion-gray-bg shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
               <Image 
                src={getCategoryImageSrc(post.category)}
                alt={post.category || 'Cover image'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            
            {/* Content */}
            <div className="flex flex-col">
              {/* Eyebrow / Category */}
              <div className="mb-2">
                <span className="text-[13px] font-medium text-notion-secondary">
                  {post.category || 'Notion HQ'}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[18px] sm:text-[20px] font-bold text-notion-text leading-[1.3] mb-2 group-hover:text-notion-blue-text transition-colors line-clamp-3">
                {post.title}
              </h3>
              
              {/* Description */}
              <p className="text-[15px] text-notion-secondary line-clamp-2 leading-[1.5] mb-4">
                {post.description}
              </p>
              
              {/* Date footer */}
              <div className="flex items-center justify-end mt-auto pt-4">
                <span className="text-[13px] text-notion-secondary font-mono">{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
