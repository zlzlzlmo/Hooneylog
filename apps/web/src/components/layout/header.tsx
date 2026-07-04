import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

// Categories are a home-page filter (not tags), so nav points at the home
// filter via ?category=<real category name>. The home page seeds its active
// category from this param.
const NAV = [
  { category: 'Frontend', label: 'frontend', cls: 'hover:text-cat-fe' },
  { category: 'Backend', label: 'backend', cls: 'hover:text-cat-be' },
  { category: 'Artificial Intelligence', label: 'ai', cls: 'hover:text-cat-ai' },
].map((n) => ({ ...n, href: `/?category=${encodeURIComponent(n.category)}` }));

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full h-[46px] bg-notion-bg/85 backdrop-blur-md border-b border-notion-border flex items-center gap-4 px-4 sm:px-6 font-mono text-[12.5px]">
      <Link
        href="/"
        className="flex items-center gap-[3px] font-semibold tracking-tight text-notion-text rounded-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg"
      >
        hooneylog
        <span
          aria-hidden="true"
          className="inline-block w-[7px] h-[14px] bg-accent translate-y-[2px] motion-safe:animate-[blink_1.15s_steps(1)_infinite]"
        />
      </Link>
      <nav aria-label="카테고리" className="ml-auto flex items-center gap-5 text-notion-secondary">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`lowercase transition-colors ${n.cls}`}>
            {n.label}
          </Link>
        ))}
      </nav>
      <ThemeToggle />
    </header>
  );
}
