import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "HooneyLog",
  description: "HooneyLog Blog based on Notion API",
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
      </body>
    </html>
  );
}
