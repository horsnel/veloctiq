import type { FeatureResult } from '@/types';

// ============================================================
// VELOCTIQ ARENA FEATURES (F49 - F64)
// All functions compute REAL results from input data.
// No mock data. No API calls. Pure browser-side logic.
// ============================================================

// -------------------- F49: Share of Voice Benchmarking --------------------
interface F49Input {
  yourProfile: { followerCount: number; engagementRate: number; contentCount: number; mentionCount: number };
  competitors: {
    name: string;
    followerCount: number;
    engagementRate: number;
    contentCount: number;
    mentionCount: number;
    audienceOverlap: number; // 0-100 percentage
  }[];
  nicheKeywords: string[];
  searchResults: { creator: string; mentionCount: number }[];
}

function f49_shareOfVoiceBenchmarking(input: F49Input): FeatureResult {
  const allProfiles = [
    { name: 'You', followerCount: input.yourProfile.followerCount, engagementRate: input.yourProfile.engagementRate, contentCount: input.yourProfile.contentCount, mentionCount: input.yourProfile.mentionCount },
    ...input.competitors.map(c => ({ name: c.name, followerCount: c.followerCount, engagementRate: c.engagementRate, contentCount: c.contentCount, mentionCount: c.mentionCount })),
  ];

  // Calculate weighted engagement score
  const engagementScores = allProfiles.map(p => ({
    name: p.name,
    weightedEngagement: p.followerCount * (p.engagementRate / 100),
    contentVolumeScore: p.contentCount * Math.log10(p.followerCount + 1) * 10,
    mentionScore: p.mentionCount * 15,
    totalSOVScore: 0,
  }));

  // Calculate total for each metric
  const totalWeightedEngagement = engagementScores.reduce((s, e) => s + e.weightedEngagement, 0);
  const totalContentVolume = engagementScores.reduce((s, e) => s + e.contentVolumeScore, 0);
  const totalMentions = engagementScores.reduce((s, e) => s + e.mentionScore, 0);

  // Share of voice calculation (weighted composite)
  engagementScores.forEach(e => {
    const engagementShare = totalWeightedEngagement > 0 ? e.weightedEngagement / totalWeightedEngagement : 0;
    const contentShare = totalContentVolume > 0 ? e.contentVolumeScore / totalContentVolume : 0;
    const mentionShare = totalMentions > 0 ? e.mentionScore / totalMentions : 0;
    e.totalSOVScore = Math.round((engagementShare * 0.4 + contentShare * 0.3 + mentionShare * 0.3) * 100);
  });

  const totalSOV = engagementScores.reduce((s, e) => s + e.totalSOVScore, 0);
  const sovResults = engagementScores.map(e => ({
    name: e.name,
    shareOfVoice: totalSOV > 0 ? Math.round((e.totalSOVScore / totalSOV) * 100) : 0,
    engagementWeight: e.weightedEngagement,
    contentWeight: e.contentVolumeScore,
    mentionWeight: e.mentionScore,
  }));

  sovResults.sort((a, b) => b.shareOfVoice - a.shareOfVoice);

  const yourSOV = sovResults.find(s => s.name === 'You')?.shareOfVoice || 0;
  const leaderSOV = sovResults[0]?.shareOfVoice || 0;
  const gapToLeader = leaderSOV - yourSOV;

  // Competitive positioning
  const positioning = yourSOV >= 30 ? 'leader' : yourSOV >= 20 ? 'challenger' : yourSOV >= 10 ? 'contender' : 'niche';

  // Search visibility share
  const totalSearchMentions = input.searchResults.reduce((s, r) => s + r.mentionCount, 0);
  const yourSearchMentions = input.searchResults.find(r => r.creator === 'You')?.mentionCount || 0;
  const searchSOV = totalSearchMentions > 0 ? Math.round((yourSearchMentions / totalSearchMentions) * 100) : 0;

  return {
    success: true,
    data: {
      yourShareOfVoice: yourSOV,
      yourRank: sovResults.findIndex(s => s.name === 'You') + 1,
      gapToLeader,
      competitivePosition: positioning,
      searchSOV,
      leader: sovResults[0],
      rankings: sovResults.map((s, i) => ({ rank: i + 1, ...s })),
      metricBreakdown: {
        engagementShare: Math.round((engagementScores.find(e => e.name === 'You')?.weightedEngagement || 0) / totalWeightedEngagement * 100),
        contentShare: Math.round((engagementScores.find(e => e.name === 'You')?.contentVolumeScore || 0) / totalContentVolume * 100),
        mentionShare: Math.round((engagementScores.find(e => e.name === 'You')?.mentionScore || 0) / totalMentions * 100),
      },
      recommendations: [
        positioning === 'leader' ? 'You lead the conversation - defend your position with consistent output' : `Gap to leader: ${gapToLeader}% - increase content volume and engagement`,
        searchSOV < 10 ? 'Low search visibility - optimize content for discovery' : 'Strong search presence - maintain keyword strategy',
        input.competitors.filter(c => c.audienceOverlap > 50).length > 0
          ? 'High audience overlap with competitors - differentiate your content'
          : 'Low overlap - you have a unique audience position',
      ],
    },
    source: 'browser',
    featureId: 'f49',
  };
}

// -------------------- F50: Engagement Velocity Alerts --------------------
interface F50Input {
  engagementHistory: { date: string; likes: number; comments: number; shares: number; views: number }[];
  alertThreshold: number; // percentage change that triggers alert
}

