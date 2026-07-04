import { GoogleGenAI } from '@google/genai';
import type { Gemini, GroundedResponse } from './types';

export function extractGroundingSources(response: unknown): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const candidates = (response as { candidates?: unknown[] })?.candidates ?? [];
  for (const cand of candidates) {
    const chunks =
      (cand as { groundingMetadata?: { groundingChunks?: unknown[] } })?.groundingMetadata
        ?.groundingChunks ?? [];
    for (const chunk of chunks) {
      const uri = (chunk as { web?: { uri?: string } })?.web?.uri;
      if (uri && !seen.has(uri)) {
        seen.add(uri);
        out.push(uri);
      }
    }
  }
  return out;
}

export function parseJsonBlock<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced ? fenced[1] : text).trim();
  const first = raw.search(/[[{]/);
  if (first === -1) throw new Error('No JSON found in response');
  const open = raw[first];
  const close = open === '{' ? '}' : ']';
  const last = raw.lastIndexOf(close);
  if (last <= first) throw new Error('Malformed JSON in response');
  return JSON.parse(raw.slice(first, last + 1)) as T;
}

export function createGemini(apiKey: string): Gemini {
  const ai = new GoogleGenAI({ apiKey });
  return {
    async generateGrounded(prompt: string, model: string): Promise<GroundedResponse> {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });
      return { text: response.text ?? '', sources: extractGroundingSources(response) };
    },
    async generateText(prompt: string, model: string): Promise<string> {
      const response = await ai.models.generateContent({ model, contents: prompt });
      return response.text ?? '';
    },
  };
}
