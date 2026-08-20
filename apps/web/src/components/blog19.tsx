import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Blog19Item {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  link: string;
}

interface Blog19Props {
  heading?: string;
  items: Blog19Item[];
  className?: string;
}

const Blog19 = ({ heading = '관련 글', items, className }: Blog19Props) => {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className={cn('py-16', className)}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
        <h2 id="related-heading" className="text-2xl font-semibold md:text-3xl">
          {heading}
        </h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/">전체 글 보기</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10">
        {items.map((item) => (
          <Link key={item.id} href={item.link} className="group flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">{item.category}</span>
            <h3 className="mb-1 text-lg font-semibold wrap-anywhere text-balance group-hover:underline">
              {item.title}
            </h3>
            <p className="mb-4 line-clamp-3 wrap-anywhere text-sm text-muted-foreground">
              {item.description}
            </p>
            <span className="mt-auto text-sm font-medium text-muted-foreground">{item.date}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export { Blog19 };
