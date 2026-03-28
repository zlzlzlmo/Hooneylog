'use client';

import React, { useEffect } from 'react';

interface FbCommentProps {
  slug: string;
}

export function FacebookComment({ slug }: FbCommentProps) {
  useEffect(() => {
    // Dynamically load FB SDK if not exists
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/ko_KR/sdk.js#xfbml=1&version=v13.0&appId=540132141049632&autoLogAppEvents=1';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    } else if ('FB' in window) {
      (window as unknown as { FB: { XFBML: { parse: () => void } } }).FB.XFBML.parse();
    }
  }, [slug]);

  return (
    <div className="mt-10 mb-20">
      <div id="fb-root" />
      <div 
        className="fb-comments" 
        data-href={`https://www.hooneylog.com/post/${slug}`} 
        data-width="100%" 
        data-numposts="5"
      />
    </div>
  );
}
