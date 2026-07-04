import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllPosts } from '@/lib/notion';
import { PostItemList } from '@/components/blocks/post-item-list';

export const revalidate = 60;

type Params = Promise<{ tag: string }>;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const names = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) names.add(tag.name);
  }
  return Array.from(names).map((name) => ({ tag: encodeURIComponent(name) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  return {
    title: `태그: ${name}`,
    description: `'${name}' 태그가 달린 글 목록`,
    alternates: { canonical: `/tag/${tag}` },
  };
}

export default async function TagPage({ params }: { params: Params }): Promise<React.JSX.Element> {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  const posts = await getAllPosts();
  const tagged = posts.filter((post) => post.tags.some((t) => t.name === name));

  return (
    <div className="w-full pt-10 pb-20">
      <div className="mb-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-notion-secondary hover:text-notion-text px-2 py-1 -ml-2 rounded-[3px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          모든 게시글
        </Link>
      </div>
      <header className="mb-10 border-b border-notion-border pb-8">
        {/* Mono path eyebrow — the tag as a filesystem trail */}
        <p className="font-mono text-[12px] tracking-[0.06em] text-notion-secondary mb-3">
          <span className="text-accent">tag</span>
          <span className="opacity-40">/</span>
          <span className="text-notion-text">{name}</span>
        </p>
        <h1 className="text-[30px] sm:text-[38px] font-extrabold tracking-[-0.02em] text-notion-text break-keep leading-[1.15]">
          #{name}
        </h1>
        <p className="mt-3 font-mono text-[12.5px] text-notion-secondary tabular-nums">
          {tagged.length}개
        </p>
      </header>
      <PostItemList posts={tagged} />
    </div>
  );
}
