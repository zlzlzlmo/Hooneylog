'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

const SITE = 'https://hooneylog.com';

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE}/post/${slug}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; no-op
    }
  };

  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const cls =
    'flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] border border-notion-border text-notion-secondary hover:bg-notion-hover hover:text-notion-text transition-colors no-underline cursor-pointer';

  return (
    <div className="flex flex-wrap items-center gap-2 my-10">
      <span className="text-[13px] text-notion-secondary mr-1">공유하기</span>
      <a href={x} target="_blank" rel="noopener noreferrer" className={cls} aria-label="X에 공유">X</a>
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className={cls} aria-label="LinkedIn에 공유">LinkedIn</a>
      <button type="button" onClick={copy} className={cls} aria-label={copied ? '링크 복사됨' : '링크 복사'}>
        {copied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
        {copied ? '복사됨' : '링크 복사'}
      </button>
    </div>
  );
}
