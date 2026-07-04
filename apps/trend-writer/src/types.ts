export type TrendArea = 'frontend' | 'backend' | 'ai-web';

export interface TopicCandidate {
  title: string;
  whyNow: string;
  sources: string[];
  area: TrendArea;
}

export interface ResearchResult {
  facts: string[];
  sources: string[];
}

export interface DraftPost {
  title: string;
  markdown: string;
  tags: string[];
}

export interface VerifyResult {
  pass: boolean;
  reasons: string[];
}

export interface PublishInput {
  title: string;
  markdown: string;
  tags: string[];
  category: string;
  status: 'published' | 'draft';
}

export interface PublishResult {
  url: string;
  pageId: string;
}

export interface PipelineResult {
  outcome: 'published' | 'draft' | 'skipped';
  title?: string;
  url?: string;
  reasons?: string[];
}

export interface Config {
  geminiApiKey: string;
  notionApiKey: string;
  notionDatabaseId: string;
  notifyWebhookUrl: string;
  modelWrite: string;
  modelUtility: string;
}

export interface GroundedResponse {
  text: string;
  sources: string[];
}

export interface Gemini {
  generateGrounded(prompt: string, model: string): Promise<GroundedResponse>;
  generateText(prompt: string, model: string): Promise<string>;
}

export interface NotionPort {
  fetchExistingTitles(): Promise<string[]>;
  createPost(input: PublishInput): Promise<PublishResult>;
}

export type Notifier = (message: string) => Promise<void>;
