import AnotherPostImpletation, { AnotherPost } from './anotherPost';

class PreviousPost extends AnotherPostImpletation implements AnotherPost {
  getPost() {
    return this.notionList[this.currentPostIndex - 1];
  }
}
export default PreviousPost;
