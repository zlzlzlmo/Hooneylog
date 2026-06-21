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
          className="inline-flex items-center text-[15px] text-notion-secondary hover:text-notion-text hover:bg-notion-hover px-2 py-1 -ml-2 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          모든 게시글
        </Link>
      </div>
      <h1 className="text-[28px] sm:text-[32px] font-bold text-notion-text mb-8">
        <span className="text-accent">#{name}</span>
        <span className="text-notion-secondary text-[18px] font-medium ml-3">{tagged.length}개</span>
      </h1>
      <PostItemList posts={tagged} />
    </div>
  );
}
