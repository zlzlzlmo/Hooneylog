import { Header } from './header';
import { Footer } from './footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-notion-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded-[4px] focus:bg-notion-text focus:text-white"
      >
        본문으로 건너뛰기
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-[1392px] mx-auto px-4 sm:px-6 md:px-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
