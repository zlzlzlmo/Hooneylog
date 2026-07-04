import type { DraftPost, Gemini, ResearchResult, TopicCandidate, TrendArea } from './types';
import { buildWritePrompt } from './prompts/blog-format';

const AREA_TAG: Record<TrendArea, string> = {
  frontend: '프론트엔드',
  backend: '백엔드',
  'ai-web': 'AI',
};

export function extractTitle(markdown: string): string {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m && m[1] ? m[1].trim() : '';
}

export function assembleFooter(sources: string[]): string {
  const list = sources.length ? sources.map((u) => `- ${u}`).join('\n') : '- (출처 없음)';
  return [
    '',
    '---',
    '',
    '> 이 글은 AI가 최신 기술 동향을 조사·정리해 자동으로 작성·발행한 지식 전파용 글입니다. 정확성을 위해 아래 출처를 함께 확인해 주세요.',
    '',
    '**참고 출처**',
    '',
    list,
    '',
  ].join('\n');
}

export function appendFooter(markdown: string, sources: string[]): string {
  return `${markdown.trimEnd()}\n${assembleFooter(sources)}`;
}

export function deriveTags(topic: TopicCandidate): string[] {
  return [AREA_TAG[topic.area]];
}

export async function runWrite(
  gemini: Gemini,
  model: string,
  topic: TopicCandidate,
  research: ResearchResult,
): Promise<DraftPost> {
  const body = await gemini.generateText(buildWritePrompt(topic, research), model);
  const title = extractTitle(body) || topic.title;
  const markdown = appendFooter(body, research.sources);
  return { title, markdown, tags: deriveTags(topic) };
}
