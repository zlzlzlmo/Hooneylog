import type { Gemini, ResearchResult, TopicCandidate } from './types';
import { parseJsonBlock } from './gemini';

export function buildResearchPrompt(topic: TopicCandidate): string {
  return `Google Search로 아래 주제를 심층 조사해라. 추측 금지, 검색으로 확인된 사실만 수집한다.

주제: ${topic.title}
분야: ${topic.area}
배경: ${topic.whyNow}

버전·API·동작 원리·실무 트레이드오프·흔한 함정을 포함해 8~14개의 구체적 사실을 뽑아라.
각 사실은 검색 출처로 뒷받침돼야 한다. 아래 JSON만 출력(설명 금지):
{"facts":["구체적 사실 문장", "..."],"sources":["근거 URL", "..."]}`;
}

interface RawResearch {
  facts?: unknown;
}

export function parseResearchFacts(text: string): string[] {
  const raw = parseJsonBlock<RawResearch>(text);
  if (!Array.isArray(raw.facts)) return [];
  return raw.facts.filter((f): f is string => typeof f === 'string' && f.trim().length > 0);
}

export async function runResearch(
  gemini: Gemini,
  model: string,
  topic: TopicCandidate,
): Promise<ResearchResult> {
  const res = await gemini.generateGrounded(buildResearchPrompt(topic), model);
  const facts = parseResearchFacts(res.text);
  const merged = new Set<string>([...res.sources, ...topic.sources]);
  return { facts, sources: [...merged] };
}
