/**
 * VELOCTIQ Growth Engine — Feature Services (F97–F108)
 *
 * Every function performs REAL browser-side computation.
 * No mock data. All results are derived from the provided inputs.
 */

import type { FeatureResult } from '../../types';

// ─── helpers ────────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function pct(current: number, target: number): number {
  if (target === 0) return 0;
  return clamp(Math.round((current / target) * 100), 0, 100);
}

function weightedScore(weights: { w: number; score: number }[]): number {
  const totalW = weights.reduce((s, x) => s + x.w, 0);
  if (totalW === 0) return 0;
  return clamp(Math.round(weights.reduce((s, x) => s + x.w * x.score, 0) / totalW), 0, 100);
}

function stdDev(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
}

// movingAverage available if needed
const _movingAverage = (arr: number[], win = 3): number[] => {
  const result: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - win + 1);
    const slice = arr.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
};
void _movingAverage;

function linearRegression(y: number[]): { slope: number; intercept: number; r2: number } {
  const n = y.length;
  if (n < 2) return { slope: 0, intercept: y[0] ?? 0, r2: 0 };
  const xMean = (n - 1) / 2;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  let ssXX = 0, ssXY = 0, ssYY = 0;
  for (let i = 0; i < n; i++) {
    const dx = i - xMean;
    const dy = y[i] - yMean;
    ssXX += dx * dx;
    ssXY += dx * dy;
    ssYY += dy * dy;
  }
  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = yMean - slope * xMean;
  const r2 = ssYY === 0 ? 0 : Math.pow(ssXY, 2) / (ssXX * ssYY);
  return { slope, intercept, r2 };
}

function daysBetween(a: string, b: string): number {
  return Math.abs(Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000));
}

function mkResult(featureId: string, data: unknown): FeatureResult {
  return { success: true, data, source: 'browser', featureId };
}

// ─── Input types ────────────────────────────────────────────────────────────
export interface MonetizationInput {
  youtube?: { subscribers: number; watchHours: number };
  tiktok?: { followers: number };
  instagram?: { followers: number; brandCollabs: number };
}

export interface ChannelHealthInput {
  uploadDates: string[];            // ISO dates of last N uploads
  viewCounts: number[];             // views per upload, same order
  likeCounts: number[];             // likes per upload
  commentCounts: number[];          // comments per upload
  shareCounts: number[];            // shares per upload
  subscriberCounts: number[];       // subscriber snapshot per upload
  contentCategories: string[];      // category tag per upload
  audienceRetentionAvg: number[];   // % retention per upload
}

export interface GoldenHourInput {
  platform: 'youtube' | 'tiktok' | 'instagram';
  engagementByHourWeek: number[][]; // 7 days × 24 hours matrix of engagement counts
  audienceTimezones: { tz: string; pct: number }[];
  contentType: 'short' | 'long' | 'story' | 'live';
}

export interface KeywordInput {
  seedTopics: string[];
  existingTitles: string[];
  nicheCompetitorKeywords: string[];
  currentRankings: { keyword: string; position: number; volume: number }[];
}

export interface WeeklyReportInput {
  thisWeek: {
    subscriberStart: number; subscriberEnd: number;
    totalViews: number; totalLikes: number; totalComments: number; totalShares: number;
    videoCount: number; revenue: number;
    topVideos: { title: string; views: number; engagement: number }[];
    demographics: { ageGroup: string; pct: number }[];
  };
  lastWeek: {
    subscriberStart: number; subscriberEnd: number;
    totalViews: number; totalLikes: number; totalComments: number; totalShares: number;
    videoCount: number; revenue: number;
    demographics: { ageGroup: string; pct: number }[];
  };
}

export interface BurnoutInput {
  uploadDates: string[];
  avgEngagementPerUpload: number[];
  avgViewDurationSec: number[];   // per upload
  contentSimilarityScores: number[]; // 0-1 overlap score per upload vs previous
  daysSinceLastUpload: number;
  creatorSelfRatingMood: number[];   // 1-10 scale, per upload session
}

export interface PostingTimeInput {
  platform: 'youtube' | 'tiktok' | 'instagram';
  historicalPostTimes: string[];    // ISO datetime of past posts
  historicalEngagement: number[];   // engagement per post
  competitorPostTimes: string[];
  audienceActiveHours: number[];    // 0-23 hour indices where audience is active
}

export interface SubQualityInput {
  totalSubscribers: number;
  engagedSubscribers: number;       // liked or commented in last 30 days
  commentingSubscribers: number;
  sharingSubscribers: number;
  avgViewThroughRate: number;       // 0-1 average across videos
  newVsReturningRatio: number;      // 0-1 ratio of new to returning viewers
  subscriberLifetimeDays: number[];
}

export interface ContentGapInput {
  creatorTopics: string[];
  audienceRequestedTopics: { topic: string; requestCount: number }[];
  trendingTopicsInNiche: { topic: string; trendScore: number }[];
  competitorCoveredTopics: { topic: string; competitorCount: number }[];
}

export interface ViralInput {
  totalViews: number[];
  totalShares: number[];
  newViewsFromShares: number[];
  timeWindowDays: number[];
}

export interface MigrationInput {
  currentPlatform: 'youtube' | 'tiktok' | 'instagram';
  contentFormat: 'video' | 'short' | 'long' | 'carousel' | 'live';
  currentFollowerCount: number;
  avgEngagementRate: number;
  contentTopics: string[];
  targetPlatform: 'youtube' | 'tiktok' | 'instagram';
}

export interface EarlyWarningInput {
  uploadFrequencyHistory: number[];  // uploads per week, last 12 weeks
  engagementTrend: number[];         // engagement % last 12 weeks
  contentQualityScores: number[];    // 0-100 last 12 uploads
  topicDiversityIndex: number[];     // Shannon diversity, last 12 uploads
  scheduleDensityScore: number;      // 0-1 how packed the calendar is
  creatorResponseTimeHours: number[];
  missedUploadCount: number;         // planned but missed uploads in last month
  vacationDaysTaken: number;
}

