import type { Gemini, TopicCandidate, TrendArea } from './types';
import { parseJsonBlock } from './gemini';

export const SCAN_PROMPT = `너는 기술 블로그 편집자다. Google Search로 최근 2~4주 안의 프론트엔드·백엔드·AI 드리븐 웹개발 동향을 조사해라.
실무 개발자가 지금 배우면 유익한, 구체적이고 검증 가능한 주제 후보 6개를 뽑아라.
막연한 홍보성·마케팅 주제는 제외하고, 릴리스·스펙 변화·패턴·트러블슈팅처럼 손에 잡히는 주제를 우선한다.

각 후보를 아래 JSON 배열로만 출력해라(설명 금지):
[{"title":"한국어 제목 방향","whyNow":"지금 다룰 이유 한 문장","sources":["출처 URL"],"area":"frontend|backend|ai-web"}]`;

const AREAS: TrendArea[] = ['frontend', 'backend', 'ai-web'];

interface RawCandidate {
  title?: unknown;
  whyNow?: unknown;
  sources?: unknown;
  area?: unknown;
}

export function parseScanResult(text: string): TopicCandidate[] {
  const raw = parseJsonBlock<RawCandidate[]>(text);
  if (!Array.isArray(raw)) return [];
  const out: TopicCandidate[] = [];
  for (const item of raw) {
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!title) continue;
    const area = AREAS.includes(item.area as TrendArea) ? (item.area as TrendArea) : 'ai-web';
    const sources = Array.isArray(item.sources)
      ? item.sources.filter((s): s is string => typeof s === 'string')
      : [];
    out.push({
      title,
      whyNow: typeof item.whyNow === 'string' ? item.whyNow : '',
      sources,
      area,
    });
  }
  return out;
}

export async function runScan(gemini: Gemini, model: string): Promise<TopicCandidate[]> {
  const res = await gemini.generateGrounded(SCAN_PROMPT, model);
  return parseScanResult(res.text);
}