function f50_engagementVelocityAlerts(input: F50Input): FeatureResult {
  const history = input.engagementHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate daily totals
  const dailyTotals = history.map(h => ({
    date: h.date,
    total: h.likes + h.comments * 2 + h.shares * 3,
    views: h.views,
    engagementRate: h.views > 0 ? ((h.likes + h.comments + h.shares) / h.views) * 100 : 0,
  }));

  // Calculate velocity (rate of change) using consecutive differences
  const velocities: { date: string; velocity: number; acceleration: number; totalEngagement: number }[] = [];
  for (let i = 1; i < dailyTotals.length; i++) {
    const change = dailyTotals[i].total - dailyTotals[i - 1].total;
    const prevChange = i >= 2 ? dailyTotals[i - 1].total - dailyTotals[i - 2].total : change;
    const acceleration = change - prevChange;
    velocities.push({
      date: dailyTotals[i].date,
      velocity: change,
      acceleration,
      totalEngagement: dailyTotals[i].total,
    });
  }

  // Moving average of velocity
  const velocityValues = velocities.map(v => v.velocity);
  const maWindow = Math.min(7, velocityValues.length);
  const movingAverage = velocityValues.map((_, i) => {
    if (i < maWindow - 1) return null;
    const slice = velocityValues.slice(i - maWindow + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / maWindow;
  });

  // Standard deviation for anomaly detection
  const avgVelocity = velocityValues.reduce((a, b) => a + b, 0) / (velocityValues.length || 1);
  const stdDev = Math.sqrt(velocityValues.reduce((s, v) => s + Math.pow(v - avgVelocity, 2), 0) / (velocityValues.length || 1));

  // Detect alerts
  const alerts = velocities.map((v, i) => {
    const pctChange = avgVelocity !== 0 ? (v.velocity / Math.abs(avgVelocity)) * 100 : 0;
    const zScore = stdDev > 0 ? (v.velocity - avgVelocity) / stdDev : 0;
    const ma = movingAverage[i];

    let type: 'spike' | 'drop' | 'anomaly' | null = null;
    let severity: 'info' | 'warning' | 'critical' = 'info';
    let message = '';

    if (zScore > 2) {
      type = 'spike';
      severity = zScore > 3 ? 'critical' : 'warning';
      message = `Engagement spike: +${Math.round(v.velocity)} (${Math.round(pctChange)}% above average)`;
    } else if (zScore < -2) {
      type = 'drop';
      severity = zScore < -3 ? 'critical' : 'warning';
      message = `Engagement drop: ${Math.round(v.velocity)} (${Math.round(pctChange)}% below average)`;
    } else if (ma !== null && Math.abs(v.velocity - ma) > input.alertThreshold / 100 * Math.abs(avgVelocity || 1)) {
      type = 'anomaly';
      severity = 'info';
      message = `Velocity anomaly: actual ${Math.round(v.velocity)}, expected ~${Math.round(ma)}`;
    }

    return { ...v, type, severity, message, zScore: Math.round(zScore * 100) / 100, pctChange: Math.round(pctChange) };
  }).filter(a => a.type !== null);

  // Trend analysis
  const recentVelocities = velocityValues.slice(-7);
  const recentTrend = recentVelocities.reduce((s, v) => s + v, 0) / (recentVelocities.length || 1);
  const trendDirection = recentTrend > avgVelocity * 1.1 ? 'accelerating' : recentTrend < avgVelocity * 0.9 ? 'decelerating' : 'stable';

  // Current velocity score (-100 to 100)
  const latestVelocity = velocityValues[velocityValues.length - 1] || 0;
  const velocityScore = Math.round(Math.max(-100, Math.min(100, (latestVelocity / (stdDev || 1)) * 30)));

  return {
    success: true,
    data: {
      currentVelocity: Math.round(latestVelocity),
      velocityScore,
      averageVelocity: Math.round(avgVelocity),
      standardDeviation: Math.round(stdDev),
      trendDirection,
      movingAverage: movingAverage.filter(v => v !== null).map(v => Math.round(v || 0)),
      alerts,
      alertCount: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical'),
      velocityHistory: velocities,
      engagementTrend: dailyTotals.slice(-14),
      recommendations: [
        trendDirection === 'accelerating' ? 'Engagement is growing - capitalize with more content' : trendDirection === 'decelerating' ? 'Engagement declining - analyze content performance' : 'Stable engagement - test new content formats',
        alerts.filter(a => a.severity === 'critical').length > 0 ? 'Critical alerts need attention - review recent content' : 'No critical velocity issues',
        stdDev > avgVelocity * 0.5 ? 'High volatility in engagement - focus on consistency' : 'Engagement is predictable - good for planning',
      ],
    },
    source: 'browser',
    featureId: 'f50',
  };
}

// -------------------- F51: The Hook Library --------------------
interface F51Input {
  topPerformingContent: { title: string; views: number; engagementRate: number; platform: string; niche: string }[];
  platform: string;
  niche: string;
  targetAudience: string;
}

function f51_hookLibrary(input: F51Input): FeatureResult {
  // Hook templates organized by pattern type
  const hookPatterns: {
    type: string;
    templates: string[];
    performanceMultiplier: number;
    bestFor: string[];
  }[] = [
    {
      type: 'question_hook',
      templates: [
        'What if I told you that [surprising claim]?',
        'Why does nobody talk about [topic]?',
        'Have you ever wondered why [relatable problem]?',
        'What happens when you [unexpected action]?',
        'Is [common belief] actually a myth?',
        'Can you guess what happened when I [challenge]?',
        'Why did [unexpected outcome] happen after [action]?',
        'What would you do if [scenario]?',
      ],
      performanceMultiplier: 1.3,
      bestFor: ['youtube', 'instagram', 'tiktok'],
    },
    {
      type: 'statistic_hook',
      templates: [
        '[X]% of people don\'t know this about [topic]',
        'I analyzed [number] videos and found this pattern',
        'The data shows that [counterintuitive finding]',
        '[Number] [unit] later, here are the results',
        'Studies prove that [surprising fact]',
        '[X] out of [Y] creators fail at this one thing',
        'This single metric determines [outcome]',
      ],
      performanceMultiplier: 1.25,
      bestFor: ['youtube', 'linkedin', 'blog'],
    },
    {
      type: 'story_hook',
      templates: [
        'I was [negative state] until I discovered [solution]',
        'Last [timeframe], something changed everything',
        'Nobody believed me when I said [claim]',
        'I made [mistake] and it cost me [consequence]',
        'The moment I realized [insight], everything changed',
        'After [number] failed attempts, I finally [success]',
      ],
      performanceMultiplier: 1.35,
      bestFor: ['youtube', 'instagram', 'podcast'],
    },
    {
      type: 'controversy_hook',
      templates: [
        '[Popular opinion] is completely wrong, and here\'s why',
        'I\'m going to say what everyone\'s thinking about [topic]',
        'The [industry] doesn\'t want you to know this',
        'Stop [common action] if you want [desired outcome]',
        'Why [trend] is actually killing your [goal]',
        'The truth about [popular topic] nobody will tell you',
      ],
      performanceMultiplier: 1.2,
      bestFor: ['youtube', 'twitter', 'tiktok'],
    },
    {
      type: 'listicle_hook',
      templates: [
        '[Number] things I wish I knew before [activity]',
        'Top [number] [items] that will change your [aspect]',
        '[Number] mistakes that are costing you [resource]',
        'The only [number] [tools/tips] you need for [goal]',
        '[Number] secrets of [successful people] in [field]',
      ],
      performanceMultiplier: 1.15,
      bestFor: ['youtube', 'instagram', 'blog'],
    },
    {
      type: 'challenge_hook',
      templates: [
        'I tried [challenge] for [timeframe] - here\'s what happened',
        'Can you [achievement] in [timeframe]? I did.',
        'I bet you can\'t [do this] in [timeframe]',
        '[Challenge]: Day 1 / [total days]',
        'What happens when you [extreme action] for [timeframe]?',
      ],
      performanceMultiplier: 1.4,
      bestFor: ['youtube', 'tiktok', 'instagram'],
    },
    {
      type: 'fear_of_missing_out_hook',
      templates: [
        'You\'re missing out on [benefit] if you\'re not doing this',
        'While everyone\'s focused on [trend], the real opportunity is [untapped]',
        'The window for [opportunity] is closing fast',
        'Early adopters of [trend] are seeing [impressive result]',
        'This [trend/strategy] won\'t work forever - here\'s why to start now',
      ],
      performanceMultiplier: 1.2,
      bestFor: ['youtube', 'twitter', 'linkedin'],
    },
    {
      type: 'comparison_hook',
      templates: [
        '[Option A] vs [Option B] - the results will surprise you',
        'I tested [X] against [Y] for [timeframe]',
        'Why [popular choice] might not be right for you',
        'The real difference between [two options] that nobody mentions',
      ],
      performanceMultiplier: 1.25,
      bestFor: ['youtube', 'blog', 'instagram'],
    },
  ];

  // Analyze top performing content for hook patterns
  const analyzedContent = input.topPerformingContent.map(content => {
    const title = content.title.toLowerCase();
    let bestMatch = 'unknown';
    let matchScore = 0;

    const contentPatterns: { pattern: RegExp; type: string }[] = [
      { pattern: /\?/, type: 'question_hook' },
      { pattern: /\d+%|\d+\s*(percent|million|thousand|videos|posts|creators)/i, type: 'statistic_hook' },
      { pattern: /\b(i|my|story|when i|until i)\b/i, type: 'story_hook' },
      { pattern: /\b(wrong|truth|nobody|stop|killing|myth)\b/i, type: 'controversy_hook' },
      { pattern: /\b\d+\s*(things|tips|ways|mistakes|secrets|steps|rules)/i, type: 'listicle_hook' },
      { pattern: /\b(tried|challenge|day \d+|for \d+)/i, type: 'challenge_hook' },
      { pattern: /\b(missing out|closing|early|window|won'?t work)/i, type: 'fear_of_missing_out_hook' },
      { pattern: /\b(vs|versus|against|compared|difference between)/i, type: 'comparison_hook' },
    ];

    for (const { pattern, type } of contentPatterns) {
      if (pattern.test(title)) {
        bestMatch = type;
        matchScore = content.engagementRate;
        break;
      }
    }

    return { ...content, hookType: bestMatch, matchScore };
  });

  // Rank hook types by platform and niche performance
  const platformFiltered = analyzedContent.filter(c => c.platform === input.platform || input.platform === 'all');
  const nicheFiltered = platformFiltered.filter(c => c.niche === input.niche || input.niche === 'all');

  const hookPerformance = hookPatterns.map(hook => {
    const matchingContent = nicheFiltered.filter(c => c.hookType === hook.type);
    const avgPerformance = matchingContent.length > 0
      ? matchingContent.reduce((s, c) => s + c.engagementRate, 0) / matchingContent.length
      : 0;
    const avgViews = matchingContent.length > 0
      ? matchingContent.reduce((s, c) => s + c.views, 0) / matchingContent.length
      : 0;

    return {
      type: hook.type,
      templates: hook.templates.map(t => t.replace('[niche]', input.niche)),
      performanceMultiplier: avgPerformance > 0 ? hook.performanceMultiplier * (1 + avgPerformance / 20) : hook.performanceMultiplier,
      bestFor: hook.bestFor,
      sampleCount: matchingContent.length,
      avgPerformance: Math.round(avgPerformance * 100) / 100,
      avgViews: Math.round(avgViews),
    };
  });

  hookPerformance.sort((a, b) => b.performanceMultiplier - a.performanceMultiplier);

  return {
    success: true,
    data: {
      hookPatterns: hookPerformance,
      topPerformingHooks: hookPerformance.slice(0, 3),
      analyzedContent: analyzedContent.sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 10),
      recommendations: [
        hookPerformance.length > 0 ? `Best hook type for ${input.niche}: ${hookPerformance[0].type}` : 'Not enough data for hook analysis',
        `Try these templates: ${hookPerformance.slice(0, 2).flatMap(h => h.templates.slice(0, 2)).slice(0, 3).join(' | ')}`,
        'A/B test 2-3 hook types per content piece to find your sweet spot',
      ],
    },
    source: 'browser',
    featureId: 'f51',
  };
}

// -------------------- F52: Ad-Spend Transparency --------------------
interface F52Input {
  competitorProfiles: {
    name: string;
    followerCount: number;
    recentFollowerGrowth: number; // followers gained in last 30 days
    contentFrequency: number; // posts per week
    contentQuality: number; // 0-100
    estimatedReach: number;
    promotedContentRatio: number; // 0-1 ratio of posts that seem promoted
    avgEngagementRate: number;
  }[];
}

function f52_adSpendTransparency(input: F52Input): FeatureResult {
  const estimates = input.competitorProfiles.map(profile => {
    // Organic growth baseline: ~0.5-2% monthly for established accounts
    const organicGrowthBaseline = profile.followerCount * 0.005 + 50;
    const excessGrowth = Math.max(0, profile.recentFollowerGrowth - organicGrowthBaseline);

    // Growth-driven spend estimate
    // Average CPM for social ads: $5-15, assume ₦3,000 per 1000 impressions
    const growthSpendEstimate = excessGrowth * 15; // rough cost per acquired follower

    // Content promotion cost
    // Promoted content costs based on frequency
    const weeklyAdSpend = profile.promotedContentRatio * profile.contentFrequency * 5000;
    const monthlyAdSpend = weeklyAdSpend * 4.3;

    // Reach-based estimate
    // If estimated reach significantly exceeds organic reach
    const organicReach = profile.followerCount * profile.avgEngagementRate / 100 * profile.contentFrequency * 4.3;
    const paidReach = Math.max(0, profile.estimatedReach - organicReach);
    const reachSpendEstimate = paidReach * 0.003; // cost per impression

    // Quality premium (high quality content suggests professional editing/production = higher spend)
    const qualityPremium = 1 + (profile.contentQuality / 200);

    // Combined estimate with ranges
    const lowEstimate = Math.round((growthSpendEstimate + monthlyAdSpend + reachSpendEstimate) * 0.6);
    const midEstimate = Math.round((growthSpendEstimate + monthlyAdSpend + reachSpendEstimate) * qualityPremium);
    const highEstimate = Math.round((growthSpendEstimate + monthlyAdSpend + reachSpendEstimate) * qualityPremium * 1.8);

    // Spend intensity (spend relative to follower count)
    const spendPerFollower = midEstimate / profile.followerCount * 1000;

    return {
      name: profile.name,
      followerCount: profile.followerCount,
      recentFollowerGrowth: profile.recentFollowerGrowth,
      organicGrowthBaseline: Math.round(organicGrowthBaseline),
      excessGrowth: Math.round(excessGrowth),
      promotedContentRatio: Math.round(profile.promotedContentRatio * 100),
      spendEstimates: {
        low: lowEstimate,
        mid: midEstimate,
        high: highEstimate,
        range: `${lowEstimate.toLocaleString()} - ${highEstimate.toLocaleString()}`,
      },
      spendPerFollower: Math.round(spendPerFollower),
      spendIntensity: spendPerFollower > 50 ? 'heavy' : spendPerFollower > 20 ? 'moderate' : 'light',
      confidence: Math.round(50 + (profile.promotedContentRatio * 30) + (excessGrowth / profile.recentFollowerGrowth * 20)),
      breakdown: {
        growthSpend: Math.round(growthSpendEstimate),
        promotionSpend: Math.round(monthlyAdSpend),
        reachSpend: Math.round(reachSpendEstimate),
      },
    };
  });

  estimates.sort((a, b) => b.spendEstimates.mid - a.spendEstimates.mid);

  const totalEstimatedSpend = estimates.reduce((s, e) => s + e.spendEstimates.mid, 0);
  const averageSpend = estimates.length > 0 ? totalEstimatedSpend / estimates.length : 0;
  const heavySpenders = estimates.filter(e => e.spendIntensity === 'heavy');

  return {
    success: true,
    data: {
      totalMarketSpend: Math.round(totalEstimatedSpend),
      averageMonthlySpend: Math.round(averageSpend),
      estimates,
      heavySpenders,
      topSpender: estimates[0],
      spendDistribution: {
        heavy: estimates.filter(e => e.spendIntensity === 'heavy').length,
        moderate: estimates.filter(e => e.spendIntensity === 'moderate').length,
        light: estimates.filter(e => e.spendIntensity === 'light').length,
      },
      recommendations: [
        heavySpenders.length > 0 ? `${heavySpenders.length} competitor(s) spending heavily - expect aggressive growth` : 'No heavy spenders detected - organic competition',
        estimates[0] ? `Highest estimated spend: ${estimates[0].name} (₦${estimates[0].spendEstimates.mid.toLocaleString()}/mo)` : '',
        averageSpend > 100000 ? 'High market spend - significant investment needed to compete' : 'Moderate market spend - competitive positioning is achievable',
      ],
    },
    source: 'browser',
    featureId: 'f52',
  };
}

// -------------------- F53: AI Visibility Toolkit --------------------
interface F53Input {
  contentText: string;
  title: string;
  description: string;
  url: string;
  platform: string;
}

function f53_aiVisibilityToolkit(input: F53Input): FeatureResult {
  const { contentText, title, description } = input;
  const fullText = `${title} ${description} ${contentText}`.toLowerCase();
  const words = contentText.split(/\s+/).filter(w => w.length > 0);
  const sentences = contentText.split(/[.!?]+/).filter(s => s.trim().length > 5);

  let score = 0;
  const checks: { category: string; score: number; maxScore: number; details: string; suggestions: string[] }[] = [];

  // 1. Keyword Clarity (0-15)
  const titleWords = title.split(/\s+/).length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const lexicalDiversity = uniqueWords.size / words.length;
  const keywordScore = Math.round(Math.min(15, lexicalDiversity * 10 + titleWords * 0.5));
  score += keywordScore;
  checks.push({
    category: 'Keyword Clarity',
    score: keywordScore,
    maxScore: 15,
    details: `Lexical diversity: ${(lexicalDiversity * 100).toFixed(1)}%, Title word count: ${titleWords}`,
    suggestions: lexicalDiversity < 0.6 ? ['Reduce repetitive words to improve keyword clarity'] : [],
  });

  // 2. FAQ Pattern Detection (0-20)
  const questionPatterns = /\b(how|what|why|when|where|who|which|can|is|do|does)\b.*\?/gi;
  const faqMatches = fullText.match(questionPatterns) || [];
  const faqScore = Math.min(20, faqMatches.length * 5);
  score += faqScore;
  checks.push({
    category: 'FAQ Patterns',
    score: faqScore,
    maxScore: 20,
    details: `${faqMatches.length} question patterns detected`,
    suggestions: faqMatches.length < 2 ? ['Add 2-3 FAQ-style questions in your content'] : [],
  });

  // 3. Listicle Structure (0-15)
  const listPatterns = /\d+[\.\)]\s|[-•]\s|first|second|third|finally|lastly/gi;
  const listMatches = contentText.match(listPatterns) || [];
  const listScore = Math.min(15, listMatches.length * 2);
  score += listScore;
  checks.push({
    category: 'Listicle Structure',
    score: listScore,
    maxScore: 15,
    details: `${listMatches.length} list/structured elements found`,
    suggestions: listMatches.length < 3 ? ['Use numbered lists and bullet points for better AI parsing'] : [],
  });

  // 4. Semantic Richness (0-15)
  const avgSentenceLength = words.length / (sentences.length || 1);
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 15).length;
  const shortSentences = sentences.filter(s => s.split(/\s+/).length < 8).length;
  const sentenceVariety = 1 - Math.abs(longSentences / (sentences.length || 1) - shortSentences / (sentences.length || 1));
  const semanticScore = Math.round(Math.min(15, sentenceVariety * 10 + Math.min(5, words.length / 100)));
  score += semanticScore;
  checks.push({
    category: 'Semantic Richness',
    score: semanticScore,
    maxScore: 15,
    details: `Avg sentence: ${avgSentenceLength.toFixed(1)} words, Variety score: ${(sentenceVariety * 100).toFixed(0)}%`,
    suggestions: avgSentenceLength > 25 ? ['Shorten sentences for better AI readability'] : avgSentenceLength < 10 ? ['Add more detailed sentences'] : [],
  });

  // 5. Structured Data Readiness (0-15)
  const hasH1 = /^#\s/.test(title);
  const hasHeaders = /^#{1,6}\s/m.test(contentText);
  const hasBold = /\*\*[^*]+\*\*/.test(contentText) || /<strong>/.test(contentText);
  const hasLinks = /https?:\/\//.test(contentText);
  const structuredScore = Math.min(15,
    (hasH1 ? 4 : 0) + (hasHeaders ? 5 : 0) + (hasBold ? 3 : 0) + (hasLinks ? 3 : 0)
  );
  score += structuredScore;
  checks.push({
    category: 'Structured Data',
    score: structuredScore,
    maxScore: 15,
    details: `Headers: ${hasHeaders}, Bold: ${hasBold}, Links: ${hasLinks}`,
    suggestions: !hasHeaders ? ['Add header hierarchy (H1, H2, H3) for AI crawlers'] : !hasBold ? ['Use bold text for key terms'] : [],
  });

  // 6. Answer-Ready Content (0-10)
  const definitivePatterns = /\b(the answer is|simply put|in short|basically|to summarize|the bottom line)\b/gi;
  const summaryPatterns = /\b(in conclusion|overall|to sum up|key takeaway|main point)\b/gi;
  const answerScore = Math.min(10,
    (definitivePatterns.test(fullText) ? 5 : 0) + (summaryPatterns.test(fullText) ? 5 : 0)
  );
  score += answerScore;
  checks.push({
    category: 'Answer-Ready',
    score: answerScore,
    maxScore: 10,
    details: `${definitivePatterns.test(fullText) ? 'Has direct answers' : 'Missing direct answers'}`,
    suggestions: answerScore < 5 ? ['Include direct, concise answers for AI to extract'] : [],
  });

  // 7. Meta Optimization (0-10)
  const titleLength = title.length;
  const descLength = description.length;
  const titleOptimal = titleLength >= 30 && titleLength <= 70;
  const descOptimal = descLength >= 100 && descLength <= 300;
  const metaScore = Math.min(10, (titleOptimal ? 5 : 2) + (descOptimal ? 5 : 2));
  score += metaScore;
  checks.push({
    category: 'Meta Optimization',
    score: metaScore,
    maxScore: 10,
    details: `Title: ${titleLength} chars (${titleOptimal ? 'optimal' : 'suboptimal'}), Desc: ${descLength} chars`,
    suggestions: !titleOptimal ? ['Optimize title to 30-70 characters'] : !descOptimal ? ['Optimize description to 100-300 characters'] : [],
  });

  const totalSuggestions = checks.flatMap(c => c.suggestions);

  return {
    success: true,
    data: {
      overallScore: Math.min(100, score),
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F',
      checks,
      wordCount: words.length,
      sentenceCount: sentences.length,
      suggestions: totalSuggestions,
      topOptimizations: totalSuggestions.slice(0, 5),
      aiSummaryLikelihood: Math.round(score / 100 * 100),
      recommendations: [
        score >= 80 ? 'Content is well-optimized for AI visibility' : score >= 50 ? 'Good foundation - implement suggested optimizations' : 'Significant optimization needed for AI visibility',
        faqMatches.length < 2 ? 'Add FAQ sections - AI search engines prioritize Q&A content' : 'FAQ coverage is strong',
        `${totalSuggestions.length} optimization(s) available to improve AI visibility score`,
      ],
    },
    source: 'browser',
    featureId: 'f53',
  };
}

