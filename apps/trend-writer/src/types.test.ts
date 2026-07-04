import { describe, it, expect } from 'vitest';
import type { TopicCandidate, PipelineResult } from './types';

describe('types', () => {
  it('구조가 컴파일되고 값을 담는다', () => {
    const c: TopicCandidate = { title: 'T', whyNow: 'w', sources: ['https://a'], area: 'frontend' };
    const r: PipelineResult = { outcome: 'skipped' };
    expect(c.area).toBe('frontend');
    expect(r.outcome).toBe('skipped');
  });
});