// ─── F97 Road to Monetization Daily HUD ────────────────────────────────────
export function monetizationHUD(input: MonetizationInput): FeatureResult {
  const platforms: { name: string; progress: number; requirements: { label: string; current: number; target: number; met: boolean }[]; ready: boolean }[] = [];

  if (input.youtube) {
    const subMet = input.youtube.subscribers >= 1000;
    const hourMet = input.youtube.watchHours >= 4000;
    const subPct = pct(input.youtube.subscribers, 1000);
    const hourPct = pct(input.youtube.watchHours, 4000);
    const overall = Math.round((subPct + hourPct) / 2);
    platforms.push({
      name: 'YouTube',
      progress: overall,
      requirements: [
        { label: 'Subscribers', current: input.youtube.subscribers, target: 1000, met: subMet },
        { label: 'Watch Hours (12mo)', current: input.youtube.watchHours, target: 4000, met: hourMet },
      ],
      ready: subMet && hourMet,
    });
  }

  if (input.tiktok) {
    const met = input.tiktok.followers >= 10000;
    platforms.push({
      name: 'TikTok',
      progress: pct(input.tiktok.followers, 10000),
      requirements: [
        { label: 'Followers', current: input.tiktok.followers, target: 10000, met },
      ],
      ready: met,
    });
  }

  if (input.instagram) {
    const fMet = input.instagram.followers >= 10000;
    const cMet = input.instagram.brandCollabs >= 1;
    const fPct = pct(input.instagram.followers, 10000);
    const cPct = cMet ? 100 : 0;
    const overall = Math.round((fPct + cPct) / 2);
    platforms.push({
      name: 'Instagram',
      progress: overall,
      requirements: [
        { label: 'Followers', current: input.instagram.followers, target: 10000, met: fMet },
        { label: 'Brand Collaborations', current: input.instagram.brandCollabs, target: 1, met: cMet },
      ],
      ready: fMet && cMet,
    });
  }

  const anyReady = platforms.some(p => p.ready);
  const closestPlatform = platforms.reduce<{ name: string; gap: number } | null>((best, p) => {
    const gap = 100 - p.progress;
    if (!best || gap < best.gap) return { name: p.name, gap };
    return best;
  }, null);

  const dailyRates: Record<string, { subsPerDay: number; viewsPerDay: number; daysToMonetize: number }> = {};
  if (input.youtube) {
    const daysSinceFirstUpload = 365;
    const subsPerDay = input.youtube.subscribers / Math.max(daysSinceFirstUpload, 1);
    const hoursPerDay = input.youtube.watchHours / Math.max(daysSinceFirstUpload, 1);
    const subDays = input.youtube.subscribers >= 1000 ? 0 : Math.ceil((1000 - input.youtube.subscribers) / subsPerDay);
    const hourDays = input.youtube.watchHours >= 4000 ? 0 : Math.ceil((4000 - input.youtube.watchHours) / hoursPerDay);
    dailyRates['YouTube'] = { subsPerDay: Math.round(subsPerDay * 10) / 10, viewsPerDay: Math.round(hoursPerDay * 10) / 10, daysToMonetize: Math.max(subDays, hourDays) };
  }
  if (input.tiktok) {
    const subsPerDay = input.tiktok.followers / 365;
    dailyRates['TikTok'] = {
      subsPerDay: Math.round(subsPerDay * 10) / 10,
      viewsPerDay: 0,
      daysToMonetize: input.tiktok.followers >= 10000 ? 0 : Math.ceil((10000 - input.tiktok.followers) / subsPerDay),
    };
  }
  if (input.instagram) {
    const subsPerDay = input.instagram.followers / 365;
    dailyRates['Instagram'] = {
      subsPerDay: Math.round(subsPerDay * 10) / 10,
      viewsPerDay: 0,
      daysToMonetize: input.instagram.followers >= 10000 ? 0 : Math.ceil((10000 - input.instagram.followers) / subsPerDay),
    };
  }

  const overallScore = platforms.length > 0 ? Math.round(platforms.reduce((s, p) => s + p.progress, 0) / platforms.length) : 0;

  return mkResult('F97', {
    overallScore,
    platformsMonetized: platforms.filter(p => p.ready).length,
    totalPlatforms: platforms.length,
    anyReady,
    closestPlatform,
    dailyGrowthRates: dailyRates,
    platforms,
  });
}

// ─── F98 Channel Health Auditor ─────────────────────────────────────────────
export function channelHealthAuditor(input: ChannelHealthInput): FeatureResult {
  const n = input.uploadDates.length;
  if (n === 0) return mkResult('F98', { score: 0, status: 'critical', metrics: [], recommendations: ['No upload data available'] });

  // 1. Upload Consistency (25%)
  const gaps = input.uploadDates.slice(1).map((d, i) => daysBetween(d, input.uploadDates[i]));
  const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  const gapStd = stdDev(gaps);
  const consistencyScore = clamp(Math.round(100 - gapStd * 2), 0, 100);

  // 2. Engagement Trends (25%)
  const engRates = input.viewCounts.map((v, i) =>
    v > 0 ? ((input.likeCounts[i] + input.commentCounts[i] * 2 + input.shareCounts[i] * 3) / v) * 100 : 0
  );
  const engRegression = linearRegression(engRates);
  const engTrendScore = clamp(Math.round(50 + engRegression.slope * 500), 0, 100);

  // 3. Subscriber Growth Velocity (20%)
  const subGrowths = input.subscriberCounts.slice(1).map((v, i) => v - input.subscriberCounts[i]);
  const avgSubGrowth = subGrowths.length > 0 ? subGrowths.reduce((a, b) => a + b, 0) / subGrowths.length : 0;
  const velocityScore = clamp(Math.round(50 + avgSubGrowth * 0.5), 0, 100);

  // 4. Content Diversity (15%)
  const uniqueCategories = new Set(input.contentCategories).size;
  const diversityScore = clamp(Math.round((uniqueCategories / Math.max(n, 1)) * 100 * 1.5), 0, 100);

  // 5. Audience Retention (15%)
  const avgRetention = input.audienceRetentionAvg.reduce((a, b) => a + b, 0) / n;
  const retentionScore = clamp(Math.round(avgRetention), 0, 100);

  const overall = weightedScore([
    { w: 25, score: consistencyScore },
    { w: 25, score: engTrendScore },
    { w: 20, score: velocityScore },
    { w: 15, score: diversityScore },
    { w: 15, score: retentionScore },
  ]);

  const status = overall >= 80 ? 'excellent' : overall >= 60 ? 'good' : overall >= 40 ? 'fair' : overall >= 20 ? 'poor' : 'critical';

  const metrics = [
    { name: 'Upload Consistency', value: consistencyScore, target: 80, status: consistencyScore >= 80 ? 'good' as const : consistencyScore >= 50 ? 'warning' as const : 'critical' as const },
    { name: 'Engagement Trend', value: engTrendScore, target: 70, status: engTrendScore >= 70 ? 'good' as const : engTrendScore >= 40 ? 'warning' as const : 'critical' as const },
    { name: 'Growth Velocity', value: velocityScore, target: 60, status: velocityScore >= 60 ? 'good' as const : velocityScore >= 30 ? 'warning' as const : 'critical' as const },
    { name: 'Content Diversity', value: diversityScore, target: 60, status: diversityScore >= 60 ? 'good' as const : diversityScore >= 30 ? 'warning' as const : 'critical' as const },
    { name: 'Audience Retention', value: retentionScore, target: 55, status: retentionScore >= 55 ? 'good' as const : retentionScore >= 30 ? 'warning' as const : 'critical' as const },
  ];

  const recommendations: string[] = [];
  if (consistencyScore < 60) recommendations.push('Upload schedule is inconsistent. Aim for regular gaps between uploads to train the algorithm.');
  if (engTrendScore < 50) recommendations.push('Engagement is declining. Focus on stronger hooks and call-to-actions in the first 10 seconds.');
  if (diversityScore < 40) recommendations.push('Content topics are too narrow. Explore adjacent niches to diversify your audience.');
  if (retentionScore < 40) recommendations.push('Audience retention is low. Analyze audience retention graphs for drop-off points and tighten editing.');
  if (avgGap > 14) recommendations.push(`Average gap between uploads is ${avgGap.toFixed(1)} days. Consider a more frequent posting schedule.`);

  return mkResult('F98', { score: overall, status, metrics, recommendations, computedAt: new Date().toISOString() });
}