// -------------------- F54: Content Counter-Strike Logic --------------------
interface F54Input {
  yourContent: { topics: string[]; formats: string[]; postingTimes: string[]; avgPerformance: number };
  competitorContent: {
    creatorName: string;
    topTopics: string[];
    formats: string[];
    postingFrequency: number;
    avgPerformance: number;
    postingTimes: string[];
    recentGrowth: number;
    weaknesses: string[];
  }[];
}

function f54_contentCounterStrikeLogic(input: F54Input): FeatureResult {
  const { yourContent, competitorContent } = input;

  // Identify competitor topic coverage
  const allCompetitorTopics = competitorContent.flatMap(c => c.topTopics);
  const competitorTopicFrequency = allCompetitorTopics.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const highlyContestedTopics = Object.entries(competitorTopicFrequency)
    .filter(([, count]) => count >= 2)
    .map(([topic]) => topic);

  // Topic differentiation opportunities
  const coveredByYou = new Set(yourContent.topics);
  const uncoveredTopics = Object.keys(competitorTopicFrequency).filter(t => !coveredByYou.has(t));
  const uniqueYourTopics = yourContent.topics.filter(t => !competitorTopicFrequency[t]);

  // Format gap analysis
  const allFormats = new Set(competitorContent.flatMap(c => c.formats));
  const yourFormats = new Set(yourContent.formats);
  const formatGaps = [...allFormats].filter(f => !yourFormats.has(f));

  // Timing analysis
  const competitorTimes = competitorContent.flatMap(c => c.postingTimes).map(t => {
    const hour = parseInt(t.split(':')[0], 10) || 0;
    return hour;
  });
  const timeBuckets = competitorTimes.reduce<Record<string, number>>((acc, h) => {
    const slot = h < 6 ? 'early_morning' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night';
    acc[slot] = (acc[slot] || 0) + 1;
    return acc;
  }, {});
  const leastContestedTimeSlot = Object.entries(timeBuckets).sort(([, a], [, b]) => a - b)[0];

  // Counter-strike recommendations
  const strategies: {
    type: string;
    title: string;
    description: string;
    potentialImpact: number;
    effort: 'low' | 'medium' | 'high';
    rationale: string;
  }[] = [];

  // Topic differentiation
  if (uncoveredTopics.length > 0) {
    strategies.push({
      type: 'topic_differentiation',
      title: `Cover Untapped Topics: ${uncoveredTopics.slice(0, 3).join(', ')}`,
      description: `Competitors are producing content on ${uncoveredTopics.slice(0, 3).join(', ')} but you have no coverage. Early content here will capture search intent.`,
      potentialImpact: Math.round(uncoveredTopics.length * 15),
      effort: 'medium',
      rationale: `${uncoveredTopics.length} topics with 0 competition from you`,
    });
  }

  // Avoid contested topics
  if (highlyContestedTopics.length > 0) {
    strategies.push({
      type: 'avoid_saturation',
      title: `Reduce Output on: ${highlyContestedTopics.slice(0, 3).join(', ')}`,
      description: `These topics are covered by ${Math.max(...highlyContestedTopics.map(t => competitorTopicFrequency[t]))}+ competitors. Differentiate or deprioritize.`,
      potentialImpact: Math.round(highlyContestedTopics.length * 10),
      effort: 'low',
      rationale: `Saturated market with ${highlyContestedTopics.length} contested topics`,
    });
  }

  // Format advantage
  if (formatGaps.length > 0) {
    strategies.push({
      type: 'format_expansion',
      title: `Adopt New Formats: ${formatGaps.join(', ')}`,
      description: `Competitors are using ${formatGaps.join(', ')} formats that you haven't explored. First-mover advantage possible.`,
      potentialImpact: Math.round(formatGaps.length * 20),
      effort: 'medium',
      rationale: `${formatGaps.length} format gaps in your content strategy`,
    });
  }

  // Timing advantage
  if (leastContestedTimeSlot) {
    strategies.push({
      type: 'timing_advantage',
      title: `Post During: ${leastContestedTimeSlot[0].replace('_', ' ')}`,
      description: `Competitors are least active during ${leastContestedTimeSlot[0].replace('_', ' ')}. Posting then reduces noise competition.`,
      potentialImpact: 15,
      effort: 'low',
      rationale: `${leastContestedTimeSlot[1]} competitors posting at this time vs ${Math.max(...Object.values(timeBuckets))} at peak`,
    });
  }

  // Exploit weaknesses
  for (const comp of competitorContent) {
    if (comp.weaknesses.length > 0 && comp.avgPerformance < yourContent.avgPerformance) {
      strategies.push({
        type: 'exploit_weakness',
        title: `Exploit ${comp.creatorName}'s Weaknesses`,
        description: `${comp.creatorName} shows weaknesses in: ${comp.weaknesses.join(', ')}. Create superior content in these areas.`,
        potentialImpact: Math.round(25 - comp.avgPerformance / 5),
        effort: 'medium',
        rationale: `${comp.creatorName}'s avg performance (${comp.avgPerformance}) is below yours`,
      });
    }
  }

  // Double down on unique strengths
  if (uniqueYourTopics.length > 0) {
    strategies.push({
      type: 'double_down',
      title: `Amplify Unique Content: ${uniqueYourTopics.join(', ')}`,
      description: `No competitors are covering ${uniqueYourTopics.join(', ')}. You own this niche - double down.`,
      potentialImpact: Math.round(uniqueYourTopics.length * 25),
      effort: 'low',
      rationale: `${uniqueYourTopics.length} topics where you have zero competition`,
    });
  }

  strategies.sort((a, b) => b.potentialImpact - a.potentialImpact);

  return {
    success: true,
    data: {
      totalStrategies: strategies.length,
      highImpactStrategies: strategies.filter(s => s.potentialImpact >= 20),
      strategies,
      topicAnalysis: {
        contestedTopics: highlyContestedTopics,
        uncoveredOpportunities: uncoveredTopics,
        yourUniqueTopics: uniqueYourTopics,
      },
      formatAnalysis: {
        formatGaps,
        yourFormats: [...yourFormats],
        competitorFormats: [...allFormats],
      },
      timingAnalysis: {
        timeSlots: timeBuckets,
        leastContestedSlot: leastContestedTimeSlot?.[0] || 'unknown',
      },
      recommendations: [
        strategies.length > 0 ? `Top strategy: ${strategies[0].title} (${strategies[0].potentialImpact}% impact)` : 'Already well-positioned',
        formatGaps.length > 0 ? `${formatGaps.length} format gaps - try ${formatGaps[0]}` : 'Format coverage is comprehensive',
        `Total potential impact from all strategies: ${Math.round(strategies.reduce((s, st) => s + st.potentialImpact, 0))}%`,
      ],
    },
    source: 'browser',
    featureId: 'f54',
  };
}

