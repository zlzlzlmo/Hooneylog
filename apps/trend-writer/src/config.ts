import type { Config } from './types';

function required(env: NodeJS.ProcessEnv, key: string): string {
  const v = env[key];
  if (!v) throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
  return v;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    geminiApiKey: required(env, 'GEMINI_API_KEY'),
    notionApiKey: required(env, 'NOTION_API_KEY'),
    notionDatabaseId: required(env, 'NOTION_DATABASE_ID'),
    aiCategory: env.AI_CATEGORY ?? 'AI 트렌드',
    notifyWebhookUrl: env.NOTIFY_WEBHOOK_URL ?? '',
    modelWrite: env.GEMINI_MODEL_WRITE ?? 'gemini-2.5-pro',
    modelUtility: env.GEMINI_MODEL_UTILITY ?? 'gemini-2.5-flash',
  };
}
