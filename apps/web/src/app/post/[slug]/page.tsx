import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostById, getNotionPageMarkdown } from '@/lib/notion';
import { PostHeader } from '@/components/blocks/post-detail/post-header';
import { MarkdownRenderer } from '@/components/blocks/post-detail/markdown-renderer';
import { MoveToAnotherPost } from '@/components/blocks/post-detail/move-to-another-post';
import { GiscusComment } from '@/components/blocks/post-detail/giscus-comment';
import { CommentProvider } from '@/components/blocks/post-detail/comment-context';
import { getAdjacentPosts } from '@/utils/adjacent-posts';
import { getCategoryImageSrc } from '@/utils/category-image';
import { getViewCount } from '@/lib/views';

// ISR every 60 seconds
export const revalidate = 60;

type Params = Promise<{ slug: string }>;

// Dynamic Metadata
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostById(slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  const categoryImage = getCategoryImageSrc(post.category);

  return {
    title: post.title, // layout.tsx의 template에 의해 제목 | HooneyLog로 표시됨
    description: post.description,
    alternates: {
      canonical: `/post/${post.id}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://hooneylog.com/post/${post.id}`,
      type: 'article',
      publishedTime: post.createdAt,
      authors: ['Hooney'],
      images: [
        {
          url: categoryImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [categoryImage],
    }
  };
}

// Generate static params for all posts
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.id,
  }));
}

export default async function PostDetailPage({ params }: { params: Params }): Promise<React.JSX.Element> {
  const { slug } = await params;

  const [allPosts, post, markdown] = await Promise.all([
    getAllPosts(),
    getPostById(slug),
    getNotionPageMarkdown(slug)
  ]);

  if (!post) {
    notFound();
  }

  // 💡 서버에서는 초기 조회수만 가져옵니다 (캐시된 값일 수 있음)
  const views = await getViewCount(slug);

  const { previousPost, nextPost } = getAdjacentPosts(allPosts, slug);

  // JSON-LD for Search Engine Optimization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: getCategoryImageSrc(post.category),
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    author: {
      '@type': 'Person',
      name: 'Hooney',
      url: 'https://hooneylog.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://hooneylog.com/post/${post.id}`,
    },
    keywords: post.tags.join(', '),
  };

  return (
    <div className="w-full flex flex-col items-center pt-10 pb-20">
      {/* 💡 SEO: Structured Data for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="w-full max-w-[720px] px-4 sm:px-6 mx-auto flex flex-col items-center">
        
        {/* 1. Top Section (Header + Author) */}
        <section className="w-full mb-12">
          <PostHeader 
            title={post.title}
            category={post.category}
            createdAt={post.createdAt}
            tags={post.tags}
            slug={slug}
            initialViews={views}
          />
        </section>

        {/* 2. Main Body Layout (Content) */}
        <section className="w-full">
          <MarkdownRenderer content={markdown.parent ?? ''} />
          
          <MoveToAnotherPost previousPost={previousPost ?? null} nextPost={nextPost ?? null} />
          <CommentProvider>
            <GiscusComment />
          </CommentProvider>
        </section>
        
      </div>
    </div>
  );
}
