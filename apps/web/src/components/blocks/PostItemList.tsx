import { NotionPost } from '@hooneylog/shared-types';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryImageSrc } from '@/utils/categoryImage';
import { formatDate } from '@/utils/date';

interface PostItemListProps {
  posts: NotionPost[];
}

export function PostItemList({ posts }: PostItemListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500 text-xl">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20">
      {posts.map((post) => (
        <article key={post.id} className="grid grid-cols-[1fr_4fr] gap-12 animate-[fadeIn_0.6s_ease-in-out] max-mobile:grid-cols-1 max-mobile:gap-6">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md max-mobile:w-1/2 max-mobile:max-w-[200px] max-mobile:mx-auto">
            <Image 
              src={getCategoryImageSrc(post.category)}
              alt={post.category || '카테고리 이미지'}
              fill
              className="object-cover"
              sizes="(max-width: 960px) 200px, 250px"
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <Link href={`/post/${post.id}`} className="hover:text-main transition-colors">
              <h3 className="text-3xl font-bold line-clamp-2">{post.title}</h3>
            </Link>
            
            <time className="text-gray-500 text-sm">
              {formatDate(post.createdAt)}
            </time>
            
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag.id} className="text-sm px-3 py-1 bg-gray-100 rounded-full text-sub font-medium">
                  #{tag.name}
                </span>
              ))}
            </div>
            
            <p className="text-gray-600 text-lg line-clamp-3 leading-relaxed">
              {post.description}
            </p>
            
            <Link 
              href={`/post/${post.id}`} 
              className="text-main font-bold mt-auto hover:underline w-fit"
            >
              Read More &rarr;
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