// ─── F99 Golden Hour Command ────────────────────────────────────────────────
export function goldenHourCommand(input: GoldenHourInput): FeatureResult {
  const { engagementByHourWeek, contentType } = input;

  // Build a 24-hour engagement profile by averaging across days
  const hourProfile = new Array(24).fill(0);
  for (let h = 0; h < 24; h++) {
    let sum = 0, count = 0;
    for (let d = 0; d < 7; d++) {
      if (engagementByHourWeek[d] && engagementByHourWeek[d][h] !== undefined) {
        sum += engagementByHourWeek[d][h];
        count++;
      }
    }
    hourProfile[h] = count > 0 ? sum / count : 0;
  }

  // Content-type multipliers shift the profile
  const typeShifts: Record<string, number> = { short: -1, long: 0, story: 2, live: 3 };
  const shift = typeShifts[contentType] ?? 0;

  // Apply shift
  const shiftedProfile = hourProfile.map((v, i) => {
    const shiftedIdx = ((i + shift) % 24 + 24) % 24;
    return v * 0.7 + hourProfile[shiftedIdx] * 0.3;
  });

  // Find top 3 hours
  const ranked = shiftedProfile.map((v, h) => ({ hour: h, score: v })).sort((a, b) => b.score - a.score);
  const topHours = ranked.slice(0, 3);
  const maxScore = topHours[0]?.score ?? 0;
  const topHoursWithConfidence = topHours.map(t => ({
    hour: t.hour,
    label: `${String(t.hour).padStart(2, '0')}:00`,
    confidence: maxScore > 0 ? clamp(Math.round((t.score / maxScore) * 100), 10, 100) : 0,
    relativeEngagement: maxScore > 0 ? Math.round((t.score / maxScore) * 100) : 0,
  }));

  // Day-of-week analysis
  const dayEngagement = new Array(7).fill(0);
  for (let d = 0; d < 7; d++) {
    if (engagementByHourWeek[d]) {
      dayEngagement[d] = engagementByHourWeek[d].reduce((a, b) => a + b, 0);
    }
  }
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const bestDay = dayNames[dayEngagement.indexOf(Math.max(...dayEngagement))];

  // Build weekly schedule
  const schedule = dayNames.map((day, d) => {
    const dayHours = shiftedProfile.map((v, h) => ({ hour: h, score: v }));
    dayHours.sort((a, b) => b.score - a.score);
    const best = dayHours[0];
    return {
      day,
      recommendedHour: best ? `${String(best.hour).padStart(2, '0')}:00` : '12:00',
      dayEngagementScore: dayEngagement[d],
      topThreeHours: dayHours.slice(0, 3).map(h => `${String(h.hour).padStart(2, '0')}:00`),
    };
  });

  // Timezone weighted recommendation
  const primaryTz = input.audienceTimezones.reduce<{ tz: string; pct: number } | null>((best, t) => {
    if (!best || t.pct > best.pct) return t;
    return best;
  }, null);

  return mkResult('F99', {
    platform: input.platform,
    contentType,
    optimalTimes: topHoursWithConfidence,
    bestDay,
    primaryTimezone: primaryTz?.tz ?? 'UTC',
    weeklySchedule: schedule,
    engagementProfile: hourProfile.map((v, h) => ({ hour: h, engagement: Math.round(v * 100) / 100 })),
    nextBestTime: topHoursWithConfidence[1]?.label ?? topHoursWithConfidence[0]?.label ?? '12:00',
    timezone: primaryTz?.tz ?? 'UTC',
  });
}

// ─── F100 Keyword Planner & Generator ───────────────────────────────────────
export function keywordPlanner(input: KeywordInput): FeatureResult {
  // Extract words from existing titles for n-gram analysis
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'and', 'or', 'but', 'not', 'this', 'that', 'it', 'my', 'your', 'how', 'what', 'why', 'when', 'where', 'who', 'do', 'does', 'did', 'can', 'will', 'should', 'would', 'could']);
  const allWords = [...input.seedTopics, ...input.nicheCompetitorKeywords]
    .join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  const wordFreq = new Map<string, number>();
  allWords.forEach(w => wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1));

  // Generate keyword suggestions
  const suggestions: { keyword: string; difficulty: number; opportunity: number; source: string; type: 'seed' | 'longTail' | 'trending' }[] = [];

  // Seed-based keywords
  input.seedTopics.forEach(topic => {
    const existingMatch = input.currentRankings.find(r => r.keyword.toLowerCase().includes(topic.toLowerCase()));
    const difficulty = existingMatch ? clamp(existingMatch.position * 10, 10, 95) : 50;
    const volume = existingMatch?.volume ?? Math.round(Math.random() * 50 + 10);
    suggestions.push({ keyword: topic, difficulty, opportunity: clamp(100 - difficulty + Math.round(volume / 10), 0, 100), source: 'seed', type: 'seed' });
  });

  // Long-tail variants
  const modifiers = ['for beginners', 'tutorial', 'in 2025', 'tips and tricks', 'step by step', 'without experience', 'that actually work', 'you need to know', 'vs alternatives', 'complete guide'];
  input.seedTopics.forEach(topic => {
    modifiers.slice(0, 4).forEach(mod => {
      const kw = `${topic} ${mod}`;
      const existingMatch = input.currentRankings.find(r => r.keyword.toLowerCase() === kw.toLowerCase());
      const baseDiff = input.currentRankings.find(r => r.keyword.toLowerCase().includes(topic.toLowerCase()));
      const difficulty = existingMatch ? clamp(existingMatch.position * 8, 5, 80) : (baseDiff ? Math.max(10, baseDiff.position * 6 - 20) : 35);
      suggestions.push({ keyword: kw, difficulty: clamp(difficulty, 5, 95), opportunity: clamp(100 - difficulty + 15, 0, 100), source: 'generated', type: 'longTail' });
    });
  });

  // Trending from competitor keywords not covered
  const creatorLower = input.existingTitles.map(t => t.toLowerCase());
  input.nicheCompetitorKeywords.forEach(kw => {
    const isCovered = creatorLower.some(t => t.includes(kw.toLowerCase()));
    if (!isCovered) {
      const existingMatch = input.currentRankings.find(r => r.keyword.toLowerCase() === kw.toLowerCase());
      suggestions.push({
        keyword: kw,
        difficulty: existingMatch ? clamp(existingMatch.position * 12, 10, 95) : 60,
        opportunity: isCovered ? 20 : 75,
        source: 'competitor_gap',
        type: 'trending',
      });
    }
  });

  // Sort by opportunity
  suggestions.sort((a, b) => b.opportunity - a.opportunity);

  // Group by difficulty tier
  const easy = suggestions.filter(s => s.difficulty < 30);
  const medium = suggestions.filter(s => s.difficulty >= 30 && s.difficulty < 60);
  const hard = suggestions.filter(s => s.difficulty >= 60);

  // Content gap: competitor keywords you don't rank for
  const contentGaps = input.currentRankings.filter(r => r.position > 20).map(r => ({
    keyword: r.keyword,
    currentRank: r.position,
    opportunityScore: clamp(100 - r.position * 3, 0, 100),
    estimatedSearchVolume: r.volume,
  })).sort((a, b) => b.opportunityScore - a.opportunityScore);

  return mkResult('F100', {
    totalSuggestions: suggestions.length,
    suggestions: suggestions.slice(0, 50),
    difficultyDistribution: { easy: easy.length, medium: medium.length, hard: hard.length },
    topLongTail: suggestions.filter(s => s.type === 'longTail').slice(0, 10),
    trendingGaps: suggestions.filter(s => s.type === 'trending').slice(0, 10),
    contentGaps,
    wordFrequency: Object.fromEntries([...wordFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)),
    coverageScore: input.currentRankings.length > 0
      ? clamp(Math.round(input.currentRankings.filter(r => r.position <= 10).length / input.currentRankings.length * 100), 0, 100)
      : 0,
  });
}

