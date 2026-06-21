import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full h-[56px] bg-white/90 backdrop-blur-md border-b border-notion-border flex items-center px-4 sm:px-6">
      <Link
        href="/"
        className="flex items-center gap-2 h-full px-2 rounded-[4px] hover:bg-notion-hover transition-colors"
      >
        <span
          aria-hidden="true"
          className="w-[24px] h-[24px] rounded-[6px] bg-notion-text text-white flex items-center justify-center font-bold text-[14px] tracking-tight"
        >
          H
        </span>
        <span className="font-semibold text-[15px] text-notion-text tracking-tight">HooneyLog</span>
      </Link>
    </header>
  );
}
