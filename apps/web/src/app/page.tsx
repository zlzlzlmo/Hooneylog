import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/notion';
import { getGlobalStats, getViewCounts } from '@/lib/views';
import { ALL } from '@/utils/category';
import { HomePageClient } from './home-page-client';

// Hourly ISR; Notion data is Data-Cached for the same window and invalidated
// on-demand via /api/revalidate, so a tighter interval would only add render
// churn without surfacing fresher content.
export const revalidate = 3600;

// The home page reads a `?category=` filter param. Self-canonicalize to "/" so
// the filtered variants (?category=React, …) consolidate onto one indexable URL
// instead of splitting into near-duplicate entries. `types` is repeated here
// because Next.js overwrites (not deep-merges) the layout's `alternates`.
export const metadata: Metadata = {
  description:
    '막힌 지점부터 되짚는 기술 기록. 프론트엔드·백엔드·AI/RAG 개발 로그 — HooneyLog.',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'HooneyLog RSS' }],
    },
  },
  openGraph: {
    title: 'HooneyLog',
    description: '막힌 지점부터 되짚는 기술 기록. 프론트엔드·백엔드·AI/RAG 개발 로그.',
    url: 'https://hooneylog.com',
    type: 'website',
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const posts = await getAllPosts();

  const [stats, viewsMap, { category, q }] = await Promise.all([
    getGlobalStats(),
    getViewCounts(posts.map(p => p.id)),
    searchParams,
  ]);

  // The header category nav links here with ?category=<name>. Only seed a real
  // category (one that actually exists on a post); anything else falls back to
  // 전체 so an unknown param never lands on an empty list.
  const knownCategories = new Set(posts.map(p => p.category).filter(Boolean));
  const initialCategory = category && knownCategories.has(category) ? category : ALL;

  // `?q=` seeds the search box — the target of the WebSite SearchAction (root
  // layout), which is what makes a shareable search URL and Google's sitelinks
  // searchbox valid.
  const initialSearch = q ?? '';

  return (
    <HomePageClient
      initialPosts={posts}
      stats={stats}
      viewsMap={viewsMap}
      initialCategory={initialCategory}
      initialSearch={initialSearch}
    />
  );
}