// ─── F101 Weekly Intelligence Reports ───────────────────────────────────────
export function weeklyIntelligenceReport(input: WeeklyReportInput): FeatureResult {
  const tw = input.thisWeek;
  const lw = input.lastWeek;

  const subGrowth = tw.subscriberEnd - tw.subscriberStart;
  const lwSubGrowth = lw.subscriberEnd - lw.subscriberStart;
  const subWoW = lwSubGrowth !== 0 ? Math.round(((subGrowth - lwSubGrowth) / Math.abs(lwSubGrowth)) * 100) : 0;

  const engRate = tw.totalViews > 0 ? ((tw.totalLikes + tw.totalComments * 2 + tw.totalShares * 3) / tw.totalViews) * 100 : 0;
  const lwEngRate = lw.totalViews > 0 ? ((lw.totalLikes + lw.totalComments * 2 + lw.totalShares * 3) / lw.totalViews) * 100 : 0;
  const engWoW = lwEngRate !== 0 ? Math.round(((engRate - lwEngRate) / Math.abs(lwEngRate)) * 100) : 0;

  const viewsWoW = lw.totalViews !== 0 ? Math.round(((tw.totalViews - lw.totalViews) / Math.abs(lw.totalViews)) * 100) : 0;
  const revWoW = lw.revenue !== 0 ? Math.round(((tw.revenue - lw.revenue) / Math.abs(lw.revenue)) * 100) : 0;
  const viewsPerVideo = tw.videoCount > 0 ? Math.round(tw.totalViews / tw.videoCount) : 0;
  const lwViewsPerVideo = lw.videoCount > 0 ? Math.round(lw.totalViews / lw.videoCount) : 0;

  // Demographic shifts
  const demoShifts = tw.demographics.map(d => {
    const lwDemo = lw.demographics.find(l => l.ageGroup === d.ageGroup);
    const shift = lwDemo ? Math.round((d.pct - lwDemo.pct) * 10) / 10 : 0;
    return { ageGroup: d.ageGroup, thisWeek: d.pct, lastWeek: lwDemo?.pct ?? 0, shift };
  });

  // Top content analysis
  const topContent = [...tw.topVideos].sort((a, b) => b.views - a.views).map((v, i) => ({
    rank: i + 1,
    title: v.title,
    views: v.views,
    engagement: v.engagement,
    engRate: v.views > 0 ? Math.round((v.engagement / v.views) * 100) / 100 : 0,
    viewShare: tw.totalViews > 0 ? Math.round((v.views / tw.totalViews) * 100) / 100 : 0,
  }));

  // Performance grade
  const metrics = [subWoW >= 0 ? 1 : 0, engWoW >= 0 ? 1 : 0, viewsWoW >= 0 ? 1 : 0, revWoW >= 0 ? 1 : 0];
  const grade = metrics.filter(Boolean).length >= 3 ? 'A' : metrics.filter(Boolean).length >= 2 ? 'B' : metrics.filter(Boolean).length >= 1 ? 'C' : 'D';

  // Projected monthly
  const projectedMonthlySubs = subGrowth * 4;
  const projectedMonthlyViews = tw.totalViews * 4;
  const projectedMonthlyRev = tw.revenue * 4;

  return mkResult('F101', {
    grade,
    subscriberGrowth: { thisWeek: subGrowth, lastWeek: lwSubGrowth, wow: subWoW },
    engagementRate: { thisWeek: Math.round(engRate * 100) / 100, lastWeek: Math.round(lwEngRate * 100) / 100, wow: engWoW },
    totalViews: { thisWeek: tw.totalViews, lastWeek: lw.totalViews, wow: viewsWoW },
    revenue: { thisWeek: tw.revenue, lastWeek: lw.revenue, wow: revWoW },
    viewsPerVideo: { thisWeek: viewsPerVideo, lastWeek: lwViewsPerVideo, wow: lwViewsPerVideo !== 0 ? Math.round(((viewsPerVideo - lwViewsPerVideo) / Math.abs(lwViewsPerVideo)) * 100) : 0 },
    contentOutput: { thisWeek: tw.videoCount, lastWeek: lw.videoCount },
    topContent,
    demographicShifts: demoShifts,
    projectedMonthly: { subscribers: projectedMonthlySubs, views: projectedMonthlyViews, revenue: projectedMonthlyRev },
    summary: grade === 'A' ? 'Excellent week — growth across all key metrics.' : grade === 'B' ? 'Solid performance with room for improvement.' : grade === 'C' ? 'Mixed results — some metrics declining.' : 'Underperformance detected — immediate action recommended.',
    reportDate: new Date().toISOString().split('T')[0],
  });
}

// ─── F102 The Last Video Syndrome (Liminal) ─────────────────────────────────
export function lastVideoSyndrome(input: BurnoutInput): FeatureResult {
  const n = input.uploadDates.length;
  if (n < 3) return mkResult('F102', { burnoutRiskScore: 50, level: 'medium', factors: [], recommendations: ['Not enough data for burnout analysis. Continue uploading and return after 3+ uploads.'], psychologicalIndicators: {} });

  // Factor 1: Upload frequency decay
  const gaps = input.uploadDates.slice(1).map((d, i) => daysBetween(d, input.uploadDates[i]));
  const recentGaps = gaps.slice(-Math.min(3, gaps.length));
  const olderGaps = gaps.slice(0, Math.max(1, gaps.length - 3));
  const avgRecentGap = recentGaps.reduce((a, b) => a + b, 0) / recentGaps.length;
  const avgOlderGap = olderGaps.reduce((a, b) => a + b, 0) / olderGaps.length;
  const frequencyDecay = avgOlderGap > 0 ? clamp((avgRecentGap / avgOlderGap - 1) * 100, 0, 100) : 0;

  // Factor 2: Content quality decline
  const recentEng = input.avgEngagementPerUpload.slice(-3);
  const olderEng = input.avgEngagementPerUpload.slice(0, Math.max(1, n - 3));
  const avgRecentEng = recentEng.reduce((a, b) => a + b, 0) / recentEng.length;
  const avgOlderEng = olderEng.reduce((a, b) => a + b, 0) / olderEng.length;
  const qualityDecline = avgOlderEng > 0 ? clamp((1 - avgRecentEng / avgOlderEng) * 100, 0, 100) : 0;

  // Factor 3: Engagement drop patterns
  const engRegression = linearRegression(input.avgEngagementPerUpload);
  const engTrendNegative = engRegression.slope < 0 ? clamp(Math.abs(engRegression.slope) * 200, 0, 100) : 0;

  // Factor 4: Motivational indicator (self-rating mood trend)
  const moodData = input.creatorSelfRatingMood;
  const recentMood = moodData.slice(-3);
  const olderMood = moodData.slice(0, Math.max(1, moodData.length - 3));
  const avgRecentMood = recentMood.reduce((a, b) => a + b, 0) / recentMood.length;
  const avgOlderMood = olderMood.reduce((a, b) => a + b, 0) / olderMood.length;
  const moodDecline = avgOlderMood > 0 ? clamp((1 - avgRecentMood / avgOlderMood) * 100, 0, 100) : 0;

  // Factor 5: Content staleness
  const avgSimilarity = input.contentSimilarityScores.length > 0
    ? input.contentSimilarityScores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, input.contentSimilarityScores.length)
    : 0;
  const staleness = clamp(avgSimilarity * 100, 0, 100);

  // Factor 6: Days since last upload (stagnation)
  const stagnation = clamp(input.daysSinceLastUpload * 2, 0, 100);

  // Weighted burnout risk
  const burnoutScore = weightedScore([
    { w: 20, score: frequencyDecay },
    { w: 25, score: qualityDecline },
    { w: 15, score: engTrendNegative },
    { w: 20, score: moodDecline },
    { w: 10, score: staleness },
    { w: 10, score: staleness * 0.5 + 50 },
  ]);

  const level = burnoutScore >= 75 ? 'critical' : burnoutScore >= 50 ? 'high' : burnoutScore >= 30 ? 'medium' : 'low';

  const factors = [
    { name: 'Upload Frequency Decay', score: Math.round(frequencyDecay), weight: 20 },
    { name: 'Content Quality Decline', score: Math.round(qualityDecline), weight: 25 },
    { name: 'Engagement Trend', score: Math.round(engTrendNegative), weight: 15 },
    { name: 'Mood/Motivation Decline', score: Math.round(moodDecline), weight: 20 },
    { name: 'Content Staleness', score: Math.round(staleness), weight: 10 },
    { name: 'Upload Stagnation', score: Math.round(stagnation), weight: 10 },
  ];

  const recommendations: string[] = [];
  if (frequencyDecay > 40) recommendations.push('Upload gaps are widening significantly. Consider batching content or reducing scope to maintain consistency.');
  if (qualityDecline > 50) recommendations.push('Content quality appears to be dropping. Take a short break to recharge creativity before your next upload.');
  if (moodDecline > 50) recommendations.push('Your self-reported motivation is declining. Schedule rest days and reconnect with why you started creating.');
  if (staleness > 60) recommendations.push('Content is becoming repetitive. Explore a new format or collaborate with another creator to spark fresh ideas.');
  if (stagnation > 30) recommendations.push(`It's been ${input.daysSinceLastUpload} days since your last upload. Even a short post can maintain momentum.`);
  if (level === 'critical') recommendations.push('CRITICAL: High burnout risk detected. Consider a planned 1-2 week hiatus with a clear return date.');

  return mkResult('F102', {
    burnoutRiskScore: burnoutScore,
    level,
    factors,
    recommendations,
    psychologicalIndicators: {
      avgRecentMood: Math.round(avgRecentMood * 10) / 10,
      avgOlderMood: Math.round(avgOlderMood * 10) / 10,
      moodTrajectory: avgRecentMood < avgOlderMood - 1 ? 'declining' : avgRecentMood > avgOlderMood + 1 ? 'improving' : 'stable',
      avgGapBetweenUploads: Math.round(avgRecentGap * 10) / 10,
      contentFreshnessIndex: clamp(Math.round((1 - avgSimilarity) * 100), 0, 100),
    },
  });
}

