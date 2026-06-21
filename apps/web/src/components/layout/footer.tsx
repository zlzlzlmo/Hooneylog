import { AUTHOR } from '@/lib/author';

export function Footer() {
  return (
    <footer className="w-full border-t border-notion-border py-12 mt-20 flex flex-col items-center justify-center text-sm text-notion-secondary">
      <div>© {new Date().getFullYear()} {AUTHOR.name}. All rights reserved.</div>
    </footer>
  );
}
