'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Check, Copy } from 'lucide-react';

export function CodeBlock({ code, language }: { code: string; language: string }) {
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
    <div className="group/code relative my-[1.2em] text-[14px] rounded-[3px] overflow-hidden border border-notion-border font-mono">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? '복사됨' : '코드 복사'}
        className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-[4px] text-[12px] bg-white/10 text-white/80 opacity-0 group-hover/code:opacity-100 hover:bg-white/20 transition-opacity"
      >
        {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
        {copied ? '복사됨' : '복사'}
      </button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        className="code-highlighter !m-0 !p-6 overflow-x-auto"
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
