import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hooneylog.com'),
  title: {
    default: "HooneyLog",
    template: "%s | HooneyLog"
  },
  description: "HooneyLog Blog based on Notion API",
  verification: {
    google: "uTxOPNaU5TsgLGH-7rdPqKlIJNF-fNwBpt7wqNh4dzE",
  },
  alternates: {
    // No root-level canonical: it would be inherited by any route that doesn't
    // set its own, self-canonicalizing them to "/". Each route declares its own.
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'HooneyLog RSS' }],
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className={jetbrainsMono.variable}>
      <body className="min-h-full flex flex-col m-0 p-0 text-notion-text bg-notion-bg">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <AppLayout>{children}</AppLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
