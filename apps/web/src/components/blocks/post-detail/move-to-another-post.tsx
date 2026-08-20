import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { NotionPost } from '@hooneylog/shared-types';

import { Card, CardContent } from '@/components/ui/card';

interface MoveToAnotherPostProps {
  previousPost: NotionPost | null;
  nextPost: NotionPost | null;
}

export function MoveToAnotherPost({ previousPost, nextPost }: MoveToAnotherPostProps) {
  if (!previousPost && !nextPost) return null;

  return (
    <nav aria-label="이전/다음 글" className="my-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {previousPost ? (
        <Link href={`/post/${previousPost.id}`} className="group">
          <Card className="h-full transition-colors hover:bg-accent">
            <CardContent className="flex flex-col items-start gap-2">
              <span className="flex items-center gap-2 text-xs tracking-wider text-muted-foreground uppercase">
                <ArrowLeft className="size-3.5" aria-hidden="true" /> 이전 글
              </span>
              <span className="line-clamp-2 font-semibold wrap-anywhere text-balance group-hover:underline">
                {previousPost.title}
              </span>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <span className="hidden sm:block" aria-hidden="true" />
      )}

      {nextPost && (
        <Link href={`/post/${nextPost.id}`} className="group sm:col-start-2">
          <Card className="h-full transition-colors hover:bg-accent">
            <CardContent className="flex flex-col items-end gap-2 text-right">
              <span className="flex items-center gap-2 text-xs tracking-wider text-muted-foreground uppercase">
                다음 글 <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
              <span className="line-clamp-2 font-semibold wrap-anywhere text-balance group-hover:underline">
                {nextPost.title}
              </span>
            </CardContent>
          </Card>
        </Link>
      )}
    </nav>
  );
}
