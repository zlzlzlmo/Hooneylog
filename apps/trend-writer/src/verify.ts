import type { DraftPost, Gemini, VerifyResult } from './types';
import { parseJsonBlock } from './gemini';

export function buildVerifyPrompt(draft: DraftPost, existingTitles: string[]): string {
  const titles = existingTitles.map((t) => `- ${t}`).join('\n') || '- (없음)';
  return `아래 기술 블로그 글이 자동 발행 기준을 통과하는지 냉정하게 평가해라.

기준(하나라도 미달이면 pass=false):
1. 근거 충분 — 하단 '참고 출처'에 실제 URL이 있고, 본문 주장이 근거에 기반하는가.
2. 중복 아님 — 아래 기존 글 목록과 주제가 실질적으로 겹치지 않는가.
3. 양식 준수 — # 제목, 💡 콜아웃, '## 1.'~'## 6.' 6단 헤딩이 있는가.
4. 슬롭 없음 — 이중 피동·기계적 병렬·"결론적으로/시사하는 바가 크다" 등 AI 티가 과하지 않은가.

기존 글 제목:
${titles}

평가 대상:
---
${draft.markdown}
---

아래 JSON만 출력(설명 금지):
{"pass": true|false, "reasons": ["미달 사유(있으면)"]}`;
}

interface RawVerdict {
  pass?: unknown;
  reasons?: unknown;
}

export function parseVerdict(text: string): VerifyResult {
  try {
    const raw = parseJsonBlock<RawVerdict>(text);
    const pass = raw.pass === true;
    const reasons = Array.isArray(raw.reasons)
      ? raw.reasons.filter((r): r is string => typeof r === 'string')
      : [];
    return { pass, reasons };
  } catch {
    return { pass: false, reasons: ['자가검증 응답 파싱 실패'] };
  }
}

export async function runVerify(
  gemini: Gemini,
  model: string,
  draft: DraftPost,
  existingTitles: string[],
): Promise<VerifyResult> {
  const text = await gemini.generateText(buildVerifyPrompt(draft, existingTitles), model);
  return parseVerdict(text);
}
