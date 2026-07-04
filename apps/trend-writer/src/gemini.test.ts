import { describe, it, expect } from 'vitest';
import { extractGroundingSources, parseJsonBlock } from './gemini';

describe('extractGroundingSources', () => {
  it('groundingChunks의 web.uri를 중복 제거해 뽑는다', () => {
    const resp = {
      candidates: [
        {
          groundingMetadata: {
            groundingChunks: [
              { web: { uri: 'https://a.com', title: 'A' } },
              { web: { uri: 'https://b.com', title: 'B' } },
              { web: { uri: 'https://a.com', title: 'A dup' } },
            ],
          },
        },
      ],
    };
    expect(extractGroundingSources(resp)).toEqual(['https://a.com', 'https://b.com']);
  });

  it('메타데이터가 없으면 빈 배열', () => {
    expect(extractGroundingSources({ candidates: [{}] })).toEqual([]);
  });
});

describe('parseJsonBlock', () => {
  it('코드펜스로 감싼 JSON 배열을 파싱한다', () => {
    const text = 'here:\n```json\n[{"title":"x"}]\n```\ndone';
    expect(parseJsonBlock<Array<{ title: string }>>(text)).toEqual([{ title: 'x' }]);
  });

  it('펜스 없는 객체도 파싱한다', () => {
    expect(parseJsonBlock<{ pass: boolean }>('{"pass": true}')).toEqual({ pass: true });
  });

  it('JSON이 없으면 throw', () => {
    expect(() => parseJsonBlock('no json here')).toThrow();
  });
});
