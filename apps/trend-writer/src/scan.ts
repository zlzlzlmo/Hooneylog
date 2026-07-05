import type { Gemini, TopicCandidate, TrendArea } from './types';
import { parseJsonBlock } from './gemini';

const AREAS: TrendArea[] = ['frontend', 'backend', 'ai-web'];

const AREA_LABEL: Record<TrendArea, string> = {
  frontend: '프론트엔드',
  backend: '백엔드',
  'ai-web': 'AI 드리븐 웹개발',
};

// 요일 기반 분야 로테이션으로 분야 쏠림을 방지한다(월 프론트 / 수 백엔드 / 금 AI). day: 0(일)~6(토).
export function areaForWeekday(day: number): TrendArea {
  return AREAS[Math.floor(day / 2) % 3] ?? 'ai-web';
}

// TARGET_AREA 환경변수로 분야를 수동 지정할 수 있고, 없으면 요일 로테이션을 쓴다.
export function resolveArea(override: string | undefined, day: number): TrendArea {
  return AREAS.includes(override as TrendArea) ? (override as TrendArea) : areaForWeekday(day);
}

export function buildScanPrompt(area?: TrendArea): string {
  const scope = area
    ? `Google Search로 최근 4주 안의 '${AREA_LABEL[area]}'(${area}) 분야 동향만 집중 조사해라. 다른 분야 주제는 제외한다.`
    : `Google Search로 최근 4주 안의 프론트엔드·백엔드·AI 드리븐 웹개발 동향을 조사해라.`;
  const areaRule = area ? `\n모든 후보의 "area"는 "${area}"로 설정한다.` : '';
  return `너는 기술 블로그 편집자다. ${scope}
실무 개발자가 지금 배우면 유익한, 구체적이고 검증 가능한 주제 후보 6개를 뽑아라.
막연한 홍보성·마케팅 주제는 제외하고, 릴리스·스펙 변화·패턴·트러블슈팅처럼 손에 잡히는 주제를 우선한다.${areaRule}

각 후보를 아래 JSON 배열로만 출력해라(설명 금지):
[{"title":"한국어 제목 방향","whyNow":"지금 다룰 이유 한 문장","sources":["출처 URL"],"area":"frontend|backend|ai-web"}]`;
}

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
    if (!item || typeof item !== 'object') continue;
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

export async function runScan(
  gemini: Gemini,
  model: string,
  area?: TrendArea,
): Promise<TopicCandidate[]> {
  const res = await gemini.generateGrounded(buildScanPrompt(area), model);
  const candidates = parseScanResult(res.text);
  // 로테이션 분야가 지정되면 태그가 항상 그 분야를 반영하도록 고정한다.
  return area ? candidates.map((c) => ({ ...c, area })) : candidates;
}
