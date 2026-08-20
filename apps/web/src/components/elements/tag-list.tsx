import Link from 'next/link';
import { ITag } from '@hooneylog/shared-types';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function TagList({ tags, className }: { tags: ITag[]; className?: string }) {
  if (!tags || tags.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => (
        <li key={tag.id}>
          <Link href={`/tag/${encodeURIComponent(tag.name)}`}>
            <Badge
              variant="secondary"
              className="max-w-full rounded-md font-medium wrap-anywhere whitespace-normal text-muted-foreground transition-colors hover:text-foreground"
            >
              #{tag.name}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}
