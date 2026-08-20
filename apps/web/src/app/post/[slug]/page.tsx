import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostById, getNotionPageMarkdown } from '@/lib/notion';
import { Blogpost4 } from '@/components/blogpost4';
import { Blog19, type Blog19Item } from '@/components/blog19';
import { MarkdownRenderer } from '@/components/blocks/post-detail/markdown-renderer';
import { MoveToAnotherPost } from '@/components/blocks/post-detail/move-to-another-post';
import { GiscusComment } from '@/components/blocks/post-detail/giscus-comment';
import { ShareButtons } from '@/components/blocks/post-detail/share-buttons';
import { ViewCounter } from '@/components/elements/view-counter';
import { TagList } from '@/components/elements/tag-list';
import { ReadingProgress } from '@/components/elements/reading-progress';
import { AUTHOR } from '@/lib/author';
import { getAdjacentPosts } from '@/utils/adjacent-posts';
import { getCategoryImageSrc } from '@/utils/category-image';
import { getViewCount } from '@/lib/views';
import { extractToc, readingTime } from '@/utils/toc';
import { getRelatedPosts } from '@/utils/related-posts';
import { formatDate } from '@/utils/date';

type Params = Promise<{ slug: string }>;

// Dynamic Metadata
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostById(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  // Notion descriptions are optional, so fall back to a title-derived line
  // rather than shipping an empty <meta description> / og:description.
  const description = post.description?.trim() || `${post.title} — HooneyLog 기술 블로그`;

  return {
    title: post.title, // layout.tsx의 template에 의해 제목 | HooneyLog로 표시됨
    description,
    alternates: {
      canonical: `/post/${post.id}`,
    },
    openGraph: {
      title: post.title,
      description,
      url: `https://hooneylog.com/post/${post.id}`,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: ['Hooney'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  };
}

// Generate static params for all posts
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.id,
  }));
}

export default async function PostDetailPage({
  params,
}: {
  params: Params;
}): Promise<React.JSX.Element> {
  const { slug } = await params;

  const [allPosts, post, markdown] = await Promise.all([
    getAllPosts(),
    getPostById(slug),
    getNotionPageMarkdown(slug),
  ]);

  if (!post) {
    notFound();
  }

  // 💡 서버에서는 초기 조회수만 가져옵니다 (캐시된 값일 수 있음)
  const views = await getViewCount(slug);

  const { previousPost, nextPost } = getAdjacentPosts(allPosts, slug);

  const md = markdown.parent ?? '';
  const toc = extractToc(md);
  const readingMinutes = readingTime(md);
  const relatedPosts = getRelatedPosts(allPosts, post);

  const description = post.description?.trim() || `${post.title} — HooneyLog 기술 블로그`;

  // JSON-LD for Search Engine Optimization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    // Structured-data image must be an absolute URL (metadataBase does not apply
    // to hand-written JSON-LD).
    image: new URL(
      getCategoryImageSrc(post.category, post.tags),
      'https://hooneylog.com',
    ).toString(),
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: 'Hooney',
      url: 'https://hooneylog.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://hooneylog.com/post/${post.id}`,
    },
    keywords: post.tags.map((t) => t.name).join(', '),
  };

  // Breadcrumb trail: 홈 → (카테고리 필터) → 글. The category step links to the
  // home category filter (a real, indexable URL) so the path fully resolves.
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://hooneylog.com' },
      ...(post.category
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: post.category,
              item: `https://hooneylog.com/?category=${encodeURIComponent(post.category)}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: post.category ? 3 : 2,
        name: post.title,
        item: `https://hooneylog.com/post/${post.id}`,
      },
    ],
  };

  const relatedItems: Blog19Item[] = relatedPosts.map((related) => ({
    id: related.id,
    title: related.title,
    description: related.description,
    date: formatDate(related.createdAt),
    category: related.category || '미분류',
    link: `/post/${related.id}`,
  }));

  return (
    <>
      <ReadingProgress />
      {/* SEO: Structured Data for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Blogpost4
        crumbs={[
          ...(post.category
            ? [{ label: post.category, href: `/?category=${encodeURIComponent(post.category)}` }]
            : []),
          { label: post.title },
        ]}
        title={post.title}
        author={{
          name: AUTHOR.name,
          avatar: AUTHOR.avatar,
          fallback: AUTHOR.koreanName.slice(-2),
        }}
        meta={
          <>
            <span className="tabular-nums">{formatDate(post.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <ViewCounter slug={slug} initialViews={views} />
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">약 {readingMinutes}분</span>
          </>
        }
        tags={<TagList tags={post.tags} />}
        toc={toc}
        share={<ShareButtons title={post.title} slug={slug} />}
        footer={
          <>
            <MoveToAnotherPost previousPost={previousPost ?? null} nextPost={nextPost ?? null} />
            <Blog19 items={relatedItems} />
            <GiscusComment />
          </>
        }
      >
        <MarkdownRenderer content={md} />
      </Blogpost4>
    </>
  );
}
