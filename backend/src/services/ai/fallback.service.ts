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

const SPEAKING_TOPICS: SpeakingTopic[] = [
  { topic: 'Should cities make public transportation free?', category: 'Society', difficulty: 'Intermediate' },
  { topic: 'Does social media bring people closer together?', category: 'Technology', difficulty: 'Intermediate' },
  { topic: 'What can communities do to reduce food waste?', category: 'Environment', difficulty: 'Advanced' },
  { topic: 'Should people be encouraged to shop at local businesses?', category: 'Society', difficulty: 'Advanced' },
  { topic: 'Is a four-day workweek a good idea?', category: 'Career', difficulty: 'Beginner' },
  { topic: 'Should cities create more parks and public spaces?', category: 'Society', difficulty: 'Intermediate' },
  { topic: 'How can people build healthier daily habits?', category: 'Health', difficulty: 'Beginner' },
  { topic: 'Should people repair items instead of replacing them?', category: 'Environment', difficulty: 'Intermediate' },
  { topic: 'What makes a neighborhood a good place to live?', category: 'Society', difficulty: 'Beginner' },
  { topic: 'Should employers offer flexible working hours?', category: 'Career', difficulty: 'Intermediate' },
  { topic: 'How can people make online spaces more respectful?', category: 'Technology', difficulty: 'Advanced' },
  { topic: 'Should cities prioritize walking and cycling over cars?', category: 'Environment', difficulty: 'Advanced' },
  { topic: 'What makes a hobby worth pursuing?', category: 'Society', difficulty: 'Beginner' },
];

const DEBATE_TOPICS: DebateTopic[] = [
  { topic: 'Should public transportation be free?', for_stance: 'Free transit can improve access to jobs and reduce traffic.', against_stance: 'Fares help fund reliable service and transit improvements.' },
  { topic: 'Should cities restrict cars in busy downtown areas?', for_stance: 'Restrictions can reduce pollution and make streets safer for people.', against_stance: 'Restrictions can make travel harder for residents and local businesses.' },
  { topic: 'Should employers adopt a four-day workweek?', for_stance: 'A shorter week can improve well-being without reducing productivity.', against_stance: 'A shorter week may raise costs or reduce availability for customers.' },
  { topic: 'Should grocery stores donate unsold food instead of throwing it away?', for_stance: 'Donations reduce waste and help people who need food.', against_stance: 'Safe collection and delivery can be costly and difficult to coordinate.' },
  { topic: 'Should cities invest more in parks than in parking spaces?', for_stance: 'Parks support health, community life, and cleaner urban environments.', against_stance: 'Parking is needed by residents and businesses where transit is limited.' },
];

const AI_COUNTERARGUMENTS = [
  'That is a compelling perspective. However, research shows that structured guidance and accountability provided by experienced professionals often outperforms self-directed approaches in measurable outcomes.',
  'You raise a valid point. Yet studies indicate that face-to-face interaction builds emotional intelligence and critical thinking skills in ways that digital mediums have not yet replicated.',
  'A thought-provoking argument. Consider though that the most effective solutions often combine technological efficiency with human empathy — excluding either weakens the overall approach.',
];

export class FallbackAIService implements AIService {
  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async generateSpeakingTopic(input: GenerateSpeakingTopicInput): Promise<SpeakingTopic> {
    const filtered = SPEAKING_TOPICS.filter(
      t =>
        (!input.category ||
          t.category.toLowerCase() === input.category.toLowerCase()) &&
        (!input.difficulty ||
          t.difficulty.toLowerCase() === input.difficulty.toLowerCase()),
    );
    return this.pick(filtered.length ? filtered : SPEAKING_TOPICS);
  }

  async generateDebateTopic(): Promise<DebateTopic> {
    return this.pick(DEBATE_TOPICS);
  }

  async generateDebateResponse(
    _input: GenerateDebateResponseInput,
  ): Promise<DebateResponse> {
    return { response: this.pick(AI_COUNTERARGUMENTS) };
  }

  async evaluateSpeaking(input: EvaluateSpeakingInput): Promise<SpeakingEvaluation> {
    const words = input.wordCount;
    const minutes = Math.max(1, input.durationSeconds / 60);
    const wpm = words / minutes;
    const tokens: string[] = input.transcript.toLowerCase().match(/[a-z0-9']+/g) || [];
    const uniqueRatio = tokens.length ? new Set(tokens).size / tokens.length : 0;
    const topicWords: string[] = (input.topic.toLowerCase().match(/[a-z0-9']+/g) || [])
      .filter(word => word.length > 3);
    const overlap = topicWords.filter(word => tokens.includes(word)).length;
    const fluency = clampScore(50 + (wpm >= 80 && wpm <= 150 ? 25 : wpm >= 50 ? 15 : 5));
    const clarity = clampScore(55 + Math.min(30, Math.round(words / 4)));
    const vocabulary = clampScore(45 + Math.round(uniqueRatio * 45));
    const contentRelevance = clampScore(60 + Math.min(30, overlap * 6));
    const overall = Math.round(
      (fluency + clarity + vocabulary + contentRelevance) / 4,
    );

    const allStrengths = [
      'Clear central idea communicated effectively',
      'Good use of structured thinking',
      'Appropriate topic engagement',
      'Consistent vocabulary usage',
    ];
    const allImprovements = [
      'Vary sentence length to improve flow',
      'Add more specific examples to support claims',
      'Consider a stronger closing statement',
      'Pace yourself — aim for 100-130 words per minute',
    ];

    const strengthCount = words > 80 ? 3 : 2;
    const improvementCount = words > 120 ? 2 : 3;
    const strengths = allStrengths.slice(0, strengthCount);
    const improvements = allImprovements.slice(0, improvementCount);

    return {
      overall_score: overall,
      fluency,
      clarity,
      vocabulary,
      content_relevance: contentRelevance,
      strengths,
      improvements,
      feedback: `A solid practice session. Your response shows genuine engagement with the topic. Keep building your confidence and aim to speak at a comfortable, deliberate pace. Overall score: ${overall}/100.`,
    };
  }

  async evaluateDebate(input: EvaluateDebateInput): Promise<DebateEvaluation> {
    const totalWords = input.rounds.reduce(
      (sum, r) => sum + r.studentResponse.split(/\s+/).length,
      0,
    );
    const score = clampScore(55 + Math.min(30, Math.round(totalWords / 12)) + input.rounds.length * 2);
    const argumentQuality = Math.min(96, Math.max(50, score + 1));
    const relevance = Math.min(96, Math.max(50, score - 2));
    const rebuttalQuality = Math.min(96, Math.max(50, score - 4));
    const clarity = Math.min(96, Math.max(50, score + 2));
    return {
      score,
      feedback: `Well-argued debate across ${input.rounds.length} rounds. Your position was clearly stated and defended. Continue practising to develop stronger counterargument techniques. Score: ${score}/100.`,
      argument_quality: argumentQuality,
      relevance,
      rebuttal_quality: rebuttalQuality,
      clarity,
      strengths: ['Position stated clearly', 'Response supported with relevant reasoning'],
      weaknesses: ['Some points could use more specific evidence'],
      suggestions: ['Use a concrete example in each round', 'Address the opposing argument directly'],
    };
  }
}

function clampScore(value: number): number {
  return Math.max(40, Math.min(95, Math.round(value)));
}
