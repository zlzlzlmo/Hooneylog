'use client';

import { ArrowUp, Home } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { TocItem } from '@/utils/toc';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

interface Blogpost4Props {
  crumbs: Crumb[];
  title: string;
  author: { name: string; avatar: string; fallback: string };
  meta: React.ReactNode;
  tags?: React.ReactNode;
  toc: TocItem[];
  share?: React.ReactNode;
  children: React.ReactNode;
  /** Prev/next nav, related posts, comments — full-width under the reading column. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Highlights the heading currently in the reading band. The headings are rendered
 * by the markdown body (not by this component), so they are looked up by the slug
 * ids the TOC was built from.
 */
function useActiveSlug(toc: TocItem[]): string {
  const [activeSlug, setActiveSlug] = useState('');

  useEffect(() => {
    if (toc.length === 0) return;

    const headings = toc
      .map((item) => document.getElementById(item.slug))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries.find((entry) => entry.isIntersecting);
        if (first) setActiveSlug(first.target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc]);

  return activeSlug;
}

function TocList({
  toc,
  activeSlug,
  onNavigate,
}: {
  toc: TocItem[];
  activeSlug: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {toc.map((item) => (
        <li key={item.slug} className={item.depth === 3 ? 'pl-3' : undefined}>
          <a
            href={`#${item.slug}`}
            onClick={onNavigate}
            aria-current={activeSlug === item.slug ? 'true' : undefined}
            className={cn(
              'block py-1 transition-colors duration-200',
              activeSlug === item.slug
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary',
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

const Blogpost4 = ({
  crumbs,
  title,
  author,
  meta,
  tags,
  toc,
  share,
  children,
  footer,
  className,
}: Blogpost4Props) => {
  const activeSlug = useActiveSlug(toc);

  return (
    <section className={cn('py-12 md:py-16', className)}>
      <div className="container mx-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  aria-label="홈"
                  className="inline-flex size-6 items-center justify-center"
                >
                  <Home className="size-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {crumbs.map((crumb) => (
              <React.Fragment key={crumb.label}>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="min-w-0 max-w-full">
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href} className="inline-flex min-h-6 items-center">
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-7 mb-6 max-w-3xl text-3xl font-semibold break-keep wrap-anywhere text-balance md:text-5xl">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Avatar className="size-8 border">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.fallback}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{author.name}</span>
          <span className="flex flex-wrap items-center gap-2 text-muted-foreground">{meta}</span>
        </div>

        {tags && <div className="mt-5">{tags}</div>}

        <Separator className="mt-8 mb-10 md:mb-16" />

        <div className="relative grid grid-cols-12 gap-6">
          <div className="col-span-12 min-w-0 lg:col-span-8">
            {toc.length > 0 && (
              <details className="mb-8 rounded-lg border p-4 lg:hidden">
                <summary className="cursor-pointer text-sm font-medium select-none">목차</summary>
                <nav aria-label="목차" className="mt-3 text-sm">
                  <TocList toc={toc} activeSlug={activeSlug} />
                </nav>
              </details>
            )}

            {children}

            {footer}
          </div>

          <div className="sticky top-24 col-span-3 col-start-10 hidden h-fit lg:block">
            {toc.length > 0 && (
              <>
                <span className="text-lg font-medium">목차</span>
                <nav aria-label="목차" className="mt-4 max-h-[50vh] overflow-y-auto text-sm">
                  <TocList toc={toc} activeSlug={activeSlug} />
                </nav>
                <Separator className="my-6" />
              </>
            )}

            {share}

            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                      ? 'auto'
                      : 'smooth',
                  })
                }
              >
                <ArrowUp className="size-4" />맨 위로
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Blogpost4 };
