import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostById, getNotionPageMarkdown } from '@/lib/notion';
import { PostHeader } from '@/components/blocks/postDetail/PostHeader';
import { MarkdownRenderer } from '@/components/blocks/postDetail/MarkdownRenderer';
import { MoveToAnotherPost } from '@/components/blocks/postDetail/MoveToAnotherPost';
import { FacebookComment } from '@/components/blocks/postDetail/FacebookComment';
import { getAdjacentPosts } from '@/utils/adjacentPosts';

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

  return {
    title: `Hooneylog - ${post.title}`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.hooneylog.com/post/${post.id}`,
      type: 'article',
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

export default async function PostDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  const [allPosts, post, markdown] = await Promise.all([
    getAllPosts(),
    getPostById(slug),
    getNotionPageMarkdown(slug)
  ]);

  if (!post) {
    notFound();
  }

  const { previousPost, nextPost } = getAdjacentPosts(allPosts, slug);

  return (
    <div className="w-full flex flex-col items-center pt-10 pb-20">
      
      {/* Unified Layout Container for Detail Page */}
      <div className="w-full max-w-[800px] px-4 sm:px-6 mx-auto flex flex-col items-center">
        
        {/* 1. Top Section (Header + Author) */}
        <section className="w-full mb-12">
          <PostHeader 
            title={post.title}
            category={post.category}
            createdAt={post.createdAt}
            tags={post.tags}
          />
        </section>

        {/* 2. Main Body Layout (Content) */}
        <section className="w-full">
          <MarkdownRenderer content={markdown.parent} />
          
          <MoveToAnotherPost previousPost={previousPost} nextPost={nextPost} />
          <FacebookComment slug={slug} />
        </section>
        
      </div>
    </div>
  );
}
