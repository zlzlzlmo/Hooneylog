import Link from 'next/link';
import { NotionPost } from '@hooneylog/shared-types';
import { formatDate } from '@/utils/date';

export function RelatedPosts({ posts }: { posts: NotionPost[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="my-12">
      <h2 id="related-heading" className="text-[18px] font-semibold text-notion-text mb-4">
        관련 글
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-0 p-0 list-none">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/post/${post.id}`}
              className="group flex flex-col h-full p-4 rounded-[6px] border border-notion-border hover:bg-notion-hover transition-colors no-underline"
            >
              <span className="text-[12px] font-medium text-notion-secondary mb-1">{post.category || '미분류'}</span>
              <span className="text-[15px] font-semibold text-notion-text leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                {post.title}
              </span>
              <span className="mt-auto pt-3 text-[12px] text-notion-secondary font-mono">{formatDate(post.createdAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
