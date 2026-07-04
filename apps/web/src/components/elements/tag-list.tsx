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
            className="inline-block px-2 py-0.5 rounded-[3px] border border-notion-border font-mono text-[11px] text-notion-secondary hover:bg-notion-hover hover:text-notion-text transition-colors no-underline"
          >
            #{tag.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
