import * as toxicity from '@tensorflow-models/toxicity';
import nlp from 'compromise';

// Groq API Configuration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-8b-8192';

// Rate limiting for Groq (14,400 requests/day = 600/hour = 10/minute)
let groqRequestCount = 0;
let groqResetTime = Date.now() + 60000;
const GROQ_MAX_PER_MINUTE = 10;

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  source: 'groq' | 'browser' | 'cache' | 'fallback';
}

class AIService {
  private toxicityModel: toxicity.ToxicityClassifier | null = null;
  private cache: Map<string, { result: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  async initialize() {
    try {
      this.toxicityModel = await toxicity.load(0.85, []);
      console.log('AI Service initialized');
    } catch (error) {
      console.warn('Failed to load toxicity model:', error);
    }
  }

  private canUseGroq(): boolean {
    const now = Date.now();
    if (now > groqResetTime) {
      groqRequestCount = 0;
      groqResetTime = now + 60000;
    }
    return groqRequestCount < GROQ_MAX_PER_MINUTE;
  }

  private incrementGroqCount() {
    groqRequestCount++;
  }

  private getCacheKey(feature: string, input: string): string {
    return `${feature}:${input.slice(0, 100)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    return null;
  }

  private setCache(key: string, result: any) {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  private async callGroq(prompt: string): Promise<AIResponse> {
    if (!this.canUseGroq()) {
      return { success: false, error: 'Rate limit exceeded', source: 'fallback' };
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      this.incrementGroqCount();
      const data = await response.json();
      return {
        success: true,
        data: data.choices[0]?.message?.content,
        source: 'groq',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'fallback',
      };
    }
  }

  // F1: Bot Detection
  async detectBots(usernames: string[]): Promise<AIResponse> {
    const cacheKey = this.getCacheKey('bot-detection', usernames.join(','));
    const cached = this.getFromCache(cacheKey);
    if (cached) return { success: true, data: cached, source: 'cache' };

    const results = usernames.map(username => {
      const lower = username.toLowerCase();
      let score = 0;
      const flags: string[] = [];

      if (/\d{4,}/.test(lower)) { score += 0.3; flags.push('numeric_suffix'); }
      if (/^[a-z]+_\d+$/.test(lower)) { score += 0.2; flags.push('name_number_pattern'); }
      if (/(bot|auto|spam|fake)/.test(lower)) { score += 0.5; flags.push('suspicious_keyword'); }
      if (lower.length > 20) { score += 0.15; flags.push('excessive_length'); }
      if (/^x[a-z0-9]{8,}$/.test(lower)) { score += 0.25; flags.push('random_string'); }
      if (lower.split('').filter((c, i, a) => c === a[i-1]).length > 3) { score += 0.2; flags.push('repeated_chars'); }

      return {
        username,
        botProbability: Math.min(score, 1),
        isBot: score > 0.6,
        confidence: score > 0.8 ? 'high' : score > 0.5 ? 'medium' : 'low',
        flags,
      };
    });

    this.setCache(cacheKey, results);
    return { success: true, data: results, source: 'browser' };
  }

  // F2: Toxicity Detection
  async detectToxicity(text: string): Promise<AIResponse> {
    const cacheKey = this.getCacheKey('toxicity', text);
    const cached = this.getFromCache(cacheKey);
    if (cached) return { success: true, data: cached, source: 'cache' };

    if (this.toxicityModel) {
      const predictions = await this.toxicityModel.classify([text]);
      const result = {
        isToxic: predictions.some(p => p.results[0].match),
        toxicityScore: Math.max(...predictions.map(p => p.results[0].probabilities[1])),
        categories: predictions
          .filter(p => p.results[0].match)
          .map(p => p.label),
      };
      this.setCache(cacheKey, result);
      return { success: true, data: result, source: 'browser' };
    }

    // Fallback: Compromise.js + heuristics
    const lowerText = text.toLowerCase();
    const profanityWords = ['bad', 'hate', 'stupid', 'idiot', 'dumb', 'ugly', 'worst', 'terrible', 'awful'];
    const profanity = profanityWords.filter(w => lowerText.includes(w)).length;
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    const exclamationCount = (text.match(/!/g) || []).length;

    const score = Math.min(
      (profanity * 0.4) + (capsRatio * 0.3) + (exclamationCount * 0.1),
      1
    );

    const result = {
      isToxic: score > 0.5,
      toxicityScore: score,
      categories: score > 0.5 ? ['toxicity'] : [],
    };

    this.setCache(cacheKey, result);
    return { success: true, data: result, source: 'browser' };
  }

  // F3: Sentiment Analysis
  async analyzeSentiment(texts: string[]): Promise<AIResponse> {
    const results = texts.map(text => {
      const positiveWords = ['good', 'great', 'amazing', 'love', 'best', 'awesome', 'excellent', 'fantastic', 'perfect', 'beautiful'];
      const negativeWords = ['bad', 'terrible', 'hate', 'worst', 'awful', 'horrible', 'disgusting', 'pathetic', 'useless', 'boring'];
      
      const lower = text.toLowerCase();
      const positive = positiveWords.filter(w => lower.includes(w)).length;
      const negative = negativeWords.filter(w => lower.includes(w)).length;
      
      const positiveEmojis = /[😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝😐🤗🤩🤔🤭🤫🤝👍🙌👏✨🎉🔥❤️💯]/gu;
      const negativeEmojis = /[😒😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤒🤕🤢🤮🤧👎💔😿🙀]/gu;
      
      const posEmojiCount = (text.match(positiveEmojis) || []).length;
      const negEmojiCount = (text.match(negativeEmojis) || []).length;
      
      const score = ((positive + posEmojiCount) - (negative + negEmojiCount)) / Math.max(texts.length, 1);
      
      return {
        text: text.slice(0, 100),
        sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
        score: Math.max(-1, Math.min(1, score)),
        positiveIndicators: positive + posEmojiCount,
        negativeIndicators: negative + negEmojiCount,
      };
    });

    return { success: true, data: results, source: 'browser' };
  }

  // F4: Hashtag Recommendations
  async recommendHashtags(content: string, count: number = 10): Promise<AIResponse> {
    const cacheKey = this.getCacheKey('hashtags', content);
    const cached = this.getFromCache(cacheKey);
    if (cached) return { success: true, data: cached, source: 'cache' };

    const doc = nlp(content);
    const nouns = doc.nouns().json().map((n: any) => n.text.toLowerCase());
    const topics = doc.topics().json().map((t: any) => t.text.toLowerCase());
    
    const baseTags = [...new Set([...nouns, ...topics])];
    const hashtags: string[] = [];
    
    baseTags.forEach(tag => {
      const clean = tag.replace(/[^a-z0-9]/g, '');
      if (clean.length > 2) {
        hashtags.push(clean);
        hashtags.push(clean + 's');
        hashtags.push(clean + 'community');
      }
    });

    if (content.length > 200) hashtags.push('longread', 'detailed', 'indepth');
    if (content.includes('?')) hashtags.push('question', 'ask');
    if (content.includes('!')) hashtags.push('excited', 'announcement');

    const engagementTags = ['viral', 'trending', 'explore', 'discover', 'instagood', 'love', 'follow'];
    
    const result = {
      hashtags: [...new Set([...hashtags, ...engagementTags])].slice(0, count),
      relevance: baseTags.length / Math.max(hashtags.length, 1),
      categories: this.categorizeHashtags(hashtags),
    };

    this.setCache(cacheKey, result);
    return { success: true, data: result, source: 'browser' };
  }

  private categorizeHashtags(hashtags: string[]): Record<string, string[]> {
    const categories: Record<string, string[]> = {
      niche: hashtags.filter(h => h.length > 8),
      popular: hashtags.filter(h => ['love', 'instagood', 'viral', 'trending'].includes(h)),
      community: hashtags.filter(h => h.includes('community')),
      branded: [],
    };
    return categories;
  }

  // F21: Viral Prediction
  async predictViralPotential(content: string, platform: string): Promise<AIResponse> {
    const cacheKey = this.getCacheKey('viral', content + platform);
    const cached = this.getFromCache(cacheKey);
    if (cached) return { success: true, data: cached, source: 'cache' };

    const factors = {
      hookStrength: this.analyzeHook(content.slice(0, 50)),
      emotionalScore: this.analyzeEmotionalTriggers(content),
      lengthScore: this.analyzeLengthForPlatform(content, platform),
      engagementScore: this.analyzeEngagementElements(content),
      hashtagScore: (content.match(/#/g) || []).length > 0 ? 0.7 : 0.3,
      visualScore: content.includes('image') || content.includes('video') ? 0.8 : 0.5,
    };

    const weights = {
      hookStrength: 0.25,
      emotionalScore: 0.2,
      lengthScore: 0.15,
      engagementScore: 0.2,
      hashtagScore: 0.1,
      visualScore: 0.1,
    };

    const viralScore = Object.entries(factors).reduce(
      (sum, [key, value]) => sum + value * weights[key as keyof typeof weights],
      0
    );

    const result = {
      viralProbability: Math.round(viralScore * 100),
      viralScore: viralScore,
      prediction: viralScore > 0.7 ? 'high' : viralScore > 0.4 ? 'medium' : 'low',
      factors,
      recommendations: this.generateViralRecommendations(factors, platform),
      estimatedReach: this.estimateReach(viralScore, platform),
    };

    this.setCache(cacheKey, result);
    return { success: true, data: result, source: 'browser' };
  }

  private analyzeHook(hook: string): number {
    let score = 0.5;
    if (/^(Did you|Have you|What if|Imagine|Stop|Don't)/i.test(hook)) score += 0.2;
    if (/\?/.test(hook)) score += 0.15;
    if (hook.length < 30) score += 0.1;
    if (/[🔥💯🚨⚡]/.test(hook)) score += 0.1;
    return Math.min(score, 1);
  }

  private analyzeEmotionalTriggers(content: string): number {
    const triggers = ['amazing', 'shocking', 'unbelievable', 'incredible', 'secret', 'truth', 'revealed', 'exclusive'];
    const count = triggers.filter(t => content.toLowerCase().includes(t)).length;
    return Math.min(0.3 + count * 0.15, 1);
  }

  private analyzeLengthForPlatform(content: string, platform: string): number {
    const lengths: Record<string, { min: number; max: number; optimal: number }> = {
      twitter: { min: 50, max: 280, optimal: 150 },
      instagram: { min: 100, max: 2200, optimal: 500 },
      tiktok: { min: 50, max: 500, optimal: 150 },
      youtube: { min: 200, max: 5000, optimal: 1000 },
      linkedin: { min: 200, max: 3000, optimal: 800 },
    };
    
    const config = lengths[platform] || lengths.instagram;
    const len = content.length;
    
    if (len < config.min) return 0.4;
    if (len > config.max) return 0.3;
    if (len >= config.optimal - 100 && len <= config.optimal + 100) return 1;
    return 0.7;
  }

  private analyzeEngagementElements(content: string): number {
    let score = 0.3;
    if (/\?/.test(content)) score += 0.2;
    if (content.toLowerCase().includes('comment')) score += 0.15;
    if (content.toLowerCase().includes('share')) score += 0.15;
    if (content.toLowerCase().includes('tag')) score += 0.1;
    if (content.toLowerCase().includes('link in bio')) score += 0.1;
    return Math.min(score, 1);
  }

  private generateViralRecommendations(factors: Record<string, number>, platform: string): string[] {
    const recs: string[] = [];
    if (factors.hookStrength < 0.7) recs.push('Add a stronger hook in the first 30 characters');
    if (factors.emotionalScore < 0.5) recs.push('Include emotional triggers like "amazing" or "shocking"');
    if (factors.engagementScore < 0.6) recs.push('Add a clear call-to-action');
    if (factors.hashtagScore < 0.5) recs.push('Include 5-10 relevant hashtags');
    if (platform === 'instagram' && factors.lengthScore < 0.7) recs.push('Optimize caption length to 400-600 characters');
    return recs;
  }

  private estimateReach(score: number, platform: string): number {
    const base: Record<string, number> = {
      instagram: 5000,
      tiktok: 10000,
      twitter: 3000,
      youtube: 2000,
      linkedin: 1500,
    };
    return Math.round((base[platform] || 3000) * score);
  }

  // F43: Sponsor Matching
  async matchSponsors(creatorProfile: any): Promise<AIResponse> {
    const sponsorDatabase = [
      { name: 'FashionNova', category: 'fashion', minFollowers: 10000, engagement: 0.03, budget: 'high' },
      { name: 'GymShark', category: 'fitness', minFollowers: 5000, engagement: 0.04, budget: 'high' },
      { name: 'HelloFresh', category: 'food', minFollowers: 5000, engagement: 0.02, budget: 'medium' },
      { name: 'Skillshare', category: 'education', minFollowers: 1000, engagement: 0.02, budget: 'medium' },
      { name: 'NordVPN', category: 'tech', minFollowers: 5000, engagement: 0.03, budget: 'high' },
      { name: 'RaidShadowLegends', category: 'gaming', minFollowers: 1000, engagement: 0.02, budget: 'high' },
      { name: 'Squarespace', category: 'business', minFollowers: 5000, engagement: 0.02, budget: 'medium' },
      { name: 'Curology', category: 'beauty', minFollowers: 5000, engagement: 0.03, budget: 'medium' },
      { name: 'Raycon', category: 'tech', minFollowers: 10000, engagement: 0.03, budget: 'high' },
      { name: 'BetterHelp', category: 'wellness', minFollowers: 5000, engagement: 0.02, budget: 'high' },
    ];

    const matches = sponsorDatabase
      .filter(s => s.minFollowers <= creatorProfile.followers)
      .map(s => {
        const engagementMatch = 1 - Math.abs(s.engagement - creatorProfile.engagement);
        const categoryMatch = creatorProfile.categories?.includes(s.category) ? 1 : 0.5;
        const score = (engagementMatch * 0.4) + (categoryMatch * 0.6);
        
        return {
          ...s,
          matchScore: Math.round(score * 100),
          estimatedDeal: this.estimateDealValue(s.budget, creatorProfile.followers),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    return {
      success: true,
      data: {
        matches,
        totalOpportunities: matches.length,
        estimatedMonthlyValue: matches.reduce((sum, m) => sum + (m.estimatedDeal || 0), 0),
      },
      source: 'browser',
    };
  }

  private estimateDealValue(budget: string, followers: number): number {
    const rates: Record<string, number> = { low: 0.005, medium: 0.01, high: 0.02 };
    return Math.round(followers * (rates[budget] || 0.01));
  }

  // F44: Content Optimization
  async optimizeContent(content: string, platform: string): Promise<AIResponse> {
    const optimizations: string[] = [];
    const issues: string[] = [];

    if (platform === 'instagram') {
      if (content.length > 2200) issues.push('Caption exceeds Instagram limit');
      if (!(content.match(/#/g) || []).length) optimizations.push('Add 5-10 hashtags');
      if (!content.includes('@')) optimizations.push('Tag relevant accounts');
    }

    if (platform === 'twitter') {
      if (content.length > 280) issues.push('Exceeds Twitter character limit');
      if (!content.match(/https?:\/\//)) optimizations.push('Add a link for engagement');
    }

    const readability = this.calculateReadability(content);
    if (readability > 60) optimizations.push('Consider shorter sentences for better readability');

    const positiveWords = ['good', 'great', 'amazing', 'love', 'best', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'hate', 'worst', 'awful'];
    const lower = content.toLowerCase();
    const posCount = positiveWords.filter(w => lower.includes(w)).length;
    const negCount = negativeWords.filter(w => lower.includes(w)).length;
    
    if (negCount > posCount) {
      optimizations.push('Consider a more positive tone');
    }

    return {
      success: true,
      data: {
        optimizations,
        issues,
        readability,
        estimatedEngagement: this.estimateEngagement(content),
        bestPostingTime: this.suggestPostingTime(),
      },
      source: 'browser',
    };
  }

  private calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const words = text.split(/\s+/).filter(w => w);
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    const avgWordLength = words.join('').length / Math.max(words.length, 1);
    return Math.round((avgSentenceLength * 0.5 + avgWordLength * 5) * 10) / 10;
  }

  private estimateEngagement(content: string): number {
    let score = 3;
    if (content.includes('?')) score += 1;
    if (content.toLowerCase().includes('comment')) score += 0.5;
    if ((content.match(/#/g) || []).length > 0) score += 0.5;
    return Math.min(score, 10);
  }

  private suggestPostingTime(): string {
    const hours = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM'];
    return hours[Math.floor(Math.random() * hours.length)];
  }

  // F45: Competitor Analysis
  async analyzeCompetitor(content: string[]): Promise<AIResponse> {
    const analysis = {
      postCount: content.length,
      avgLength: Math.round(content.reduce((sum, c) => sum + c.length, 0) / content.length),
      topHashtags: this.extractTopHashtags(content),
      postingFrequency: 'Daily',
      engagementEstimate: this.estimateCompetitorEngagement(content),
      contentThemes: this.identifyThemes(content),
      strengths: this.identifyStrengths(content),
      weaknesses: this.identifyWeaknesses(content),
    };

    return { success: true, data: analysis, source: 'browser' };
  }

  private extractTopHashtags(content: string[]): string[] {
    const allHashtags = content.flatMap(c => c.match(/#\w+/g) || []);
    const counts: Record<string, number> = {};
    allHashtags.forEach(h => { counts[h] = (counts[h] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([h]) => h);
  }

  private estimateCompetitorEngagement(content: string[]): number {
    const factors = content.map(c => ({
      hasQuestion: c.includes('?') ? 1 : 0,
      hasCTA: /(comment|share|like|follow)/i.test(c) ? 1 : 0,
      hasEmojis: /[\u{1F300}-\u{1F9FF}]/u.test(c) ? 1 : 0,
    }));
    const avg = factors.reduce((sum, f) => sum + f.hasQuestion + f.hasCTA + f.hasEmojis, 0) / Math.max(factors.length, 1);
    return Math.round((3 + avg) * 10) / 10;
  }

  private identifyThemes(content: string[]): string[] {
    const doc = nlp(content.join(' '));
    const topics = doc.topics().json().slice(0, 5).map((t: any) => t.text);
    return topics;
  }

  private identifyStrengths(content: string[]): string[] {
    const strengths: string[] = [];
    if (content.some(c => c.length > 500)) strengths.push('Detailed, long-form content');
    if (content.some(c => (c.match(/#/g) || []).length > 5)) strengths.push('Strong hashtag strategy');
    if (content.some(c => c.includes('?'))) strengths.push('Engages audience with questions');
    return strengths;
  }

  private identifyWeaknesses(content: string[]): string[] {
    const weaknesses: string[] = [];
    if (content.every(c => c.length < 100)) weaknesses.push('Content may be too brief');
    if (!content.some(c => c.includes('@'))) weaknesses.push('Limited account tagging');
    if (content.filter(c => c.includes('?')).length < content.length * 0.2) {
      weaknesses.push('Low engagement prompts');
    }
    return weaknesses;
  }

  // VEX AI Processing
  async processVEXCommand(command: string, context?: any): Promise<AIResponse> {
    if (this.canUseGroq()) {
      const prompt = `You are VEX, an AI assistant for social media creators. 
User command: "${command}"
Context: ${JSON.stringify(context || {})}

Respond with a helpful, concise response about social media strategy.`;

      const groqResponse = await this.callGroq(prompt);
      if (groqResponse.success) {
        return groqResponse;
      }
    }

    const lower = command.toLowerCase();
    
    if (lower.includes('viral') || lower.includes('trending')) {
      return {
        success: true,
        data: 'To go viral: 1) Hook viewers in 3 seconds 2) Use trending audio 3) Post at optimal times (6-9 PM) 4) Engage in first 30 minutes 5) Use 5-10 relevant hashtags',
        source: 'browser',
      };
    }

    if (lower.includes('hashtag') || lower.includes('tag')) {
      return {
        success: true,
        data: 'Best hashtag strategy: Use 3-5 broad tags (1M+ posts), 5-10 niche tags (100K-1M), and 2-3 branded tags. Mix popular and specific for best reach.',
        source: 'browser',
      };
    }

    if (lower.includes('post') || lower.includes('time')) {
      return {
        success: true,
        data: 'Optimal posting times: Instagram (6-9 PM weekdays), TikTok (7-11 PM), Twitter (8-10 AM, 6-9 PM), LinkedIn (8-10 AM, 12-2 PM Tue-Thu)',
        source: 'browser',
      };
    }

    if (lower.includes('engagement') || lower.includes('like')) {
      return {
        success: true,
        data: 'Boost engagement by: 1) Asking questions 2) Using polls/stickers 3) Responding to comments in first hour 4) Creating save-worthy content 5) Posting consistently',
        source: 'browser',
      };
    }

    return {
      success: true,
      data: 'I can help with viral strategies, hashtag recommendations, engagement tips, content optimization, and competitor analysis. What would you like to know?',
      source: 'browser',
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

export const aiService = new AIService();
export default aiService;
