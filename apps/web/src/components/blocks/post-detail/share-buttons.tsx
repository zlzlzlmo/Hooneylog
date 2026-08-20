'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { FaLinkedin, FaXTwitter } from 'react-icons/fa6';

import { Button } from '@/components/ui/button';

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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-medium">공유하기</p>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="icon" className="rounded-full">
          <a href={x} target="_blank" rel="noopener noreferrer" aria-label="X에 공유">
            <FaXTwitter className="size-4" />
          </a>
        </Button>
        <Button asChild variant="outline" size="icon" className="rounded-full">
          <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn에 공유">
            <FaLinkedin className="size-4" />
          </a>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={copy}
          aria-label={copied ? '링크 복사됨' : '링크 복사'}
        >
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
