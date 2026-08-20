import 'server-only';
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

/**
 * IP 해시에 쓰는 salt를 반환합니다. 이 salt는 비밀이 아니라, 짧은 기간(24h) 조회 중복을
 * 판별하기 위한 dedup 토큰입니다. 다만 알려진 salt는 IPv4(2^32) 공간을 역산할 수 있으므로,
 * 프로덕션에서는 VIEW_HASH_SALT 미설정 시 조용히 커밋된 폴백으로 넘어가지 않고 loud fail 합니다.
 */
function resolveSalt(): string {
  const salt = process.env.VIEW_HASH_SALT;
  if (salt) return salt;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'VIEW_HASH_SALT is required in production for view-dedup IP hashing (no committed fallback).',
    );
  }
  return 'hooneylog-view-salt-dev';
}

/**
 * IP를 salt+sha256으로 해시한 16자 hex를 반환합니다.
 * 원본 IP를 KV에 남기지 않기 위함입니다.
 */
export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(resolveSalt() + ip)
    .digest('hex')
    .slice(0, 16);
}
