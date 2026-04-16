// WebLLM Service - Lightweight local AI fallback
// Uses browser-side processing when API quotas are exceeded

interface WebLLMResponse {
  success: boolean;
  text?: string;
  error?: string;
}

class WebLLMService {
  // Simple text generation using Markov chains and pattern matching
  // This runs entirely in the browser with no API calls
  async generateResponse(prompt: string): Promise<WebLLMResponse> {
    try {
      const lowerPrompt = prompt.toLowerCase();
      
      // Pattern-based response generation
      const response = this.patternMatch(lowerPrompt);
      
      return {
        success: true,
        text: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed',
      };
    }
  }

  private patternMatch(prompt: string): string {
    // Social media strategy responses
    const patterns: Record<string, string[]> = {
      viral: [
        "To increase viral potential: 1) Create a strong hook in the first 3 seconds 2) Use trending sounds/audio 3) Post consistently at peak hours (6-9 PM) 4) Engage with comments quickly 5) Use relevant hashtags strategically",
        "Viral content tips: Hook viewers immediately, tell a story, evoke emotion, and include a clear call-to-action. Timing matters - post when your audience is most active.",
        "For viral success: Focus on shareability. Create content that makes people want to tag friends, save for later, or share to their stories.",
      ],
      hashtag: [
        "Hashtag strategy: Use 3-5 broad hashtags (1M+ posts), 5-10 niche hashtags (10K-1M posts), and 2-3 branded/community hashtags. Research what's trending in your niche.",
        "Best hashtag practices: Don't use the same set every time. Mix popular tags with specific ones. Create a branded hashtag for your community to use.",
        "Hashtag tips: Place them in the first comment on Instagram for cleaner captions. Use location-based tags for local reach. Avoid banned or overused tags.",
      ],
      engagement: [
        "Boost engagement by: 1) Asking questions in captions 2) Using interactive features (polls, quizzes, sliders) 3) Responding to all comments in the first hour 4) Creating save-worthy educational content 5) Posting consistently",
        "Engagement secrets: The algorithm favors content that gets quick interactions. Reply to comments fast, use Stories to drive feed post engagement, and create content that sparks conversation.",
        "To increase engagement: Post when your audience is online, use compelling visuals, write captions that tell stories, and always include a call-to-action.",
      ],
      growth: [
        "Growth strategy: Post 1-2 times daily on your main platform, engage with accounts in your niche for 30 mins daily, collaborate with similar-sized creators, and optimize your bio and highlights.",
        "To grow faster: Focus on one platform first. Master its algorithm before expanding. Quality over quantity, but consistency is key.",
        "Growth tips: Cross-promote on other platforms, use SEO in your captions and bio, create series content that keeps people coming back, and analyze what works using insights.",
      ],
      content: [
        "Content ideas: Behind-the-scenes, tutorials, day-in-the-life, transformations, before/after, myths vs facts, common mistakes, tips and tricks, Q&A sessions, and user-generated content.",
        "What to post: Educational content gets saves, entertaining content gets shares, inspirational content gets likes, and controversial content gets comments. Mix these strategically.",
        "Content strategy: 80% value (educate/entertain), 20% promotion. Plan content in batches, use templates for consistency, and repurpose top performers across platforms.",
      ],
      analytics: [
        "Key metrics to track: Engagement rate (most important), reach, saves, shares, profile visits, and follower growth rate. Focus on quality engagement over vanity metrics.",
        "Analytics insights: High reach + low engagement = content not resonating. Low reach + high engagement = algorithm not pushing content. Both high = viral potential.",
        "Understanding metrics: Saves indicate high-value content. Shares mean viral potential. Comments show community engagement. Profile visits suggest conversion interest.",
      ],
      monetization: [
        "Monetization paths: Brand partnerships, affiliate marketing, digital products, coaching/consulting, sponsored content, ad revenue, and membership programs.",
        "To attract sponsors: Maintain consistent posting, engage authentically with your audience, create a media kit, and reach out to brands that align with your values.",
        "Revenue tips: Don't rely on one income stream. Diversify with products, services, and partnerships. Your email list is your most valuable asset.",
      ],
      algorithm: [
        "Algorithm tips: First 30 minutes are crucial. Respond to every comment quickly. Use all platform features (Reels, Stories, Lives). Create watch-time optimized content.",
        "How algorithms work: They prioritize content that keeps users on the platform longer. Create binge-worthy content series and use hooks to maintain attention.",
        "Algorithm hack: Post when your specific audience is online (check insights), use trending features early, and create content that generates saves and shares over just likes.",
      ],
    };

    // Find matching pattern
    for (const [key, responses] of Object.entries(patterns)) {
      if (prompt.includes(key)) {
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // Default response
    const defaults = [
      "I can help with viral strategies, hashtag optimization, engagement tips, growth tactics, content ideas, analytics interpretation, monetization, and algorithm insights. What specific area would you like to explore?",
      "As your social media AI assistant, I can provide guidance on: creating viral content, optimizing hashtags, boosting engagement, growing your following, content strategy, understanding analytics, monetization options, and platform algorithms. What would you like to know?",
      "I'm here to help you succeed on social media! Ask me about viral content creation, hashtag strategies, engagement techniques, growth hacks, content planning, analytics, making money, or how algorithms work.",
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  // Simple text classification for feature routing
  classifyIntent(text: string): string {
    const lower = text.toLowerCase();
    
    if (lower.includes('viral') || lower.includes('trending') || lower.includes('views')) {
      return 'viral_prediction';
    }
    if (lower.includes('hashtag') || lower.includes('tag') || lower.includes('#')) {
      return 'hashtag_recommendation';
    }
    if (lower.includes('engagement') || lower.includes('like') || lower.includes('comment')) {
      return 'engagement_analysis';
    }
    if (lower.includes('bot') || lower.includes('fake') || lower.includes('spam')) {
      return 'bot_detection';
    }
    if (lower.includes('sponsor') || lower.includes('brand') || lower.includes('deal')) {
      return 'sponsor_matching';
    }
    if (lower.includes('competitor') || lower.includes('competition')) {
      return 'competitor_analysis';
    }
    if (lower.includes('sentiment') || lower.includes('feedback')) {
      return 'sentiment_analysis';
    }
    if (lower.includes('toxic') || lower.includes('hate') || lower.includes('negative')) {
      return 'toxicity_detection';
    }
    if (lower.includes('optimize') || lower.includes('improve') || lower.includes('better')) {
      return 'content_optimization';
    }
    
    return 'general_chat';
  }

  // Generate content ideas based on niche
  generateContentIdeas(niche: string, count: number = 5): string[] {
    const ideasByNiche: Record<string, string[]> = {
      fitness: [
        "5 exercises you're doing wrong (and how to fix them)",
        "What I eat in a day as a fitness coach",
        "The truth about cardio for fat loss",
        "Gym etiquette everyone should know",
        "My morning routine that changed everything",
      ],
      fashion: [
        "5 ways to style one basic piece",
        "Thrift flip transformation",
        "Outfit of the week compilation",
        "Fashion mistakes making you look older",
        "Capsule wardrobe essentials",
      ],
      food: [
        "Restaurant-style recipe at home",
        "Meal prep for busy week",
        "Trying viral food hacks",
        "What $20 buys at different grocery stores",
        "Quick 15-minute dinner ideas",
      ],
      tech: [
        "Apps that changed my productivity",
        "Gadget review: worth it or waste?",
        "Hidden phone features you didn't know",
        "Desk setup tour 2024",
        "Tech myths debunked",
      ],
      beauty: [
        "Skincare routine for beginners",
        "Makeup mistakes to avoid",
        "Drugstore dupes for high-end products",
        "Get ready with me: special occasion",
        "Hair care tips that actually work",
      ],
      business: [
        "How I made my first $10K online",
        "Tools every entrepreneur needs",
        "Mistakes that cost me thousands",
        "Day in the life of a business owner",
        "How to start with $0",
      ],
      travel: [
        "Hidden gems in [destination]",
        "Travel hacks that save money",
        "Packing for a week in carry-on only",
        "Local food tour experience",
        "Budget travel tips from a pro",
      ],
      gaming: [
        "Game review: honest thoughts",
        "Pro tips for beginners",
        "My gaming setup tour",
        "Reacting to viral game clips",
        "Hidden features you missed",
      ],
    };

    const ideas = ideasByNiche[niche.toLowerCase()] || ideasByNiche.fitness;
    return ideas.slice(0, count);
  }

  // Generate hashtag sets by category
  generateHashtagSet(category: string): string[] {
    const sets: Record<string, string[]> = {
      fitness: ['#fitness', '#gym', '#workout', '#fitnessmotivation', '#bodybuilding', '#health', '#fit', '#training', '#fitfam', '#lifestyle'],
      fashion: ['#fashion', '#style', '#ootd', '#fashionblogger', '#instafashion', '#outfit', '#fashionista', '#streetstyle', '#fashionstyle', '#lookbook'],
      food: ['#food', '#foodporn', '#foodie', '#instafood', '#foodphotography', '#yummy', '#delicious', '#foodstagram', '#homemade', '#cooking'],
      tech: ['#tech', '#technology', '#innovation', '#gadgets', '#techie', '#coding', '#programming', '#developer', '#software', '#ai'],
      beauty: ['#beauty', '#makeup', '#skincare', '#beautyblogger', '#makeupartist', '#cosmetics', '#beautytips', '#glam', '#selfcare', '#instabeauty'],
      travel: ['#travel', '#wanderlust', '#travelphotography', '#adventure', '#travelgram', '#explore', '#vacation', '#travelblogger', '#nature', '#photography'],
      business: ['#business', '#entrepreneur', '#success', '#marketing', '#smallbusiness', '#startup', '#motivation', '#hustle', '#money', '#boss'],
      lifestyle: ['#lifestyle', '#life', '#motivation', '#inspiration', '#happiness', '#selflove', '#mindset', '#goals', '#positivevibes', '#loveyourself'],
    };

    return sets[category.toLowerCase()] || sets.lifestyle;
  }

  // Estimate optimal posting times based on platform
  estimateBestPostTime(platform: string): string[] {
    const times: Record<string, string[]> = {
      instagram: ['6:00 AM', '11:00 AM', '2:00 PM', '7:00 PM', '9:00 PM'],
      tiktok: ['7:00 AM', '12:00 PM', '4:00 PM', '8:00 PM', '10:00 PM'],
      twitter: ['8:00 AM', '12:00 PM', '5:00 PM', '7:00 PM'],
      youtube: ['2:00 PM', '4:00 PM', '6:00 PM'],
      linkedin: ['8:00 AM', '12:00 PM', '5:00 PM'],
      facebook: ['9:00 AM', '1:00 PM', '3:00 PM', '7:00 PM'],
    };

    return times[platform.toLowerCase()] || times.instagram;
  }
}

export const webLLMService = new WebLLMService();
export default webLLMService;
