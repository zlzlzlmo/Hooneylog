import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hooneylog.com'),
  title: {
    default: "HooneyLog",
    template: "%s | HooneyLog"
  },
  description: "HooneyLog Blog based on Notion API",
  verification: {
    google: "fRen9BNDD5VjyRybbMKn5tm68CqHW5r_XjGb4BTvmSg",
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
    <html lang="ko" className={inter.className}>
      <body className="min-h-full flex flex-col m-0 p-0 text-notion-text bg-notion-bg">
        <AppLayout>{children}</AppLayout>
        <Analytics />
      </body>
    </html>
  );
}
