import { cacheLife } from 'next/cache';

import { Footer29 } from '@/components/footer29';

export async function SiteFooter() {
  // Cache Components: reading the clock during prerender is a build error unless
  // the value is cached. The copyright year only has to be right within a day.
  'use cache';
  cacheLife('days');

  return <Footer29 year={new Date().getFullYear()} />;
}
