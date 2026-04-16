import type { FeatureResult } from '@/types';

// ============================================================
// VELOCTIQ BANK FEATURES (F33 - F48)
// All functions compute REAL results from input data.
// No mock data. No API calls. Pure browser-side logic.
// ============================================================

// -------------------- F33: Buying Intent Scoring --------------------
interface F33Input {
  comments: { id: string; text: string; timestamp: string; likes: number }[];
  niche?: string;
}

const BUY_INTENT_PATTERNS: { pattern: RegExp; weight: number; category: string }[] = [
  { pattern: /\b(buy|purchase|order|grab|cop|cop that|pick up|snag)\b/i, weight: 25, category: 'direct_purchase' },
  { pattern: /\b(how much|price|cost|pricing|worth it|afford|budget|cheap|expensive|deal)\b/i, weight: 20, category: 'price_inquiry' },
  { pattern: /\b(where can i|link|promo code|discount|coupon|offer|sale|code)\b/i, weight: 22, category: 'purchase_ready' },
  { pattern: /\b(vs|versus|compared to|better than|alternative|or should i)\b/i, weight: 15, category: 'comparison' },
  { pattern: /\b(recommend|suggestion|should i get|worth buying|thinking about|planning to)\b/i, weight: 18, category: 'consideration' },
  { pattern: /\b(urgent|need|must have|right now|asap|immediately|running out)\b/i, weight: 20, category: 'urgency' },
  { pattern: /\b(review|tested|tried it|just got|bought this|my experience|results)\b/i, weight: 12, category: 'review_pattern' },
  { pattern: /\b(wishlist|want this|wish i had|saving up|christmas list|birthday)\b/i, weight: 16, category: 'desire' },
  { pattern: /\b(affiliate|sponsor|paid link|ad|not sponsored|gifted)\b/i, weight: -10, category: 'sponsor_awareness' },
  { pattern: /\b(scam|fake|waste of money|don'?t buy|regret|refund|return)\b/i, weight: -25, category: 'negative_intent' },
  { pattern: /\$(\d+[\d,.]*)/g, weight: 14, category: 'price_mention' },
  { pattern: /\b(\d+)%\s*(off|discount|save)\b/i, weight: 16, category: 'discount_signal' },
];

function computeBuyingIntentScore(comment: string): { score: number; signals: { category: string; weight: number; matched: string }[] } {
  const signals: { category: string; weight: number; matched: string }[] = [];
  let rawScore = 0;

  for (const { pattern, weight, category } of BUY_INTENT_PATTERNS) {
    const matches = comment.match(pattern);
    if (matches) {
      const matchCount = matches.length;
      const adjustedWeight = weight + (matchCount > 1 ? (matchCount - 1) * weight * 0.3 : 0);
      rawScore += adjustedWeight;
      signals.push({ category, weight: adjustedWeight, matched: matches[0] });
    }
  }

  // Normalize to 0-100 using sigmoid-like clamp
  const normalizedScore = Math.round(Math.min(100, Math.max(0, 50 + rawScore * 1.5)));
  return { score: normalizedScore, signals };
}

function f33_buyingIntentScoring(input: F33Input): FeatureResult {
  const scored = input.comments.map(comment => {
    const { score, signals } = computeBuyingIntentScore(comment.text);
    let intentCategory: 'cold' | 'warm' | 'hot' | 'on_fire';
    if (score >= 75) intentCategory = 'on_fire';
    else if (score >= 50) intentCategory = 'hot';
    else if (score >= 25) intentCategory = 'warm';
    else intentCategory = 'cold';

    return {
      commentId: comment.id,
      text: comment.text.substring(0, 120),
      buyingScore: score,
      intentCategory,
      signalCount: signals.length,
      topSignals: signals.sort((a, b) => b.weight - a.weight).slice(0, 3),
      engagementMultiplier: comment.likes > 10 ? 1.2 : 1.0,
    };
  });

  const totalComments = scored.length || 1;
  const hotComments = scored.filter(c => c.intentCategory === 'hot' || c.intentCategory === 'on_fire');
  const avgScore = scored.reduce((sum, c) => sum + c.buyingScore, 0) / totalComments;
  const weightedAvg = scored.reduce((sum, c) => sum + c.buyingScore * c.engagementMultiplier, 0) / totalComments;
  const buyingIndex = Math.round(((hotComments.length / totalComments) * 60) + (avgScore * 0.4));

  const categoryBreakdown = scored.reduce<Record<string, number>>((acc, c) => {
    acc[c.intentCategory] = (acc[c.intentCategory] || 0) + 1;
    return acc;
  }, {});

  const signalFrequency = scored.flatMap(c => c.topSignals).reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  const topSignalsOverall = Object.entries(signalFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, frequency: count, percentage: Math.round((count / totalComments) * 100) }));

  const data = {
    aggregateBuyingIntentIndex: Math.min(100, Math.max(0, buyingIndex)),
    totalCommentsAnalyzed: totalComments,
    averageBuyingScore: Math.round(avgScore * 10) / 10,
    weightedAverageScore: Math.round(weightedAvg * 10) / 10,
    hotLeadCount: hotComments.length,
    hotLeadPercentage: Math.round((hotComments.length / totalComments) * 100),
    categoryBreakdown,
    topSignalsOverall,
    scoredComments: scored.sort((a, b) => b.buyingScore - a.buyingScore),
    recommendations: [
      avgScore > 60 ? 'High buying intent detected - prioritize affiliate content' : 'Consider product review content to increase buying signals',
      hotComments.length > totalComments * 0.3 ? 'Strong purchase readiness in audience' : 'Build more product-focused content to warm up audience',
      signalFrequency['price_inquiry'] > totalComments * 0.2 ? 'Many price inquiries - include pricing comparisons' : 'Create comparison content to drive purchase decisions',
    ],
  };

  return { success: true, data, source: 'browser', featureId: 'f33' };
}

// -------------------- F34: Affiliate Matchmaker --------------------
interface F34Input {
  niche: string;
  audienceSize: number;
  engagementRate: number;
  contentType: 'video' | 'blog' | 'social' | 'podcast' | 'mixed';
  topCategories: string[];
  audienceGeo: string[];
}

interface AffiliateProgram {
  id: string;
  brand: string;
  categories: string[];
  commissionRate: number;
  cookieDays: number;
  minPayout: number;
  avgOrderValue: number;
  contentFormats: string[];
  audienceSizeRange: [number, number];
  engagementThreshold: number;
}

