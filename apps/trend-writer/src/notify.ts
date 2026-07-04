import type { Notifier } from './types';

export function createNotifier(webhookUrl: string, fetchImpl: typeof fetch = fetch): Notifier {
  return async (message: string): Promise<void> => {
    if (!webhookUrl) {
      console.log(`[notify] ${message}`);
      return;
    }
    try {
      const res = await fetchImpl(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message, text: message }),
      });
      if (!res.ok) console.error('[notify] webhook 응답 오류:', res.status);
    } catch (err) {
      console.error('[notify] webhook 실패:', err);
    }
  };
}
