import { describe, it, expect, vi } from 'vitest';
import { createNotifier } from './notify';

describe('createNotifier', () => {
  it('webhook 미설정 시 fetch 호출 없이 로깅만', async () => {
    const fetchSpy = vi.fn();
    const notify = createNotifier('', fetchSpy as unknown as typeof fetch);
    await notify('메시지');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('webhook 설정 시 content/text 페이로드로 POST', async () => {
    const fetchSpy = vi.fn(async () => ({ ok: true }) as Response);
    const notify = createNotifier('https://hook', fetchSpy as unknown as typeof fetch);
    await notify('메시지');
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://hook');
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.content).toBe('메시지');
    expect(body.text).toBe('메시지');
  });
});