// -------------------- F55: Follower Migration Tracker --------------------
interface F55Input {
  yourFollowers: string[];
  competitorFollowers: { creatorName: string; followers: string[] }[];
  yourEngagedUsers: string[];
  recentUnfollows: { username: string; date: string }[];
  contentPreferences: Record<string, { topics: string[]; lastActive: string }[]>;
}

function f55_followerMigrationTracker(input: F55Input): FeatureResult {
  const engagedSet = new Set(input.yourEngagedUsers);

  // Track username overlap between you and competitors
  const overlaps = input.competitorFollowers.map(comp => {
    const compSet = new Set(comp.followers);
    const overlapping = input.yourFollowers.filter(f => compSet.has(f));
    const overlapRate = input.yourFollowers.length > 0 ? overlapping.length / input.yourFollowers.length : 0;

    // Check if overlapping users are also engaged with you
    const engagedOverlap = overlapping.filter(f => engagedSet.has(f));

    // Check for migration patterns: unfollowed you but follow competitor
    const unfollowSet = new Set(input.recentUnfollows.map(u => u.username));
    const migratedToCompetitor = overlapping.filter(f => unfollowSet.has(f));

    const mRate = overlapping.length > 0 ? Math.round(migratedToCompetitor.length / overlapping.length * 100) : 0;
    return {
      competitor: comp.creatorName,
      totalOverlap: overlapping.length,
      overlapRate: Math.round(overlapRate * 100) / 100,
      engagedOverlap: engagedOverlap.length,
      migratedCount: migratedToCompetitor.length,
      migrationRate: mRate,
      riskLevel: mRate > 20 ? 'high' : mRate > 10 ? 'medium' : 'low' as const,
    };
  });

  overlaps.sort((a, b) => b.migratedCount - a.migratedCount);

  // Analyze content preference shifts for migrated users
  const migratedUsers = overlaps.flatMap(o => o.migratedCount > 0 ? input.recentUnfollows.filter(_u => overlaps.some(o2 => o2.migratedCount > 0)).map(_u => _u.username) : []);
  void migratedUsers;

  // Time-based migration analysis
  const migrationByMonth = input.recentUnfollows.reduce<Record<string, number>>((acc, u) => {
    const month = u.date.substring(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const migrationTrend = Object.entries(migrationByMonth).sort(([a], [b]) => a.localeCompare(b));
  const recentMonthCount = migrationTrend.length > 0 ? migrationTrend[migrationTrend.length - 1][1] : 0;
  const previousMonthCount = migrationTrend.length > 1 ? migrationTrend[migrationTrend.length - 2][1] : recentMonthCount;
  const migrationAcceleration = previousMonthCount > 0 ? ((recentMonthCount - previousMonthCount) / previousMonthCount) * 100 : 0;

  const totalOverlap = overlaps.reduce((s, o) => s + o.totalOverlap, 0);
  const totalMigrated = overlaps.reduce((s, o) => s + o.migratedCount, 0);
  const highRiskCompetitors = overlaps.filter(o => o.riskLevel === 'high');

  return {
    success: true,
    data: {
      totalAnalyzedFollowers: input.yourFollowers.length,
      totalCompetitorOverlaps: totalOverlap,
      totalMigrated: totalMigrated,
      migrationRate: input.yourFollowers.length > 0 ? Math.round(totalMigrated / input.yourFollowers.length * 100) : 0,
      migrationAcceleration: Math.round(migrationAcceleration),
      migrationTrend: migrationTrend,
      competitorOverlaps: overlaps,
      highRiskCompetitors,
      mostAtRisk: overlaps[0] || null,
      recommendations: [
        totalMigrated > input.yourFollowers.length * 0.05 ? 'Significant migration detected - audit your content strategy' : 'Migration is within normal range',
        highRiskCompetitors.length > 0 ? `${highRiskCompetitors.length} high-risk competitors attracting your followers` : 'No high-risk migration patterns',
        overlaps[0] ? `Biggest threat: ${overlaps[0].competitor} with ${overlaps[0].migratedCount} migrated followers` : 'No active migration threats',
      ],
    },
    source: 'browser',
    featureId: 'f55',
  };
}

// -------------------- F56: Cross-Niche Rivalry Map --------------------
interface F56Input {
  yourNiches: string[];
  competitors: {
    name: string;
    primaryNiche: string;
    secondaryNiches: string[];
    followerCount: number;
    engagementRate: number;
    contentOverlap: number; // 0-100 similarity to your content
    audienceInterests: string[];
  }[];
}

function f56_crossNicheRivalryMap(input: F56Input): FeatureResult {
  const { yourNiches } = input;
  const yourNicheSet = new Set(yourNiches);

  // Map each competitor's niche relationship
  const rivalryMap = input.competitors.map(comp => {
    const compNicheSet = new Set([comp.primaryNiche, ...comp.secondaryNiches]);

    // Direct niche overlap (primary matches your niches)
    const directOverlap = [...compNicheSet].filter(n => yourNicheSet.has(n));
    const adjacencyOverlap = [...compNicheSet].filter(n =>
      !yourNicheSet.has(n) && [...yourNicheSet].some(yn =>
        yn.includes(n.split(' ')[0]) || n.includes(yn.split(' ')[0])
      )
    );

    // Niche distance score (0 = identical, 100 = completely unrelated)
    const sharedNiches = [...yourNicheSet].filter(n => compNicheSet.has(n)).length;
    const totalUniqueNiches = new Set([...yourNicheSet, ...compNicheSet]).size;
    const nicheDistance = totalUniqueNiches > 0
      ? Math.round((1 - sharedNiches / totalUniqueNiches) * 100)
      : 100;

    // Audience interest overlap
    const interestOverlap = comp.audienceInterests.filter(i =>
      yourNiches.some(n => i.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(i.toLowerCase()))
    ).length;

    // Competition intensity score
    const intensityScore = Math.round(
      (sharedNiches * 25) +
      (adjacencyOverlap.length * 10) +
      (comp.contentOverlap * 0.2) +
      (interestOverlap * 5) +
      (comp.followerCount > 0 ? Math.min(20, comp.followerCount / 10000) : 0) +
      (comp.engagementRate > 0 ? Math.min(20, comp.engagementRate * 2) : 0)
    );

    // Threat classification
    const threatLevel = intensityScore > 70 ? 'direct' : intensityScore > 40 ? 'cross_niche' : intensityScore > 20 ? 'emerging' : 'none';

    return {
      competitor: comp.name,
      primaryNiche: comp.primaryNiche,
      secondaryNiches: comp.secondaryNiches,
      directOverlap,
      adjacentNiches: adjacencyOverlap,
      nicheDistance,
      contentOverlap: comp.contentOverlap,
      interestOverlap: interestOverlap,
      intensityScore: Math.min(100, intensityScore),
      threatLevel,
      opportunityScore: nicheDistance > 40 && comp.contentOverlap < 30 ? Math.round(nicheDistance * 0.5) : 0,
    };
  });

  rivalryMap.sort((a, b) => b.intensityScore - a.intensityScore);

  // Cross-niche opportunities
  const allCompNiches = input.competitors.flatMap(c => [c.primaryNiche, ...c.secondaryNiches]);
  const compNicheFreq = allCompNiches.reduce<Record<string, number>>((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {});
  const untappedNiches = Object.keys(compNicheFreq).filter(n => !yourNicheSet.has(n) && compNicheFreq[n] >= 2);

  const directRivals = rivalryMap.filter(r => r.threatLevel === 'direct');
  const crossNicheRivals = rivalryMap.filter(r => r.threatLevel === 'cross_niche');
  const opportunities = rivalryMap.filter(r => r.opportunityScore > 0).sort((a, b) => b.opportunityScore - a.opportunityScore);

  return {
    success: true,
    data: {
      rivalryMap,
      directRivals,
      crossNicheRivals,
      untappedNiches,
      expansionOpportunities: opportunities.slice(0, 5),
      yourNiches,
      threatSummary: {
        direct: directRivals.length,
        crossNiche: crossNicheRivals.length,
        emerging: rivalryMap.filter(r => r.threatLevel === 'emerging').length,
        none: rivalryMap.filter(r => r.threatLevel === 'none').length,
      },
      recommendations: [
        directRivals.length > 2 ? `${directRivals.length} direct rivals in your niche - focus on differentiation` : 'Minimal direct competition in your niche',
        untappedNiches.length > 0 ? `Cross-niche expansion: ${untappedNiches.slice(0, 3).join(', ')}` : 'All competitor niches are already covered',
        opportunities.length > 0 ? `Low competition opportunity: expand into areas near ${opportunities[0].competitor}'s niche` : 'No obvious expansion opportunities',
      ],
    },
    source: 'browser',
    featureId: 'f56',
  };
}

// -------------------- F57: Historical Growth Auditing --------------------
interface F57Input {
  followerHistory: { date: string; count: number }[];
  contentHistory: { date: string; views: number; type: string }[];
  milestones: { date: string; event: string }[];
}

function f57_historicalGrowthAuditing(input: F57Input): FeatureResult {
  const followerData = input.followerHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate daily growth rates
  const growthRates: { date: string; rate: number; delta: number }[] = [];
  for (let i = 1; i < followerData.length; i++) {
    const prev = followerData[i - 1].count;
    const curr = followerData[i].count;
    const delta = curr - prev;
    const rate = prev > 0 ? (delta / prev) * 100 : 0;
    growthRates.push({ date: followerData[i].date, rate, delta });
  }

  // Detect inflection points (significant changes in growth rate)
  const avgGrowthRate = growthRates.reduce((s, g) => s + g.rate, 0) / (growthRates.length || 1);
  const stdDev = Math.sqrt(growthRates.reduce((s, g) => s + Math.pow(g.rate - avgGrowthRate, 2), 0) / (growthRates.length || 1));

  const inflectionPoints = growthRates
    .filter(g => Math.abs(g.rate - avgGrowthRate) > stdDev * 1.5)
    .map(g => ({
      date: g.date,
      growthRate: Math.round(g.rate * 100) / 100,
      type: g.rate > avgGrowthRate ? 'acceleration' : 'deceleration',
      magnitude: Math.abs(Math.round(g.rate - avgGrowthRate)),
      possibleCause: input.milestones.find(m =>
        Math.abs(new Date(m.date).getTime() - new Date(g.date).getTime()) < 7 * 86400000
      )?.event || 'Unknown (possibly algorithm change or viral content)',
    }));

  // Seasonal patterns
  const monthlyGrowth = growthRates.reduce<Record<string, { rates: number[]; total: number }>>((acc, g) => {
    const month = g.date.substring(0, 7);
    if (!acc[month]) acc[month] = { rates: [], total: 0 };
    acc[month].rates.push(g.rate);
    acc[month].total += g.delta;
    return acc;
  }, {});
  const seasonalPattern = Object.entries(monthlyGrowth).map(([month, data]) => ({
    month,
    avgGrowthRate: Math.round(data.rates.reduce((a, b) => a + b, 0) / data.rates.length * 100) / 100,
    totalNewFollowers: data.total,
    bestMonth: data.rates.every(r => r > avgGrowthRate),
    worstMonth: data.rates.every(r => r < avgGrowthRate),
  })).sort((a, b) => b.totalNewFollowers - a.totalNewFollowers);

  // Algorithm impact periods
  const algorithmPeriods = inflectionPoints
    .filter(ip => ip.possibleCause === 'Unknown (possibly algorithm change or viral content)' && ip.type === 'deceleration')
    .map(ip => ({ date: ip.date, impact: ip.magnitude }));

  // Content performance correlation
  const contentByMonth = input.contentHistory.reduce<Record<string, { count: number; totalViews: number }>>((acc, c) => {
    const month = c.date.substring(0, 7);
    if (!acc[month]) acc[month] = { count: 0, totalViews: 0 };
    acc[month].count++;
    acc[month].totalViews += c.views;
    return acc;
  }, {});

  const growthPerformanceCorrelation = seasonalPattern.map(sp => {
    const content = contentByMonth[sp.month];
    return {
      month: sp.month,
      followerGrowth: sp.totalNewFollowers,
      contentCount: content?.count || 0,
      totalViews: content?.totalViews || 0,
      viewsPerFollowerGained: sp.totalNewFollowers > 0 ? (content?.totalViews || 0) / sp.totalNewFollowers : 0,
    };
  });

  // Growth stages
  const totalGrowth = followerData.length > 1
    ? followerData[followerData.length - 1].count - followerData[0].count
    : 0;
  const overallGrowthRate = followerData[0].count > 0
    ? (totalGrowth / followerData[0].count) * 100
    : 0;

  const growthStage = overallGrowthRate > 500 ? 'hypergrowth' : overallGrowthRate > 100 ? 'rapid' : overallGrowthRate > 30 ? 'steady' : overallGrowthRate > 0 ? 'slow' : 'stagnant';

  return {
    success: true,
    data: {
      overallGrowthRate: Math.round(overallGrowthRate * 100) / 100,
      totalNewFollowers: totalGrowth,
      growthStage,
      avgDailyGrowthRate: Math.round(avgGrowthRate * 100) / 100,
      growthStdDev: Math.round(stdDev * 100) / 100,
      inflectionPoints,
      seasonalPattern,
      algorithmImpactPeriods: algorithmPeriods,
      growthPerformanceCorrelation,
      growthVolatility: stdDev > avgGrowthRate * 0.5 ? 'high' : stdDev > avgGrowthRate * 0.2 ? 'medium' : 'low',
      recommendations: [
        inflectionPoints.filter(ip => ip.type === 'acceleration').length > 0
          ? `Key growth accelerators found at: ${inflectionPoints.filter(ip => ip.type === 'acceleration').slice(0, 3).map(ip => ip.date).join(', ')}`
          : 'No strong acceleration periods detected',
        seasonalPattern.length > 0 ? `Peak growth month: ${seasonalPattern[0].month}` : 'Insufficient data for seasonal analysis',
        stdDev > avgGrowthRate * 0.5 ? 'Growth is volatile - focus on consistent content output' : 'Growth is stable - maintain current strategy',
      ],
    },
    source: 'browser',
    featureId: 'f57',
  };
}

// -------------------- F58: Multi-Modal Vision Scout --------------------
interface F58Input {
  contentItems: {
    id: string;
    platform: string;
    type: 'image' | 'video' | 'carousel' | 'story';
    title: string;
    description: string;
    colorPalette: string[]; // hex colors
    hasTextOverlay: boolean;
    hasFace: boolean;
    composition: 'centered' | 'rule_of_thirds' | 'minimal' | 'crowded';
    views: number;
    engagementRate: number;
  }[];
}

function f58_multiModalVisionScout(input: F58Input): FeatureResult {
  const analyzed = input.contentItems.map(item => {
    // Color analysis
    const warmColors = item.colorPalette.filter(c => {
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      return r > g && r > 150;
    }).length;
    const coolColors = item.colorPalette.filter(c => {
      const b = parseInt(c.slice(5, 7), 16);
      const r = parseInt(c.slice(1, 3), 16);
      return b > r && b > 150;
    }).length;
    const highContrast = item.colorPalette.length >= 2 &&
      (() => {
        const brightnesses = item.colorPalette.map(c => {
          const r = parseInt(c.slice(1, 3), 16);
          const g = parseInt(c.slice(3, 5), 16);
          const b = parseInt(c.slice(5, 7), 16);
          return (r * 299 + g * 587 + b * 114) / 1000;
        });
        const max = Math.max(...brightnesses);
        const min = Math.min(...brightnesses);
        return (max - min) / (max || 1) > 0.5;
      })();

    // Text overlay density
    const wordCount = item.description.split(/\s+/).length;
    const textDensity = item.hasTextOverlay ? Math.min(1, wordCount / 50) : 0;

    // Composition scoring
    const compositionScores: Record<string, number> = {
      centered: 0.6,
      rule_of_thirds: 0.85,
      minimal: 0.7,
      crowded: 0.4,
    };

    // Combined visual score
    const visualScore = Math.round(
      (compositionScores[item.composition] || 0.5) * 30 +
      (item.hasFace ? 20 : 10) +
      (highContrast ? 20 : 10) +
      (warmColors > coolColors ? 15 : 10) +
      (item.hasTextOverlay ? (1 - textDensity) * 15 : 8)
    );

    // Platform trend alignment
    const platformTrends: Record<string, { best: string; good: string[] }> = {
      youtube: { best: 'face', good: ['high_contrast', 'text_overlay'] },
      instagram: { best: 'colorful', good: ['face', 'minimal', 'carousel'] },
      tiktok: { best: 'face', good: ['bold_colors', 'text_overlay'] },
      linkedin: { best: 'minimal', good: ['professional', 'centered'] },
      twitter: { best: 'text_overlay', good: ['high_contrast'] },
    };
    const _trend = platformTrends[item.platform] || { best: 'face', good: ['high_contrast'] };
    void _trend;
    const trendAlignment = visualScore > 60 ? 'aligned' : visualScore > 40 ? 'partial' : 'misaligned';

    return {
      contentId: item.id,
      platform: item.platform,
      type: item.type,
      visualScore,
      trendAlignment,
      composition: item.composition,
      compositionScore: Math.round((compositionScores[item.composition] || 0.5) * 100),
      hasFace: item.hasFace,
      hasTextOverlay: item.hasTextOverlay,
      textDensity: Math.round(textDensity * 100),
      warmColors,
      coolColors,
      highContrast,
      colorCount: item.colorPalette.length,
      performance: {
        views: item.views,
        engagementRate: item.engagementRate,
        viewPerformance: item.views > 0 ? Math.round(item.engagementRate * 10) / 10 : 0,
      },
    };
  });

  analyzed.sort((a, b) => b.visualScore - a.visualScore);

  // Aggregate stats
  const avgVisualScore = analyzed.length > 0 ? Math.round(analyzed.reduce((s, a) => s + a.visualScore, 0) / analyzed.length) : 0;
  const faceContent = analyzed.filter(a => a.hasFace);
  const faceContentAvgPerf = faceContent.length > 0 ? faceContent.reduce((s, a) => s + a.performance.engagementRate, 0) / faceContent.length : 0;
  const noFaceContent = analyzed.filter(a => !a.hasFace);
  const noFaceContentAvgPerf = noFaceContent.length > 0 ? noFaceContent.reduce((s, a) => s + a.performance.engagementRate, 0) / noFaceContent.length : 0;

  const contrastContent = analyzed.filter(a => a.highContrast);
  const contrastAvgPerf = contrastContent.length > 0 ? contrastContent.reduce((s, a) => s + a.performance.engagementRate, 0) / contrastContent.length : 0;

  // Best performing visual patterns
  const byComposition = analyzed.reduce<Record<string, { score: number; perf: number; count: number }>>((acc, a) => {
    if (!acc[a.composition]) acc[a.composition] = { score: 0, perf: 0, count: 0 };
    acc[a.composition].score += a.visualScore;
    acc[a.composition].perf += a.performance.engagementRate;
    acc[a.composition].count++;
    return acc;
  }, {});
  const bestComposition = Object.entries(byComposition)
    .map(([type, data]) => ({ type, avgScore: Math.round(data.score / data.count), avgPerf: Math.round(data.perf / data.count * 10) / 10, count: data.count }))
    .sort((a, b) => b.avgPerf - a.avgPerf);

  return {
    success: true,
    data: {
      averageVisualScore: avgVisualScore,
      totalAnalyzed: analyzed.length,
      analyzedContent: analyzed,
      patternAnalysis: {
        faceImpact: { faceContent: faceContent.length, avgPerf: Math.round(faceContentAvgPerf * 10) / 10, vsNoFace: Math.round((faceContentAvgPerf - noFaceContentAvgPerf) * 10) / 10 },
        contrastImpact: { highContrast: contrastContent.length, avgPerf: Math.round(contrastAvgPerf * 10) / 10 },
        bestComposition,
      },
      trendAlignment: {
        aligned: analyzed.filter(a => a.trendAlignment === 'aligned').length,
        partial: analyzed.filter(a => a.trendAlignment === 'partial').length,
        misaligned: analyzed.filter(a => a.trendAlignment === 'misaligned').length,
      },
      recommendations: [
        faceContentAvgPerf > noFaceContentAvgPerf ? 'Face content performs better - include faces in more content' : 'Non-face content outperforms - diversify visual strategy',
        bestComposition[0] ? `Best composition: ${bestComposition[0].type} (${bestComposition[0].avgPerf}% avg engagement)` : 'Insufficient data for composition analysis',
        avgVisualScore < 50 ? 'Visual quality needs improvement - focus on composition and contrast' : 'Visual quality is strong - maintain standards',
      ],
    },
    source: 'browser',
    featureId: 'f58',
  };
}

// -------------------- F59: Dead Creator Inheritance Protocol (Liminal) --------------------
interface F59Input {
  inactiveCreators: {
    name: string;
    lastPostDate: string;
    followerCount: number;
    niche: string;
    contentStyle: string;
    lastEngagementRate: number;
    platform: string;
  }[];
  yourProfile: { niche: string; followerCount: number; contentStyle: string; platform: string };
}

function f59_deadCreatorInheritanceProtocol(input: F59Input): FeatureResult {
  const now = Date.now();
  const dayMs = 86400000;

  const opportunities = input.inactiveCreators.map(creator => {
    const daysInactive = Math.floor((now - new Date(creator.lastPostDate).getTime()) / dayMs);

    // Audience orphaning assessment
    // After 30 days: 30% of audience starts looking elsewhere
    // After 90 days: 60% actively seeking alternatives
    // After 180 days: 80% have moved on
    const orphaningRate = Math.min(95,
      daysInactive < 30 ? daysInactive * 1 :
      daysInactive < 90 ? 30 + (daysInactive - 30) * 1 :
      daysInactive < 180 ? 60 + (daysInactive - 90) * 0.33 :
      80 + (daysInactive - 180) * 0.05
    );

    const orphanedAudienceSize = Math.round(creator.followerCount * orphaningRate / 100);

    // Compatibility scoring
    const nicheMatch = creator.niche.toLowerCase() === input.yourProfile.niche.toLowerCase() ? 100 :
      creator.niche.toLowerCase().includes(input.yourProfile.niche.toLowerCase()) ||
      input.yourProfile.niche.toLowerCase().includes(creator.niche.toLowerCase()) ? 60 : 20;

    const styleMatch = creator.contentStyle.toLowerCase() === input.yourProfile.contentStyle.toLowerCase() ? 100 : 40;
    const platformMatch = creator.platform === input.yourProfile.platform ? 100 : 30;
    const sizeCompatibility = Math.max(10, 100 - Math.abs(Math.log10(creator.followerCount) - Math.log10(input.yourProfile.followerCount)) * 30);

    // Inheritance potential score
    const inheritanceScore = Math.round(
      (nicheMatch * 0.35) +
      (styleMatch * 0.25) +
      (platformMatch * 0.2) +
      (sizeCompatibility * 0.1) +
      (orphaningRate * 0.1)
    );

    // Estimated capturable audience (based on compatibility and timing)
    const captureRate = (inheritanceScore / 100) * (orphaningRate / 100) * 0.15; // max 15% of orphaned audience
    const estimatedGain = Math.round(creator.followerCount * captureRate);

    // Risk: bigger creators = more competition for inheritance
    const inheritanceCompetition = Math.max(1, creator.followerCount / 50000);
    const riskLevel = inheritanceCompetition > 5 ? 'high' : inheritanceCompetition > 2 ? 'medium' : 'low';

    return {
      creatorName: creator.name,
      daysInactive,
      originalFollowerCount: creator.followerCount,
      nicheMatch: Math.round(nicheMatch),
      styleMatch: Math.round(styleMatch),
      platformMatch: Math.round(platformMatch),
      orphaningRate: Math.round(orphaningRate),
      orphanedAudienceSize,
      inheritanceScore: Math.min(100, inheritanceScore),
      estimatedGain,
      captureRate: Math.round(captureRate * 100) / 100,
      riskLevel,
      strategy: daysInactive < 60 ? 'mention_and_engage' : daysInactive < 120 ? 'content_pivot' : 'direct_outreach',
    };
  });

  opportunities.sort((a, b) => b.inheritanceScore - a.inheritanceScore);

  const totalPotentialGain = opportunities.reduce((s, o) => s + o.estimatedGain, 0);
  const highOpportunities = opportunities.filter(o => o.inheritanceScore >= 60);

  return {
    success: true,
    data: {
      totalInactiveCreators: input.inactiveCreators.length,
      totalOrphanedAudience: Math.round(opportunities.reduce((s, o) => s + o.orphanedAudienceSize, 0)),
      totalPotentialGain,
      opportunities: opportunities.slice(0, 15),
      highOpportunities: highOpportunities.slice(0, 5),
      bestOpportunity: opportunities[0],
      recommendations: [
        highOpportunities.length > 0 ? `${highOpportunities.length} high-value inheritance opportunities available` : 'No strong inheritance matches found',
        opportunities[0] ? `Top opportunity: ${opportunities[0].creatorName} (${opportunities[0].estimatedGain} potential followers)` : '',
        totalPotentialGain > 1000 ? `Combined potential: ${totalPotentialGain.toLocaleString()} followers` : 'Inheritance potential is limited',
      ],
    },
    source: 'browser',
    featureId: 'f59',
  };
}

// -------------------- F60: The Uncanny Valley of You (Liminal) --------------------
interface F60Input {
  currentContent: { title: string; type: string; topics: string[]; engagementRate: number; date: string }[];
  historicalContent: { title: string; type: string; topics: string[]; engagementRate: number; date: string }[];
  contentProfile: { usualTone: string; usualLength: number; usualFormats: string[] };
  audienceFeedback: { text: string; sentiment: number; date: string }[];
}

function f60_uncannyValleyOfYou(input: F60Input): FeatureResult {
  const { currentContent, historicalContent, contentProfile, audienceFeedback } = input;

  // Compare current vs historical patterns
  const historicalTopics = historicalContent.flatMap(c => c.topics);
  const currentTopics = currentContent.flatMap(c => c.topics);

  const historicalTopicFreq = historicalTopics.reduce<Record<string, number>>((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const currentTopicFreq = currentTopics.reduce<Record<string, number>>((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});

  // Topic staleness score
  const allTopics = [...new Set([...historicalTopics, ...currentTopics])];
  const topicStaleness = allTopics.map(topic => {
    const histCount = historicalTopicFreq[topic] || 0;
    const currCount = currentTopicFreq[topic] || 0;
    const total = histCount + currCount;
    const saturation = total / (historicalContent.length + currentContent.length);
    const isOverused = saturation > 0.3 && currCount >= histCount * 0.8;
    return { topic, saturation: Math.round(saturation * 100), isOverused, totalCount: total };
  }).filter(t => t.isOverused).sort((a, b) => b.saturation - a.saturation);

  // Style stagnation
  const currentTypes = currentContent.reduce<Record<string, number>>((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {});
  const historicalTypes = historicalContent.reduce<Record<string, number>>((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {});
  const typeDiversity = Object.keys(currentTypes).length;
  const historicalTypeDiversity = Object.keys(historicalTypes).length;
  const diversityChange = typeDiversity - historicalTypeDiversity;

  // Format staleness
  const formatUsage = contentProfile.usualFormats.reduce<Record<string, number>>((acc, f) => { acc[f] = (acc[f] || 0) + 1; return acc; }, {});
  const dominantFormat = Object.entries(formatUsage).sort(([, a], [, b]) => b - a)[0];

  // Title pattern analysis
  const titlePatterns: { pattern: RegExp; label: string }[] = [
    { pattern: /^\d+\s/i, label: 'number_start' },
    { pattern: /\?$/, label: 'question_end' },
    { pattern: /!$/, label: 'exclamation_end' },
    { pattern: /\b(how to|why|what if|the truth)\b/i, label: 'formulaic_hook' },
    { pattern: /\|.*$|:.*$/, label: 'separator_title' },
  ];
  const currentTitlePatterns = currentContent.flatMap(c =>
    titlePatterns.filter(p => p.pattern.test(c.title)).map(p => p.label)
  );
  const historicalTitlePatterns = historicalContent.flatMap(c =>
    titlePatterns.filter(p => p.pattern.test(c.title)).map(p => p.label)
  );
  const patternStagnation = currentTitlePatterns.filter(p =>
    historicalTitlePatterns.filter(hp => hp === p).length > historicalContent.length * 0.3
  ).length;

  // Engagement fatigue detection
  const currentAvgEngagement = currentContent.length > 0 ? currentContent.reduce((s, c) => s + c.engagementRate, 0) / currentContent.length : 0;
  const historicalAvgEngagement = historicalContent.length > 0 ? historicalContent.reduce((s, c) => s + c.engagementRate, 0) / historicalContent.length : 0;
  const engagementTrend = historicalAvgEngagement > 0 ? ((currentAvgEngagement - historicalAvgEngagement) / historicalAvgEngagement) * 100 : 0;

  // Audience sentiment fatigue
  const recentFeedback = audienceFeedback.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  const olderFeedback = audienceFeedback.slice(10);
  const recentAvgSentiment = recentFeedback.length > 0 ? recentFeedback.reduce((s, f) => s + f.sentiment, 0) / recentFeedback.length : 0;
  const olderAvgSentiment = olderFeedback.length > 0 ? olderFeedback.reduce((s, f) => s + f.sentiment, 0) / olderFeedback.length : 0;

  // Uncanny valley score (0-100, higher = more stagnant)
  const uvScore = Math.round(
    Math.min(100,
      (topicStaleness.length * 15) +
      (diversityChange <= 0 ? 20 : 5) +
      (patternStagnation * 10) +
      (engagementTrend < -10 ? 25 : engagementTrend < 0 ? 10 : 0) +
      ((recentAvgSentiment - olderAvgSentiment) < -0.1 ? 20 : 0)
    )
  );

  const fatigueLevel = uvScore >= 70 ? 'severe' : uvScore >= 45 ? 'moderate' : uvScore >= 20 ? 'mild' : 'fresh';

  // Refresh recommendations
  const refreshSuggestions: { action: string; impact: number; description: string }[] = [];
  if (topicStaleness.length > 0) refreshSuggestions.push({
    action: 'Explore New Topics',
    impact: 30,
    description: `Reduce usage of overused topics: ${topicStaleness.slice(0, 3).map(t => t.topic).join(', ')}`,
  });
  if (diversityChange <= 0) refreshSuggestions.push({
    action: 'Diversify Content Types',
    impact: 25,
    description: `Current type diversity (${typeDiversity}) is at or below historical (${historicalTypeDiversity})`,
  });
  if (patternStagnation > 1) refreshSuggestions.push({
    action: 'Vary Title Patterns',
    impact: 20,
    description: `${patternStagnation} title patterns are overused - try new hooks`,
  });
  if (dominantFormat) refreshSuggestions.push({
    action: 'Mix Up Formats',
    impact: 15,
    description: `Dominant format: ${dominantFormat[0]} - rotate with alternatives`,
  });

  return {
    success: true,
    data: {
      uncannyValleyScore: uvScore,
      fatigueLevel,
      topicStaleness: topicStaleness.slice(0, 10),
      engagementTrend: Math.round(engagementTrend * 10) / 10,
      currentAvgEngagement: Math.round(currentAvgEngagement * 100) / 100,
      historicalAvgEngagement: Math.round(historicalAvgEngagement * 100) / 100,
      sentimentShift: Math.round((recentAvgSentiment - olderAvgSentiment) * 100) / 100,
      typeDiversityChange: diversityChange,
      patternStagnation,
      refreshSuggestions: refreshSuggestions.sort((a, b) => b.impact - a.impact),
      recommendations: [
        fatigueLevel === 'severe' ? 'CRITICAL: Content fatigue detected - immediate refresh needed' : fatigueLevel === 'moderate' ? 'Moderate stagnation - implement refresh plan' : 'Content feels fresh - maintain current variety',
        refreshSuggestions.length > 0 ? `Top refresh action: ${refreshSuggestions[0].action}` : 'No refresh actions needed',
        engagementTrend < -10 ? 'Engagement declining - audience may be experiencing content fatigue' : 'Engagement trends are stable or improving',
      ],
    },
    source: 'browser',
    featureId: 'f60',
  };
}

// -------------------- F61: Competitor Thumbnail Face Micro-Expression Analyzer --------------------
interface F61Input {
  thumbnails: {
    id: string;
    creatorName: string;
    hasFace: boolean;
    expression: 'smile' | 'surprise' | 'serious' | 'contempt' | 'neutral' | 'anger' | 'fear';
    faceSize: number; // percentage of frame
    dominantColor: string;
    textOverlay: string;
    composition: 'closeup' | 'medium' | 'wide' | 'product';
    views: number;
    ctr: number; // click-through rate
  }[];
}

function f61_competitorThumbnailFaceMicroExpressionAnalyzer(input: F61Input): FeatureResult {
  const analyzed = input.thumbnails.map(thumb => {
    // Expression effectiveness scoring
    const expressionPerformance: Record<string, number> = {
      surprise: 0.85, smile: 0.75, contempt: 0.55, serious: 0.6,
      neutral: 0.45, anger: 0.7, fear: 0.65,
    };

    // Face size scoring (20-40% of frame is optimal)
    let faceSizeScore = 100;
    if (thumb.faceSize < 15) faceSizeScore = 60;
    else if (thumb.faceSize < 20) faceSizeScore = 75;
    else if (thumb.faceSize > 50) faceSizeScore = 50;

    // Color vibrancy (based on dominant color)
    const r = parseInt(thumb.dominantColor.slice(1, 3), 16);
    const g = parseInt(thumb.dominantColor.slice(3, 5), 16);
    const b = parseInt(thumb.dominantColor.slice(5, 7), 16);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max > 0 ? (max - min) / max : 0;
    const colorScore = saturation > 0.5 ? 90 : saturation > 0.3 ? 75 : 50;

    // Text overlay scoring
    const textLength = thumb.textOverlay.length;
    let textScore = 70;
    if (textLength === 0) textScore = 40;
    else if (textLength <= 5) textScore = 60;
    else if (textLength <= 30) textScore = 90;
    else textScore = 50; // too much text

    // Composition scoring
    const compositionScores: Record<string, number> = {
      closeup: 85, medium: 70, wide: 55, product: 60,
    };

    // Combined thumbnail score
    const overallScore = Math.round(
      (expressionPerformance[thumb.expression] || 0.5) * 35 +
      (faceSizeScore / 100) * 20 +
      (colorScore / 100) * 15 +
      (textScore / 100) * 20 +
      (compositionScores[thumb.composition] || 50) / 100 * 10
    );

    // CTR prediction
    const predictedCTR = Math.round((overallScore / 100) * 12 * 100) / 100; // base ~12% max CTR

    return {
      thumbnailId: thumb.id,
      creatorName: thumb.creatorName,
      hasFace: thumb.hasFace,
      expression: thumb.expression,
      expressionEffectiveness: Math.round((expressionPerformance[thumb.expression] || 0.5) * 100),
      faceSize: thumb.faceSize,
      faceSizeScore,
      saturation: Math.round(saturation * 100),
      colorScore,
      textOverlayLength: textLength,
      textScore,
      composition: thumb.composition,
      compositionScore: compositionScores[thumb.composition] || 50,
      overallScore,
      actualCTR: thumb.ctr,
      predictedCTR,
      views: thumb.views,
      scoreAccuracy: thumb.ctr > 0 ? Math.round(Math.abs(thumb.ctr - predictedCTR) / thumb.ctr * 100) : 0,
    };
  });

  analyzed.sort((a, b) => b.overallScore - a.overallScore);

  // Aggregate insights
  const byExpression = analyzed.filter(a => a.hasFace).reduce<Record<string, { avgCTR: number; avgScore: number; count: number }>>((acc, a) => {
    if (!acc[a.expression]) acc[a.expression] = { avgCTR: 0, avgScore: 0, count: 0 };
    acc[a.expression].avgCTR += a.actualCTR;
    acc[a.expression].avgScore += a.overallScore;
    acc[a.expression].count++;
    return acc;
  }, {});

  const expressionRanking = Object.entries(byExpression)
    .map(([expression, data]) => ({
      expression,
      avgCTR: Math.round(data.avgCTR / data.count * 100) / 100,
      avgScore: Math.round(data.avgScore / data.count),
      count: data.count,
    }))
    .sort((a, b) => b.avgCTR - a.avgCTR);

  const byComposition = analyzed.reduce<Record<string, { avgCTR: number; count: number }>>((acc, a) => {
    if (!acc[a.composition]) acc[a.composition] = { avgCTR: 0, count: 0 };
    acc[a.composition].avgCTR += a.actualCTR;
    acc[a.composition].count++;
    return acc;
  }, {});

  const faceVsNoFace = {
    faceContent: analyzed.filter(a => a.hasFace),
    noFaceContent: analyzed.filter(a => !a.hasFace),
    faceAvgCTR: Math.round(analyzed.filter(a => a.hasFace).reduce((s, a) => s + a.actualCTR, 0) / (analyzed.filter(a => a.hasFace).length || 1) * 100) / 100,
    noFaceAvgCTR: Math.round(analyzed.filter(a => !a.hasFace).reduce((s, a) => s + a.actualCTR, 0) / (analyzed.filter(a => !a.hasFace).length || 1) * 100) / 100,
  };

  return {
    success: true,
    data: {
      thumbnails: analyzed,
      expressionRanking,
      compositionAnalysis: Object.entries(byComposition).map(([comp, data]) => ({
        composition: comp,
        avgCTR: Math.round(data.avgCTR / data.count * 100) / 100,
        count: data.count,
      })),
      faceImpact: faceVsNoFace,
      topThumbnails: analyzed.slice(0, 5),
      worstThumbnails: analyzed.slice(-5).reverse(),
      recommendations: [
        expressionRanking[0] ? `Best expression: ${expressionRanking[0].expression} (${expressionRanking[0].avgCTR}% avg CTR)` : 'Not enough face data',
        faceVsNoFace.faceAvgCTR > faceVsNoFace.noFaceAvgCTR ? 'Face thumbnails outperform - always include a face' : 'Non-face thumbnails perform well - consider alternatives',
        analyzed[0] ? `Top scoring thumbnail pattern: ${analyzed[0].composition} with ${analyzed[0].expression} expression` : '',
      ],
    },
    source: 'browser',
    featureId: 'f61',
  };
}

// -------------------- F62: Collaboration Matchmaker (Asymmetric) --------------------
interface F62Input {
  yourProfile: { followerCount: number; niche: string; engagementRate: number; contentFrequency: number };
  potentialCollaborators: {
    name: string;
    followerCount: number;
    niche: string;
    engagementRate: number;
    contentFrequency: number;
    audienceDemographics: { age18_24: number; age25_34: number; age35_plus: number };
    recentGrowth: number;
    opennessToCollab: number; // 0-100
  }[];
  yourDemographics: { age18_24: number; age25_34: number; age35_plus: number };
}

function f62_collaborationMatchmaker(input: F62Input): FeatureResult {
  const { yourProfile, yourDemographics } = input;

  const scored = input.potentialCollaborators.map(collab => {
    // Audience complementarity (different sizes = good for asymmetric collab)
    const sizeRatio = Math.max(yourProfile.followerCount, collab.followerCount) /
      Math.min(yourProfile.followerCount, collab.followerCount);
    const asymmetricBonus = sizeRatio > 2 ? 25 : sizeRatio > 1.5 ? 15 : sizeRatio > 1.1 ? 5 : 0;

    // Niche alignment (some overlap is good, too much = redundant)
    const nicheMatch = collab.niche.toLowerCase() === yourProfile.niche.toLowerCase() ? 100 :
      collab.niche.toLowerCase().includes(yourProfile.niche.toLowerCase()) ? 70 : 30;
    const nicheScore = nicheMatch > 50 ? nicheMatch : nicheMatch * 0.5; // penalize no match
    const nicheDiversityBonus = nicheMatch > 30 && nicheMatch < 80 ? 10 : 0; // slight diversity is best

    // Content frequency compatibility
    const freqDiff = Math.abs(yourProfile.contentFrequency - collab.contentFrequency);
    const freqScore = Math.max(0, 20 - freqDiff * 3);

    // Demographics overlap (some overlap = complementary)
    const demoOverlap = Math.min(
      yourDemographics.age18_24 + collab.audienceDemographics.age18_24,
      yourDemographics.age25_34 + collab.audienceDemographics.age25_34,
      yourDemographics.age35_plus + collab.audienceDemographics.age35_plus
    ) / 200;

    // Mutual benefit calculation
    const yourBenefit = Math.round(collab.followerCount * 0.03 * (collab.engagementRate / 5)); // estimated followers gained
    const theirBenefit = Math.round(yourProfile.followerCount * 0.03 * (yourProfile.engagementRate / 5));
    const benefitRatio = Math.max(yourBenefit, theirBenefit) / (Math.min(yourBenefit, theirBenefit) || 1);
    const mutualityScore = Math.max(0, 25 - (benefitRatio - 1) * 10);

    // Growth momentum bonus
    const growthBonus = Math.min(15, collab.recentGrowth * 1.5);

    // Openness factor
    const opennessFactor = collab.opennessToCollab / 100;

    // Total compatibility score
    const totalScore = Math.round(
      (nicheScore * 0.25) +
      asymmetricBonus +
      nicheDiversityBonus +
      freqScore +
      (demoOverlap * 15) +
      mutualityScore +
      growthBonus
    );

    // Estimated audience reach from collaboration
    const estimatedReach = Math.round(
      (yourProfile.followerCount + collab.followerCount) * 0.15 * (1 + demoOverlap)
    );

    return {
      collaborator: collab.name,
      followerCount: collab.followerCount,
      niche: collab.niche,
      compatibilityScore: Math.min(100, totalScore),
      nicheMatch: Math.round(nicheScore),
      asymmetricPotential: asymmetricBonus,
      mutualBenefit: { yourGain: yourBenefit, theirGain: theirBenefit, ratio: Math.round(benefitRatio * 10) / 10 },
      estimatedReach,
      demoOverlap: Math.round(demoOverlap * 100),
      growthBonus: Math.round(growthBonus),
      openness: collab.opennessToCollab,
      feasibility: Math.round(totalScore * opennessFactor),
      recommendation: totalScore > 70 ? 'high_priority' : totalScore > 50 ? 'worth_exploring' : totalScore > 30 ? 'long_term' : 'skip',
    };
  });

  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  const highPriority = scored.filter(s => s.recommendation === 'high_priority');
  const totalEstimatedReach = scored.filter(s => s.recommendation !== 'skip').reduce((s, sc) => s + sc.estimatedReach, 0);

  return {
    success: true,
    data: {
      totalPotentialCollaborators: input.potentialCollaborators.length,
      highPriorityCount: highPriority.length,
      topMatches: scored.slice(0, 10),
      totalPotentialReach: totalEstimatedReach,
      bestMatch: scored[0],
      allMatches: scored,
      recommendations: [
        highPriority.length > 0 ? `${highPriority.length} high-priority collaboration(s): ${highPriority.slice(0, 3).map(h => h.collaborator).join(', ')}` : 'No high-priority matches - expand your network',
        scored[0] ? `Best asymmetric match: ${scored[0].collaborator} (reach: ${scored[0].estimatedReach.toLocaleString()})` : '',
        totalEstimatedReach > yourProfile.followerCount * 2 ? 'Massive reach potential through collaborations' : 'Moderate reach potential - prioritize quality over quantity',
      ],
    },
    source: 'browser',
    featureId: 'f62',
  };
}

// -------------------- F63: Viral Mechanism Reverse-Engineer --------------------
interface F63Input {
  viralContent: {
    id: string;
    title: string;
    views: number;
    shares: number;
    comments: number;
    likes: number;
    duration: number; // seconds
    hook: string;
    emotionalArc: string; // description of emotional journey
    platform: string;
    topic: string;
  }[];
}

function f63_viralMechanismReverseEngineer(input: F63Input): FeatureResult {
  const analyzed = input.viralContent.map(content => {
    const { views, shares, comments, likes, duration, hook, emotionalArc, platform, topic } = content;

    // Virality coefficient: shares / views (each share generates new views)
    const viralityCoefficient = views > 0 ? (shares / views) * 100 : 0;
    const engagementRatio = views > 0 ? (likes + comments + shares) / views : 0;

    // Hook analysis
    const hookWordCount = hook.split(/\s+/).length;
    const hookType = /\?/.test(hook) ? 'question' :
      /\d/.test(hook) ? 'statistic' :
      /\b(I|my|we|our)\b/i.test(hook) ? 'personal' :
      /\b(shocking|insane|crazy|unbelievable|never)\b/i.test(hook) ? 'hyperbole' :
      'statement';

    // Hook timing score (shorter hooks = better for short-form)
    const idealHookLength = platform === 'tiktok' || platform === 'instagram' ? 5 : 8;
    const hookTimingScore = hookWordCount <= idealHookLength ? 100 :
      hookWordCount <= idealHookLength * 2 ? 70 : 40;

    // Emotional arc analysis
    const emotionalTriggers: { pattern: RegExp; type: string; weight: number }[] = [
      { pattern: /\b(surprise|shock|wow|unbelievable|insane|crazy)\b/i, type: 'surprise', weight: 30 },
      { pattern: /\b(angry|outrage|unfair|justice|wrong)\b/i, type: 'outrage', weight: 25 },
      { pattern: /\b(inspire|amazing|beautiful|heart|love|incredible)\b/i, type: 'awe', weight: 28 },
      { pattern: /\b(funny|laugh|hilarious|comedy|joke)\b/i, type: 'humor', weight: 27 },
      { pattern: /\b(fear|danger|risk|warning|scary)\b/i, type: 'fear', weight: 22 },
      { pattern: /\b(secret|hidden|revealed|exposed|truth)\b/i, type: 'curiosity', weight: 32 },
      { pattern: /\b(mistake|fail|worst|regret|embarrass)\b/i, type: 'schadenfreude', weight: 20 },
      { pattern: /\b(how to|tutorial|guide|step by step|learn)\b/i, type: 'utility', weight: 18 },
    ];

    const detectedEmotions = emotionalTriggers.map(t => ({
      ...t,
      detected: t.pattern.test(`${content.title} ${hook} ${emotionalArc}`),
    })).filter(t => t.detected);

    const emotionalIntensity = detectedEmotions.reduce((s, e) => s + e.weight, 0);

    // Engagement trigger analysis
    const shareMotivation = shares > 0 ? shares / (likes || 1) : 0; // high share ratio = strong share motivation
    const commentDebate = comments > 0 ? comments / (likes || 1) : 0; // high = controversial/debatable

    // Retention proxy (based on engagement ratio)
    const estimatedRetention = Math.min(95, Math.round(engagementRatio * 200 + 30));

    // Mechanism breakdown score
    const mechanismScore = Math.round(
      (Math.min(25, viralityCoefficient * 5)) +
      (Math.min(20, hookTimingScore * 0.2)) +
      (Math.min(25, emotionalIntensity * 0.3)) +
      (Math.min(15, shareMotivation * 50)) +
      (Math.min(15, engagementRatio * 30))
    );

    return {
      contentId: content.id,
      title: content.title,
      topic,
      platform,
      views,
      viralityCoefficient: Math.round(viralityCoefficient * 1000) / 1000,
      engagementRatio: Math.round(engagementRatio * 1000) / 1000,
      hookAnalysis: {
        hook: hook.substring(0, 100),
        type: hookType,
        wordCount: hookWordCount,
        timingScore: hookTimingScore,
      },
      emotionalArc: {
        description: emotionalArc,
        detectedEmotions: detectedEmotions.map(e => ({ type: e.type, weight: e.weight })),
        intensity: emotionalIntensity,
      },
      engagementTriggers: {
        shareMotivation: Math.round(shareMotivation * 100) / 100,
        commentDebateScore: Math.round(commentDebate * 100) / 100,
        estimatedRetention,
      },
      mechanismScore: Math.min(100, mechanismScore),
      duration,
      optimalDuration: platform === 'tiktok' ? (duration <= 60 ? 'optimal' : duration <= 180 ? 'acceptable' : 'too_long') :
        platform === 'youtube' ? (duration >= 300 && duration <= 900 ? 'optimal' : duration < 300 ? 'too_short' : 'long') : 'neutral',
    };
  });

  analyzed.sort((a, b) => b.mechanismScore - a.mechanismScore);

  // Aggregate mechanism patterns
  const topHooks = analyzed.slice(0, 5).map(a => a.hookAnalysis);
  const topEmotions = analyzed.flatMap(a => a.emotionalArc.detectedEmotions)
    .reduce<Record<string, number>>((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {});
  const emotionRanking = Object.entries(topEmotions)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({ type, count, percentage: Math.round(count / analyzed.length * 100) }));

  const avgVirality = analyzed.reduce((s, a) => s + a.viralityCoefficient, 0) / (analyzed.length || 1);
  const avgShareMotivation = analyzed.reduce((s, a) => s + a.engagementTriggers.shareMotivation, 0) / (analyzed.length || 1);

  return {
    success: true,
    data: {
      analyzedContent: analyzed,
      topMechanisms: analyzed.slice(0, 5),
      hookPatterns: topHooks,
      emotionRanking,
      aggregateMetrics: {
        averageVirality: Math.round(avgVirality * 1000) / 1000,
        averageShareMotivation: Math.round(avgShareMotivation * 100) / 100,
        averageMechanismScore: Math.round(analyzed.reduce((s, a) => s + a.mechanismScore, 0) / (analyzed.length || 1)),
      },
      replicationGuide: {
        bestHookType: topHooks.length > 0 ? topHooks[0].type : 'unknown',
        bestEmotions: emotionRanking.slice(0, 3).map(e => e.type),
        idealShareRatio: Math.round(avgShareMotivation * 100) / 100,
      },
      recommendations: [
        analyzed[0] ? `Strongest mechanism: ${analyzed[0].emotionalArc.detectedEmotions[0]?.type || 'mixed'} (${analyzed[0].mechanismScore}/100)` : '',
        emotionRanking[0] ? `Top emotional trigger: ${emotionRanking[0].type} - use in future content` : '',
        `Average virality coefficient: ${Math.round(avgVirality * 1000) / 1000}% - ${avgVirality > 0.01 ? 'strong viral potential' : 'needs optimization'}`,
      ],
    },
    source: 'browser',
    featureId: 'f63',
  };
}

// -------------------- F64: Competitive Keyword Gap Analysis --------------------
interface F64Input {
  yourKeywords: { keyword: string; rank: number; searchVolume: number; difficulty: number }[];
  competitorKeywords: { keyword: string; creator: string; rank: number; searchVolume: number; difficulty: number }[];
}

function f64_competitiveKeywordGapAnalysis(input: F64Input): FeatureResult {
  const { yourKeywords, competitorKeywords } = input;

  // Build keyword maps
  const yourKeywordMap = new Map(yourKeywords.map(k => [k.keyword.toLowerCase(), k]));

  // All unique keywords
  const allKeywords = new Set([
    ...yourKeywords.map(k => k.keyword.toLowerCase()),
    ...competitorKeywords.map(k => k.keyword.toLowerCase()),
  ]);

  // Gap analysis
  const gaps: {
    keyword: string;
    yourRank: number | null;
    competitorRank: number | null;
    competitorName: string | null;
    searchVolume: number;
    difficulty: number;
    opportunityScore: number;
    gapType: 'content_gap' | 'ranking_gap' | 'owned' | 'competitive_advantage';
  }[] = [];

  for (const kw of allKeywords) {
    const yours = yourKeywordMap.get(kw);
    const theirs = competitorKeywords.filter(k => k.keyword.toLowerCase() === kw);

    if (yours && theirs.length > 0) {
      // Both have it - check ranking gap
      const bestCompetitor = theirs.sort((a, b) => a.rank - b.rank)[0];
      const gapSize = yours.rank - bestCompetitor.rank;

      if (gapSize > 3) {
        gaps.push({
          keyword: kw,
          yourRank: yours.rank,
          competitorRank: bestCompetitor.rank,
          competitorName: bestCompetitor.creator,
          searchVolume: yours.searchVolume,
          difficulty: yours.difficulty,
          opportunityScore: Math.round(Math.min(100, gapSize * 5 + yours.searchVolume / 100)),
          gapType: 'ranking_gap',
        });
      } else if (gapSize < -3) {
        gaps.push({
          keyword: kw,
          yourRank: yours.rank,
          competitorRank: bestCompetitor.rank,
          competitorName: bestCompetitor.creator,
          searchVolume: yours.searchVolume,
          difficulty: yours.difficulty,
          opportunityScore: 0,
          gapType: 'competitive_advantage',
        });
      } else {
        gaps.push({
          keyword: kw,
          yourRank: yours.rank,
          competitorRank: bestCompetitor.rank,
          competitorName: bestCompetitor.creator,
          searchVolume: yours.searchVolume,
          difficulty: yours.difficulty,
          opportunityScore: 0,
          gapType: 'owned',
        });
      }
    } else if (!yours && theirs.length > 0) {
      // Content gap - competitors rank for keywords you don't target
      const bestCompetitor = theirs.sort((a, b) => a.rank - b.rank)[0];
      const oppScore = Math.round(Math.min(100,
        (bestCompetitor.searchVolume / 50) +
        (bestCompetitor.rank < 10 ? 30 : 10) +
        (100 - bestCompetitor.difficulty) * 0.3
      ));

      gaps.push({
        keyword: kw,
        yourRank: null,
        competitorRank: bestCompetitor.rank,
        competitorName: bestCompetitor.creator,
        searchVolume: bestCompetitor.searchVolume,
        difficulty: bestCompetitor.difficulty,
        opportunityScore: oppScore,
        gapType: 'content_gap',
      });
    } else if (yours && theirs.length === 0) {
      // You own this keyword exclusively
      gaps.push({
        keyword: kw,
        yourRank: yours.rank,
        competitorRank: null,
        competitorName: null,
        searchVolume: yours.searchVolume,
        difficulty: yours.difficulty,
        opportunityScore: 0,
        gapType: 'competitive_advantage',
      });
    }
  }

  // Categorize and sort
  const contentGaps = gaps.filter(g => g.gapType === 'content_gap').sort((a, b) => b.opportunityScore - a.opportunityScore);
  const rankingGaps = gaps.filter(g => g.gapType === 'ranking_gap').sort((a, b) => b.opportunityScore - a.opportunityScore);
  const owned = gaps.filter(g => g.gapType === 'owned');
  const advantages = gaps.filter(g => g.gapType === 'competitive_advantage');

  // Low competition, high volume keywords
  const lowCompetitionHighVolume = gaps
    .filter(g => g.difficulty < 40 && g.searchVolume > 500)
    .sort((a, b) => b.searchVolume - a.searchVolume);

  // Quick wins: low difficulty + small ranking gap
  const quickWins = rankingGaps
    .filter(g => g.difficulty < 50 && g.yourRank && g.competitorRank && (g.yourRank - g.competitorRank) < 10)
    .sort((a, b) => a.difficulty - b.difficulty);

  // Total opportunity volume
  const totalOpportunityVolume = contentGaps.reduce((s, g) => s + g.searchVolume, 0);

  return {
    success: true,
    data: {
      totalKeywords: gaps.length,
      contentGaps: contentGaps.slice(0, 20),
      contentGapCount: contentGaps.length,
      rankingGaps: rankingGaps.slice(0, 15),
      rankingGapCount: rankingGaps.length,
      ownedKeywords: owned,
      competitiveAdvantages: advantages,
      lowCompetitionHighVolume: lowCompetitionHighVolume.slice(0, 10),
      quickWins: quickWins.slice(0, 10),
      totalOpportunityVolume,
      avgDifficultyOfGaps: contentGaps.length > 0 ? Math.round(contentGaps.reduce((s, g) => s + g.difficulty, 0) / contentGaps.length) : 0,
      allGaps: gaps.sort((a, b) => b.opportunityScore - a.opportunityScore),
      recommendations: [
        contentGaps.length > 0 ? `${contentGaps.length} content gaps found - top opportunity: "${contentGaps[0].keyword}" (${contentGaps[0].searchVolume} volume)` : 'No significant content gaps - strong keyword coverage',
        quickWins.length > 0 ? `${quickWins.length} quick wins available with low difficulty` : 'No quick wins - focus on content gaps for new keywords',
        totalOpportunityVolume > 10000 ? `Major opportunity: ${totalOpportunityVolume.toLocaleString()} total search volume in content gaps` : 'Opportunity volume is moderate - prioritize high-volume gaps',
      ],
    },
    source: 'browser',
    featureId: 'f64',
  };
}

// ============================================================
// EXPORT: arenaFeatures object with all F49-F64 functions
// ============================================================
export const arenaFeatures = {
  f49_shareOfVoiceBenchmarking,
  f50_engagementVelocityAlerts,
  f51_hookLibrary,
  f52_adSpendTransparency,
  f53_aiVisibilityToolkit,
  f54_contentCounterStrikeLogic,
  f55_followerMigrationTracker,
  f56_crossNicheRivalryMap,
  f57_historicalGrowthAuditing,
  f58_multiModalVisionScout,
  f59_deadCreatorInheritanceProtocol,
  f60_uncannyValleyOfYou,
  f61_competitorThumbnailFaceMicroExpressionAnalyzer,
  f62_collaborationMatchmaker,
  f63_viralMechanismReverseEngineer,
  f64_competitiveKeywordGapAnalysis,
};

export type ArenaFeatures = typeof arenaFeatures;
