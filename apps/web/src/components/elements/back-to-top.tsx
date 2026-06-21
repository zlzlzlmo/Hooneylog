'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  const scrollToTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="맨 위로"
      className="fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full border border-notion-border bg-notion-bg text-notion-text shadow-sm hover:bg-notion-hover transition-colors flex items-center justify-center cursor-pointer"
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
