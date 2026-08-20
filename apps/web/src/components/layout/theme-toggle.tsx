'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

// 테마는 <html class="dark"> 가 원본. React state 로 복제하지 않고 그대로 구독한다.
// 서버 스냅샷은 항상 false 라 하이드레이션 불일치가 없고, 다른 곳에서 클래스를
// 바꿔도(초기 인라인 스크립트 등) 버튼이 따라온다.
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    () => document.documentElement.classList.contains('dark'),
    () => false,
  );

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // storage unavailable; no-op
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      aria-pressed={isDark}
      className="flex items-center justify-center w-8 h-8 rounded-[4px] text-notion-secondary hover:bg-notion-hover hover:text-notion-text transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
