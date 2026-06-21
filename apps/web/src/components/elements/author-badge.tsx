import Image from 'next/image';
import { AUTHOR } from '@/lib/author';

export function AuthorBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 40 : 48;
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative rounded-full overflow-hidden border border-notion-border bg-notion-bg flex-shrink-0"
        style={{ width: dim, height: dim }}
      >
        <Image src={AUTHOR.avatar} alt={AUTHOR.name} fill className="object-cover" />
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-medium text-notion-text">{AUTHOR.name}</span>
        <span className="text-[13px] text-notion-secondary">{AUTHOR.tagline}</span>
      </div>
    </div>
  );
}
