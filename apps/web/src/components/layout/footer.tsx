import { AUTHOR, AUTHOR_SOCIALS } from '@/lib/author';

export function Footer() {
  return (
    <footer className="w-full border-t border-notion-border mt-20 py-10 px-4 sm:px-6 font-mono text-[12px] text-notion-secondary flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <span>
        <span className="text-accent">$</span> hooneylog — frontend · backend · ai
      </span>
      <nav aria-label="프로필 링크" className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {AUTHOR_SOCIALS.map(({ label, href }) => {
          const external = href.startsWith('http');
          return (
            <a
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="hover:text-notion-text transition-colors"
            >
              {label}
            </a>
          );
        })}
      </nav>
      <span>
        © {new Date().getFullYear()} {AUTHOR.name} ·{' '}
        <a href="/feed.xml" className="hover:text-notion-text transition-colors">
          RSS
        </a>
      </span>
    </footer>
  );
}
