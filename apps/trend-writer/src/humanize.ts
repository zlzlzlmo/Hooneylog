import type { DraftPost, Gemini } from './types';
import { buildHumanizePrompt } from './prompts/humanize-rules';
import { extractTitle } from './write';

export async function runHumanize(
  gemini: Gemini,
  model: string,
  draft: DraftPost,
): Promise<DraftPost> {
  const result = await gemini.generateText(buildHumanizePrompt(draft.markdown), model);
  const trimmed = result.trim();
  if (!trimmed) return draft;
  return {
    title: extractTitle(trimmed) || draft.title,
    markdown: trimmed,
    tags: draft.tags,
  };
}
