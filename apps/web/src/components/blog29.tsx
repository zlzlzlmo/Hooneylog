import { ArrowUpRightIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface Blog29Post {
  href: string;
  date: string;
  title: string;
  content: string;
  tags: { id: string; name: string; href: string }[];
}

interface Blog29Props {
  heading: string;
  eyebrow?: string;
  meta?: string;
  posts: Blog29Post[];
  emptyMessage?: string;
  className?: string;
}

const Blog29 = ({
  heading,
  eyebrow,
  meta,
  posts,
  emptyMessage = '아직 글이 없어요.',
  className,
}: Blog29Props) => {
  return (
    <section className={cn('bg-background py-12 md:py-16', className)}>
      <div className="container mx-auto">
        {eyebrow && <p className="mb-3 text-sm text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-left text-3xl font-bold tracking-tighter break-keep wrap-anywhere text-foreground sm:text-5xl">
          {heading}
        </h1>
        {meta && <p className="mt-3 text-sm tabular-nums text-muted-foreground">{meta}</p>}

        {posts.length === 0 ? (
          <p className="mt-16 text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="mt-10 space-y-6 md:mt-14">
            {posts.map((post, index) => (
              <React.Fragment key={post.href}>
                <article className="relative w-full pr-14">
                  <p className="text-sm tracking-tight text-muted-foreground">{post.date}</p>

                  <h2 className="mt-2 text-lg font-medium tracking-tight wrap-anywhere text-balance text-foreground md:text-2xl">
                    <Link href={post.href} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>

                  <p className="mt-4 line-clamp-3 wrap-anywhere text-sm text-muted-foreground md:text-base">
                    {post.content}
                  </p>

                  {post.tags.length > 0 && (
                    <ul className="mt-4 flex flex-wrap items-center gap-2">
                      {post.tags.map((tag) => (
                        <li key={tag.id}>
                          <Link href={tag.href}>
                            <Badge
                              variant="secondary"
                              className="h-6 rounded-md font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                              #{tag.name}
                            </Badge>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button
                    asChild
                    variant="secondary"
                    size="icon"
                    className="absolute top-0 right-0 size-10 rounded-full transition-transform ease-in-out hover:rotate-45"
                  >
                    <Link href={post.href} tabIndex={-1} aria-hidden="true">
                      <ArrowUpRightIcon />
                    </Link>
                  </Button>
                </article>

                {index < posts.length - 1 && <Separator className="h-px w-full" />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export { Blog29 };