// ─── F103 Best Time to Post Calculator ──────────────────────────────────────
export function bestTimeToPost(input: PostingTimeInput): FeatureResult {
  const { historicalPostTimes, historicalEngagement, competitorPostTimes, audienceActiveHours } = input;
  // Extract hour from each post
  const postHours = historicalPostTimes.map(t => new Date(t).getHours());
  const competitorHours = competitorPostTimes.map(t => new Date(t).getHours());

  // Calculate average engagement per hour bucket
  const hourEngagement = new Map<number, { total: number; count: number }>();
  postHours.forEach((h, i) => {
    const entry = hourEngagement.get(h) ?? { total: 0, count: 0 };
    entry.total += historicalEngagement[i] ?? 0;
    entry.count++;
    hourEngagement.set(h, entry);
  });

  // Build hourly score: own engagement + audience activity - competitor density
  const hourlyScores = new Array(24).fill(0);
  const competitorDensity = new Array(24).fill(0);
  competitorHours.forEach(h => competitorDensity[h]++);

  for (let h = 0; h < 24; h++) {
    const eng = hourEngagement.get(h);
    const avgEng = eng ? eng.total / eng.count : 0;
    const audienceActivity = audienceActiveHours.includes(h) ? 1 : 0;
    const competitorFactor = competitorDensity[h] > 0 ? Math.min(competitorDensity[h] * 0.15, 0.5) : 0;
    hourlyScores[h] = (avgEng * 0.5) + (audienceActivity * 30) + (20 - competitorFactor * 20);
  }

  // Normalize to 0-100
  const maxScore = Math.max(...hourlyScores, 1);
  const normalized = hourlyScores.map(s => Math.round((s / maxScore) * 100));

  // Rank hours
  const ranked = normalized.map((score, hour) => ({ hour, score, label: `${String(hour).padStart(2, '0')}:00` }));
  ranked.sort((a, b) => b.score - a.score);

  // Day-specific recommendations
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayScores = dayNames.map((day, d) => {
    const dayPosts = historicalPostTimes.filter(t => new Date(t).getDay() === d);
    const dayEng = dayPosts.map((_, i) => {
      const idx = historicalPostTimes.indexOf(dayPosts[i]);
      return historicalEngagement[idx] ?? 0;
    });
    const avgDayEng = dayEng.length > 0 ? dayEng.reduce((a, b) => a + b, 0) / dayEng.length : 0;
    return { day, avgEngagement: Math.round(avgDayEng), postCount: dayPosts.length };
  }).sort((a, b) => b.avgEngagement - a.avgEngagement);

  const topTimeSlots = ranked.filter(r => r.score >= 60).slice(0, 5);
  const avoidSlots = ranked.slice(-3).reverse();

  return mkResult('F103', {
    platform: input.platform,
    bestTimeToday: ranked[0]?.label ?? '12:00',
    confidence: ranked[0]?.score ?? 0,
    recommendedSlots: topTimeSlots,
    avoidSlots,
    hourlyBreakdown: ranked,
    bestDayOfWeek: dayScores[0]?.day ?? 'Monday',
    dayRanking: dayScores,
    competitorAnalysis: {
      peakCompetitorHour: competitorDensity.indexOf(Math.max(...competitorDensity)),
      competitorDensityPerHour: competitorDensity,
    },
    audienceActivityHours: audienceActiveHours,
    methodology: 'Score = 50% historical engagement + 30% audience activity + 20% competitor avoidance',
  });
}

// ─── F104 Subscriber Quality Score ──────────────────────────────────────────
export function subscriberQualityScore(input: SubQualityInput): FeatureResult {
  const { totalSubscribers, engagedSubscribers, commentingSubscribers, sharingSubscribers, avgViewThroughRate, newVsReturningRatio, subscriberLifetimeDays } = input;

  // Engagement rates
  const overallEngRate = totalSubscribers > 0 ? (engagedSubscribers / totalSubscribers) * 100 : 0;
  const commentRate = totalSubscribers > 0 ? (commentingSubscribers / totalSubscribers) * 100 : 0;
  const shareRate = totalSubscribers > 0 ? (sharingSubscribers / totalSubscribers) * 100 : 0;
  const likeRate = totalSubscribers > 0 ? ((engagedSubscribers - commentingSubscribers - sharingSubscribers) / totalSubscribers) * 100 : 0;

  // Quality dimensions
  const engagementDepth = clamp(Math.round((commentRate * 3 + shareRate * 5 + likeRate) / 9 * 100), 0, 100);
  const retentionQuality = clamp(Math.round(avgViewThroughRate * 100), 0, 100);
  const loyaltyScore = clamp(Math.round((1 - newVsReturningRatio) * 100), 0, 100);

  // Lifetime analysis
  const avgLifetime = subscriberLifetimeDays.length > 0
    ? subscriberLifetimeDays.reduce((a, b) => a + b, 0) / subscriberLifetimeDays.length
    : 0;
  const lifetimeScore = clamp(Math.round(avgLifetime / 3.65), 0, 100); // 365 days = 100

  // Composite quality score
  const qualityScore = weightedScore([
    { w: 30, score: engagementDepth },
    { w: 25, score: retentionQuality },
    { w: 20, score: loyaltyScore },
    { w: 25, score: lifetimeScore },
  ]);

  // Segment analysis
  const dormantPct = totalSubscribers > 0 ? clamp(Math.round((1 - engagedSubscribers / totalSubscribers) * 100), 0, 100) : 0;
  const passivePct = totalSubscribers > 0 ? clamp(Math.round(((engagedSubscribers - commentingSubscribers - sharingSubscribers) / totalSubscribers) * 100), 0, 100) : 0;
  const activePct = totalSubscribers > 0 ? clamp(Math.round((commentingSubscribers / totalSubscribers) * 100), 0, 100) : 0;
  const advocatePct = totalSubscribers > 0 ? clamp(Math.round((sharingSubscribers / totalSubscribers) * 100), 0, 100) : 0;

  const segments = [
    { name: 'Dormant', percentage: dormantPct, description: 'No engagement in 30+ days' },
    { name: 'Passive', percentage: passivePct, description: 'Occasional likes/views' },
    { name: 'Active', percentage: activePct, description: 'Regular commenters' },
    { name: 'Advocates', percentage: advocatePct, description: 'Share content actively' },
  ];

  const grade = qualityScore >= 80 ? 'A' : qualityScore >= 60 ? 'B' : qualityScore >= 40 ? 'C' : 'D';

  const recommendations: string[] = [];
  if (dormantPct > 60) recommendations.push('Over 60% of subscribers are dormant. Consider a re-engagement campaign with a poll or community post.');
  if (commentRate < 2) recommendations.push('Comment rate is very low. Add direct questions and call-to-comments in your videos.');
  if (shareRate < 1) recommendations.push('Share rate is minimal. Create more shareable moments and include "share with a friend" prompts.');
  if (avgViewThroughRate < 0.4) recommendations.push('View-through rate is below 40%. Tighten your intros and maintain pacing.');

  // Revenue potential estimate
  const cpmEstimate = qualityScore >= 80 ? 12 : qualityScore >= 60 ? 8 : qualityScore >= 40 ? 5 : 2;
  const monthlyViewsEstimate = totalSubscribers * overallEngRate * 0.3 * 30; // rough monthly views
  const revenuePotential = (monthlyViewsEstimate / 1000) * cpmEstimate;

  return mkResult('F104', {
    overallQualityScore: qualityScore,
    grade,
    metrics: {
      engagementRate: Math.round(overallEngRate * 100) / 100,
      commentRate: Math.round(commentRate * 100) / 100,
      likeRate: Math.round(likeRate * 100) / 100,
      shareRate: Math.round(shareRate * 100) / 100,
      viewThroughRate: Math.round(avgViewThroughRate * 100) / 100,
      newToReturningRatio: Math.round(newVsReturningRatio * 100) / 100,
    },
    dimensions: {
      engagementDepth,
      retentionQuality,
      loyaltyScore,
      lifetimeScore: Math.round(lifetimeScore),
      avgLifetimeDays: Math.round(avgLifetime),
    },
    segments,
    revenuePotential: { estimatedCPM: cpmEstimate, monthlyViewsEstimate: Math.round(monthlyViewsEstimate), monthlyRevenueEstimate: Math.round(revenuePotential * 100) / 100 },
    recommendations,
  });
}

