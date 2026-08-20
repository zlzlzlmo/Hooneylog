'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Eye, Search as SearchIcon, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CategoryFallbackImage } from '@/components/elements/category-fallback-image';
import { AUTHOR, AUTHOR_SOCIALS } from '@/lib/author';
import { cn } from '@/lib/utils';

export interface Blog37Category {
  label: string;
  value: string;
  count: number;
}

export interface Blog37Post {
  id: string;
  title: string;
  summary: string;
  label: string;
  published: string;
  url: string;
  image: string;
  /** True when `image` is the placeholder, so a generated gradient is drawn instead. */
  imageIsFallback: boolean;
  views: number;
}

interface Blog37Props {
  heading: React.ReactNode;
  description: string;
  categories: Blog37Category[];
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  posts: Blog37Post[];
  resultCount: number;
  remaining: number;
  onLoadMore: () => void;
  onReset: () => void;
  stats?: { total: number; today: number };
  className?: string;
}

const Blog37 = ({
  heading,
  description,
  categories,
  selectedCategory,
  onSelectCategory,
  searchValue,
  onSearchChange,
  posts,
  resultCount,
  remaining,
  onLoadMore,
  onReset,
  stats,
  className,
}: Blog37Props) => {
  return (
    <section className={cn('py-12 md:py-16', className)}>
      <div className="container mx-auto">
        <div className="mb-12 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {heading}
          </h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 border">
                  <AvatarImage src={AUTHOR.avatar} alt={AUTHOR.name} />
                  <AvatarFallback>{AUTHOR.koreanName.slice(-2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {AUTHOR.koreanName} {AUTHOR.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{AUTHOR.tagline}</p>
                </div>
              </div>

              <nav aria-label="프로필 링크" className="flex flex-wrap gap-2">
                {AUTHOR_SOCIALS.map(({ label, href }) => (
                  <Button key={label} asChild variant="outline" size="sm">
                    <a
                      href={href}
                      {...(href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {label}
                    </a>
                  </Button>
                ))}
              </nav>

              {stats && (
                <dl className="grid grid-cols-2 gap-2 rounded-lg border p-3 text-sm">
                  <div className="min-w-0">
                    <dt className="truncate text-xs text-muted-foreground">총 조회수</dt>
                    <dd className="font-medium tabular-nums">{stats.total.toLocaleString()}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="truncate text-xs text-muted-foreground">오늘</dt>
                    <dd className="font-medium tabular-nums">+{stats.today.toLocaleString()}</dd>
                  </div>
                </dl>
              )}
            </div>

            <Separator className="my-6" />

            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <label htmlFor="post-search" className="sr-only">
                포스트 검색
              </label>
              <Input
                id="post-search"
                type="search"
                placeholder="제목·내용 검색..."
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                className="px-9 [&::-webkit-search-cancel-button]:hidden"
              />
              {searchValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="검색어 지우기"
                  onClick={() => onSearchChange('')}
                  className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
            {searchValue && (
              <p className="mt-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                검색 결과 {resultCount}개
              </p>
            )}

            <nav
              aria-label="카테고리 필터"
              className="mt-6 flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1"
            >
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant="ghost"
                  size="sm"
                  aria-pressed={selectedCategory === category.value}
                  onClick={() => onSelectCategory(category.value)}
                  className={cn(
                    'justify-between gap-2 px-3 lg:w-full',
                    selectedCategory === category.value &&
                      'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                  )}
                >
                  <span className="truncate">{category.label}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {category.count}
                  </span>
                </Button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <p className="text-muted-foreground">
                  {searchValue
                    ? `'${searchValue}'에 대한 검색 결과가 없어요.`
                    : '아직 글이 없어요.'}
                </p>
                <Button variant="outline" onClick={onReset}>
                  전체 글 보기
                </Button>
              </div>
            ) : (
              <>
                {posts.map((post, index) => (
                  <div key={post.id}>
                    <article className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
                      <Link
                        href={post.url}
                        tabIndex={-1}
                        aria-hidden="true"
                        className="relative block aspect-16/9 w-full shrink-0 overflow-hidden rounded-lg border transition-opacity hover:opacity-80 sm:w-44 md:w-52"
                      >
                        {post.imageIsFallback ? (
                          <CategoryFallbackImage category={post.label} />
                        ) : (
                          <Image
                            src={post.image}
                            alt=""
                            fill
                            priority={index < 2}
                            sizes="(min-width: 768px) 208px, (min-width: 640px) 176px, 100vw"
                            className="object-cover"
                          />
                        )}
                      </Link>

                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="secondary">{post.label}</Badge>
                          <span className="inline-flex items-center gap-1">
                            <Eye aria-hidden="true" className="size-3.5" />
                            <span className="tabular-nums">{post.views.toLocaleString()}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{post.published}</span>
                        </div>
                        <h3 className="text-xl font-semibold wrap-anywhere text-pretty md:text-2xl">
                          <Link href={post.url} className="hover:underline">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="line-clamp-3 wrap-anywhere text-muted-foreground">
                          {post.summary}
                        </p>
                        <Link
                          href={post.url}
                          tabIndex={-1}
                          aria-hidden="true"
                          className="inline-flex min-h-6 items-center text-sm font-medium hover:underline"
                        >
                          자세히 보기
                          <ArrowRight className="ml-2 size-4" />
                        </Link>
                      </div>
                    </article>

                    {index < posts.length - 1 && <Separator className="my-8 md:my-10" />}
                  </div>
                ))}

                {remaining > 0 && (
                  <div className="mt-12 flex justify-center">
                    <Button variant="outline" onClick={onLoadMore}>
                      더 보기 ({remaining}개 남음)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Blog37 };
