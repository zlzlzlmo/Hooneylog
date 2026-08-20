'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { cn } from '@/lib/utils';

export interface NavItem {
  name: string;
  link: string;
  /** Home-page category this item filters to; undefined for plain links. */
  category?: string;
}

interface Navbar17Props {
  logo: { title: string; url: string };
  items: NavItem[];
  className?: string;
}

/**
 * The active item comes from the URL (`/?category=…`), so a refresh or a shared
 * link keeps the right tab lit. `useSearchParams` opts its subtree into client
 * rendering, hence the Suspense boundary — the rest of the header stays static.
 */
function useActiveItem(items: NavItem[]): string {
  const pathname = usePathname();
  const category = useSearchParams().get('category');

  if (pathname !== '/') return '';
  return items.find((item) => item.category === category)?.name ?? items[0]?.name ?? '';
}

const Navbar17 = ({ logo, items, className }: Navbar17Props) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/85 py-3 backdrop-blur-md',
        className,
      )}
    >
      <nav className="container mx-auto flex items-center justify-between gap-4">
        <Link href={logo.url} className="flex items-center gap-1">
          <span className="text-lg font-semibold tracking-tighter">{logo.title}</span>
          <span
            aria-hidden="true"
            className="inline-block h-4 w-[7px] translate-y-px bg-foreground motion-safe:animate-[blink_1.15s_steps(1)_infinite]"
          />
        </Link>

        <Suspense fallback={<div className="hidden lg:block lg:h-10" />}>
          <DesktopNav items={items} />
        </Suspense>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Suspense fallback={null}>
            <MobileNav items={items} />
          </Suspense>
        </div>
      </nav>
    </header>
  );
};

export { Navbar17 };

const DesktopNav = ({ items }: { items: NavItem[] }) => {
  const activeItem = useActiveItem(items);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = document.querySelector(
        `[data-nav-item="${activeItem}"]`,
      ) as HTMLElement | null;

      if (activeEl && indicatorRef.current && menuRef.current) {
        const menuRect = menuRef.current.getBoundingClientRect();
        const itemRect = activeEl.getBoundingClientRect();

        indicatorRef.current.style.opacity = '1';
        indicatorRef.current.style.width = `${itemRect.width}px`;
        indicatorRef.current.style.left = `${itemRect.left - menuRect.left}px`;
      } else if (indicatorRef.current) {
        // Off the home page nothing is active, so hide the underline entirely.
        indicatorRef.current.style.opacity = '0';
      }
    };
    updateIndicator();
    window.addEventListener('resize', updateIndicator);

    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeItem]);

  return (
    <NavigationMenu className="hidden lg:block">
      <NavigationMenuList ref={menuRef} className="flex items-center gap-6 rounded-4xl px-8 py-3">
        {items.map((item) => (
          <React.Fragment key={item.name}>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href={item.link}
                  data-nav-item={item.name}
                  aria-current={activeItem === item.name ? 'page' : undefined}
                  className={`relative cursor-pointer text-sm font-medium hover:bg-transparent ${
                    activeItem === item.name ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </React.Fragment>
        ))}
        {/* Active Indicator */}
        <div
          ref={indicatorRef}
          className="absolute bottom-2 flex h-1 items-center justify-center px-2 opacity-0 transition-all duration-300"
        >
          <div className="h-0.5 w-full rounded-t-none bg-foreground transition-all duration-300" />
        </div>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const AnimatedHamburger = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className="group relative size-full">
      <div className="absolute flex size-full items-center justify-center">
        <Menu
          className={`absolute size-6 text-muted-foreground transition-all duration-300 group-hover:text-foreground ${
            isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
          }`}
        />
        <X
          className={`absolute size-6 text-muted-foreground transition-all duration-300 group-hover:text-foreground ${
            isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
          }`}
        />
      </div>
    </div>
  );
};

const MobileNav = ({ items }: { items: NavItem[] }) => {
  const activeItem = useActiveItem(items);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-full items-center lg:hidden">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="메뉴 열기">
            <AnimatedHamburger isOpen={isOpen} />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-xl p-0 lg:hidden"
        >
          <ul className="w-full bg-background py-4 text-foreground">
            {items.map((navItem) => (
              <li key={navItem.name}>
                <Link
                  href={navItem.link}
                  onClick={() => setIsOpen(false)}
                  aria-current={activeItem === navItem.name ? 'page' : undefined}
                  className={`flex items-center border-l-[3px] px-6 py-4 text-sm font-medium transition-all duration-75 ${
                    activeItem === navItem.name
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {navItem.name}
                </Link>
              </li>
            ))}
            <li className="flex flex-col px-6 py-2 sm:hidden">
              <ThemeToggle className="w-fit" />
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};
