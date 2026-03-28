/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotionPost } from 'services/notion/notionApi';

export interface AnotherPost {
  getPost: () => void;
}

abstract class AnotherPostImpletation {
  protected readonly notionList;

  protected readonly currentPost;

  constructor(notionList: NotionPost[], currentPost: NotionPost) {
    this.notionList = notionList;
    this.currentPost = currentPost;
  }

  protected get currentPostIndex() {
    return this.notionList.findIndex(({ id }) => id === this.currentPost.id);
  }
}

export default AnotherPostImpletation;
