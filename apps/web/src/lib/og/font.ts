import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Noto Sans KR (Bold), subset to Latin + all modern Hangul + punctuation.
 * SIL Open Font License 1.1 — see NotoSansKR-OFL.txt in this folder.
 *
 * Loaded lazily from the function bundle (webpack emits the asset via the
 * `new URL(..., import.meta.url)` reference) so OG image generation no longer
 * depends on fetching a subset from Google Fonts at request time — that fetch
 * could fail and silently drop the real (Korean) title.
 */
let cached: ArrayBuffer | null = null;

export function loadNotoSansKrBold(): ArrayBuffer {
  if (cached) return cached;
  const path = fileURLToPath(new URL('./NotoSansKR-Bold-subset.ttf', import.meta.url));
  const buffer = readFileSync(path);
  cached = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  return cached;
}
