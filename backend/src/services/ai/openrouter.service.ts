import { env } from '../../config/env';
import { BaseAIService } from './base.service';

interface OpenRouterResponse {
  choices?: {
    message?: {
      content?: string | { type?: string; text?: string }[] | null;
    };
  }[];
  error?: { message?: string };
}

/** Uses OpenRouter for generation while reusing shared prompts, validation, and fallback behavior. */
export class OpenRouterAIService extends BaseAIService {
  protected override async generateText(prompt: string): Promise<string> {
    const apiKey = env.OPENROUTER_API_KEY;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    if (env.OPENROUTER_SITE_URL) headers['HTTP-Referer'] = env.OPENROUTER_SITE_URL;
    if (env.OPENROUTER_APP_NAME) headers['X-Title'] = env.OPENROUTER_APP_NAME;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: env.AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as OpenRouterResponse;
    if (!response.ok) {
      throw new Error(`OpenRouter API error ${response.status}: ${data.error?.message || response.statusText}`);
    }

    const content = data.choices?.[0]?.message?.content;
    const text = typeof content === 'string'
      ? content
      : content?.map((part) => part.text || '').join('');
    if (!text?.trim()) throw new Error('Empty response from OpenRouter');
    return text.trim();
  }
}
