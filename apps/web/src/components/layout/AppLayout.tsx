import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  return (
    <div className="grid grid-rows-[6rem_1fr_10rem] relative w-full min-h-screen">
      <Header />
      <main className="max-w-[var(--container-max)] w-full mx-auto max-mobile:px-5">
        {children}
      </main>
      <Footer />
    </div>
  );
}
