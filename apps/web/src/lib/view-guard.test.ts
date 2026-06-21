import { describe, it, expect } from 'vitest';
import { getClientIp, hashIp } from './view-guard';

describe('getClientIp', () => {
  it('returns the first IP from a multi-value x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });

  it('returns a single x-forwarded-for value', () => {
    const headers = new Headers({ 'x-forwarded-for': '9.9.9.9' });
    expect(getClientIp(headers)).toBe('9.9.9.9');
  });

  it('falls back to x-real-ip when x-forwarded-for is missing', () => {
    const headers = new Headers({ 'x-real-ip': '8.8.8.8' });
    expect(getClientIp(headers)).toBe('8.8.8.8');
  });

  it('returns "unknown" when no IP header is present', () => {
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});

describe('hashIp', () => {
  it('is deterministic for the same IP', () => {
    expect(hashIp('1.2.3.4')).toBe(hashIp('1.2.3.4'));
  });

  it('does not return the raw IP', () => {
    expect(hashIp('1.2.3.4')).not.toBe('1.2.3.4');
  });

  it('produces different hashes for different IPs', () => {
    expect(hashIp('1.2.3.4')).not.toBe(hashIp('1.2.3.5'));
  });

  it('returns a 16-char hex string', () => {
    expect(hashIp('1.2.3.4')).toMatch(/^[0-9a-f]{16}$/);
  });
});
