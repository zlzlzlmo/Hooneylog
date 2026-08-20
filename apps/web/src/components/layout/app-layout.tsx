import { Navbar17, type NavItem } from '@/components/navbar17';
import { SiteFooter } from '@/components/layout/site-footer';

// Categories are a home-page filter (not tags), so nav points at the home
// filter via ?category=<real category name>. The home page seeds its active
// category from this param.
const NAV_ITEMS: NavItem[] = [
  // No `category`: matches the home page with no ?category= param.
  { name: '전체', link: '/' },
  { name: 'Frontend', link: '/?category=Frontend', category: 'Frontend' },
  { name: 'Backend', link: '/?category=Backend', category: 'Backend' },
  {
    name: 'AI',
    link: `/?category=${encodeURIComponent('Artificial Intelligence')}`,
    category: 'Artificial Intelligence',
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        본문으로 건너뛰기
      </a>
      <Navbar17 logo={{ title: 'hooneylog', url: '/' }} items={NAV_ITEMS} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