function generateAffiliateDatabase(): AffiliateProgram[] {
  const brands = [
    { brand: 'Amazon Associates', categories: ['tech', 'lifestyle', 'fashion', 'home', 'books', 'beauty', 'fitness'], commission: 3, cookie: 24, minPay: 10, aov: 45, formats: ['blog', 'video', 'social', 'mixed'] },
    { brand: 'ShareASale', categories: ['fashion', 'beauty', 'home', 'food', 'tech'], commission: 8, cookie: 30, minPay: 50, aov: 65, formats: ['blog', 'social', 'mixed'] },
    { brand: 'CJ Affiliate', categories: ['tech', 'finance', 'travel', 'fashion'], commission: 6, cookie: 7, minPay: 25, aov: 80, formats: ['blog', 'video', 'mixed'] },
    { brand: 'Shopify Partners', categories: ['tech', 'business', 'ecommerce'], commission: 20, cookie: 30, minPay: 25, aov: 29, formats: ['video', 'blog', 'podcast', 'mixed'] },
    { brand: 'ConvertKit', categories: ['tech', 'business', 'creator'], commission: 30, cookie: 90, minPay: 50, aov: 49, formats: ['blog', 'video', 'podcast', 'mixed'] },
    { brand: 'Skillshare', categories: ['education', 'tech', 'creator', 'design'], commission: 7, cookie: 30, minPay: 10, aov: 15, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Adobe Creative Cloud', categories: ['tech', 'design', 'creator', 'photography'], commission: 8, cookie: 30, minPay: 25, aov: 55, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Canva Pro', categories: ['design', 'creator', 'tech', 'business'], commission: 36, cookie: 30, minPay: 50, aov: 12, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'NordVPN', categories: ['tech', 'security', 'privacy'], commission: 30, cookie: 30, minPay: 20, aov: 70, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Semrush', categories: ['tech', 'business', 'marketing', 'seo'], commission: 40, cookie: 120, minPay: 50, aov: 120, formats: ['blog', 'video', 'mixed'] },
    { brand: 'Notion', categories: ['tech', 'productivity', 'creator', 'business'], commission: 10, cookie: 90, minPay: 25, aov: 10, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Tailwind CSS Pro', categories: ['tech', 'design', 'developer'], commission: 25, cookie: 45, minPay: 50, aov: 12, formats: ['blog', 'video', 'mixed'] },
    { brand: 'Audible', categories: ['entertainment', 'education', 'books'], commission: 5, cookie: 30, minPay: 10, aov: 15, formats: ['video', 'podcast', 'blog', 'mixed'] },
    { brand: 'Bluehost', categories: ['tech', 'business', 'webhosting'], commission: 65, cookie: 45, minPay: 50, aov: 36, formats: ['blog', 'video', 'mixed'] },
    { brand: 'Teachable', categories: ['education', 'creator', 'business'], commission: 20, cookie: 90, minPay: 50, aov: 39, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Gumroad', categories: ['creator', 'digital', 'tech', 'education'], commission: 10, cookie: 30, minPay: 10, aov: 20, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Fiverr', categories: ['business', 'tech', 'design', 'freelance'], commission: 15, cookie: 30, minPay: 10, aov: 50, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Kinsta', categories: ['tech', 'webhosting', 'business'], commission: 50, cookie: 60, minPay: 50, aov: 30, formats: ['blog', 'video', 'mixed'] },
    { brand: 'Ahrefs', categories: ['tech', 'seo', 'marketing', 'business'], commission: 20, cookie: 90, minPay: 50, aov: 99, formats: ['blog', 'video', 'mixed'] },
    { brand: 'Webflow', categories: ['tech', 'design', 'webhosting'], commission: 20, cookie: 90, minPay: 50, aov: 16, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Loom', categories: ['tech', 'business', 'productivity', 'creator'], commission: 15, cookie: 30, minPay: 25, aov: 10, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Vimeo', categories: ['tech', 'creator', 'video'], commission: 15, cookie: 30, minPay: 25, aov: 20, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Epidemic Sound', categories: ['music', 'creator', 'video', 'podcast'], commission: 25, cookie: 45, minPay: 25, aov: 15, formats: ['video', 'podcast', 'blog', 'mixed'] },
    { brand: 'Artlist', categories: ['music', 'creator', 'video'], commission: 30, cookie: 45, minPay: 25, aov: 17, formats: ['video', 'blog', 'mixed'] },
    { brand: 'SquareSpace', categories: ['tech', 'design', 'webhosting', 'creator'], commission: 20, cookie: 45, minPay: 50, aov: 24, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Wix', categories: ['tech', 'design', 'webhosting', 'business'], commission: 25, cookie: 45, minPay: 50, aov: 18, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Hostinger', categories: ['tech', 'webhosting', 'business'], commission: 40, cookie: 30, minPay: 50, aov: 28, formats: ['video', 'blog', 'mixed'] },
    { brand: 'TubeBuddy', categories: ['tech', 'creator', 'youtube'], commission: 50, cookie: 60, minPay: 25, aov: 25, formats: ['video', 'blog', 'mixed'] },
    { brand: 'VidIQ', categories: ['tech', 'creator', 'youtube'], commission: 15, cookie: 30, minPay: 25, aov: 8, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Apple Podcasts', categories: ['entertainment', 'education', 'podcast'], commission: 5, cookie: 30, minPay: 10, aov: 10, formats: ['podcast', 'video', 'mixed'] },
    { brand: 'Stan Store', categories: ['creator', 'business', 'ecommerce'], commission: 10, cookie: 30, minPay: 10, aov: 15, formats: ['social', 'video', 'mixed'] },
    { brand: 'Ecamm Live', categories: ['tech', 'creator', 'streaming'], commission: 20, cookie: 30, minPay: 25, aov: 20, formats: ['video', 'mixed'] },
    { brand: 'Restream', categories: ['tech', 'creator', 'streaming'], commission: 15, cookie: 30, minPay: 25, aov: 24, formats: ['video', 'mixed'] },
    { brand: 'Descript', categories: ['tech', 'creator', 'video', 'podcast'], commission: 15, cookie: 30, minPay: 25, aov: 12, formats: ['video', 'podcast', 'blog', 'mixed'] },
    { brand: 'SparkToro', categories: ['tech', 'marketing', 'business'], commission: 30, cookie: 90, minPay: 25, aov: 38, formats: ['blog', 'video', 'mixed'] },
    { brand: 'ManyChat', categories: ['tech', 'marketing', 'creator', 'business'], commission: 20, cookie: 30, minPay: 25, aov: 15, formats: ['social', 'video', 'mixed'] },
    { brand: 'Systeme.io', categories: ['tech', 'business', 'marketing'], commission: 40, cookie: 60, minPay: 25, aov: 27, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Podia', categories: ['tech', 'creator', 'education', 'business'], commission: 30, cookie: 30, minPay: 25, aov: 35, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Circle', categories: ['tech', 'creator', 'community', 'business'], commission: 20, cookie: 90, minPay: 50, aov: 39, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Kajabi', categories: ['tech', 'creator', 'education', 'business'], commission: 30, cookie: 30, minPay: 50, aov: 149, formats: ['video', 'blog', 'podcast', 'mixed'] },
    { brand: 'Wistia', categories: ['tech', 'video', 'business'], commission: 20, cookie: 90, minPay: 50, aov: 19, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Boldog Digital', categories: ['tech', 'photography', 'creator'], commission: 10, cookie: 30, minPay: 25, aov: 75, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Privacy.com', categories: ['tech', 'finance', 'security'], commission: 5, cookie: 30, minPay: 25, aov: 0, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Acorns', categories: ['finance', 'business', 'investing'], commission: 10, cookie: 30, minPay: 25, aov: 5, formats: ['video', 'podcast', 'blog', 'mixed'] },
    { brand: 'Mint Mobile', categories: ['tech', 'lifestyle', 'finance'], commission: 10, cookie: 30, minPay: 25, aov: 15, formats: ['video', 'social', 'mixed'] },
    { brand: 'Huel', categories: ['health', 'fitness', 'lifestyle', 'food'], commission: 10, cookie: 30, minPay: 25, aov: 50, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Athletic Greens', categories: ['health', 'fitness', 'lifestyle'], commission: 30, cookie: 90, minPay: 50, aov: 97, formats: ['video', 'podcast', 'blog', 'mixed'] },
    { brand: 'Whoop', categories: ['health', 'fitness', 'tech'], commission: 15, cookie: 30, minPay: 25, aov: 30, formats: ['video', 'social', 'mixed'] },
    { brand: 'Calm', categories: ['health', 'wellness', 'lifestyle'], commission: 20, cookie: 30, minPay: 25, aov: 60, formats: ['video', 'podcast', 'social', 'mixed'] },
    { brand: 'BetterHelp', categories: ['health', 'wellness', 'lifestyle'], commission: 35, cookie: 90, minPay: 50, aov: 75, formats: ['video', 'podcast', 'blog', 'social', 'mixed'] },
    { brand: 'NordicTrack', categories: ['fitness', 'health', 'lifestyle'], commission: 8, cookie: 45, minPay: 25, aov: 150, formats: ['video', 'blog', 'mixed'] },
    { brand: 'Crunchyroll', categories: ['entertainment', 'anime'], commission: 15, cookie: 30, minPay: 25, aov: 8, formats: ['video', 'social', 'mixed'] },
    { brand: 'HBO Max', categories: ['entertainment', 'streaming'], commission: 5, cookie: 30, minPay: 10, aov: 15, formats: ['video', 'social', 'mixed'] },
    { brand: 'ExpressVPN', categories: ['tech', 'security', 'privacy'], commission: 20, cookie: 30, minPay: 20, aov: 80, formats: ['video', 'blog', 'social', 'mixed'] },
    { brand: 'Dashlane', categories: ['tech', 'security'], commission: 25, cookie: 30, minPay: 25, aov: 35, formats: ['blog', 'video', 'mixed'] },
    { brand: '1Password', categories: ['tech', 'security'], commission: 20, cookie: 30, minPay: 25, aov: 36, formats: ['video', 'blog', 'mixed'] },
  ];

  return brands.map((b, i) => ({
    id: `aff-${i + 1}`,
    brand: b.brand,
    categories: b.categories,
    commissionRate: b.commission,
    cookieDays: b.cookie,
    minPayout: b.minPay,
    avgOrderValue: b.aov,
    contentFormats: b.formats,
    audienceSizeRange: [1000, 10000000] as [number, number],
    engagementThreshold: 1.0,
  }));
}

const AFFILIATE_DB = generateAffiliateDatabase();

function f34_affiliateMatchmaker(input: F34Input): FeatureResult {
  const normalizedNiche = input.niche.toLowerCase();
  const normalizedCategories = input.topCategories.map(c => c.toLowerCase());

  const scored = AFFILIATE_DB.map(program => {
    // Category overlap score (0-40)
    const categoryOverlap = program.categories.filter(c =>
      normalizedCategories.includes(c) || normalizedNiche.includes(c) ||
      c.includes(normalizedNiche)
    );
    const categoryScore = Math.min(40, categoryOverlap.length * 12);

    // Content format compatibility (0-20)
    const formatMatch = program.contentFormats.includes(input.contentType) ? 20 : 10;

    // Audience size fit (0-15)
    let audienceScore = 15;
    if (input.audienceSize < program.audienceSizeRange[0]) {
      audienceScore = Math.max(3, 15 * (input.audienceSize / program.audienceSizeRange[0]));
    }

    // Engagement rate fit (0-15)
    const engagementScore = input.engagementRate >= program.engagementThreshold
      ? 15
      : Math.max(3, 15 * (input.engagementRate / program.engagementThreshold));

    // Commission potential score (0-10)
    const commissionScore = Math.min(10, program.commissionRate / 6);

    const totalFitScore = Math.round(categoryScore + formatMatch + audienceScore + engagementScore + commissionScore);

    // Estimate monthly earnings: clicks = audienceSize * engagementRate * 0.01 * 0.05
    const estimatedClicks = Math.round(input.audienceSize * (input.engagementRate / 100) * 0.005);
    const conversionRate = 0.02 + (program.commissionRate / 500);
    const estimatedConversions = Math.round(estimatedClicks * conversionRate);
    const estimatedMonthlyRevenue = Math.round(estimatedConversions * program.avgOrderValue * (program.commissionRate / 100));

    return {
      programId: program.id,
      brand: program.brand,
      fitScore: Math.min(100, totalFitScore),
      commissionRate: program.commissionRate,
      cookieDays: program.cookieDays,
      minPayout: program.minPayout,
      avgOrderValue: program.avgOrderValue,
      matchedCategories: categoryOverlap,
      estimatedMonthlyClicks: estimatedClicks,
      estimatedMonthlyConversions: estimatedConversions,
      estimatedMonthlyRevenue,
      formatCompatible: program.contentFormats.includes(input.contentType),
    };
  });

  scored.sort((a, b) => b.fitScore - a.fitScore);
  const topMatches = scored.slice(0, 15);
  const totalEstimatedRevenue = topMatches.reduce((s, m) => s + m.estimatedMonthlyRevenue, 0);

  return {
    success: true,
    data: {
      totalProgramsScanned: AFFILIATE_DB.length,
      matches: topMatches,
      totalEstimatedMonthlyRevenue: totalEstimatedRevenue,
      topPick: topMatches[0],
      averageCommissionRate: Math.round(topMatches.reduce((s, m) => s + m.commissionRate, 0) / topMatches.length * 10) / 10,
      recommendations: [
        topMatches.length > 0 ? `Top match: ${topMatches[0].brand} at ${topMatches[0].fitScore}% fit` : 'No strong matches found',
        totalEstimatedRevenue > 1000 ? 'Strong revenue potential - diversify across top 5 programs' : 'Focus on building audience size for better affiliate earnings',
        `Average commission rate: ${Math.round(topMatches.reduce((s, m) => s + m.commissionRate, 0) / topMatches.length)}%`,
      ],
    },
    source: 'browser',
    featureId: 'f34',
  };
}

// -------------------- F35: Trend Blue Ocean Radar --------------------
interface F35Input {
  keywords: { keyword: string; searchVolume: number; contentCount: number; growthRate: number }[];
  comments: { text: string }[];
}

function f35_trendBlueOceanRadar(input: F35Input): FeatureResult {
  const opportunities = input.keywords.map(kw => {
    // Competition score: higher content count = more saturated
    const saturationScore = Math.min(100, (kw.contentCount / 100) * 100);

    // Market interest score: based on search volume relative to average
    const avgVolume = input.keywords.reduce((s, k) => s + k.searchVolume, 0) / (input.keywords.length || 1);
    const interestScore = Math.min(100, (kw.searchVolume / avgVolume) * 50);

    // Growth momentum score
    const growthScore = Math.min(100, Math.abs(kw.growthRate) * 5);

    // Blue ocean score: high interest + high growth + LOW saturation
    const blueOceanScore = Math.round(
      (interestScore * 0.35) +
      (growthScore * 0.35) +
      ((100 - saturationScore) * 0.30)
    );

    // Also check comment mentions
    const commentMentions = input.comments.filter(c =>
      c.text.toLowerCase().includes(kw.keyword.toLowerCase())
    ).length;
    const demandSignal = Math.min(100, commentMentions * 15);

    // Recalculate with comment signal
    const adjustedBlueOcean = Math.round(blueOceanScore * 0.7 + demandSignal * 0.3);

    return {
      keyword: kw.keyword,
      searchVolume: kw.searchVolume,
      contentCount: kw.contentCount,
      growthRate: kw.growthRate,
      saturationScore: Math.round(saturationScore),
      interestScore: Math.round(interestScore),
      growthScore: Math.round(growthScore),
      blueOceanScore: Math.min(100, Math.max(0, adjustedBlueOcean)),
      commentMentions,
      demandSignal,
      classification: adjustedBlueOcean >= 70 ? 'blue_ocean' : adjustedBlueOcean >= 45 ? 'yellow_ocean' : 'red_ocean',
    };
  });

  opportunities.sort((a, b) => b.blueOceanScore - a.blueOceanScore);

  const blueOceans = opportunities.filter(o => o.classification === 'blue_ocean');
  const yellowOceans = opportunities.filter(o => o.classification === 'yellow_ocean');
  const redOceans = opportunities.filter(o => o.classification === 'red_ocean');

  const opportunityMatrix = {
    highInterestLowSaturation: opportunities.filter(o => o.interestScore > 60 && o.saturationScore < 40),
    highGrowthLowSaturation: opportunities.filter(o => o.growthScore > 60 && o.saturationScore < 40),
    highInterestHighGrowth: opportunities.filter(o => o.interestScore > 60 && o.growthScore > 60),
    lowCompetition: opportunities.filter(o => o.saturationScore < 25),
  };

  return {
    success: true,
    data: {
      totalKeywordsAnalyzed: opportunities.length,
      blueOceanCount: blueOceans.length,
      yellowOceanCount: yellowOceans.length,
      redOceanCount: redOceans.length,
      topBlueOceans: blueOceans.slice(0, 10),
      opportunityMatrix,
      avgBlueOceanScore: Math.round(opportunities.reduce((s, o) => s + o.blueOceanScore, 0) / (opportunities.length || 1)),
      allOpportunities: opportunities,
      recommendations: [
        blueOceans.length > 0
          ? `${blueOceans.length} blue ocean opportunities found - prioritize: ${blueOceans.slice(0, 3).map(o => o.keyword).join(', ')}`
          : 'No clear blue ocean opportunities - consider niche pivots or combining topics',
        yellowOceans.length > opportunities.length * 0.3
          ? 'Significant yellow ocean potential - early mover advantage possible'
          : 'Market is either saturated or untapped - focus on content differentiation',
      ],
    },
    source: 'browser',
    featureId: 'f35',
  };
}

// -------------------- F36: ROI Forecaster --------------------
interface F36Input {
  historicalRevenue: { month: string; revenue: number; spend: number }[];
  currentGrowthRate: number;
  avgEngagementRate: number;
  followerCount: number;
  investmentAmount: number;
  investmentType: 'content' | 'ads' | 'tools' | 'collaboration';
}

function calculateMovingAverage(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = window - 1; i < values.length; i++) {
    const slice = values.slice(i - window + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / window);
  }
  return result;
}

function calculateLinearRegression(values: number[]): { slope: number; intercept: number; r2: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
    sumY2 += values[i] * values[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const ssRes = values.reduce((s, v, i) => s + Math.pow(v - (slope * i + intercept), 2), 0);
  const ssTot = values.reduce((s, v) => s + Math.pow(v - sumY / n, 2), 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

function f36_roiForecaster(input: F36Input): FeatureResult {
  const revenues = input.historicalRevenue.map(r => r.revenue);
  const rois = input.historicalRevenue.map(r => r.spend > 0 ? ((r.revenue - r.spend) / r.spend) * 100 : 0);

  const ma3 = calculateMovingAverage(revenues, 3);
  const ma6 = revenues.length >= 6 ? calculateMovingAverage(revenues, 6) : ma3;

  const revenueRegression = calculateLinearRegression(revenues);
  const _roiRegression = calculateLinearRegression(rois);
  void _roiRegression;

  // Growth rate with seasonality consideration
  const recentGrowth = revenues.length >= 2
    ? ((revenues[revenues.length - 1] - revenues[revenues.length - 2]) / revenues[revenues.length - 2]) * 100
    : input.currentGrowthRate;

  const blendedGrowthRate = (input.currentGrowthRate * 0.6 + recentGrowth * 0.3 + revenueRegression.slope * 0.1) / 100;

  // Investment type multipliers
  const investmentMultipliers: Record<string, number> = {
    content: 1.5, ads: 0.8, tools: 1.2, collaboration: 1.8,
  };
  const multiplier = investmentMultipliers[input.investmentType] || 1.0;

  // Calculate confidence interval
  const stdDev = rois.length > 1
    ? Math.sqrt(rois.reduce((s, r) => s + Math.pow(r - rois.reduce((a, b) => a + b, 0) / rois.length, 2), 0) / rois.length)
    : 20;

  const baseRevenue = revenues.length > 0 ? revenues[revenues.length - 1] : 0;
  const projectedReturn = input.investmentAmount * multiplier * (1 + blendedGrowthRate);
  const projectedROI = ((projectedReturn - input.investmentAmount) / input.investmentAmount) * 100;

  const projections = [1, 3, 6, 12].map(months => {
    const projectedRevenue = baseRevenue * Math.pow(1 + blendedGrowthRate, months);
    const cumulativeReturn = input.investmentAmount * multiplier * (1 + blendedGrowthRate * months);
    const confidence = Math.max(40, Math.round(100 - stdDev * months * 0.15));
    return {
      months,
      projectedRevenue: Math.round(projectedRevenue),
      investmentReturn: Math.round(cumulativeReturn),
      roi: Math.round(((cumulativeReturn - input.investmentAmount) / input.investmentAmount) * 100),
      confidenceInterval: {
        low: Math.round(cumulativeReturn * (1 - stdDev / 200 * months)),
        high: Math.round(cumulativeReturn * (1 + stdDev / 200 * months)),
      },
      confidence,
    };
  });

  // Engagement-driven estimate
  const engagementMultiplier = input.avgEngagementRate / 5;
  const audienceValue = (input.followerCount * engagementMultiplier * 0.01).toFixed(2);

  return {
    success: true,
    data: {
      historicalTrend: revenueRegression.slope > 0 ? 'upward' : revenueRegression.slope < 0 ? 'downward' : 'stable',
      trendStrength: Math.round(revenueRegression.r2 * 100),
      movingAverage3Month: ma3.length > 0 ? Math.round(ma3[ma3.length - 1]) : 0,
      movingAverage6Month: ma6.length > 0 ? Math.round(ma6[ma6.length - 1]) : 0,
      projectedROI: Math.round(projectedROI),
      projectedReturn: Math.round(projectedReturn),
      audienceEstimatedValue: parseFloat(audienceValue),
      investmentMultiplier: multiplier,
      blendedGrowthRate: Math.round(blendedGrowthRate * 10000) / 100,
      projections,
      riskAssessment: stdDev > 30 ? 'high' : stdDev > 15 ? 'medium' : 'low',
      recommendations: [
        projectedROI > 50 ? 'Strong ROI potential - recommended investment' : 'Moderate ROI expected - consider optimization',
        stdDev > 25 ? 'High variance in historical returns - diversify investments' : 'Consistent returns - safe to scale',
        `Investment type multiplier: ${multiplier}x (${input.investmentType})`,
      ],
    },
    source: 'browser',
    featureId: 'f36',
  };
}

// -------------------- F37: Product Trend Lab --------------------
interface F37Input {
  comments: { text: string; timestamp: string; likes: number }[];
  products: { name: string; mentions: number; sentiment: number; category: string }[];
  timeframeDays: number;
}

function f37_productTrendLab(input: F37Input): FeatureResult {
  const now = Date.now();
  const dayMs = 86400000;

  // Time-segment the comments
  const segments = Math.min(12, Math.max(2, Math.ceil(input.timeframeDays / 7)));
  const segmentSize = input.timeframeDays / segments;

  const timeSegments = Array.from({ length: segments }, (_, i) => {
    const start = now - (segments - i) * segmentSize * dayMs;
    const end = now - (segments - i - 1) * segmentSize * dayMs;
    const segComments = input.comments.filter(c =>
      new Date(c.timestamp).getTime() >= start && new Date(c.timestamp).getTime() < end
    );
    return {
      label: `Period ${i + 1}`,
      commentCount: segComments.length,
      avgLikes: segComments.length > 0 ? Math.round(segComments.reduce((s, c) => s + c.likes, 0) / segComments.length) : 0,
    };
  });

  // Calculate mention trajectory for each product
  const trendAnalysis = input.products.map(product => {
    const productComments = input.comments.filter(c =>
      c.text.toLowerCase().includes(product.name.toLowerCase())
    );

    // Growth rate calculation
    const midPoint = Math.floor(productComments.length / 2);
    const recentHalf = productComments.slice(midPoint);
    const olderHalf = productComments.slice(0, midPoint);
    const growthRate = olderHalf.length > 0
      ? ((recentHalf.length - olderHalf.length) / olderHalf.length) * 100
      : productComments.length > 0 ? 100 : 0;

    // Sentiment trajectory
    const recentSentiment = recentHalf.length > 0
      ? recentHalf.reduce((s, c) => s + (c.likes > 0 ? 1 : -0.5), 0) / recentHalf.length
      : 0;
    const olderSentiment = olderHalf.length > 0
      ? olderHalf.reduce((s, c) => s + (c.likes > 0 ? 1 : -0.5), 0) / olderHalf.length
      : 0;
    const sentimentTrajectory = recentSentiment - olderSentiment;

    // Combined trend score
    const trendScore = Math.round(
      (Math.min(50, growthRate * 0.5)) +
      (Math.min(25, product.sentiment * 0.25)) +
      (Math.min(25, sentimentTrajectory * 25))
    );

    const prediction = trendScore > 60 ? 'growing' : trendScore > 35 ? 'stable' : 'declining';
    const momentum = growthRate > 20 ? 'accelerating' : growthRate < -20 ? 'decelerating' : 'steady';

    return {
      productName: product.name,
      category: product.category,
      totalMentions: product.mentions,
      commentMentions: productComments.length,
      growthRate: Math.round(growthRate * 10) / 10,
      sentiment: product.sentiment,
      sentimentTrajectory: Math.round(sentimentTrajectory * 100) / 100,
      trendScore: Math.min(100, Math.max(0, trendScore)),
      prediction,
      momentum,
      avgEngagement: productComments.length > 0
        ? Math.round(productComments.reduce((s, c) => s + c.likes, 0) / productComments.length)
        : 0,
    };
  });

  trendAnalysis.sort((a, b) => b.trendScore - a.trendScore);

  const rising = trendAnalysis.filter(t => t.prediction === 'growing');
  const stable = trendAnalysis.filter(t => t.prediction === 'stable');
  const declining = trendAnalysis.filter(t => t.prediction === 'declining');

  return {
    success: true,
    data: {
      timeSegments,
      trendAnalysis,
      rising: rising.slice(0, 10),
      stable: stable.slice(0, 5),
      declining: declining.slice(0, 10),
      summary: {
        totalProductsTracked: trendAnalysis.length,
        risingCount: rising.length,
        stableCount: stable.length,
        decliningCount: declining.length,
        averageTrendScore: Math.round(trendAnalysis.reduce((s, t) => s + t.trendScore, 0) / (trendAnalysis.length || 1)),
      },
      recommendations: [
        rising.length > 0 ? `Rising trends: ${rising.slice(0, 3).map(r => r.productName).join(', ')}` : 'No rising trends detected',
        declining.length > 0 ? `Declining trends to avoid: ${declining.slice(0, 3).map(d => d.productName).join(', ')}` : 'All products showing stable or positive trends',
        'Focus content on rising products with high sentiment for maximum engagement',
      ],
    },
    source: 'browser',
    featureId: 'f37',
  };
}

// -------------------- F38: Link Health Monitor --------------------
interface F38Input {
  links: { url: string; label: string; clicks: number; conversions: number; createdAt: string; lastClicked: string }[];
}

function f38_linkHealthMonitor(input: F38Input): FeatureResult {
  const now = Date.now();
  const dayMs = 86400000;

  const analyzed = input.links.map(link => {
    // URL pattern analysis
    const hasHttps = link.url.startsWith('https');
    const hasUtm = /utm_/.test(link.url);
    const _hasTracking = /[?&]/.test(link.url);
    void _hasTracking;
    const urlLength = link.url.length;
    const hasShortDomain = /bit\.ly|t\.co|tinyurl|short\.io|rebrand/.test(link.url);

    // Age analysis
    const ageDays = Math.floor((now - new Date(link.createdAt).getTime()) / dayMs);
    const daysSinceClick = Math.floor((now - new Date(link.lastClicked).getTime()) / dayMs);

    // Performance metrics
    const conversionRate = link.clicks > 0 ? (link.conversions / link.clicks) * 100 : 0;
    const clicksPerDay = ageDays > 0 ? link.clicks / ageDays : link.clicks;
    const isStale = daysSinceClick > 30;

    // Click-through estimation (based on age decay)
    const decayFactor = Math.exp(-0.01 * ageDays);
    const estimatedFutureClicks = Math.round(clicksPerDay * 30 * decayFactor);

    // Health score calculation
    let healthScore = 100;
    if (!hasHttps) healthScore -= 20;
    if (!hasUtm) healthScore -= 15;
    if (isStale) healthScore -= 25;
    if (hasShortDomain) healthScore -= 5;
    if (urlLength > 200) healthScore -= 10;
    if (conversionRate < 1 && link.clicks > 10) healthScore -= 15;
    if (clicksPerDay < 0.5 && ageDays > 14) healthScore -= 10;
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      url: link.url,
      label: link.label,
      healthScore,
      status: healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'warning' : 'critical',
      ageDays,
      daysSinceClick,
      clicksPerDay: Math.round(clicksPerDay * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      hasHttps,
      hasUtm,
      hasShortDomain,
      isStale,
      estimatedFutureClicks,
      issues: [
        !hasHttps ? 'Missing HTTPS - security risk' : null,
        !hasUtm ? 'No UTM tracking parameters' : null,
        isStale ? `No clicks in ${daysSinceClick} days` : null,
        hasShortDomain ? 'Shortened URL - may reduce trust' : null,
        conversionRate < 1 && link.clicks > 10 ? 'Low conversion rate - consider replacement' : null,
      ].filter(Boolean),
    };
  });

  analyzed.sort((a, b) => a.healthScore - b.healthScore);

  const healthy = analyzed.filter(l => l.status === 'healthy');
  const warning = analyzed.filter(l => l.status === 'warning');
  const critical = analyzed.filter(l => l.status === 'critical');

  const totalClicks = input.links.reduce((s, l) => s + l.clicks, 0);
  const totalConversions = input.links.reduce((s, l) => s + l.conversions, 0);
  const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const linksWithoutUtm = analyzed.filter(l => !l.hasUtm).length;

  return {
    success: true,
    data: {
      overallHealthScore: analyzed.length > 0 ? Math.round(analyzed.reduce((s, l) => s + l.healthScore, 0) / analyzed.length) : 0,
      totalLinks: analyzed.length,
      healthyCount: healthy.length,
      warningCount: warning.length,
      criticalCount: critical.length,
      totalClicks,
      totalConversions,
      averageConversionRate: Math.round(avgConversionRate * 100) / 100,
      linksWithoutUtm,
      criticalLinks: critical,
      warningLinks: warning,
      allLinks: analyzed,
      recommendations: [
        linksWithoutUtm > 0 ? `${linksWithoutUtm} links missing UTM parameters - add tracking` : 'All links have tracking parameters',
        critical.length > 0 ? `${critical.length} critical links need immediate attention` : 'No critical link issues',
        avgConversionRate < 2 ? 'Low overall conversion rate - test different link placements' : 'Conversion rates are healthy',
      ],
    },
    source: 'browser',
    featureId: 'f38',
  };
}

// -------------------- F39: Niche Profitability Benchmarking --------------------
interface F39Input {
  niche: string;
  followerCount: number;
  engagementRate: number;
  avgViews: number;
  monthlyRevenue: number;
  growthRate: number;
  contentType: string;
}

const NICHE_BENCHMARKS: Record<string, { avgCPM: number; avgEngagement: number; avgGrowth: number; monetizationMonths: number; avgRevenuePer1k: number }> = {
  tech: { avgCPM: 12, avgEngagement: 3.5, avgGrowth: 5, monetizationMonths: 6, avgRevenuePer1k: 15 },
  beauty: { avgCPM: 18, avgEngagement: 5.2, avgGrowth: 8, monetizationMonths: 4, avgRevenuePer1k: 25 },
  finance: { avgCPM: 25, avgEngagement: 3.0, avgGrowth: 4, monetizationMonths: 8, avgRevenuePer1k: 35 },
  gaming: { avgCPM: 8, avgEngagement: 6.5, avgGrowth: 10, monetizationMonths: 5, avgRevenuePer1k: 10 },
  fitness: { avgCPM: 14, avgEngagement: 4.8, avgGrowth: 6, monetizationMonths: 5, avgRevenuePer1k: 18 },
  food: { avgCPM: 10, avgEngagement: 4.5, avgGrowth: 5, monetizationMonths: 7, avgRevenuePer1k: 12 },
  travel: { avgCPM: 11, avgEngagement: 4.0, avgGrowth: 7, monetizationMonths: 6, avgRevenuePer1k: 14 },
  education: { avgCPM: 15, avgEngagement: 3.8, avgGrowth: 6, monetizationMonths: 5, avgRevenuePer1k: 20 },
  lifestyle: { avgCPM: 9, avgEngagement: 5.0, avgGrowth: 7, monetizationMonths: 5, avgRevenuePer1k: 11 },
  fashion: { avgCPM: 16, avgEngagement: 5.5, avgGrowth: 9, monetizationMonths: 4, avgRevenuePer1k: 22 },
  photography: { avgCPM: 13, avgEngagement: 4.2, avgGrowth: 5, monetizationMonths: 6, avgRevenuePer1k: 16 },
  music: { avgCPM: 7, avgEngagement: 6.0, avgGrowth: 8, monetizationMonths: 4, avgRevenuePer1k: 9 },
  business: { avgCPM: 22, avgEngagement: 3.2, avgGrowth: 4, monetizationMonths: 7, avgRevenuePer1k: 30 },
  comedy: { avgCPM: 6, avgEngagement: 7.0, avgGrowth: 12, monetizationMonths: 3, avgRevenuePer1k: 8 },
  creator: { avgCPM: 14, avgEngagement: 4.5, avgGrowth: 7, monetizationMonths: 5, avgRevenuePer1k: 17 },
};

function f39_nicheProfitabilityBenchmarking(input: F39Input): FeatureResult {
  const normalizedNiche = input.niche.toLowerCase();
  const benchmark = NICHE_BENCHMARKS[normalizedNiche] || NICHE_BENCHMARKS.lifestyle;

  // Calculate percentile using normal distribution approximation
  // Error function approximation (Abramowitz and Stegun)
  const erf = (x: number): number => {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sign * y;
  };
  const zScore = (value: number, mean: number, stdDev: number) => (value - mean) / stdDev;
  const normalCDF = (x: number) => 0.5 * (1 + erf(x / Math.sqrt(2)));

  const cpmPercentile = Math.round(normalCDF(zScore(input.monthlyRevenue / (input.avgViews / 1000), benchmark.avgCPM, benchmark.avgCPM * 0.4)) * 100);
  const engagementPercentile = Math.round(normalCDF(zScore(input.engagementRate, benchmark.avgEngagement, benchmark.avgEngagement * 0.3)) * 100);
  const growthPercentile = Math.round(normalCDF(zScore(input.growthRate, benchmark.avgGrowth, benchmark.avgGrowth * 0.5)) * 100);

  const actualCPM = input.avgViews > 0 ? (input.monthlyRevenue / input.avgViews) * 1000 : 0;
  const estimatedMaxRevenue = (input.avgViews / 1000) * benchmark.avgCPM * 1.5;

  const metrics = [
    {
      name: 'CPM Rate',
      yourValue: Math.round(actualCPM * 100) / 100,
      benchmarkValue: benchmark.avgCPM,
      percentile: Math.min(99, Math.max(1, cpmPercentile)),
      status: actualCPM >= benchmark.avgCPM ? 'above' : 'below',
    },
    {
      name: 'Engagement Rate',
      yourValue: input.engagementRate,
      benchmarkValue: benchmark.avgEngagement,
      percentile: Math.min(99, Math.max(1, engagementPercentile)),
      status: input.engagementRate >= benchmark.avgEngagement ? 'above' : 'below',
    },
    {
      name: 'Growth Rate',
      yourValue: input.growthRate,
      benchmarkValue: benchmark.avgGrowth,
      percentile: Math.min(99, Math.max(1, growthPercentile)),
      status: input.growthRate >= benchmark.avgGrowth ? 'above' : 'below',
    },
    {
      name: 'Revenue per 1K Followers',
      yourValue: Math.round((input.monthlyRevenue / input.followerCount) * 1000 * 100) / 100,
      benchmarkValue: benchmark.avgRevenuePer1k,
      percentile: Math.min(99, Math.max(1, Math.round(normalCDF(zScore(input.monthlyRevenue / (input.followerCount / 1000), benchmark.avgRevenuePer1k, benchmark.avgRevenuePer1k * 0.5)) * 100))),
      status: (input.monthlyRevenue / (input.followerCount / 1000)) >= benchmark.avgRevenuePer1k ? 'above' : 'below',
    },
  ];

  const overallPercentile = Math.round(metrics.reduce((s, m) => s + m.percentile, 0) / metrics.length);

  return {
    success: true,
    data: {
      niche: input.niche,
      benchmarkSource: 'industry',
      overallPercentile,
      profitabilityGrade: overallPercentile >= 80 ? 'A' : overallPercentile >= 60 ? 'B' : overallPercentile >= 40 ? 'C' : overallPercentile >= 20 ? 'D' : 'F',
      metrics,
      estimatedMaxRevenue: Math.round(estimatedMaxRevenue),
      revenueGap: Math.round(estimatedMaxRevenue - input.monthlyRevenue),
      monetizationTimeline: benchmark.monetizationMonths,
      cpmEfficiency: Math.round((actualCPM / benchmark.avgCPM) * 100),
      recommendations: [
        cpmPercentile < 50 ? 'Below-average CPM - diversify revenue streams' : 'Strong CPM performance',
        engagementPercentile < 40 ? 'Low engagement - focus on community building' : 'Engagement is competitive',
        growthPercentile < 30 ? 'Slow growth - consider content strategy pivot' : 'Growth rate is healthy',
        `Revenue gap to niche maximum: ₦${Math.round(estimatedMaxRevenue - input.monthlyRevenue).toLocaleString()}`,
      ],
    },
    source: 'browser',
    featureId: 'f39',
  };
}

// -------------------- F40: Automated Revenue Reporting --------------------
interface F40Input {
  transactions: { id: string; type: string; amount: number; date: string; source: string }[];
  period: 'week' | 'month' | 'quarter' | 'year';
}

function f40_automatedRevenueReporting(input: F40Input): FeatureResult {
  const now = new Date();
  const periodMs: Record<string, number> = {
    week: 7 * 86400000,
    month: 30 * 86400000,
    quarter: 90 * 86400000,
    year: 365 * 86400000,
  };
  const cutoff = now.getTime() - periodMs[input.period];

  const periodTransactions = input.transactions.filter(t =>
    new Date(t.date).getTime() >= cutoff
  );

  const revenueBySource = periodTransactions.reduce<Record<string, number>>((acc, t) => {
    acc[t.source] = (acc[t.source] || 0) + t.amount;
    return acc;
  }, {});

  const totalRevenue = periodTransactions.reduce((s, t) => s + t.amount, 0);
  const totalTransactions = periodTransactions.length;
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const previousPeriodTransactions = input.transactions.filter(t => {
    const ts = new Date(t.date).getTime();
    return ts >= cutoff - periodMs[input.period] && ts < cutoff;
  });
  const previousRevenue = previousPeriodTransactions.reduce((s, t) => s + t.amount, 0);
  const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  // Group by day for trend
  const byDay = periodTransactions.reduce<Record<string, number>>((acc, t) => {
    const day = t.date.split('T')[0];
    acc[day] = (acc[day] || 0) + t.amount;
    return acc;
  }, {});
  const dailyValues = Object.values(byDay).sort();
  const avgDaily = dailyValues.length > 0 ? dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length : 0;
  const maxDaily = dailyValues.length > 0 ? Math.max(...dailyValues) : 0;
  const minDaily = dailyValues.length > 0 ? Math.min(...dailyValues) : 0;

  const bestSource = Object.entries(revenueBySource).sort(([, a], [, b]) => b - a)[0];
  const worstSource = Object.entries(revenueBySource).sort(([, a], [, b]) => a - b)[0];

  // Project next period
  const projectedRevenue = Math.round(totalRevenue * (1 + growthRate / 100));

  return {
    success: true,
    data: {
      period: input.period,
      totalRevenue: Math.round(totalRevenue),
      totalTransactions,
      averageTransactionValue: Math.round(avgTransactionValue),
      growthRate: Math.round(growthRate * 100) / 100,
      previousPeriodRevenue: Math.round(previousRevenue),
      projectedNextPeriod: projectedRevenue,
      revenueBySource: Object.fromEntries(
        Object.entries(revenueBySource).map(([source, amount]) => [source, Math.round(amount)])
      ),
      bestPerformer: bestSource ? { source: bestSource[0], revenue: Math.round(bestSource[1]), percentage: Math.round((bestSource[1] / totalRevenue) * 100) } : null,
      worstPerformer: worstSource ? { source: worstSource[0], revenue: Math.round(worstSource[1]), percentage: Math.round((worstSource[1] / totalRevenue) * 100) } : null,
      dailyStats: {
        average: Math.round(avgDaily),
        best: Math.round(maxDaily),
        worst: Math.round(minDaily),
        daysWithRevenue: Object.keys(byDay).length,
      },
      recommendations: [
        growthRate > 10 ? 'Strong revenue growth - maintain current strategy' : growthRate > 0 ? 'Positive but slow growth - optimize conversion' : 'Revenue declining - review strategy',
        bestSource ? `Top revenue source: ${bestSource[0]} - double down here` : 'Diversify revenue sources',
        worstSource ? `Underperformer: ${worstSource[0]} - consider replacing` : '',
      ].filter(Boolean),
    },
    source: 'browser',
    featureId: 'f40',
  };
}

// -------------------- F41: Campaign Lifecycle Manager --------------------
interface F41Input {
  campaigns: {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    dailyData: { date: string; impressions: number; clicks: number }[];
  }[];
}

function f41_campaignLifecycleManager(input: F41Input): FeatureResult {
  const now = Date.now();

  const analyzed = input.campaigns.map(campaign => {
    const start = new Date(campaign.startDate).getTime();
    const end = campaign.endDate ? new Date(campaign.endDate).getTime() : null;
    const daysSinceStart = (now - start) / 86400000;
    const totalDays = end ? (end - start) / 86400000 : daysSinceStart;
    const progressPercent = totalDays > 0 ? Math.min(100, (daysSinceStart / totalDays) * 100) : 100;
    const budgetPace = totalDays > 0 ? (campaign.spent / campaign.budget) / (daysSinceStart / totalDays) : 1;
    const budgetBurnRate = daysSinceStart > 0 ? campaign.spent / daysSinceStart : 0;

    // Determine lifecycle stage
    let stage: 'planning' | 'launch' | 'growth' | 'peak' | 'declining' | 'ended';
    let stageRecommendation = '';

    if (daysSinceStart < 3) {
      stage = 'launch';
      stageRecommendation = 'Monitor initial performance closely. Set baseline metrics.';
    } else if (progressPercent < 30) {
      stage = 'growth';
      stageRecommendation = 'Optimize targeting. Test creative variations.';
    } else if (progressPercent < 70) {
      stage = 'peak';
      stageRecommendation = 'Scale winning creatives. Maintain budget discipline.';
    } else if (progressPercent < 95 && !end) {
      stage = 'declining';
      stageRecommendation = 'Consider extending or refreshing creatives.';
    } else if (end && now > end) {
      stage = 'ended';
      stageRecommendation = 'Analyze results. Document learnings for next campaign.';
    } else {
      stage = 'peak';
      stageRecommendation = 'Maximize ROI in the remaining time.';
    }

    // Performance metrics
    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
    const conversionRate = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0;
    const cpc = campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0;
    const cpa = campaign.conversions > 0 ? campaign.spent / campaign.conversions : 0;

    // Performance trend (last 7 days vs prior 7 days)
    const dailyData = campaign.dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recentWeek = dailyData.slice(-7);
    const priorWeek = dailyData.slice(-14, -7);
    const recentClicks = recentWeek.reduce((s, d) => s + d.clicks, 0);
    const priorClicks = priorWeek.reduce((s, d) => s + d.clicks, 0);
    const clickTrend = priorClicks > 0 ? ((recentClicks - priorClicks) / priorClicks) * 100 : 0;

    return {
      ...campaign,
      stage,
      progressPercent: Math.round(progressPercent),
      budgetPace: Math.round(budgetPace * 100) / 100,
      budgetBurnRate: Math.round(budgetBurnRate),
      budgetRemaining: Math.round(campaign.budget - campaign.spent),
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      cpa: Math.round(cpa * 100) / 100,
      clickTrend: Math.round(clickTrend),
      stageRecommendation,
      performanceScore: Math.round(
        (Math.min(40, ctr * 4)) +
        (Math.min(30, conversionRate * 3)) +
        (Math.min(30, clickTrend > 0 ? 30 : 30 + clickTrend * 0.3))
      ),
    };
  });

  const byStage = analyzed.reduce<Record<string, typeof analyzed>>((acc, c) => {
    if (!acc[c.stage]) acc[c.stage] = [];
    acc[c.stage].push(c);
    return acc;
  }, {});

  return {
    success: true,
    data: {
      campaigns: analyzed,
      byStage,
      totalBudget: Math.round(analyzed.reduce((s, c) => s + c.budget, 0)),
      totalSpent: Math.round(analyzed.reduce((s, c) => s + c.spent, 0)),
      totalRemaining: Math.round(analyzed.reduce((s, c) => s + c.budgetRemaining, 0)),
      averagePerformanceScore: Math.round(analyzed.reduce((s, c) => s + c.performanceScore, 0) / (analyzed.length || 1)),
      recommendations: [
        analyzed.filter(c => c.budgetPace > 1.2).length > 0
          ? `${analyzed.filter(c => c.budgetPace > 1.2).length} campaign(s) overspending - adjust budgets`
          : 'All campaigns within budget',
        analyzed.filter(c => c.clickTrend < -10).length > 0
          ? `${analyzed.filter(c => c.clickTrend < -10).length} campaign(s) declining - refresh creatives`
          : 'Campaign trends are healthy',
        `Active campaigns: ${analyzed.filter(c => c.stage !== 'ended').length}`,
      ],
    },
    source: 'browser',
    featureId: 'f41',
  };
}

// -------------------- F42: Social-to-Ledger Financial Sync --------------------
interface F42Input {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followers: number;
  niche: string;
  platform: string;
}

function f42_socialToLedgerFinancialSync(input: F42Input): FeatureResult {
  const { views, likes, comments, shares, saves, followers, niche } = input;

  // Engagement rate
  const totalEngagements = likes + comments + shares + saves;
  const engagementRate = views > 0 ? (totalEngagements / views) * 100 : 0;

  // Platform CPM estimates (per 1000 views)
  const platformCPM: Record<string, number> = {
    youtube: 12, instagram: 8, tiktok: 4, twitter: 3, linkedin: 10, facebook: 6,
  };
  const baseCPM = platformCPM[input.platform] || 6;

  // Niche CPM modifiers
  const nicheModifiers: Record<string, number> = {
    finance: 2.1, business: 1.8, tech: 1.3, beauty: 1.5, fitness: 1.1,
    gaming: 0.8, education: 1.4, food: 0.9, travel: 1.0, comedy: 0.7,
  };
  const nicheMod = nicheModifiers[niche.toLowerCase()] || 1.0;

  // Engagement quality multiplier
  const engagementQuality = Math.min(2.0, 0.5 + (engagementRate / 10) * 0.5);

  // Calculated CPM
  const effectiveCPM = baseCPM * nicheMod * engagementQuality;

  // Revenue estimates
  const adRevenue = (views / 1000) * effectiveCPM;
  const sponsorshipValuePerPost = (followers / 1000) * 50 * nicheMod * engagementQuality;
  const affiliateRevenueEstimate = views * 0.005 * 15 * nicheMod;
  const merchRevenueEstimate = followers * 0.02 * 20;
  const courseRevenueEstimate = followers * 0.005 * 50 * engagementQuality;

  // Engagement-to-conversion rate estimation
  const commentToLeadRate = comments > 0 ? 0.05 * engagementQuality : 0;
  const shareToReachRate = 2.5; // each share reaches ~2.5 new people
  const saveToInterestRate = saves > 0 ? 0.15 : 0;
  const estimatedLeads = Math.round(comments * commentToLeadRate + saves * saveToInterestRate);
  const estimatedReach = views + (shares * shareToReachRate);

  // Financial equivalents mapping
  const financialMapping = {
    viewsValue: Math.round(adRevenue),
    engagementValue: Math.round(totalEngagements * 0.02 * nicheMod),
    audienceValue: Math.round(followers * 0.5 * nicheMod * engagementQuality),
    contentValuePerPiece: Math.round(adRevenue + sponsorshipValuePerPost * 0.3),
    totalEstimatedMonthlyRevenue: Math.round(adRevenue * 30 + sponsorshipValuePerPost * 8),
  };

  return {
    success: true,
    data: {
      engagementRate: Math.round(engagementRate * 100) / 100,
      effectiveCPM: Math.round(effectiveCPM * 100) / 100,
      baseCPM,
      nicheModifier: nicheMod,
      engagementQuality: Math.round(engagementQuality * 100) / 100,
      revenueBreakdown: {
        adRevenue: Math.round(adRevenue),
        sponsorshipValuePerPost: Math.round(sponsorshipValuePerPost),
        affiliateRevenueEstimate: Math.round(affiliateRevenueEstimate),
        merchRevenueEstimate: Math.round(merchRevenueEstimate),
        courseRevenueEstimate: Math.round(courseRevenueEstimate),
      },
      conversionEstimates: {
        estimatedLeads,
        estimatedReach: Math.round(estimatedReach),
        commentToLeadRate: Math.round(commentToLeadRate * 1000) / 1000,
        saveToInterestRate,
      },
      financialMapping,
      recommendations: [
        effectiveCPM < baseCPM ? 'Engagement quality pulling CPM below platform average - boost interaction' : 'CPM above platform average - strong position',
        affiliateRevenueEstimate > adRevenue ? 'Affiliate potential exceeds ad revenue - add links' : 'Ad revenue is primary - grow audience first',
        `Estimated monthly revenue potential: ₦${Math.round(adRevenue * 30 + sponsorshipValuePerPost * 8).toLocaleString()}`,
      ],
    },
    source: 'browser',
    featureId: 'f42',
  };
}

// -------------------- F43: Sponsor Shadow Inventory (Liminal) --------------------
interface F43Input {
  competitorContent: {
    id: string;
    text: string;
    creatorName: string;
    likes: number;
    views: number;
    hasSponsorTag: boolean;
    brandMentions: string[];
  }[];
}

function f43_sponsorShadowInventory(input: F43Input): FeatureResult {
  const sponsorSignals: { pattern: RegExp; weight: number; type: string }[] = [
    { pattern: /\b(sponsored by|paid partnership|ad\s*:\s*|brought to you by|thanks to|powered by)\b/i, weight: 30, type: 'explicit_disclosure' },
    { pattern: /\b(use (my )?code|discount code|promo code|link in (bio|desc))\b/i, weight: 35, type: 'affiliate_signal' },
    { pattern: /\b(check out|go to|visit|try|switch to|upgrade to)\s+\w+/i, weight: 20, type: 'call_to_action' },
    { pattern: /\b(love (this|my|their)|been using|can'?t live without|game changer|changed (my|the) (game|way))\b/i, weight: 25, type: 'endorsement_language' },
    { pattern: /\b(not sponsored|honest (review|opinion)|no one (paid|told) me)\b/i, weight: 15, type: 'reverse_psychology' },
    { pattern: /\b(best \w+ (i'?ve|i have) ever|top \d+ (pick|choice|favorite)|if you know me|as you (know|might know))\b/i, weight: 18, type: 'brand_affinity' },
  ];

  const analyzed = input.competitorContent.map(content => {
    const text = content.text.toLowerCase();
    const detectedSignals: { type: string; weight: number; matched: string }[] = [];
    let totalSignalScore = 0;

    for (const signal of sponsorSignals) {
      const matches = text.match(signal.pattern);
      if (matches) {
        totalSignalScore += signal.weight;
        detectedSignals.push({ type: signal.type, weight: signal.weight, matched: matches[0] });
      }
    }

    // Check for abrupt topic shifts (sponsor transition indicators)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    let shiftScore = 0;
    for (let i = 1; i < sentences.length; i++) {
      const prevWords = sentences[i - 1].split(/\s+/).slice(-3).join(' ');
      const currWords = sentences[i].split(/\s+/).slice(0, 3).join(' ');
      const prevSet = new Set(prevWords.split(/\s+/));
      const currSet = new Set(currWords.split(/\s+/));
      const overlap = [...prevSet].filter(w => currSet.has(w)).length;
      if (overlap === 0 && sentences.length > 3) shiftScore += 5;
    }
    if (shiftScore > 0) {
      totalSignalScore += shiftScore;
      detectedSignals.push({ type: 'topic_shift', weight: shiftScore, matched: 'detected abrupt content transition' });
    }

    // Brand mention density
    const brandDensity = content.brandMentions.length / Math.max(1, text.split(/\s+/).length) * 100;

    // Deal value estimation
    const estimatedDealValue = totalSignalScore > 50
      ? Math.round(content.views * 0.02 * 5 + content.likes * 0.5)
      : totalSignalScore > 20
        ? Math.round(content.views * 0.01 * 3)
        : 0;

    const isLikelySponsored = content.hasSponsorTag || totalSignalScore >= 30 || brandDensity > 0.5;

    return {
      contentId: content.id,
      creatorName: content.creatorName,
      views: content.views,
      likes: content.likes,
      hasSponsorTag: content.hasSponsorTag,
      signalScore: totalSignalScore,
      detectedSignals,
      brandDensity: Math.round(brandDensity * 100) / 100,
      isLikelySponsored,
      confidence: Math.min(95, Math.max(10, Math.round(totalSignalScore * 1.2))),
      estimatedDealValue,
      brandMentions: content.brandMentions,
    };
  });

  const sponsoredContent = analyzed.filter(c => c.isLikelySponsored);
  const totalEstimatedShadowSpend = sponsoredContent.reduce((s, c) => s + c.estimatedDealValue, 0);
  const brandsByFrequency = sponsoredContent.flatMap(c => c.brandMentions)
    .reduce<Record<string, number>>((acc, b) => { acc[b] = (acc[b] || 0) + 1; return acc; }, {});
  const topBrands = Object.entries(brandsByFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([brand, frequency]) => ({
      brand,
      frequency,
      estimatedTotalSpend: Math.round(sponsoredContent
        .filter(c => c.brandMentions.includes(brand))
        .reduce((s, c) => s + c.estimatedDealValue, 0)),
    }));

  return {
    success: true,
    data: {
      totalContentAnalyzed: analyzed.length,
      likelySponsoredCount: sponsoredContent.length,
      sponsorshipRate: Math.round((sponsoredContent.length / (analyzed.length || 1)) * 100),
      totalEstimatedShadowSpend: Math.round(totalEstimatedShadowSpend),
      averageConfidence: sponsoredContent.length > 0
        ? Math.round(sponsoredContent.reduce((s, c) => s + c.confidence, 0) / sponsoredContent.length)
        : 0,
      topBrands,
      sponsoredContent: sponsoredContent.sort((a, b) => b.signalScore - a.signalScore),
      allContent: analyzed,
      recommendations: [
        sponsoredContent.length > analyzed.length * 0.5
          ? 'High sponsorship rate in competitors - significant ad revenue opportunity'
          : 'Low sponsorship rate - untapped market',
        topBrands.length > 0 ? `Top sponsor brand: ${topBrands[0].brand} (${topBrands[0].frequency} mentions)` : 'No clear sponsor brands detected',
        `Estimated shadow market size: ₦${Math.round(totalEstimatedShadowSpend).toLocaleString()}`,
      ],
    },
    source: 'browser',
    featureId: 'f43',
  };
}

// -------------------- F44: Sponsorship Rate Calculator --------------------
interface F44Input {
  followerCount: number;
  engagementRate: number;
  niche: string;
  contentType: 'video' | 'reel' | 'story' | 'post' | 'stream' | 'podcast';
  platform: string;
  contentQualityScore: number; // 0-100
  audienceDemographics: { age18_24: number; age25_34: number; age35_plus: number };
}

function f44_sponsorshipRateCalculator(input: F44Input): FeatureResult {
  const { followerCount, engagementRate, contentQualityScore, contentType, audienceDemographics } = input;

  // Base rate: ₦50 per 1000 followers
  const baseRatePer1k = 50;

  // Niche multiplier
  const nicheMultipliers: Record<string, number> = {
    finance: 2.5, business: 2.0, tech: 1.6, beauty: 1.8, fitness: 1.4,
    gaming: 1.2, education: 1.5, food: 1.1, travel: 1.3, fashion: 1.7,
    creator: 1.4, photography: 1.3, music: 1.0, comedy: 1.1, lifestyle: 1.2,
  };
  const nicheMult = nicheMultipliers[input.niche.toLowerCase()] || 1.0;

  // Engagement multiplier (engagement rate relative to 3% baseline)
  const engagementMult = Math.max(0.5, Math.min(3.0, engagementRate / 3));

  // Content type multiplier
  const contentTypeMultipliers: Record<string, number> = {
    video: 1.5, reel: 1.2, story: 0.5, post: 0.8, stream: 1.3, podcast: 1.4,
  };
  const contentMult = contentTypeMultipliers[contentType] || 1.0;

  // Quality multiplier
  const qualityMult = 0.7 + (contentQualityScore / 100) * 0.8;

  // Demographics multiplier (25-34 is premium demographic)
  const demoMult = 0.8 + (audienceDemographics.age25_34 / 100) * 0.6 + (audienceDemographics.age35_plus / 100) * 0.3;

  // Calculate rates
  const followerThousands = followerCount / 1000;
  const baseSponsorshipRate = Math.round(followerThousands * baseRatePer1k * nicheMult * engagementMult * contentMult * qualityMult * demoMult);

  // Market comparison (percentiles)
  const rates = [
    baseSponsorshipRate * 0.5,   // low end
    baseSponsorshipRate * 0.75,  // below average
    baseSponsorshipRate,          // calculated rate
    baseSponsorshipRate * 1.25,  // above average
    baseSponsorshipRate * 1.5,   // premium
  ];

  // Package recommendations
  const packages = [
    { name: 'Shoutout', type: 'single_mention', price: Math.round(baseSponsorshipRate * 0.3), deliverables: '1 mention in content' },
    { name: 'Dedicated Review', type: 'dedicated', price: Math.round(baseSponsorshipRate * 0.7), deliverables: 'Full product review/recommendation' },
    { name: 'Integration', type: 'integration', price: baseSponsorshipRate, deliverables: 'Seamless product integration in content' },
    { name: 'Series Sponsorship', type: 'series', price: Math.round(baseSponsorshipRate * 2.5), deliverables: '3-5 content pieces with brand messaging' },
    { name: 'Long-term Partner', type: 'partnership', price: Math.round(baseSponsorshipRate * 8), deliverables: 'Monthly presence across 6 months' },
  ];

  // CPM-based rate validation
  const estimatedViews = followerCount * (engagementRate / 100) * 5;
  const cpms = packages.map(p => ({
    package: p.name,
    effectiveCPM: estimatedViews > 0 ? Math.round((p.price / estimatedViews) * 1000) : 0,
  }));

  return {
    success: true,
    data: {
      recommendedRate: baseSponsorshipRate,
      ratePer1kFollowers: Math.round(baseSponsorshipRate / followerThousands),
      multipliers: {
        niche: { value: nicheMult, label: input.niche },
        engagement: { value: engagementMult, label: `${engagementRate}%` },
        contentType: { value: contentMult, label: contentType },
        quality: { value: Math.round(qualityMult * 100) / 100, label: `${contentQualityScore}/100` },
        demographics: { value: Math.round(demoMult * 100) / 100, label: `${audienceDemographics.age25_34}% age 25-34` },
      },
      marketRange: {
        low: rates[0],
        belowAverage: rates[1],
        marketRate: rates[2],
        aboveAverage: rates[3],
        premium: rates[4],
      },
      packages,
      cpms: cpms,
      estimatedViews: Math.round(estimatedViews),
      recommendations: [
        engagementRate > 5 ? 'High engagement justifies premium pricing' : 'Boost engagement to command higher rates',
        contentQualityScore > 70 ? 'Strong content quality - price at above-average tier' : 'Improve production quality for better rates',
        `Minimum recommended rate: ₦${rates[1].toLocaleString()}, Premium: ₦${rates[4].toLocaleString()}`,
      ],
    },
    source: 'browser',
    featureId: 'f44',
  };
}

// -------------------- F45: Content Debt Forecaster --------------------
interface F45Input {
  content: {
    id: string;
    title: string;
    type: 'tutorial' | 'review' | 'vlog' | 'listicle' | 'opinion' | 'news' | 'evergreen' | 'challenge' | 'story';
    publishDate: string;
    views: number;
    currentViewsPerDay: number;
    peakViewsPerDay: number;
    topic: string;
  }[];
}

function f45_contentDebtForecaster(input: F45Input): FeatureResult {
  const now = Date.now();

  // Content type lifecycle (days until significant decay)
  const typeLifecycles: Record<string, { halfLife: number; fullLife: number; refreshCycle: number }> = {
    news: { halfLife: 2, fullLife: 7, refreshCycle: 0 },
    challenge: { halfLife: 14, fullLife: 30, refreshCycle: 90 },
    vlog: { halfLife: 21, fullLife: 45, refreshCycle: 180 },
    review: { halfLife: 45, fullLife: 90, refreshCycle: 120 },
    listicle: { halfLife: 60, fullLife: 180, refreshCycle: 150 },
    opinion: { halfLife: 30, fullLife: 60, refreshCycle: 90 },
    tutorial: { halfLife: 90, fullLife: 365, refreshCycle: 180 },
    evergreen: { halfLife: 120, fullLife: 540, refreshCycle: 365 },
    story: { halfLife: 7, fullLife: 14, refreshCycle: 60 },
  };

  const analyzed = input.content.map(item => {
    const lifecycle = typeLifecycles[item.type] || typeLifecycles.vlog;
    const ageDays = Math.floor((now - new Date(item.publishDate).getTime()) / 86400000);
    const ageRatio = ageDays / lifecycle.fullLife;

    // Decay factor: exponential decay
    const decayFactor = Math.exp(-0.693 * (ageDays / lifecycle.halfLife));
    const decayScore = Math.round(decayFactor * 100);

    // Performance ratio (current vs peak)
    const performanceRatio = item.peakViewsPerDay > 0
      ? item.currentViewsPerDay / item.peakViewsPerDay
      : 0;

    // Platform algorithm decay (content beyond 30 days gets less algorithmic push)
    const algorithmBoost = ageDays < 7 ? 1.5 : ageDays < 30 ? 1.2 : ageDays < 90 ? 0.8 : 0.5;

    // Debt score: higher = more stale
    const debtScore = Math.round(
      (ageRatio * 40) +
      ((1 - performanceRatio) * 30) +
      ((1 - algorithmBoost / 1.5) * 30)
    );

    // Time to refresh
    const daysUntilRefresh = Math.max(0, Math.round(lifecycle.refreshCycle - ageDays));
    const needsRefresh = debtScore > 60 || daysUntilRefresh <= 0;

    // Estimated value of refresh
    const potentialViewsGain = Math.round(item.peakViewsPerDay * 0.3 * lifecycle.halfLife * 0.1);

    return {
      contentId: item.id,
      title: item.title,
      type: item.type,
      topic: item.topic,
      ageDays,
      currentViewsPerDay: item.currentViewsPerDay,
      peakViewsPerDay: item.peakViewsPerDay,
      performanceRatio: Math.round(performanceRatio * 100) / 100,
      decayScore,
      debtScore: Math.min(100, Math.max(0, debtScore)),
      debtLevel: debtScore >= 75 ? 'critical' : debtScore >= 50 ? 'high' : debtScore >= 25 ? 'medium' : 'low',
      needsRefresh,
      daysUntilRefresh,
      refreshPriority: needsRefresh ? Math.round(debtScore + potentialViewsGain * 0.001) : 0,
      estimatedRefreshValue: potentialViewsGain,
      halfLife: lifecycle.halfLife,
      fullLife: lifecycle.fullLife,
      refreshCycle: lifecycle.refreshCycle,
    };
  });

  analyzed.sort((a, b) => b.debtScore - a.debtScore);

  const needsRefreshCount = analyzed.filter(c => c.needsRefresh).length;
  const critical = analyzed.filter(c => c.debtLevel === 'critical');
  const totalPotentialViews = analyzed.reduce((s, c) => s + c.estimatedRefreshValue, 0);

  // Refresh schedule (next 30 days)
  const refreshSchedule = analyzed
    .filter(c => c.needsRefresh)
    .sort((a, b) => a.daysUntilRefresh - b.daysUntilRefresh)
    .slice(0, 10)
    .map((c, i) => ({
      contentId: c.contentId,
      title: c.title,
      suggestedRefreshDate: new Date(now + i * 3 * 86400000).toISOString().split('T')[0],
      estimatedValue: c.estimatedRefreshValue,
    }));

  return {
    success: true,
    data: {
      totalContent: analyzed.length,
      needsRefreshCount,
      criticalCount: critical.length,
      totalPotentialRecoveryViews: totalPotentialViews,
      averageDebtScore: Math.round(analyzed.reduce((s, c) => s + c.debtScore, 0) / (analyzed.length || 1)),
      refreshSchedule,
      mostStaleContent: analyzed.slice(0, 10),
      byDebtLevel: {
        critical: critical.length,
        high: analyzed.filter(c => c.debtLevel === 'high').length,
        medium: analyzed.filter(c => c.debtLevel === 'medium').length,
        low: analyzed.filter(c => c.debtLevel === 'low').length,
      },
      recommendations: [
        needsRefreshCount > analyzed.length * 0.3
          ? `${needsRefreshCount} pieces need refresh - prioritize top 5`
          : 'Content library is relatively fresh',
        critical.length > 0 ? `${critical.length} critically stale items - refresh immediately` : 'No critical debt items',
        `Total recovery potential: ${Math.round(totalPotentialViews).toLocaleString()} views`,
      ],
    },
    source: 'browser',
    featureId: 'f45',
  };
}

// -------------------- F46: Sponsor Jingle Trauma Score --------------------
interface F46Input {
  content: {
    id: string;
    title: string;
    hasSponsorSegment: boolean;
    sponsorName?: string;
    preSponsorEngagement: { likes: number; comments: number; views: number };
    postSponsorEngagement: { likes: number; comments: number; views: number };
    commentSentiments: { text: string; sentiment: 'positive' | 'negative' | 'neutral'; timestamp: string }[];
    dropOffRate: number; // percentage of viewers who leave during sponsor
    unsubscribeRate: number;
  }[];
}

function f46_sponsorJingleTraumaScore(input: F46Input): FeatureResult {
  const analyzed = input.content.map(content => {
    if (!content.hasSponsorSegment) {
      return {
        contentId: content.id,
        title: content.title,
        sponsorName: 'none',
        traumaScore: 0,
        acceptanceScore: 100,
        hasSponsorSegment: false,
        impact: 'neutral',
      };
    }

    // Engagement delta
    const likeDelta = content.preSponsorEngagement.likes > 0
      ? ((content.postSponsorEngagement.likes - content.preSponsorEngagement.likes) / content.preSponsorEngagement.likes) * 100
      : 0;
    const commentDelta = content.preSponsorEngagement.comments > 0
      ? ((content.postSponsorEngagement.comments - content.preSponsorEngagement.comments) / content.preSponsorEngagement.comments) * 100
      : 0;
    const viewDelta = content.preSponsorEngagement.views > 0
      ? ((content.postSponsorEngagement.views - content.preSponsorEngagement.views) / content.preSponsorEngagement.views) * 100
      : 0;

    // Sentiment shift during sponsor segments
    const sponsorKeywords = content.sponsorName
      ? content.sponsorName.toLowerCase().split(/\s+/)
      : ['sponsor', 'ad', 'promoted', 'paid'];
    const sponsorMentions = content.commentSentiments.filter(c =>
      sponsorKeywords.some(k => c.text.toLowerCase().includes(k))
    );
    const sponsorSentimentScore = sponsorMentions.length > 0
      ? (sponsorMentions.filter(s => s.sentiment === 'positive').length - sponsorMentions.filter(s => s.sentiment === 'negative').length) / sponsorMentions.length * 100
      : 0;

    // Negative comment patterns
    const negativePatterns = /\b(skip|ads|too many|unsubscribe|dislike|annoying|spam|sellout|shill|cringe)\b/i;
    const negativeCommentCount = sponsorMentions.filter(c =>
      negativePatterns.test(c.text)
    ).length;

    // Trauma score (0-100, higher = more negative impact)
    const traumaScore = Math.round(
      Math.min(100, Math.max(0,
        (content.dropOffRate * 0.8) +
        (content.unsubscribeRate * 3) +
        (Math.max(0, -likeDelta) * 0.5) +
        (Math.max(0, -commentDelta) * 0.3) +
        (negativeCommentCount * 5) +
        (Math.max(0, -sponsorSentimentScore) * 0.4)
      ))
    );

    const acceptanceScore = Math.round(100 - traumaScore);
    const impact = traumaScore > 60 ? 'severe' : traumaScore > 35 ? 'moderate' : traumaScore > 15 ? 'mild' : 'minimal';

    return {
      contentId: content.id,
      title: content.title,
      sponsorName: content.sponsorName || 'unknown',
      traumaScore,
      acceptanceScore,
      hasSponsorSegment: true,
      impact,
      engagementDelta: { likes: Math.round(likeDelta), comments: Math.round(commentDelta), views: Math.round(viewDelta) },
      sentimentShift: Math.round(sponsorSentimentScore),
      negativeSponsorComments: negativeCommentCount,
      dropOffRate: content.dropOffRate,
      unsubscribeRate: content.unsubscribeRate,
    };
  });

  const sponsoredContent = analyzed.filter(c => c.hasSponsorSegment);
  const avgTrauma = sponsoredContent.length > 0
    ? Math.round(sponsoredContent.reduce((s, c) => s + c.traumaScore, 0) / sponsoredContent.length)
    : 0;
  const avgAcceptance = 100 - avgTrauma;

  // Worst sponsors
  const sponsorTrauma = sponsoredContent.reduce<Record<string, number[]>>((acc, c) => {
    if (!acc[c.sponsorName]) acc[c.sponsorName] = [];
    acc[c.sponsorName].push(c.traumaScore);
    return acc;
  }, {});
  const rankedSponsors = Object.entries(sponsorTrauma)
    .map(([name, scores]) => ({
      name,
      avgTraumaScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      acceptanceScore: Math.round(100 - scores.reduce((a, b) => a + b, 0) / scores.length),
      occurrences: scores.length,
    }))
    .sort((a, b) => a.acceptanceScore - b.acceptanceScore);

  return {
    success: true,
    data: {
      averageTraumaScore: avgTrauma,
      averageAcceptanceScore: avgAcceptance,
      overallImpact: avgTrauma > 60 ? 'severe' : avgTrauma > 35 ? 'moderate' : avgTrauma > 15 ? 'mild' : 'minimal',
      totalSponsoredContent: sponsoredContent.length,
      rankedSponsors,
      worstContent: sponsoredContent.filter(c => c.impact === 'severe').sort((a, b) => b.traumaScore - a.traumaScore).slice(0, 5),
      allContent: analyzed,
      recommendations: [
        avgTrauma > 50 ? 'High sponsor trauma - reduce frequency or improve integration' : 'Audience is sponsor-tolerant',
        rankedSponsors.length > 0 && rankedSponsors[0].avgTraumaScore > 50
          ? `Most damaging sponsor: ${rankedSponsors[0].name} - consider replacement`
          : 'No particularly damaging sponsors detected',
        'Use seamless product placement over hard transitions for better acceptance',
      ],
    },
    source: 'browser',
    featureId: 'f46',
  };
}

// -------------------- F47: Affiliate Link Placement Optimizer --------------------
interface F47Input {
  contentText: string;
  contentStructure: {
    sections: { type: 'intro' | 'body' | 'comparison' | 'review' | 'conclusion' | 'cta'; text: string; position: number }[];
  };
  affiliateProducts: { name: string; url: string; relevance: number }[];
}

function f47_affiliateLinkPlacementOptimizer(input: F47Input): FeatureResult {
  const { contentText, contentStructure, affiliateProducts } = input;
  const totalWords = contentText.split(/\s+/).length;

  // Analyze each section for link placement opportunities
  const recommendations = contentStructure.sections.map(section => {
    const sectionWords = section.text.split(/\s+/).length;
    const sectionRatio = sectionWords / totalWords;

    // Scoring factors
    let placementScore = 50;

    // CTA sections are natural link positions (+30)
    if (section.type === 'cta') placementScore += 30;
    // Review sections (+25)
    if (section.type === 'review') placementScore += 25;
    // Comparison sections (+20)
    if (section.type === 'comparison') placementScore += 20;
    // Body sections (+10)
    if (section.type === 'body') placementScore += 10;

    // Check for product mentions
    const productMentions = affiliateProducts.filter(p =>
      section.text.toLowerCase().includes(p.name.toLowerCase())
    );
    placementScore += productMentions.length * 15;

    // Check for purchase-intent keywords in section
    const intentWords = /\b(buy|get|order|check out|try|click|link|here|now|today|discount|deal|price|best|top|recommend)\b/gi;
    const intentMatches = section.text.match(intentWords);
    if (intentMatches) placementScore += intentMatches.length * 3;

    // Early sections (intro) should have fewer links (-15)
    if (section.type === 'intro' && productMentions.length === 0) placementScore -= 15;

    // Too many links in one section penalty
    const idealLinksPerSection = sectionRatio * affiliateProducts.length;
    if (productMentions.length > idealLinksPerSection + 1) placementScore -= 10;

    placementScore = Math.min(100, Math.max(0, placementScore));

    // Match products to this section
    const matchedProducts = affiliateProducts
      .map(p => {
        const isMentioned = section.text.toLowerCase().includes(p.name.toLowerCase());
        const relevance = isMentioned ? p.relevance * 1.5 : p.relevance * 0.6;
        return { ...p, isMentioned, adjustedRelevance: Math.min(100, relevance) };
      })
      .filter(p => p.adjustedRelevance > 30)
      .sort((a, b) => b.adjustedRelevance - a.adjustedRelevance);

    return {
      sectionType: section.type,
      position: section.position,
      wordCount: sectionWords,
      placementScore,
      recommended: placementScore >= 60,
      linkCount: matchedProducts.length,
      products: matchedProducts.slice(0, 3),
      ctaIntegration: section.type === 'cta' ? 'natural' : section.type === 'body' ? 'contextual' : 'forced',
    };
  });

  recommendations.sort((a, b) => b.placementScore - a.placementScore);

  const totalRecommended = recommendations.filter(r => r.recommended);
  const bestPositions = recommendations.filter(r => r.recommended).slice(0, 5);

  // Overall optimization score
  const totalPossibleScore = recommendations.length * 100;
  const achievedScore = recommendations.reduce((s, r) => s + r.placementScore, 0);
  const optimizationScore = totalPossibleScore > 0 ? Math.round(achievedScore / totalPossibleScore * 100) : 0;

  // Estimate click-through improvement
  const currentCTR = 2.5; // average affiliate CTR
  const estimatedCTR = currentCTR * (1 + (optimizationScore - 50) / 200);
  const ctrImprovement = Math.round(((estimatedCTR - currentCTR) / currentCTR) * 100);

  return {
    success: true,
    data: {
      totalWords,
      totalSections: contentStructure.sections.length,
      optimizationScore,
      currentEstimatedCTR: currentCTR,
      optimizedEstimatedCTR: Math.round(estimatedCTR * 100) / 100,
      ctrImprovement,
      bestPositions,
      allRecommendations: recommendations,
      totalRecommendedPlacements: totalRecommended.length,
      productsToPlace: affiliateProducts.length,
      recommendations: [
        optimizationScore > 70 ? 'Good placement opportunities detected' : 'Significant placement optimization possible',
        `Estimated CTR improvement: ${ctrImprovement}% with optimized placement`,
        bestPositions.length > 0
          ? `Best section for links: ${bestPositions[0].sectionType} (score: ${bestPositions[0].placementScore})`
          : 'Review content structure for better link integration points',
      ],
    },
    source: 'browser',
    featureId: 'f47',
  };
}

// -------------------- F48: Revenue Leak Detection --------------------
interface F48Input {
  revenueStreams: {
    type: string;
    current: number;
    potential: number;
    isActive: boolean;
    lastOptimized: string;
    metrics: Record<string, number>;
  }[];
  affiliateLinks: { clicks: number; conversions: number; revenue: number; commissionRate: number }[];
  sponsorDeals: { value: number; deliverables: string; frequency: string; competitorAvgRate: number }[];
  contentCount: number;
  avgViewsPerContent: number;
}

function f48_revenueLeakDetection(input: F48Input): FeatureResult {
  const leaks: {
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    estimatedLoss: number;
    recoveryEffort: 'easy' | 'moderate' | 'complex';
    recommendation: string;
  }[] = [];

  // Check for inactive revenue streams
  const inactiveStreams = input.revenueStreams.filter(s => !s.isActive);
  for (const stream of inactiveStreams) {
    const lossEstimate = stream.potential * 0.5;
    leaks.push({
      category: 'abandoned_stream',
      description: `Inactive revenue stream: ${stream.type}`,
      severity: lossEstimate > 50000 ? 'high' : 'medium',
      estimatedLoss: Math.round(lossEstimate),
      recoveryEffort: 'moderate',
      recommendation: `Reactivate ${stream.type} - potential ₦${Math.round(stream.potential).toLocaleString()}/mo`,
    });
  }

  // Check revenue gap (current vs potential) per stream
  for (const stream of input.revenueStreams.filter(s => s.isActive)) {
    const gap = stream.potential - stream.current;
    const gapRatio = stream.potential > 0 ? gap / stream.potential : 0;
    if (gapRatio > 0.4) {
      leaks.push({
        category: 'underperforming_stream',
        description: `${stream.type} at ${Math.round((1 - gapRatio) * 100)}% of potential`,
        severity: gapRatio > 0.7 ? 'high' : 'medium',
        estimatedLoss: Math.round(gap),
        recoveryEffort: 'moderate',
        recommendation: `Optimize ${stream.type} - leaving ₦${Math.round(gap).toLocaleString()} on the table`,
      });
    }
  }

  // Affiliate link conversion analysis
  if (input.affiliateLinks.length > 0) {
    const avgConversionRate = input.affiliateLinks.reduce((s, l) => s + l.conversions / (l.clicks || 1), 0) / input.affiliateLinks.length;
    const avgCommissionRate = input.affiliateLinks.reduce((s, l) => s + l.commissionRate, 0) / input.affiliateLinks.length;

    if (avgConversionRate < 0.03) {
      const missedConversions = Math.round(input.affiliateLinks.reduce((s, l) => s + l.clicks * (0.05 - l.conversions / (l.clicks || 1)), 0));
      leaks.push({
        category: 'low_affiliate_conversion',
        description: `Affiliate conversion rate ${Math.round(avgConversionRate * 100)}% below 5% benchmark`,
        severity: 'medium',
        estimatedLoss: Math.round(missedConversions * avgCommissionRate * 10),
        recoveryEffort: 'moderate',
        recommendation: 'Optimize link placement and CTA to improve affiliate conversions',
      });
    }

    // Commission rate analysis
    const bestCommissionLink = input.affiliateLinks.reduce((best, l) => l.commissionRate > best.commissionRate ? l : best, input.affiliateLinks[0]);
    const worstCommissionLink = input.affiliateLinks.reduce((worst, l) => l.commissionRate < worst.commissionRate ? l : worst, input.affiliateLinks[0]);

    if (worstCommissionLink.commissionRate < bestCommissionLink.commissionRate * 0.5 && worstCommissionLink.clicks > 100) {
      leaks.push({
        category: 'underpriced_affiliate',
        description: `Low commission rate: ${worstCommissionLink.commissionRate}% vs best ${bestCommissionLink.commissionRate}%`,
        severity: 'medium',
        estimatedLoss: Math.round(worstCommissionLink.clicks * (bestCommissionLink.commissionRate - worstCommissionLink.commissionRate) / 100 * 20),
        recoveryEffort: 'easy',
        recommendation: 'Renegotiate or replace low-commission affiliate programs',
      });
    }
  }

  // Sponsor deal analysis
  for (const deal of input.sponsorDeals) {
    if (deal.competitorAvgRate > 0 && deal.value < deal.competitorAvgRate * 0.8) {
      leaks.push({
        category: 'underpriced_sponsor',
        description: `Sponsor deal priced ${Math.round((1 - deal.value / deal.competitorAvgRate) * 100)}% below market`,
        severity: 'high',
        estimatedLoss: Math.round(deal.competitorAvgRate - deal.value),
        recoveryEffort: 'moderate',
        recommendation: `Renegotiate sponsor deal to ₦${Math.round(deal.competitorAvgRate).toLocaleString()} market rate`,
      });
    }
  }

  // Content monetization gap
  const totalContentViews = input.contentCount * input.avgViewsPerContent;
  const estimatedAdRevenue = (totalContentViews / 1000) * 8;
  const hasAdRevenue = input.revenueStreams.some(s => s.type === 'ads');
  if (!hasAdRevenue && totalContentViews > 10000) {
    leaks.push({
      category: 'unoptimized_ad_placement',
      description: `${Math.round(totalContentViews).toLocaleString()} total views without ad monetization`,
      severity: totalContentViews > 100000 ? 'high' : 'medium',
      estimatedLoss: Math.round(estimatedAdRevenue),
      recoveryEffort: 'easy',
      recommendation: `Enable ad monetization - potential ₦${Math.round(estimatedAdRevenue).toLocaleString()}/mo`,
    });
  }

  // Missing revenue streams
  const activeTypes = new Set(input.revenueStreams.filter(s => s.isActive).map(s => s.type));
  const commonStreams = ['ads', 'affiliate', 'sponsorship', 'merch', 'courses', 'tips'];
  const missingStreams = commonStreams.filter(t => !activeTypes.has(t));
  if (missingStreams.length > 0) {
    const estimatedMissingRevenue = missingStreams.length * input.avgViewsPerContent * 0.05;
    leaks.push({
      category: 'missing_revenue_streams',
      description: `${missingStreams.length} common revenue stream(s) not active: ${missingStreams.join(', ')}`,
      severity: missingStreams.length > 2 ? 'medium' : 'low',
      estimatedLoss: Math.round(estimatedMissingRevenue),
      recoveryEffort: 'complex',
      recommendation: `Consider adding: ${missingStreams.slice(0, 3).join(', ')}`,
    });
  }

  // Calculate totals
  const totalEstimatedLoss = leaks.reduce((s, l) => s + l.estimatedLoss, 0);
  const criticalLeaks = leaks.filter(l => l.severity === 'critical' || l.severity === 'high');
  leaks.sort((a, b) => b.estimatedLoss - a.estimatedLoss);

  return {
    success: true,
    data: {
      totalLeaks: leaks.length,
      totalEstimatedLoss: Math.round(totalEstimatedLoss),
      criticalLeakCount: criticalLeaks.length,
      leaks,
      topLeak: leaks[0] || null,
      recoveryPotential: Math.round(totalEstimatedLoss * 0.7),
      byCategory: leaks.reduce<Record<string, number>>((acc, l) => {
        acc[l.category] = (acc[l.category] || 0) + l.estimatedLoss;
        return acc;
      }, {}),
      bySeverity: {
        critical: leaks.filter(l => l.severity === 'critical').length,
        high: leaks.filter(l => l.severity === 'high').length,
        medium: leaks.filter(l => l.severity === 'medium').length,
        low: leaks.filter(l => l.severity === 'low').length,
      },
      recommendations: [
        totalEstimatedLoss > 100000 ? `Major revenue leak detected: ₦${Math.round(totalEstimatedLoss).toLocaleString()}/mo` : 'Revenue leaks are manageable',
        criticalLeaks.length > 0 ? `${criticalLeaks.length} high-priority leaks to address immediately` : 'No critical leaks found',
        leaks[0] ? `Biggest leak: ${leaks[0].description} (₦${Math.round(leaks[0].estimatedLoss).toLocaleString()})` : 'No significant revenue leaks detected',
      ],
    },
    source: 'browser',
    featureId: 'f48',
  };
}

// ============================================================
// EXPORT: bankFeatures object with all F33-F48 functions
// ============================================================
export const bankFeatures = {
  f33_buyingIntentScoring,
  f34_affiliateMatchmaker,
  f35_trendBlueOceanRadar,
  f36_roiForecaster,
  f37_productTrendLab,
  f38_linkHealthMonitor,
  f39_nicheProfitabilityBenchmarking,
  f40_automatedRevenueReporting,
  f41_campaignLifecycleManager,
  f42_socialToLedgerFinancialSync,
  f43_sponsorShadowInventory,
  f44_sponsorshipRateCalculator,
  f45_contentDebtForecaster,
  f46_sponsorJingleTraumaScore,
  f47_affiliateLinkPlacementOptimizer,
  f48_revenueLeakDetection,
};

export type BankFeatures = typeof bankFeatures;
