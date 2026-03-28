import { NotionPost } from '@hooneylog/shared-types';

export function getAdjacentPosts(posts: NotionPost[], currentPostId: string) {
  const currentIndex = posts.findIndex(post => post.id === currentPostId);
  
  if (currentIndex === -1) {
    return { previousPost: null, nextPost: null };
  }

  // list is sorted by date descending (newest first)
  // So 'previous' chronologically means an older post (higher index in the array)
  // And 'next' chronologically means a newer post (lower index in the array)
  const previousPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

  return { previousPost, nextPost };
}
