import React, { Component } from 'react';
import PostTag from './PostTag';

const OTagType = {
  post: 'POST',
} as const;

type TagType = typeof OTagType[keyof typeof OTagType];

export interface TagProps {
  tagType: TagType;
  children: string;
}

class Tag extends Component<TagProps> {
  renderElement(props: TagProps) {
    switch (props.tagType) {
      case OTagType.post:
        return <PostTag {...props} />;
      default:
        console.error('Tag Props 확인');
    }
  }

  render() {
    return this.renderElement(this.props);
  }
}

export default Tag;
