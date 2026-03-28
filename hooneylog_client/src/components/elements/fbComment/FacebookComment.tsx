import React, { useEffect } from 'react';
import Script from 'next/script';

interface FbCommentProps {
  slug: string;
}

const FacebookComment = ({ slug }: FbCommentProps) => {
  useEffect(() => {
    if ((window as any).FB) {
      (window as any).FB.XFBML.parse();
    }
  }, []);

  return (
    <>
      <div className="fb-comments" data-href={`https://www.hooneylog.com/post1/detail/${slug}`} data-width="100%" />
      <Script
        id="facebook-jssdk"
        src="https://connect.facebook.net/ko_KR/sdk.js#xfbml=1&version=v13.0&appId=540132141049632&autoLogAppEvents=1"
        async
        defer
        crossOrigin="anonymous"
      />
      <div id="fb-root" />
    </>
  );
};

export default FacebookComment;
