import { AIService } from './ai.interface';
import { FallbackAIService } from './fallback.service';
import { env } from '../../config/env';

function createAIService(): AIService {
  if (env.OPENROUTER_API_KEY && env.AI_MODEL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { OpenRouterAIService } = require('./openrouter.service');
      console.log('🤖 Using OpenRouter AI service');
      return new OpenRouterAIService() as AIService;
    } catch (e) {
      console.warn('⚠️  Failed to load OpenRouter service, using fallback:', e);
    }
  }
  console.log('🔄 Using fallback AI service (configure OPENROUTER_API_KEY and AI_MODEL to enable AI)');
  return new FallbackAIService();
}

export const aiService: AIService = createAIService();
