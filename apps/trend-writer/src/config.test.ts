import { describe, it, expect } from 'vitest';
import { loadConfig } from './config';

describe('loadConfig', () => {
  it('필수 값이 없으면 throw', () => {
    expect(() => loadConfig({})).toThrow(/GEMINI_API_KEY/);
  });

  it('기본 모델·카테고리를 채운다', () => {
    const c = loadConfig({
      GEMINI_API_KEY: 'g',
      NOTION_API_KEY: 'n',
      NOTION_DATABASE_ID: 'd',
    });
    expect(c.modelWrite).toBe('gemini-2.5-pro');
    expect(c.modelUtility).toBe('gemini-2.5-flash');
    expect(c.aiCategory).toBe('AI 트렌드');
    expect(c.notifyWebhookUrl).toBe('');
  });
});
