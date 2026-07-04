import { describe, it, expect } from 'vitest';
import { parseScanResult, runScan } from './scan';
import type { Gemini } from './types';

describe('parseScanResult', () => {
  it('JSON 배열을 TopicCandidate[]로 파싱하고 잘못된 항목을 거른다', () => {
    const text = '```json\n[{"title":"A","whyNow":"w","sources":["https://a"],"area":"frontend"},{"title":""}]\n```';
    const out = parseScanResult(text);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('A');
    expect(out[0].area).toBe('frontend');
  });

  it('area가 이상하면 ai-web으로 보정', () => {
    const out = parseScanResult('[{"title":"A","whyNow":"w","sources":[],"area":"weird"}]');
    expect(out[0].area).toBe('ai-web');
  });

  it('null·비객체 항목을 크래시 없이 걸러낸다', () => {
    const out = parseScanResult('[{"title":"A","whyNow":"w","sources":[],"area":"frontend"}, null, 42]');
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('A');
  });
});

describe('runScan', () => {
  it('gemini.generateGrounded 결과를 파싱해 반환', async () => {
    const gemini: Gemini = {
      generateGrounded: async () => ({
        text: '[{"title":"A","whyNow":"w","sources":["https://a"],"area":"backend"}]',
        sources: ['https://a'],
      }),
      generateText: async () => '',
    };
    const out = await runScan(gemini, 'm');
    expect(out[0].area).toBe('backend');
  });
});
