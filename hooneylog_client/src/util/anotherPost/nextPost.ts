import AnotherPostImpletation, { AnotherPost } from './anotherPost';

class NextPost extends AnotherPostImpletation implements AnotherPost {
  getPost() {
    return this.notionList[this.currentPostIndex + 1];
  }
}

export default NextPost;
