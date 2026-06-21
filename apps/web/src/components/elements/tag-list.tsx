import Link from 'next/link';
import { ITag } from '@hooneylog/shared-types';

export function TagList({ tags, className = '' }: { tags: ITag[]; className?: string }) {
  if (!tags || tags.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 m-0 p-0 list-none ${className}`}>
      {tags.map((tag) => (
        <li key={tag.id}>
          <Link
            href={`/tag/${encodeURIComponent(tag.name)}`}
            className="inline-block px-2.5 py-1 rounded-full text-[13px] bg-notion-gray-bg text-notion-secondary hover:bg-notion-hover hover:text-notion-text transition-colors no-underline"
          >
            #{tag.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
