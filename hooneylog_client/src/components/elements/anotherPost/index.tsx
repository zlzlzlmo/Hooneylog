import { NotionPost } from 'services/notion/notionApi';
import React, { Component } from 'react';
import NextPost from './NextPost';
import PreviosPost from './PreviosPost';

const OAnotherPostType = {
  previos: 'PREVIOS',
  next: 'NEXT',
} as const;

type AnotherPostType = typeof OAnotherPostType[keyof typeof OAnotherPostType];

export interface AnotherPostProps {
  postType: AnotherPostType;
  postItem?: NotionPost;
}

class AnotherPost extends Component<AnotherPostProps> {
  renderElement(props: AnotherPostProps) {
    switch (props.postType) {
      case OAnotherPostType.previos:
        return <PreviosPost {...props} />;
      case OAnotherPostType.next:
        return <NextPost {...props} />;
      default:
        console.error('Another Post 컴포넌트 props 확인');
    }
  }
  render() {
    return this.renderElement(this.props);
  }
}

export default AnotherPost;
