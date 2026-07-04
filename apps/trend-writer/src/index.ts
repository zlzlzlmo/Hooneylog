import { Client } from '@notionhq/client';
import type { Config, Gemini, NotionPort, Notifier, PipelineResult, TrendArea } from './types';
import { loadConfig } from './config';
import { createGemini } from './gemini';
import { createNotifier } from './notify';
import { createNotionPort } from './publish';
import { areaForWeekday, runScan } from './scan';
import { pickFreshTopic } from './dedup';
import { runResearch } from './research';
import { appendFooter, insertDisclosure, runWrite } from './write';
import { runHumanize } from './humanize';
import { runVerify } from './verify';

export interface PipelineDeps {
  gemini: Gemini;
  notion: NotionPort;
  notify: Notifier;
  config: Config;
  targetArea?: TrendArea;
}

export async function runPipeline(deps: PipelineDeps): Promise<PipelineResult> {
  const { gemini, notion, notify, config, targetArea } = deps;

  const candidates = await runScan(gemini, config.modelUtility, targetArea);
  const existing = await notion.fetchExistingTitles();
  const topic = pickFreshTopic(candidates, existing);

  if (!topic) {
    await notify('트렌드 스캔 결과가 전부 기존 글과 중복되어 이번 회차를 건너뜁니다.');
    return { outcome: 'skipped' };
  }

  const research = await runResearch(gemini, config.modelUtility, topic);
  const draft = await runWrite(gemini, config.modelWrite, topic, research);
  const humanized = await runHumanize(gemini, config.modelWrite, draft);
  const withFooter = {
    ...humanized,
    markdown: appendFooter(insertDisclosure(humanized.markdown), research.sources),
  };
  const verdict = await runVerify(gemini, config.modelUtility, withFooter, existing);

  const status = verdict.pass && research.sources.length > 0 ? 'published' : 'draft';
  const result = await notion.createPost({
    title: withFooter.title,
    markdown: withFooter.markdown,
    tags: withFooter.tags,
    status,
  });

  const reasons = verdict.pass && research.sources.length === 0 ? ['근거 출처 없음'] : verdict.reasons;
  const reasonLine = status === 'draft' ? `\n사유: ${reasons.join('; ')}` : '';
  await notify(`[${status}] ${withFooter.title}\n${result.url}${reasonLine}`);

  return {
    outcome: status,
    title: withFooter.title,
    url: result.url,
    reasons: status === 'draft' ? reasons : undefined,
  };
}

export async function main(): Promise<void> {
  const config = loadConfig();
  const gemini = createGemini(config.geminiApiKey);
  const client = new Client({ auth: config.notionApiKey });
  const notion = createNotionPort(
    client as unknown as Parameters<typeof createNotionPort>[0],
    config.notionDatabaseId,
    config.aiCategory,
  );
  const notify = createNotifier(config.notifyWebhookUrl);
  const targetArea = areaForWeekday(new Date().getDay());
  const result = await runPipeline({ gemini, notion, notify, config, targetArea });
  console.log(`[trend-writer] 분야(로테이션): ${targetArea}`);
  console.log('[trend-writer] 결과:', JSON.stringify(result));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[trend-writer] 실패:', err);
    process.exit(1);
  });
}