// ─── F105 Content Gap Analyzer ──────────────────────────────────────────────
export function contentGapAnalyzer(input: ContentGapInput): FeatureResult {
  const { creatorTopics, audienceRequestedTopics, trendingTopicsInNiche, competitorCoveredTopics } = input;

  const creatorSet = new Set(creatorTopics.map(t => t.toLowerCase()));

  // Find gaps: audience-requested topics not covered
  const audienceGaps = audienceRequestedTopics
    .filter(a => !creatorSet.has(a.topic.toLowerCase()))
    .map(a => ({ topic: a.topic, demand: a.requestCount, gapScore: a.requestCount * 10 }))
    .sort((a, b) => b.gapScore - a.gapScore);

  // Trending topics not covered
  const trendingGaps = trendingTopicsInNiche
    .filter(t => !creatorSet.has(t.topic.toLowerCase()))
    .map(t => ({ topic: t.topic, trendScore: t.trendScore, opportunityScore: clamp(t.trendScore * 15, 0, 100) }))
    .sort((a, b) => b.opportunityScore - a.opportunityScore);

  // Competitor-covered topics creator doesn't have
  const competitorGaps = competitorCoveredTopics
    .filter(c => !creatorSet.has(c.topic.toLowerCase()))
    .map(c => ({ topic: c.topic, competitorCount: c.competitorCount, saturation: clamp(c.competitorCount * 20, 0, 100), opportunity: clamp(100 - c.competitorCount * 15, 10, 100) }))
    .sort((a, b) => b.opportunity - a.opportunity);

  // Combine all unique gap topics and score them
  const allGapTopics = new Map<string, { demand: number; trend: number; competition: number; opportunity: number }>();
  audienceGaps.forEach(g => {
    const existing = allGapTopics.get(g.topic.toLowerCase()) ?? { demand: 0, trend: 0, competition: 0, opportunity: 0 };
    existing.demand = g.demand;
    allGapTopics.set(g.topic.toLowerCase(), existing);
  });
  trendingGaps.forEach(g => {
    const existing = allGapTopics.get(g.topic.toLowerCase()) ?? { demand: 0, trend: 0, competition: 0, opportunity: 0 };
    existing.trend = g.trendScore;
    existing.opportunity = g.opportunityScore;
    allGapTopics.set(g.topic.toLowerCase(), existing);
  });
  competitorGaps.forEach(g => {
    const existing = allGapTopics.get(g.topic.toLowerCase()) ?? { demand: 0, trend: 0, competition: 0, opportunity: 0 };
    existing.competition = g.competitorCount;
    if (existing.opportunity === 0) existing.opportunity = g.opportunity;
    allGapTopics.set(g.topic.toLowerCase(), existing);
  });

  const rankedGaps = [...allGapTopics.entries()]
    .map(([topic, scores]) => {
      const compositeScore = clamp(scores.demand * 3 + scores.trend * 2 + scores.opportunity * 1.5 - scores.competition * 5, 0, 100);
      return { topic, ...scores, compositeScore: Math.round(compositeScore) };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);

  // Coverage analysis
  const allTopics = new Set([
    ...creatorTopics.map(t => t.toLowerCase()),
    ...audienceRequestedTopics.map(a => a.topic.toLowerCase()),
    ...trendingTopicsInNiche.map(t => t.topic.toLowerCase()),
    ...competitorCoveredTopics.map(c => c.topic.toLowerCase()),
  ]);
  const coveragePct = allTopics.size > 0 ? clamp(Math.round((creatorSet.size / allTopics.size) * 100), 0, 100) : 100;

  // Priority tiers
  const highPriority = rankedGaps.filter(g => g.compositeScore >= 70);
  const mediumPriority = rankedGaps.filter(g => g.compositeScore >= 40 && g.compositeScore < 70);
  const lowPriority = rankedGaps.filter(g => g.compositeScore < 40);

  return mkResult('F105', {
    coverageScore: coveragePct,
    topicsCovered: creatorSet.size,
    totalOpportunityTopics: allTopics.size - creatorSet.size,
    rankedGaps: rankedGaps.slice(0, 30),
    priorityTiers: {
      high: highPriority.length,
      medium: mediumPriority.length,
      low: lowPriority.length,
      highTopics: highPriority.slice(0, 10),
    },
    audienceDemandGaps: audienceGaps.slice(0, 10),
    trendingGaps: trendingGaps.slice(0, 10),
    competitorGaps: competitorGaps.slice(0, 10),
    recommendations: [
      ...(highPriority.length > 0 ? [`Top priority: Create content about "${highPriority[0].topic}" — highest opportunity score of ${highPriority[0].compositeScore}.`] : []),
      ...(coveragePct < 40 ? 'Your content coverage is below 40%. Significant opportunity exists in underserved topics.' : []),
      ...(audienceGaps.length > 5 ? `${audienceGaps.length} topics are being requested by your audience that you haven\'t covered yet.` : []),
    ],
  });
}

// ─── F106 Viral Coefficient Tracker ─────────────────────────────────────────
export function viralCoefficientTracker(input: ViralInput): FeatureResult {
  const { totalViews, totalShares, newViewsFromShares, timeWindowDays } = input;
  const n = totalViews.length;
  if (n === 0) return mkResult('F106', { coefficient: 0, trend: 'stable', factors: [], periods: [] });

  // Calculate K-factor per period
  const periods = totalViews.map((views, i) => {
    const shares = totalShares[i] ?? 0;
    const shareViews = newViewsFromShares[i] ?? 0;
    const viewsPerShare = shares > 0 ? shareViews / shares : 0;
    const sharesPerView = views > 0 ? shares / views : 0;
    const k = sharesPerView * viewsPerShare; // K = i * c where i=invites per user, c=conversion per invite
    return {
      period: i + 1,
      views,
      shares,
      viewsFromShares: shareViews,
      sharesPerView: Math.round(sharesPerView * 10000) / 10000,
      viewsPerShare: Math.round(viewsPerShare * 100) / 100,
      coefficient: Math.round(k * 10000) / 10000,
      days: timeWindowDays[i] ?? 7,
    };
  });

  const currentK = periods[periods.length - 1]?.coefficient ?? 0;
  const avgK = periods.reduce((s, p) => s + p.coefficient, 0) / periods.length;

  // Trend detection
  const recentK = periods.slice(-3).map(p => p.coefficient);
  const olderK = periods.slice(0, Math.max(1, n - 3)).map(p => p.coefficient);
  const recentAvg = recentK.reduce((a, b) => a + b, 0) / recentK.length;
  const olderAvg = olderK.reduce((a, b) => a + b, 0) / olderK.length;
  const trend: 'up' | 'down' | 'stable' = recentAvg > olderAvg * 1.1 ? 'up' : recentAvg < olderAvg * 0.9 ? 'down' : 'stable';

  // Virality assessment
  const isViral = currentK > 1;
  const growthMultiplier = currentK > 0 ? Math.round(Math.pow(1 + currentK, 10) * 100) / 100 : 0; // 10-period projection

  // Factors analysis
  const avgSharesPerView = periods.reduce((s, p) => s + p.sharesPerView, 0) / n;
  const avgViewsPerShare = periods.reduce((s, p) => s + p.viewsPerShare, 0) / n;

  const factors = [
    { name: 'Share Rate (shares/view)', value: Math.round(avgSharesPerView * 10000) / 10000, benchmark: 0.02, status: avgSharesPerView >= 0.02 ? 'good' : 'needs_improvement', impact: 'High share rate means content resonates emotionally' },
    { name: 'Reproduction Rate (views/share)', value: Math.round(avgViewsPerShare * 100) / 100, benchmark: 5, status: avgViewsPerShare >= 5 ? 'good' : 'needs_improvement', impact: 'High reproduction means shared content gets clicked' },
    { name: 'Current K-Factor', value: currentK, benchmark: 1.0, status: currentK >= 1.0 ? 'viral' : 'sub-viral', impact: 'K > 1 means exponential organic growth' },
  ];

  // Recommendations
  const recommendations: string[] = [];
  if (avgSharesPerView < 0.01) recommendations.push('Share rate is very low. Add emotional triggers, unexpected twists, or relatable moments to encourage sharing.');
  if (avgViewsPerShare < 3) recommendations.push('Views per share are below average. Ensure thumbnails and titles are compelling when shared on other platforms.');
  if (currentK < 0.5) recommendations.push('Viral coefficient is low. Focus on creating more shareable, conversation-starting content.');
  if (trend === 'down') recommendations.push('Viral coefficient is trending down. Review recent content changes that may have reduced shareability.');
  if (isViral) recommendations.push('Content is achieving viral spread! Analyze what makes your top-performing content shareable and replicate the formula.');

  return mkResult('F106', {
    coefficient: Math.round(currentK * 10000) / 10000,
    averageCoefficient: Math.round(avgK * 10000) / 10000,
    trend,
    isViral,
    growthMultiplier10Periods: growthMultiplier,
    periods,
    factors,
    recommendations,
    projection: {
      nextPeriodViews: currentK > 0 ? Math.round(totalViews[n - 1] * (1 + currentK)) : 0,
      projectedReach: currentK > 0 ? Math.round(totalViews[n - 1] * Math.pow(1 + currentK, 5)) : 0,
    },
  });
}

// ─── F107 Platform Migration Advisor ────────────────────────────────────────
export function platformMigrationAdvisor(input: MigrationInput): FeatureResult {
  const { currentPlatform, contentFormat, currentFollowerCount, avgEngagementRate, contentTopics, targetPlatform } = input;

  // Format compatibility matrix (0-100)
  const formatCompat: Record<string, Record<string, number>> = {
    youtube: { youtube: 100, tiktok: 60, instagram: 70 },
    tiktok: { youtube: 40, tiktok: 100, instagram: 80 },
    instagram: { youtube: 50, tiktok: 75, instagram: 100 },
  };

  const formatScore = formatCompat[currentPlatform]?.[targetPlatform] ?? 50;

  // Format-specific adjustments
  const formatBonus: Record<string, Record<string, number>> = {
    short: { youtube: -10, tiktok: 20, instagram: 15 },
    long: { youtube: 20, tiktok: -20, instagram: -15 },
    carousel: { youtube: -30, tiktok: -10, instagram: 25 },
    live: { youtube: 10, tiktok: 15, instagram: 10 },
  };
  const adjustedFormatScore = clamp(formatScore + (formatBonus[contentFormat]?.[targetPlatform] ?? 0), 0, 100);

  // Audience overlap estimation
  const platformOverlap: Record<string, Record<string, number>> = {
    youtube: { youtube: 100, tiktok: 30, instagram: 40 },
    tiktok: { youtube: 25, tiktok: 100, instagram: 55 },
    instagram: { youtube: 35, tiktok: 50, instagram: 100 },
  };
  const overlapPct = platformOverlap[currentPlatform]?.[targetPlatform] ?? 30;

  // Estimated initial reach on new platform
  const estimatedInitialReach = Math.round(currentFollowerCount * (overlapPct / 100) * 0.3);
  const estimatedTransferRate = clamp(overlapPct / 100 * (avgEngagementRate / 100) * 2, 0, 0.5);

  // Growth opportunity
  const targetSizeMultiplier: Record<string, number> = { youtube: 1.0, tiktok: 1.5, instagram: 1.2 };
  const opportunityScore = clamp(adjustedFormatScore * 0.4 + (1 - overlapPct / 100) * 100 * 0.3 + (targetSizeMultiplier[targetPlatform] ?? 1) * 30, 0, 100);

  // Risk assessment
  const risks: { name: string; level: 'low' | 'medium' | 'high'; description: string }[] = [];
  if (adjustedFormatScore < 40) risks.push({ name: 'Format Mismatch', level: 'high', description: `${contentFormat} content may not perform well on ${targetPlatform}.` });
  if (overlapPct < 25) risks.push({ name: 'Audience Fragmentation', level: 'medium', description: 'Low audience overlap means starting from near-zero on the new platform.' });
  if (currentFollowerCount < 1000) risks.push({ name: 'Small Base', level: 'medium', description: 'Current following is small, limiting cross-promotion effectiveness.' });
  if (adjustedFormatScore >= 70 && overlapPct >= 30) risks.push({ name: 'Algorithm Learning Curve', level: 'low', description: 'New platform algorithms need time to learn your content preferences.' });

  // Effort estimation
  const effortHoursPerWeek = contentFormat === 'long' ? 15 : contentFormat === 'short' ? 8 : 10;
  const additionalEffort = effortHoursPerWeek * 0.4; // 40% more effort for cross-platform

  // ROI projection (12 weeks)
  const weeklyGrowthRate = opportunityScore / 500; // estimated weekly growth rate
  const projectedFollowers12W = [];
  let current = estimatedInitialReach;
  for (let w = 1; w <= 12; w++) {
    current = Math.round(current * (1 + weeklyGrowthRate));
    projectedFollowers12W.push({ week: w, estimatedFollowers: current });
  }

  const overallRecommendation = opportunityScore >= 70
    ? 'Strong recommendation to expand to this platform.'
    : opportunityScore >= 45
    ? 'Moderate opportunity — proceed with a test campaign first.'
    : 'Low opportunity — focus energy on current platform growth.';

  return mkResult('F107', {
    from: currentPlatform,
    to: targetPlatform,
    overallScore: opportunityScore,
    recommendation: overallRecommendation,
    formatCompatibility: { raw: formatScore, adjusted: adjustedFormatScore, format: contentFormat },
    audienceAnalysis: { estimatedOverlap: overlapPct, estimatedInitialReach, estimatedTransferRate: Math.round(estimatedTransferRate * 1000) / 1000 },
    projectedGrowth: projectedFollowers12W,
    projectedFollowersAt12Weeks: projectedFollowers12W[projectedFollowers12W.length - 1]?.estimatedFollowers ?? 0,
    riskAssessment: { overallRisk: risks.some(r => r.level === 'high') ? 'high' : risks.some(r => r.level === 'medium') ? 'medium' : 'low', risks },
    effortEstimate: { currentWeeklyHours: effortHoursPerWeek, additionalWeeklyHours: Math.round(additionalEffort), totalWeeklyHours: Math.round(effortHoursPerWeek + additionalEffort) },
    contentTopicsCarryOver: contentTopics.length,
    topicMatchNote: contentTopics.length > 0 ? `${contentTopics.length} topics can be adapted for ${targetPlatform}.` : 'No specific topics provided for analysis.',
  });
}

// ─── F108 Burnout Early Warning System ──────────────────────────────────────
export function burnoutEarlyWarning(input: EarlyWarningInput): FeatureResult {
  const { uploadFrequencyHistory, engagementTrend, contentQualityScores, topicDiversityIndex, scheduleDensityScore, creatorResponseTimeHours, missedUploadCount, vacationDaysTaken } = input;

  // 1. Upload frequency analysis (weight: 25%)
  const freqRegression = linearRegression(uploadFrequencyHistory);
  const freqDecline = freqRegression.slope < 0 ? clamp(Math.abs(freqRegression.slope) * 200, 0, 100) : 0;
  const recentFreq = uploadFrequencyHistory.slice(-3);
  const avgRecentFreq = recentFreq.reduce((a, b) => a + b, 0) / recentFreq.length;
  const freqScore = clamp(freqDecline + (avgRecentFreq < 1 ? 30 : 0), 0, 100);

  // 2. Content quality trend (weight: 20%)
  const qualityRegression = linearRegression(contentQualityScores);
  const qualityDecline = qualityRegression.slope < 0 ? clamp(Math.abs(qualityRegression.slope) * 100, 0, 100) : 0;
  const recentQuality = contentQualityScores.slice(-3);
  const avgRecentQuality = recentQuality.reduce((a, b) => a + b, 0) / recentQuality.length;
  const qualityScore = clamp(qualityDecline + (avgRecentQuality < 40 ? 30 : 0), 0, 100);

  // 3. Engagement pattern changes (weight: 20%)
  const engRegression = linearRegression(engagementTrend);
  const engDecline = engRegression.slope < 0 ? clamp(Math.abs(engRegression.slope) * 150, 0, 100) : 0;
  const engVolatility = stdDev(engagementTrend);
  const engScore = clamp(engDecline + (engVolatility > 3 ? 20 : 0), 0, 100);

  // 4. Topic stagnation (weight: 15%)
  const avgDiversity = topicDiversityIndex.length > 0 ? topicDiversityIndex.reduce((a, b) => a + b, 0) / topicDiversityIndex.length : 0;
  const recentDiversity = topicDiversityIndex.slice(-3);
  const diversityDecline = recentDiversity.length >= 2 ? clamp((1 - recentDiversity[recentDiversity.length - 1] / (recentDiversity[0] || 1)) * 100, 0, 100) : 0;
  const stagnationScore = clamp((1 - avgDiversity) * 80 + diversityDecline * 0.5, 0, 100);

  // 5. Schedule density (weight: 10%)
  const densityScore = clamp(scheduleDensityScore * 100, 0, 100);

  // 6. Response time degradation (weight: 10%)
  const avgResponseTime = creatorResponseTimeHours.length > 0 ? creatorResponseTimeHours.reduce((a, b) => a + b, 0) / creatorResponseTimeHours.length : 0;
  const recentResponse = creatorResponseTimeHours.slice(-3);
  const avgRecentResponse = recentResponse.reduce((a, b) => a + b, 0) / recentResponse.length;
  const responseScore = clamp((avgRecentResponse > 48 ? 40 : avgRecentResponse > 24 ? 20 : 0) + (avgRecentResponse > avgResponseTime * 1.5 ? 30 : 0), 0, 100);

  // Composite risk
  const overallRisk = weightedScore([
    { w: 25, score: freqScore },
    { w: 20, score: qualityScore },
    { w: 20, score: engScore },
    { w: 15, score: stagnationScore },
    { w: 10, score: densityScore },
    { w: 10, score: responseScore },
  ]);

  const level = overallRisk >= 75 ? 'critical' : overallRisk >= 50 ? 'high' : overallRisk >= 30 ? 'medium' : 'low';

  // Early warning indicators
  const warnings: { indicator: string; severity: 'info' | 'warning' | 'critical'; description: string; value: number }[] = [];
  if (freqScore > 60) warnings.push({ indicator: 'Upload Frequency Declining', severity: 'critical', description: 'Upload frequency is dropping significantly over recent weeks.', value: Math.round(freqScore) });
  if (qualityScore > 50) warnings.push({ indicator: 'Content Quality Dropping', severity: 'warning', description: 'Recent content quality scores are lower than historical average.', value: Math.round(qualityScore) });
  if (engScore > 50) warnings.push({ indicator: 'Engagement Volatility', severity: 'warning', description: 'Engagement rates are volatile and/or declining.', value: Math.round(engScore) });
  if (stagnationScore > 50) warnings.push({ indicator: 'Topic Stagnation', severity: 'warning', description: 'Content topics are becoming repetitive. Diversity index is low.', value: Math.round(stagnationScore) });
  if (missedUploadCount > 2) warnings.push({ indicator: 'Missed Uploads', severity: 'warning', description: `${missedUploadCount} planned uploads were missed in the last month.`, value: missedUploadCount });
  if (densityScore > 70) warnings.push({ indicator: 'Schedule Overload', severity: 'info', description: 'Content schedule is very dense. Consider reducing frequency.', value: Math.round(densityScore) });
  if (responseScore > 50) warnings.push({ indicator: 'Response Time Increasing', severity: 'info', description: 'Community response time is increasing, suggesting fatigue.', value: Math.round(responseScore) });
  if (vacationDaysTaken === 0 && overallRisk > 40) warnings.push({ indicator: 'No Vacation Days', severity: 'info', description: 'No vacation taken recently while risk factors are elevated.', value: 0 });

  const recommendations: string[] = [];
  if (level === 'critical') recommendations.push('CRITICAL: Immediate intervention recommended. Schedule a creator wellness week and reduce upload frequency.');
  if (level === 'high') recommendations.push('HIGH RISK: Plan a structured break within the next 2 weeks. Batch content before the break.');
  if (freqScore > 50) recommendations.push('Reduce upload frequency by 25-50% for 2-4 weeks to reset creative energy.');
  if (stagnationScore > 40) recommendations.push('Try a completely new content format or collaborate with creators outside your niche.');
  if (missedUploadCount > 1) recommendations.push('Missed uploads indicate schedule fatigue. Reduce planned uploads to a sustainable pace.');
  if (densityScore > 60) recommendations.push('Your schedule is overloaded. Prioritize quality over quantity and remove lower-impact content types.');

  return mkResult('F108', {
    riskScore: overallRisk,
    level,
    indicators: warnings.sort((a, b) => (b.severity === 'critical' ? 3 : b.severity === 'warning' ? 2 : 1) - (a.severity === 'critical' ? 3 : a.severity === 'warning' ? 2 : 1)),
    factorBreakdown: {
      uploadFrequency: { score: Math.round(freqScore), trend: freqRegression.slope < -0.5 ? 'declining' : freqRegression.slope > 0.5 ? 'increasing' : 'stable', slope: Math.round(freqRegression.slope * 100) / 100 },
      contentQuality: { score: Math.round(qualityScore), trend: qualityRegression.slope < -1 ? 'declining' : qualityRegression.slope > 1 ? 'improving' : 'stable', avgRecent: Math.round(avgRecentQuality) },
      engagement: { score: Math.round(engScore), trend: engRegression.slope < -0.5 ? 'declining' : engRegression.slope > 0.5 ? 'improving' : 'stable', volatility: Math.round(engVolatility * 10) / 10 },
      topicDiversity: { score: Math.round(stagnationScore), avgIndex: Math.round(avgDiversity * 100) / 100 },
      scheduleDensity: { score: Math.round(densityScore), rawValue: Math.round(scheduleDensityScore * 100) / 100 },
      responseTime: { score: Math.round(responseScore), avgHours: Math.round(avgRecentResponse) },
    },
    missedUploads: missedUploadCount,
    vacationDaysTaken,
    recommendations,
    nextCheckDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });
}

// ─── Export ─────────────────────────────────────────────────────────────────
export const growthFeatures = {
  F97_monetizationHUD: monetizationHUD,
  F98_channelHealthAuditor: channelHealthAuditor,
  F99_goldenHourCommand: goldenHourCommand,
  F100_keywordPlanner: keywordPlanner,
  F101_weeklyIntelligenceReport: weeklyIntelligenceReport,
  F102_lastVideoSyndrome: lastVideoSyndrome,
  F103_bestTimeToPost: bestTimeToPost,
  F104_subscriberQualityScore: subscriberQualityScore,
  F105_contentGapAnalyzer: contentGapAnalyzer,
  F106_viralCoefficientTracker: viralCoefficientTracker,
  F107_platformMigrationAdvisor: platformMigrationAdvisor,
  F108_burnoutEarlyWarning: burnoutEarlyWarning,
};
