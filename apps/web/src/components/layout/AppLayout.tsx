import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 w-full max-w-[1392px] mx-auto px-4 sm:px-6 md:px-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
