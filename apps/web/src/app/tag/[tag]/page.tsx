import { Metadata } from 'next';
import { getAllPosts } from '@/lib/notion';
import { Blog29, type Blog29Post } from '@/components/blog29';
import { formatDate } from '@/utils/date';

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

  const items: Blog29Post[] = tagged.map((post) => ({
    href: `/post/${post.id}`,
    date: formatDate(post.createdAt),
    title: post.title,
    content: post.description,
    tags: post.tags.map((t) => ({
      id: t.id,
      name: t.name,
      href: `/tag/${encodeURIComponent(t.name)}`,
    })),
  }));

  return (
    <Blog29
      eyebrow={`tag / ${name}`}
      heading={`#${name}`}
      meta={`${tagged.length}개`}
      posts={items}
      emptyMessage={`'${name}' 태그가 달린 글이 아직 없어요.`}
    />
  );
}
