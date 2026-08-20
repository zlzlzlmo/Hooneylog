import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import { HiOutlineMail } from 'react-icons/hi';
import { SiVelog } from 'react-icons/si';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AUTHOR } from '@/lib/author';
import { cn } from '@/lib/utils';

interface Footer29Props {
  /** Passed in rather than read here: prerendering can't read the clock. */
  year: number;
  className?: string;
}

const navigationLinks = [
  {
    title: '카테고리',
    links: [
      { name: 'Frontend', href: '/?category=Frontend' },
      { name: 'Backend', href: '/?category=Backend' },
      {
        name: 'Artificial Intelligence',
        href: `/?category=${encodeURIComponent('Artificial Intelligence')}`,
      },
    ],
  },
  {
    title: '사이트',
    links: [
      { name: '전체 글', href: '/' },
      { name: 'RSS', href: '/feed.xml' },
      { name: '사이트맵', href: '/sitemap.xml' },
    ],
  },
];

const socialLinks = [
  { name: 'GitHub', href: AUTHOR.links.github, icon: FaGithub },
  { name: 'LinkedIn', href: AUTHOR.links.linkedin, icon: FaLinkedin },
  { name: 'velog', href: AUTHOR.links.velog, icon: SiVelog },
  { name: 'Email', href: AUTHOR.links.email, icon: HiOutlineMail },
];

const Footer29 = ({ year, className }: Footer29Props) => {
  return (
    <section className={cn('mt-24 border-t py-16', className)}>
      <div className="container mx-auto">
        <footer>
          <div className="flex flex-col justify-between gap-10 lg:flex-row">
            <div className="flex max-w-sm flex-col items-start gap-4">
              <Link href="/" className="text-lg font-semibold tracking-tighter">
                hooneylog
              </Link>
              <p className="text-sm text-muted-foreground">{AUTHOR.role}</p>
            </div>
            <div className="grid grid-cols-2 gap-12 md:gap-20">
              {navigationLinks.map((section) => (
                <div key={section.title} className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold">{section.title}</h3>
                  <ul className="flex flex-col gap-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-10 lg:my-14" />
          <div className="flex flex-col justify-between gap-6 text-sm font-medium text-muted-foreground lg:flex-row lg:items-end">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-medium uppercase">KEEP IN TOUCH</p>
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    aria-label={link.name}
                    {...(link.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="inline-flex size-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <link.icon className="size-4.5" />
                  </a>
                ))}
              </div>
            </div>
            <p className="order-last text-xs lg:order-none">
              © {year} {AUTHOR.name}. All rights reserved.
            </p>
            {AUTHOR.openToWork && (
              <Badge
                variant="outline"
                className="h-auto w-fit gap-2 rounded-full bg-background px-3 py-1.5 text-xs text-foreground"
              >
                <span className="relative size-[0.4375rem] shrink-0">
                  <span className="absolute top-1/2 left-1/2 z-10 size-[0.6875rem] -translate-1/2 animate-pulse rounded-full bg-green-400/50" />
                  <span className="absolute top-1/2 left-1/2 z-20 size-full -translate-1/2 rounded-full bg-green-500" />
                </span>
                구직 중 · Open to work
              </Badge>
            )}
          </div>
        </footer>
      </div>
    </section>
  );
};

export { Footer29 };
