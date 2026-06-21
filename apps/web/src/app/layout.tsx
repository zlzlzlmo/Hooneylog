import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";

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
    canonical: "/",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
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
