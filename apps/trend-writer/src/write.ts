import type { DraftPost, Gemini, ResearchResult, TopicCandidate, TrendArea } from './types';
import { buildWritePrompt } from './prompts/blog-format';

const AREA_TAG: Record<TrendArea, string> = {
  frontend: '프론트엔드',
  backend: '백엔드',
  'ai-web': 'AI',
};

// 분야를 블로그의 실제 카테고리 값(Frontend/Backend/Artificial Intelligence)으로 매핑한다.
const AREA_CATEGORY: Record<TrendArea, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  'ai-web': 'Artificial Intelligence',
};

export function categoryForArea(area: TrendArea): string {
  return AREA_CATEGORY[area];
}

// 제목 바로 아래에 결정론적으로 삽입되는 AI 고지(항상 동일). 상단 노출 + 인간 사칭 방지.
// 인용(>) 블록은 martian 변환 시 내용이 비어버리므로 일반 볼드 문단으로 둔다.
export const AI_DISCLOSURE =
  '**🤖 안녕하세요, 최신 기술 동향을 직접 조사해 정리한 AI 글입니다. 사실은 아래 출처로 확인할 수 있으니 함께 읽어주세요.**';

export function extractTitle(markdown: string): string {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m && m[1] ? m[1].trim() : '';
}

// 첫 H1(제목) 바로 다음 줄에 AI 고지를 삽입한다. H1이 없으면 맨 앞에 붙인다.
export function insertDisclosure(markdown: string): string {
  const lines = markdown.split('\n');
  const idx = lines.findIndex((l) => /^#\s+/.test(l));
  if (idx === -1) return `${AI_DISCLOSURE}\n\n${markdown}`;
  lines.splice(idx + 1, 0, '', AI_DISCLOSURE);
  return lines.join('\n');
}

// 하단 푸터는 학습용 '참고 출처' 링크만. AI 고지는 상단(insertDisclosure)에서 처리.
export function assembleFooter(sources: string[]): string {
  const list = sources.length ? sources.map((u) => `- ${u}`).join('\n') : '- (출처 없음)';
  return ['', '---', '', '**참고 출처**', '', list, ''].join('\n');
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
  return { title, markdown: body, tags: deriveTags(topic) };
}
