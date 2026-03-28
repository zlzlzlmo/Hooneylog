import { NotionPost } from 'services/notion/notionApi';
import NextPost from './nextPost';
import PreviousPost from './previosPost';

interface ICreateAnotherPost {
  type: 'previos' | 'next';
  notionList: NotionPost[];
  currentPost: NotionPost;
}

export default function createAnotherPost({ type, notionList, currentPost }: ICreateAnotherPost) {
  if (type === 'previos') {
    return new PreviousPost(notionList, currentPost);
  }
  return new NextPost(notionList, currentPost);
}
