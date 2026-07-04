import type { TopicCandidate } from './types';

export function normalizeTitle(title: string): string {
  return title
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

export function isDuplicate(candidate: string, existing: string[]): boolean {
  const n = normalizeTitle(candidate);
  if (!n) return false;
  const contains = (a: string, b: string): boolean => b.length >= 6 && a.includes(b);
  return existing.some((e) => {
    const en = normalizeTitle(e);
    return en === n || contains(en, n) || contains(n, en);
  });
}

export function pickFreshTopic(
  candidates: TopicCandidate[],
  existingTitles: string[],
): TopicCandidate | null {
  return candidates.find((c) => !isDuplicate(c.title, existingTitles)) ?? null;
}
