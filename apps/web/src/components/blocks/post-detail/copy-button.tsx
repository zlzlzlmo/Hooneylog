'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; no-op
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? '복사됨' : '코드 복사'}
      className="flex items-center gap-1.5 px-2 py-1 rounded-[3px] font-mono text-[11px] tracking-[0.06em] text-notion-secondary hover:text-notion-text hover:bg-notion-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-notion-bg"
    >
      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      {copied ? '복사됨' : '복사'}
    </button>
  );
}
