import { createHash } from 'node:crypto';

/**
 * 요청 헤더에서 클라이언트 IP를 추출합니다.
 * Vercel/프록시 환경 기준: x-forwarded-for(첫 IP) → x-real-ip → 'unknown'.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;
  return 'unknown';
}

const SALT = process.env.VIEW_HASH_SALT ?? 'hooneylog-view-salt-v1';

/**
 * IP를 salt+sha256으로 해시한 16자 hex를 반환합니다.
 * 원본 IP를 KV에 남기지 않기 위함입니다.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(SALT + ip).digest('hex').slice(0, 16);
}
