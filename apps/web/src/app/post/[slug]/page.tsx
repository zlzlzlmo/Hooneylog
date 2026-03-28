import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostById, getBlocksById } from '@/lib/notion';
import { PostDetailInfo } from '@/components/blocks/postDetail/PostDetailInfo';
import { PostBlocks } from '@/components/blocks/postDetail/PostBlocks';
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

  const [allPosts, post, blocks] = await Promise.all([
    getAllPosts(),
    getPostById(slug),
    getBlocksById(slug)
  ]);

  if (!post) {
    notFound();
  }

  const { previousPost, nextPost } = getAdjacentPosts(allPosts, slug);

  return (
    <main className="w-full max-w-[850px] mx-auto py-20 px-6">
      <PostDetailInfo 
        title={post.title} 
        createdAt={post.createdAt} 
        tags={post.tags} 
      />
      <PostBlocks blocks={blocks} />
      <MoveToAnotherPost previousPost={previousPost} nextPost={nextPost} />
      <FacebookComment slug={slug} />
    </main>
  );
}
