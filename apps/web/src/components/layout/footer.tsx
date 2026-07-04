import { AUTHOR } from '@/lib/author';

export function Footer() {
  return (
    <footer className="w-full border-t border-notion-border mt-20 py-10 px-4 sm:px-6 font-mono text-[12px] text-notion-secondary flex flex-wrap items-center justify-between gap-3">
      <span>
        <span className="text-accent">$</span> hooneylog — frontend · backend · ai
      </span>
      <span>
        © {new Date().getFullYear()} {AUTHOR.name} ·{' '}
        <a href="/feed.xml" className="hover:text-notion-text transition-colors">
          RSS
        </a>
      </span>
    </footer>
  );
}
