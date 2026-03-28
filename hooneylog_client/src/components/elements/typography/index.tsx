import React, { Component } from 'react';
import DateFormatText from './Date';
import PostDesc from './PostDesc';
import PostDetailTitle from './PostDetailTitle';
import PostTitle from './PostTitle';
import ReadMore from './ReadMore';

const OTypographyType = {
  postTitle: 'POST_TITLE',
  postDetailTitle: 'POST_DETAIL_TITLE',
  postDescription: 'POST_DESC',
  readMore: 'READ_MORE',
  date: 'DATE',
} as const;

type TypographyType = typeof OTypographyType[keyof typeof OTypographyType];

export interface TypographyProps {
  typoType: TypographyType;
  children: string;
  margin?: string;
}

class Typography extends Component<TypographyProps> {
  renderElement(props: TypographyProps) {
    switch (props.typoType) {
      case OTypographyType.postTitle:
        return <PostTitle {...props} />;
      case OTypographyType.postDetailTitle:
        return <PostDetailTitle {...props} />;
      case OTypographyType.postDescription:
        return <PostDesc {...props} />;
      case OTypographyType.readMore:
        return <ReadMore {...props} />;
      case OTypographyType.date:
        return <DateFormatText {...props} />;
      default:
        console.error('Typography Props 확인');
    }
  }
  render() {
    return this.renderElement(this.props);
  }
}

export default Typography;
