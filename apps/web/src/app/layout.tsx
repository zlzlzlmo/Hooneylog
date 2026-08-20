import type { Metadata } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hooneylog.com'),
  title: {
    default: 'HooneyLog',
    template: '%s | HooneyLog',
  },
  description: 'HooneyLog Blog based on Notion API',
  verification: {
    google: 'uTxOPNaU5TsgLGH-7rdPqKlIJNF-fNwBpt7wqNh4dzE',
  },
  alternates: {
    // No root-level canonical: it would be inherited by any route that doesn't
    // set its own, self-canonicalizing them to "/". Each route declares its own.
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'HooneyLog RSS' }],
    },
  },
};

// Site-wide entity graph: identifies the site (WebSite) and its author (Person)
// for Google's knowledge panel, and reconciles the "Hooney" pen name with the
// legal name via `alternateName`.
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://hooneylog.com/#website',
      url: 'https://hooneylog.com',
      name: 'HooneyLog',
      description: 'HooneyLog — 프론트엔드·백엔드·AI/RAG 기술 블로그',
      inLanguage: 'ko-KR',
      publisher: { '@id': 'https://hooneylog.com/#person' },
      // Sitelinks searchbox: the home page reads `?q=` and seeds its search.
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://hooneylog.com/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Person',
      '@id': 'https://hooneylog.com/#person',
      name: 'Seunghoon Shin',
      alternateName: 'Hooney',
      url: 'https://hooneylog.com',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`font-sans ${geist.variable} ${jetbrainsMono.variable}`}
    >
      <body className="m-0 flex min-h-full flex-col p-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=(t==='dark'||t==='light')?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <AppLayout>{children}</AppLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
