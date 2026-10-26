import {
  AIService,
  GenerateSpeakingTopicInput,
  GenerateDebateResponseInput,
  EvaluateSpeakingInput,
  EvaluateDebateInput,
} from './ai.interface';
import {
  SpeakingTopic,
  DebateTopic,
  DebateResponse,
  SpeakingEvaluation,
  DebateEvaluation,
} from '../../types';
import { FallbackAIService } from './fallback.service';
import { z } from 'zod';

const score = z.number().int().min(0).max(100);
const speakingTopicSchema = z.object({
  topic: z.string().min(5).max(500),
  category: z.string().min(2).max(80),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
});
const debateTopicSchema = z.object({
  topic: z.string().min(5).max(500),
  for_stance: z.string().min(5).max(500),
  against_stance: z.string().min(5).max(500),
});
const speakingEvaluationSchema = z.object({
  overall_score: score,
  fluency: score,
  clarity: score,
  vocabulary: score,
  content_relevance: score,
  strengths: z.array(z.string().min(2).max(250)).min(1).max(5),
  improvements: z.array(z.string().min(2).max(250)).min(1).max(5),
  feedback: z.string().min(10).max(2000),
});
const debateEvaluationSchema = z.object({
  score,
  feedback: z.string().min(10).max(2000),
  argument_quality: score,
  relevance: score,
  rebuttal_quality: score,
  clarity: score,
  strengths: z.array(z.string().min(2).max(250)).min(1).max(5),
  weaknesses: z.array(z.string().min(2).max(250)).min(1).max(5),
  suggestions: z.array(z.string().min(2).max(250)).min(1).max(5),
});

export abstract class BaseAIService implements AIService {
  private readonly fallback: FallbackAIService;

  constructor() {
    this.fallback = new FallbackAIService();
  }

  protected abstract generateText(prompt: string): Promise<string>;

  private parseJSON<T>(text: string, schema: z.ZodType<T>): T {
    // strip ```json ... ``` fences if present
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return schema.parse(JSON.parse(cleaned));
  }

  async generateSpeakingTopic(
    input: GenerateSpeakingTopicInput,
  ): Promise<SpeakingTopic> {
    try {
      const prompt = `Generate a single public speaking practice topic as JSON. Choose a varied, relatable subject from everyday life, culture, health, work, community, environment, technology, or society. Avoid making topics about school, students, or education unless the requested category is Education. Do not repeatedly favor one subject area.
${input.category ? `Category: ${input.category}` : 'Pick any interesting category.'}
${input.difficulty ? `Difficulty: ${input.difficulty}` : 'Use Intermediate difficulty.'}

Respond ONLY with valid JSON in this exact format (no other text):
{
  "topic": "<engaging debate/speech topic>",
  "category": "<category name>",
  "difficulty": "Beginner" | "Intermediate" | "Advanced"
}`;
      const raw = await this.generateText(prompt);
      return this.parseJSON(raw, speakingTopicSchema);
    } catch (err) {
      console.warn('AI generateSpeakingTopic failed, using fallback:', err);
      return this.fallback.generateSpeakingTopic(input);
    }
  }

  async generateDebateTopic(): Promise<DebateTopic> {
    try {
      const prompt = `Generate a debate topic for a general audience practice debate as JSON. Choose a varied, relatable subject such as everyday life, culture, health, work, community, environment, technology, or society. Avoid school, students, and education topics unless specifically requested. Do not repeatedly favor one subject area.

Respond ONLY with valid JSON in this exact format (no other text):
{
  "topic": "<clear debate proposition>",
  "for_stance": "<one sentence argument in favor>",
  "against_stance": "<one sentence argument against>"
}`;
      const raw = await this.generateText(prompt);
      return this.parseJSON(raw, debateTopicSchema);
    } catch (err) {
      console.warn('AI generateDebateTopic failed, using fallback:', err);
      return this.fallback.generateDebateTopic();
    }
  }

  async generateDebateResponse(
    input: GenerateDebateResponseInput,
  ): Promise<DebateResponse> {
    try {
      const historyText = input.conversationHistory
        .map(
          (h, i) =>
            `Round ${i + 1} prompt: ${h.prompt}\nStudent: ${h.response}`,
        )
        .join('\n\n');

      const prompt = `You are an AI debate opponent in round ${input.round} of 3.
Topic: "${input.topic}"
Your position: ${input.position === 'FOR' ? 'AGAINST' : 'FOR'} (opposite of student)

${historyText ? `Previous rounds:\n${historyText}\n\n` : ''}Student's argument in round ${input.round}:
"${input.studentResponse}"

Respond with a concise, well-argued counterargument (2-4 sentences). Be respectful but firm. Do NOT use JSON — just write your response directly.`;

      const response = await this.generateText(prompt);
      return { response: z.string().min(5).max(3000).parse(response) };
    } catch (err) {
      console.warn('AI generateDebateResponse failed, using fallback:', err);
      return this.fallback.generateDebateResponse(input);
    }
  }

  async evaluateSpeaking(input: EvaluateSpeakingInput): Promise<SpeakingEvaluation> {
    try {
      const wpm = input.wordCount / Math.max(1, input.durationSeconds / 60);
      const prompt = `Evaluate this student speech practice. Score each dimension 0-100.

Topic: "${input.topic}"
Duration: ${input.durationSeconds} seconds (${wpm.toFixed(0)} words/min)
Word count: ${input.wordCount}
Transcript: "${input.transcript}"

Respond ONLY with valid JSON in this exact format (no other text):
{
  "overall_score": <0-100>,
  "fluency": <0-100>,
  "clarity": <0-100>,
  "vocabulary": <0-100>,
  "content_relevance": <0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "feedback": "<2-3 sentence personalised feedback paragraph>"
}`;
      const raw = await this.generateText(prompt);
      return this.parseJSON(raw, speakingEvaluationSchema);
    } catch (err) {
      console.warn('AI evaluateSpeaking failed, using fallback:', err);
      return this.fallback.evaluateSpeaking(input);
    }
  }

  async evaluateDebate(input: EvaluateDebateInput): Promise<DebateEvaluation> {
    try {
      const roundsText = input.rounds
        .map(
          (r, i) =>
            `Round ${i + 1}:\nPrompt: ${r.prompt}\nStudent: ${r.studentResponse}`,
        )
        .join('\n\n');

      const prompt = `Evaluate this student's debate performance. Score 0-100.

Topic: "${input.topic}"
Student position: ${input.position}

${roundsText}

Respond ONLY with valid JSON in this exact format (no other text):
{
  "score": <0-100>,
  "argument_quality": <0-100>,
  "relevance": <0-100>,
  "rebuttal_quality": <0-100>,
  "clarity": <0-100>,
  "strengths": ["<strength>", "<strength>"],
  "weaknesses": ["<weakness>"],
  "suggestions": ["<suggestion>", "<suggestion>"],
  "feedback": "<3-4 sentence personalised feedback paragraph covering argumentation quality, evidence usage, and how to improve>"
}`;
      const raw = await this.generateText(prompt);
      return this.parseJSON(raw, debateEvaluationSchema);
    } catch (err) {
      console.warn('AI evaluateDebate failed, using fallback:', err);
      return this.fallback.evaluateDebate(input);
    }
  }
}
