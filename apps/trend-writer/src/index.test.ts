import { describe, it, expect, vi } from 'vitest';
import { runPipeline } from './index';
import type { Config, Gemini, NotionPort } from './types';

const config: Config = {
  geminiApiKey: 'g', notionApiKey: 'n', notionDatabaseId: 'd',
  aiCategory: 'AI 트렌드', notifyWebhookUrl: '',
  modelWrite: 'w', modelUtility: 'u',
};

function geminiFor(opts: { scan: string; research: string; write: string; humanize: string; verify: string }): Gemini {
  const texts = [opts.write, opts.humanize, opts.verify];
  let i = 0;
  return {
    generateGrounded: vi.fn(async (prompt: string) =>
      prompt.includes('후보') || prompt.includes('동향')
        ? { text: opts.scan, sources: [] }
        : { text: opts.research, sources: ['https://src'] },
    ),
    generateText: vi.fn(async () => texts[i++] ?? ''),
  };
}

const scanJson = '[{"title":"새 주제","whyNow":"w","sources":["https://a"],"area":"frontend"}]';
const researchJson = '{"facts":["사실1"],"sources":["https://r"]}';
const post = '# 새 주제\n\n## 1. 문제의 배경\n본문\n## 6. 마치며\n끝';

function notionFor(titles: string[]): NotionPort {
  return {
    fetchExistingTitles: async () => titles,
    createPost: vi.fn(async () => ({ pageId: 'p', url: 'https://notion/p' })),
  };
}

const noSourceScanJson = '[{"title":"새 주제","whyNow":"w","sources":[],"area":"frontend"}]';

function geminiNoSources(): Gemini {
  const texts = [post, post, '{"pass":true,"reasons":[]}'];
  let i = 0;
  return {
    generateGrounded: vi.fn(async (prompt: string) =>
      prompt.includes('후보') || prompt.includes('동향')
        ? { text: noSourceScanJson, sources: [] }
        : { text: '{"facts":["f"],"sources":[]}', sources: [] },
    ),
    generateText: vi.fn(async () => texts[i++] ?? ''),
  };
}

describe('runPipeline', () => {
  it('정상 흐름: 통과 시 published', async () => {
    const notify = vi.fn(async () => {});
    const res = await runPipeline({
      gemini: geminiFor({ scan: scanJson, research: researchJson, write: post, humanize: post, verify: '{"pass":true,"reasons":[]}' }),
      notion: notionFor(['다른 글']),
      notify, config,
    });
    expect(res.outcome).toBe('published');
    expect(res.url).toBe('https://notion/p');
  });

  it('전부 중복이면 skipped, 발행 안 함', async () => {
    const notion = notionFor(['새 주제']);
    const res = await runPipeline({
      gemini: geminiFor({ scan: scanJson, research: researchJson, write: post, humanize: post, verify: '{"pass":true}' }),
      notion, notify: async () => {}, config,
    });
    expect(res.outcome).toBe('skipped');
    expect(notion.createPost).not.toHaveBeenCalled();
  });

  it('검증 실패 시 draft로 발행', async () => {
    const notion = notionFor(['다른 글']);
    const res = await runPipeline({
      gemini: geminiFor({ scan: scanJson, research: researchJson, write: post, humanize: post, verify: '{"pass":false,"reasons":["근거 부족"]}' }),
      notion, notify: async () => {}, config,
    });
    expect(res.outcome).toBe('draft');
    expect(res.reasons).toContain('근거 부족');
    expect(notion.createPost).toHaveBeenCalledOnce();
  });

  it('연구 출처가 전혀 없으면 verify 통과여도 draft로 발행', async () => {
    const notion = notionFor(['다른 글']);
    const res = await runPipeline({
      gemini: geminiNoSources(),
      notion, notify: async () => {}, config,
    });
    expect(res.outcome).toBe('draft');
    expect(notion.createPost).toHaveBeenCalledOnce();
  });
});
