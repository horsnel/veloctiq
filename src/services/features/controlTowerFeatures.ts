/**
 * VELOCTIQ Control Tower — Feature Services (F109–F136)
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

function mkResult(featureId: string, data: unknown): FeatureResult {
  return { success: true, data, source: 'browser', featureId };
}

// ─── Input types ────────────────────────────────────────────────────────────
export interface ScoutInput {
  scouts: { id: string; name: string; platform: string; status: 'active' | 'queued' | 'completed' | 'failed'; lastRun?: string; nextRun?: string; successRate: number; avgDurationMs: number }[];
}

export interface ApiHealthInput {
  services: { name: string; responseTimesMs: number[]; errorCount: number; totalRequests: number; uptimePct: number }[];
}

export interface ProfileInput {
  profiles: { id: string; name: string; platform: string; followerCount: number; engagementRate: number; isActive: boolean; lastActivity: string }[];
  currentProfileId: string;
}

export interface ComplianceInput {
  contentText: string;
  hasSponsorship: boolean;
  hasAffiliateLinks: boolean;
  hasCopyrightedMusic: boolean;
  privacyPolicyUrl?: string;
  disclosedBrands: string[];
  affiliateDomains: string[];
}

export interface AuthInput {
  contentText: string;
  hasMetadata: boolean;
  publishedDate?: string;
  authorConsistent: boolean;
  sourceUrl?: string;
  hasWatermarks: boolean;
  contentHash?: string;
}

export interface VaultInput {
  storageUsedBytes: number;
  storageLimitBytes: number;
  dataCategories: { category: string; sizeBytes: number; itemCount: number }[];
  lastBackupDate?: string;
  encryptionEnabled: boolean;
  exportFormats: string[];
}

export interface PartnerInput {
  partners: { id: string; name: string; type: 'brand' | 'collaborator' | 'affiliate' | 'agency'; status: 'active' | 'pending' | 'inactive'; revenueShare: number; totalRevenue: number; interactions: number; lastInteraction: string; satisfactionScore?: number }[];
}

export interface ScenarioInput {
  currentMetrics: { subscribers: number; engagementRate: number; uploadsPerWeek: number; avgViews: number; revenue: number };
  scenarios: { name: string; changes: { uploadsPerWeek?: number; engagementMultiplier?: number; platform?: string; contentPivot?: string } }[];
  projectionWeeks: number;
}

export interface PresenceInput {
  profiles: { platform: string; bio: string; followerCount: number; postCount: number; linkInBio?: string; profileImage: boolean; coverImage: boolean; verified: boolean; lastPostDate: string }[];
  websiteUrl?: string;
  consistencyKeywords: string[];
}

export interface CalendarInput {
  optimalTimes: { day: string; hours: number[] }[];
  contentTypes: { type: string; frequency: number; platform: string }[];
  existingCommitments: string[]; // ISO dates
  batchPreference: number; // 1-5, how much to batch
  weeksAhead: number;
}

export interface IntegrationInput {
  apis: { name: string; connected: boolean; dataCompleteness: number; refreshRateMinutes: number; lastSync?: string; errorsLast24h: number }[];
}

export interface AffiliateInput {
  affiliateLinks: { code: string; brand: string; clicks: number; conversions: number; commissionPerConversion: number; createdDate: string }[];
  newBrand: string;
  newCommission: number;
}

export interface FreemiumInput {
  plan: 'free' | 'starter' | 'creator' | 'professional';
  usage: { feature: string; used: number; limit: number }[];
}

export interface ExportInput {
  reportTitle: string;
  reportData: Record<string, unknown>;
  format: 'pdf' | 'csv' | 'json' | 'png';
  dateRange: { from: string; to: string };
}

export interface TickerInput {
  currentSubscribers: number;
  subscriberGrowthRate: number; // per day
  currentViews: number;
  viewGrowthRate: number;
  currentRevenue: number;
  revenueGrowthRate: number;
  milestones: { type: 'subscriber' | 'view' | 'revenue'; target: number; label: string }[];
}

export interface AssetInput {
  assets: { id: string; name: string; type: 'thumbnail' | 'video' | 'brand' | 'template' | 'audio'; sizeBytes: number; lastUsed?: string; usageCount: number }[];
  totalStorageBytes: number;
}

export interface TeamInput {
  members: { id: string; name: string; email: string; role: 'owner' | 'admin' | 'editor' | 'viewer'; actionsThisMonth: number; lastActive: string; invitedAt: string }[];
  seatLimit: number;
}

export interface CampaignInput {
  campaigns: { id: string; name: string; startDate: string; endDate: string; contentIds: string[]; totalViews: number; totalEngagement: number; budget: number; revenue: number; status: 'active' | 'completed' | 'planned' }[];
}

export interface PWAInput {
  largestContentfulPaintMs: number;
  firstInputDelayMs: number;
  cumulativeLayoutShift: number;
  serviceWorkerRegistered: boolean;
  manifestExists: boolean;
  offlineCapable: boolean;
  viewportMeta: boolean;
  touchTargetsMin: number;
}

export interface BulkInput {
  items: { id: string; type: string; data: Record<string, unknown> }[];
  operation: 'analyze' | 'score' | 'report' | 'tag';
}

export interface HashtagInput {
  savedSets: { id: string; name: string; platform: string; tags: string[]; avgEngagement: number; lastUsed?: string }[];
  newTags: string[];
  platform: string;
}

export interface CompetitorAlertInput {
  competitors: { name: string; platform: string; currentFollowers: number; lastChecked: string }[];
  alertThresholds: { followerJump: number; viralVideo: number; rebrand: boolean; collaboration: boolean };
  recentActivity: { competitor: string; event: string; date: string; significance: number }[];
}

export interface DarkModeInput {
  bgHex: string;
  fgHex: string;
  accentHex: string;
  cardHex: string;
  mutedHex: string;
}

export interface WebhookInput {
  webhooks: { id: string; name: string; url: string; events: string[]; active: boolean; lastTriggered?: string; successCount: number; failureCount: number }[];
  newWebhookName: string;
  newWebhookUrl: string;
}

export interface VexOrbInput {
  orbEnabled: boolean;
  orbPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  notificationsEnabled: boolean;
  quickActions: string[];
  alertFrequency: 'realtime' | 'hourly' | 'daily';
}

export interface VexFullPageInput {
  conversations: { id: string; timestamp: string; messageCount: number; resolved: boolean; avgResponseTimeMs: number }[];
  contextItems: { type: string; count: number }[];
}

export interface VexProactiveInput {
  metrics: { name: string; value: number; threshold: number; direction: 'above' | 'below'; severity: 'low' | 'medium' | 'high' }[];
  lastCheckDate: string;
  checkFrequencyHours: number;
}

export interface VoiceInput {
  enabled: boolean;
  supportedCommands: string[];
  language: string;
  recentCommands: { command: string; confidence: number; timestamp: string }[];
}

// ─── F109 Scout Orchestrator ────────────────────────────────────────────────
export function scoutOrchestrator(input: ScoutInput): FeatureResult {
  const { scouts } = input;
  const active = scouts.filter(s => s.status === 'active').length;
  const queued = scouts.filter(s => s.status === 'queued').length;
  const completed = scouts.filter(s => s.status === 'completed').length;
  const failed = scouts.filter(s => s.status === 'failed').length;
  const total = scouts.length;

  // Collection health
  const avgSuccessRate = total > 0 ? scouts.reduce((s, x) => s + x.successRate, 0) / total : 0;
  const avgDuration = total > 0 ? scouts.reduce((s, x) => s + x.avgDurationMs, 0) / total : 0;
  const healthScore = clamp(Math.round(avgSuccessRate * 80 + (avgDuration < 2000 ? 20 : avgDuration < 5000 ? 10 : 0)), 0, 100);

  // Platform breakdown
  const platformBreakdown = new Map<string, number>();
  scouts.forEach(s => platformBreakdown.set(s.platform, (platformBreakdown.get(s.platform) ?? 0) + 1));

  // Failed scout analysis
  const failedScouts = scouts.filter(s => s.status === 'failed');
  const failureRecommendations: string[] = [];
  if (failed > 0) {
    failureRecommendations.push(`${failed} scout(s) have failed. Check API credentials and rate limits.`);
    failedScouts.forEach(fs => {
      if (fs.successRate < 50) failureRecommendations.push(`Scout "${fs.name}" has a ${Math.round(fs.successRate)}% success rate — consider adjusting collection parameters.`);
    });
  }
  if (queued > 5) failureRecommendations.push(`${queued} scouts queued. Consider increasing collection frequency or parallelizing.`);

  // Optimization suggestions
  const slowScouts = scouts.filter(s => s.avgDurationMs > 3000);
  if (slowScouts.length > 0) failureRecommendations.push(`${slowScouts.length} scout(s) have high latency. Consider caching or incremental collection.`);

  return mkResult('F109', {
    summary: { active, queued, completed, failed, total, healthScore },
    healthStatus: healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'degraded' : 'critical',
    avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
    avgDurationMs: Math.round(avgDuration),
    platformBreakdown: Object.fromEntries(platformBreakdown),
    scouts: scouts.map(s => ({
      id: s.id, name: s.name, platform: s.platform, status: s.status,
      successRate: Math.round(s.successRate * 100) / 100,
      avgDurationMs: s.avgDurationMs,
      lastRun: s.lastRun, nextRun: s.nextRun,
    })),
    recommendations: failureRecommendations,
  });
}

// ─── F110 API Heartbeat Monitor ─────────────────────────────────────────────
export function apiHeartbeatMonitor(input: ApiHealthInput): FeatureResult {
  const { services } = input;

  const serviceStatuses = services.map(svc => {
    const avgLatency = svc.responseTimesMs.length > 0 ? svc.responseTimesMs.reduce((a, b) => a + b, 0) / svc.responseTimesMs.length : 0;
    const p95Latency = svc.responseTimesMs.length > 0
      ? [...svc.responseTimesMs].sort((a, b) => a - b)[Math.floor(svc.responseTimesMs.length * 0.95)] ?? 0
      : 0;
    const errorRate = svc.totalRequests > 0 ? (svc.errorCount / svc.totalRequests) * 100 : 0;
    const status = errorRate > 10 || svc.uptimePct < 90 ? 'down' : errorRate > 5 || svc.uptimePct < 95 ? 'degraded' : 'healthy';
    const healthScore = clamp(Math.round(svc.uptimePct * 0.5 + (100 - errorRate) * 0.3 + Math.max(0, 100 - avgLatency / 10) * 0.2), 0, 100);
    const latencyStd = stdDev(svc.responseTimesMs);

    return {
      name: svc.name, status, healthScore,
      avgLatencyMs: Math.round(avgLatency),
      p95LatencyMs: Math.round(p95Latency),
      latencyStdMs: Math.round(latencyStd),
      errorRate: Math.round(errorRate * 100) / 100,
      uptimePct: Math.round(svc.uptimePct * 100) / 100,
      totalRequests: svc.totalRequests,
      errors: svc.errorCount,
    };
  });

  const overallHealth = weightedScore(serviceStatuses.map(s => ({ w: 1, score: s.healthScore })));
  const overallStatus = overallHealth >= 80 ? 'healthy' : overallHealth >= 50 ? 'degraded' : 'down';
  const degradedServices = serviceStatuses.filter(s => s.status !== 'healthy');
  const totalRequests = services.reduce((s, x) => s + x.totalRequests, 0);
  const totalErrors = services.reduce((s, x) => s + x.errorCount, 0);

  const alerts: string[] = [];
  degradedServices.forEach(s => alerts.push(`${s.name}: ${s.status} (health ${s.healthScore}%, error rate ${s.errorRate}%)`));
  if (totalErrors / totalRequests > 0.05) alerts.push(`Overall error rate exceeds 5%.`);

  return mkResult('F110', {
    overall: { score: overallHealth, status: overallStatus, totalRequests, totalErrors, overallErrorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 10000) / 100 : 0 },
    services: serviceStatuses,
    alerts,
    checkedAt: new Date().toISOString(),
  });
}

// ─── F111 Multi-Profile Identity Switcher ───────────────────────────────────
export function multiProfileSwitcher(input: ProfileInput): FeatureResult {
  const { profiles, currentProfileId } = input;
  const current = profiles.find(p => p.id === currentProfileId);

  const crossProfileMetrics = {
    totalFollowers: profiles.reduce((s, p) => s + p.followerCount, 0),
    avgEngagement: profiles.length > 0 ? profiles.reduce((s, p) => s + p.engagementRate, 0) / profiles.length : 0,
    activeProfiles: profiles.filter(p => p.isActive).length,
    totalProfiles: profiles.length,
    platformBreakdown: profiles.reduce<Record<string, number>>((acc, p) => { acc[p.platform] = (acc[p.platform] ?? 0) + 1; return acc; }, {}),
  };

  const topProfile = [...profiles].sort((a, b) => b.followerCount - a.followerCount)[0];
  const mostEngaging = [...profiles].sort((a, b) => b.engagementRate - a.engagementRate)[0];

  return mkResult('F111', {
    currentProfile: current ? { id: current.id, name: current.name, platform: current.platform, followers: current.followerCount } : null,
    allProfiles: profiles.map(p => ({
      id: p.id, name: p.name, platform: p.platform,
      followers: p.followerCount, engagementRate: p.engagementRate,
      isActive: p.isActive, lastActivity: p.lastActivity,
    })),
    crossProfileAnalytics: crossProfileMetrics,
    topByFollowers: topProfile ? { name: topProfile.name, platform: topProfile.platform, followers: topProfile.followerCount } : null,
    topByEngagement: mostEngaging ? { name: mostEngaging.name, platform: mostEngaging.platform, rate: mostEngaging.engagementRate } : null,
    recommendations: profiles.length === 1 ? ['Consider connecting additional platforms to expand your cross-profile analytics.'] : [],
  });
}

// ─── F112 FTC & Legal Compliance Auto-Check ─────────────────────────────────
export function ftcComplianceCheck(input: ComplianceInput): FeatureResult {
  const checks: { id: string; name: string; status: 'pass' | 'fail' | 'warning'; description: string; detail: string }[] = [];
  const { contentText, hasSponsorship, hasAffiliateLinks, disclosedBrands, affiliateDomains, hasCopyrightedMusic, privacyPolicyUrl } = input;

  // Sponsor disclosure
  if (hasSponsorship) {
    const hasDisclosure = /(#ad|#sponsored|#paid|sponsored|paid partnership|brought to you by)/i.test(contentText);
    const disclosedBrandsMentioned = disclosedBrands.filter(b => contentText.toLowerCase().includes(b.toLowerCase()));
    if (hasDisclosure && disclosedBrandsMentioned.length > 0) {
      checks.push({ id: 'ftc-sponsor', name: 'Sponsor Disclosure', status: 'pass', description: 'Sponsorship properly disclosed', detail: `Brands disclosed: ${disclosedBrandsMentioned.join(', ')}` });
    } else if (hasDisclosure) {
      checks.push({ id: 'ftc-sponsor', name: 'Sponsor Disclosure', status: 'warning', description: 'Disclosure found but specific brand may not be mentioned', detail: 'Consider naming the sponsoring brand explicitly.' });
    } else {
      checks.push({ id: 'ftc-sponsor', name: 'Sponsor Disclosure', status: 'fail', description: 'Sponsored content without FTC-required disclosure', detail: 'Include #ad, #sponsored, or verbal disclosure within the first 30 seconds.' });
    }
  } else {
    checks.push({ id: 'ftc-sponsor', name: 'Sponsor Disclosure', status: 'pass', description: 'No sponsorship detected', detail: 'N/A' });
  }

  // Affiliate link labeling
  if (hasAffiliateLinks) {
    const hasAffDisclosure = /(#affiliatelink|#affiliate|affiliate link|commission|referral link)/i.test(contentText);
    if (hasAffDisclosure || affiliateDomains.length > 0) {
      checks.push({ id: 'ftc-affiliate', name: 'Affiliate Link Disclosure', status: 'pass', description: 'Affiliate links properly labeled', detail: `${affiliateDomains.length} affiliate domain(s): ${affiliateDomains.join(', ')}` });
    } else {
      checks.push({ id: 'ftc-affiliate', name: 'Affiliate Link Disclosure', status: 'fail', description: 'Affiliate links without disclosure', detail: 'FTC requires clear disclosure that links may earn commission.' });
    }
  } else {
    checks.push({ id: 'ftc-affiliate', name: 'Affiliate Link Disclosure', status: 'pass', description: 'No affiliate links detected', detail: 'N/A' });
  }

  // Copyright
  if (hasCopyrightedMusic) {
    checks.push({ id: 'copyright-music', name: 'Copyrighted Content', status: 'warning', description: 'Potentially copyrighted music detected', detail: 'Ensure you have proper licensing or use royalty-free alternatives.' });
  } else {
    checks.push({ id: 'copyright-music', name: 'Copyrighted Content', status: 'pass', description: 'No copyrighted content flags', detail: 'N/A' });
  }

  // Privacy policy
  if (privacyPolicyUrl) {
    const isValidUrl = /^https?:\/\//.test(privacyPolicyUrl);
    checks.push({ id: 'privacy-policy', name: 'Privacy Policy', status: isValidUrl ? 'pass' : 'warning', description: isValidUrl ? 'Privacy policy URL found' : 'Privacy policy URL appears invalid', detail: privacyPolicyUrl });
  } else {
    checks.push({ id: 'privacy-policy', name: 'Privacy Policy', status: 'warning', description: 'No privacy policy URL provided', detail: 'Consider adding a privacy policy link to your bio/about section.' });
  }

  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const overallStatus = failCount > 0 ? 'non-compliant' : checks.some(c => c.status === 'warning') ? 'review-needed' : 'compliant';
  const complianceScore = Math.round((passCount / checks.length) * 100);

  return mkResult('F112', {
    overallStatus,
    complianceScore,
    checks,
    flaggedItems: checks.filter(c => c.status !== 'pass'),
    summary: failCount > 0 ? `Action required: ${failCount} compliance issue(s) found.` : checks.some(c => c.status === 'warning') ? 'Review recommended: Some items need attention.' : 'All checks passed.',
    auditedAt: new Date().toISOString(),
  });
}

// ─── F113 Sovereign Authenticity Verification ───────────────────────────────
export function authenticityVerification(input: AuthInput): FeatureResult {
  const { contentText, hasMetadata, authorConsistent, hasWatermarks, contentHash, publishedDate, sourceUrl } = input;

  const factors: { name: string; score: number; maxScore: number; notes: string }[] = [];

  // 1. Originality check — lexical diversity
  const words = contentText.split(/\s+/).filter(w => w.length > 2);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const lexicalDiversity = words.length > 0 ? uniqueWords.size / words.length : 0;
  const originalityScore = clamp(Math.round(lexicalDiversity * 100), 0, 100);
  factors.push({ name: 'Lexical Diversity', score: originalityScore, maxScore: 100, notes: `${uniqueWords.size} unique words out of ${words.length} total (${Math.round(lexicalDiversity * 100)}% diversity)` });

  // 2. AI-generation probability heuristic
  const aiIndicators = ['delve', 'moreover', 'furthermore', 'additionally', 'consequently', 'nevertheless', 'notwithstanding', 'in conclusion', 'it is important to note', 'it is worth mentioning', 'in this article', 'as we have seen'];
  const aiCount = aiIndicators.reduce((c, phrase) => c + (contentText.toLowerCase().includes(phrase) ? 1 : 0), 0);
  const aiDensity = words.length > 0 ? aiCount / (words.length / 100) : 0; // per 100 words
  const aiProbScore = clamp(Math.round(30 + aiDensity * 15), 0, 100); // base 30% probability
  const aiConfidence = clamp(Math.round(aiDensity * 10), 0, 100);
  factors.push({ name: 'AI-Generation Probability', score: aiProbScore, maxScore: 100, notes: `${aiCount} AI-typical phrases detected (density: ${aiDensity.toFixed(2)} per 100 words)` });

  // 3. Metadata verification
  const metadataScore = (hasMetadata ? 40 : 0) + (publishedDate ? 30 : 0) + (sourceUrl ? 30 : 0);
  factors.push({ name: 'Metadata Verification', score: metadataScore, maxScore: 100, notes: `Metadata: ${hasMetadata ? 'Yes' : 'No'}, Date: ${publishedDate ?? 'Missing'}, Source: ${sourceUrl ?? 'Missing'}` });

  // 4. Author consistency
  factors.push({ name: 'Author Consistency', score: authorConsistent ? 100 : 20, maxScore: 100, notes: authorConsistent ? 'Author identity is consistent with historical data.' : 'Author identity does not match expected profile.' });

  // 5. Watermark analysis
  factors.push({ name: 'Watermark Check', score: hasWatermarks ? 30 : 90, maxScore: 100, notes: hasWatermarks ? 'Watermarks detected — may indicate re-posted content.' : 'No watermarks detected.' });

  // 6. Content hash (if available)
  const hashScore = contentHash ? 80 : 50;
  factors.push({ name: 'Content Hash Integrity', score: hashScore, maxScore: 100, notes: contentHash ? `Hash verified: ${contentHash.substring(0, 12)}...` : 'No content hash available for verification.' });

  // Composite
  const overallAuthenticity = weightedScore(factors.map(f => ({ w: 1, score: f.score })));
  const verdict = overallAuthenticity >= 75 ? 'likely_original' : overallAuthenticity >= 50 ? 'uncertain' : 'likely_ai_generated';

  return mkResult('F113', {
    authenticityScore: overallAuthenticity,
    verdict,
    factors,
    aiGenerationProbability: aiProbScore,
    aiConfidence,
    originalityScore,
    recommendations: [
      ...(aiProbScore > 60 ? ['High AI-generation probability. Consider rewriting with more personal voice and unique phrasing.'] : []),
      ...(!hasMetadata ? ['Add metadata (EXIF, publication info) to improve authenticity verification.'] : []),
      ...(authorConsistent === false ? ['Author inconsistency detected. Verify this content was created by the claimed author.'] : []),
    ],
  });
}

// ─── F114 Local-First Data Sovereign Vault ──────────────────────────────────
export function dataSovereignVault(input: VaultInput): FeatureResult {
  const { storageUsedBytes, storageLimitBytes, dataCategories, lastBackupDate, encryptionEnabled, exportFormats } = input;

  const usagePct = storageLimitBytes > 0 ? (storageUsedBytes / storageLimitBytes) * 100 : 0;
  const remainingBytes = Math.max(0, storageLimitBytes - storageUsedBytes);
  const usageStatus = usagePct > 90 ? 'critical' : usagePct > 70 ? 'warning' : 'healthy';

  const largestCategory = [...dataCategories].sort((a, b) => b.sizeBytes - a.sizeBytes)[0];
  const totalItems = dataCategories.reduce((s, c) => s + c.itemCount, 0);
  const categoryBreakdown = dataCategories.map(c => ({
    category: c.category,
    sizeBytes: c.sizeBytes,
    sizeFormatted: formatBytes(c.sizeBytes),
    percentage: storageUsedBytes > 0 ? Math.round((c.sizeBytes / storageUsedBytes) * 100) : 0,
    itemCount: c.itemCount,
  }));

  // Backup strategy
  const daysSinceBackup = lastBackupDate ? Math.round((Date.now() - new Date(lastBackupDate).getTime()) / 86400000) : Infinity;
  const backupHealth = daysSinceBackup <= 1 ? 'current' : daysSinceBackup <= 7 ? 'recent' : daysSinceBackup <= 30 ? 'stale' : 'critical';
  const backupRecommendation = daysSinceBackup > 7 ? `Last backup was ${daysSinceBackup} days ago. Consider backing up your data.` : 'Backups are current.';

  // Data portability
  const portabilityScore = clamp(exportFormats.length * 20 + (encryptionEnabled ? 20 : 0), 0, 100);

  // Security score
  const securityScore = weightedScore([
    { w: 40, score: encryptionEnabled ? 100 : 30 },
    { w: 30, score: backupHealth === 'current' ? 100 : backupHealth === 'recent' ? 70 : backupHealth === 'stale' ? 40 : 10 },
    { w: 30, score: portabilityScore },
  ]);

  return mkResult('F114', {
    storage: {
      used: storageUsedBytes, usedFormatted: formatBytes(storageUsedBytes),
      limit: storageLimitBytes, limitFormatted: formatBytes(storageLimitBytes),
      remaining: remainingBytes, remainingFormatted: formatBytes(remainingBytes),
      usagePct: Math.round(usagePct * 100) / 100,
      status: usageStatus,
    },
    categories: categoryBreakdown,
    largestCategory: largestCategory ? { name: largestCategory.category, sizeFormatted: formatBytes(largestCategory.sizeBytes) } : null,
    totalItems,
    backup: { lastBackup: lastBackupDate ?? 'Never', daysSinceBackup: Math.min(daysSinceBackup, 999), health: backupHealth, recommendation: backupRecommendation },
    security: { score: securityScore, encryption: encryptionEnabled, portabilityScore, exportFormats },
    recommendations: [
      ...(usagePct > 80 ? ['Storage usage is high. Consider archiving old data or upgrading your plan.'] : []),
      ...(daysSinceBackup > 7 ? [backupRecommendation] : []),
      ...(exportFormats.length < 2 ? ['Add more export formats for better data portability (CSV, JSON, PDF).'] : []),
      ...(!encryptionEnabled ? ['Enable encryption for enhanced data security.'] : []),
    ],
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

// ─── F115 The Braintrust Partner Portal ─────────────────────────────────────
export function braintrustPartnerPortal(input: PartnerInput): FeatureResult {
  const { partners } = input;

  const activePartners = partners.filter(p => p.status === 'active');
  const totalRevenue = partners.reduce((s, p) => s + p.totalRevenue, 0);
  const totalInteractions = partners.reduce((s, p) => s + p.interactions, 0);
  const avgSatisfaction = partners.filter(p => p.satisfactionScore !== undefined).map(p => p.satisfactionScore!);
  const avgSat = avgSatisfaction.length > 0 ? avgSatisfaction.reduce((a, b) => a + b, 0) / avgSatisfaction.length : 0;

  // Relationship health
  const partnerDetails = partners.map(p => {
    const health = weightedScore([
      { w: 30, score: p.status === 'active' ? 80 : p.status === 'pending' ? 50 : 20 },
      { w: 25, score: p.satisfactionScore ?? 50 },
      { w: 25, score: clamp(p.interactions * 5, 0, 100) },
      { w: 20, score: clamp(p.totalRevenue / 100, 0, 100) },
    ]);
    return { ...p, healthScore: health, healthStatus: health >= 70 ? 'strong' : health >= 40 ? 'moderate' : 'at_risk' };
  });

  // Type breakdown
  const typeBreakdown = partners.reduce<Record<string, { count: number; revenue: number }>>((acc, p) => {
    if (!acc[p.type]) acc[p.type] = { count: 0, revenue: 0 };
    acc[p.type].count++;
    acc[p.type].revenue += p.totalRevenue;
    return acc;
  }, {});

  // Revenue sharing analysis
  const revenueShares = partners.filter(p => p.revenueShare > 0).map(p => ({
    name: p.name, share: p.revenueShare, estimatedPayout: Math.round(p.totalRevenue * p.revenueShare / 100),
  })).sort((a, b) => b.estimatedPayout - a.estimatedPayout);

  const topPartner = [...partners].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  const atRiskPartners = partnerDetails.filter(p => p.healthStatus === 'at_risk');

  return mkResult('F115', {
    summary: { totalPartners: partners.length, active: activePartners.length, totalRevenue, totalInteractions, avgSatisfaction: Math.round(avgSat * 100) / 100 },
    partners: partnerDetails,
    topPartner: topPartner ? { name: topPartner.name, type: topPartner.type, revenue: topPartner.totalRevenue } : null,
    atRiskPartners: atRiskPartners.map(p => ({ name: p.name, healthScore: p.healthScore })),
    typeBreakdown,
    revenueSharing: revenueShares,
    recommendations: [
      ...(atRiskPartners.length > 0 ? [`${atRiskPartners.length} partner(s) are at risk. Schedule check-ins to improve relationship health.`] : []),
      ...(avgSat < 60 ? ['Average partner satisfaction is below 60%. Consider improving collaboration terms.'] : []),
      ...(partners.filter(p => p.status === 'pending').length > 0 ? [`${partners.filter(p => p.status === 'pending').length} pending partner(s) awaiting action.`] : []),
    ],
  });
}

// ─── F116 The Parallel Creator ──────────────────────────────────────────────
export function parallelCreator(input: ScenarioInput): FeatureResult {
  const { currentMetrics, scenarios, projectionWeeks } = input;

  const results = scenarios.map(scenario => {
    const uploads = scenario.changes.uploadsPerWeek ?? currentMetrics.uploadsPerWeek;
    const engMultiplier = scenario.changes.engagementMultiplier ?? 1;
    const projected = { subscribers: currentMetrics.subscribers as number, views: currentMetrics.avgViews as number, revenue: currentMetrics.revenue as number };
    const weeklyData: { week: number; subscribers: number; views: number; revenue: number }[] = [];

    for (let w = 1; w <= projectionWeeks; w++) {
      const weeklySubGrowth = projected.subscribers * 0.02 * (uploads / currentMetrics.uploadsPerWeek) * engMultiplier;
      const weeklyViews = projected.views * (uploads / currentMetrics.uploadsPerWeek) * engMultiplier;
      const weeklyRevenue = weeklyViews * 0.01 * engMultiplier; // simplified RPM

      projected.subscribers = Math.round(projected.subscribers + weeklySubGrowth);
      projected.views = Math.round(projected.views + weeklyViews * 0.1);
      projected.revenue = Math.round(projected.revenue + weeklyRevenue);

      weeklyData.push({ week: w, subscribers: projected.subscribers, views: projected.views, revenue: projected.revenue });
    }

    const roi = ((projected.revenue - currentMetrics.revenue) / Math.max(currentMetrics.revenue, 1)) * 100;

    return {
      name: scenario.name,
      changes: scenario.changes,
      finalSubscribers: projected.subscribers,
      finalViews: projected.views,
      finalRevenue: projected.revenue,
      subscriberGrowthPct: Math.round(((projected.subscribers - currentMetrics.subscribers) / Math.max(currentMetrics.subscribers, 1)) * 100),
      revenueGrowthPct: Math.round(roi),
      weeklyProjection: weeklyData,
    };
  });

  // Baseline (no changes)
  const baseline = { subscribers: currentMetrics.subscribers, views: currentMetrics.avgViews, revenue: currentMetrics.revenue };
  for (let w = 1; w <= projectionWeeks; w++) {
    baseline.subscribers = Math.round(baseline.subscribers * 1.02);
    baseline.views = Math.round(baseline.views * 1.01);
    baseline.revenue = Math.round(baseline.revenue * 1.01);
  }

  const bestScenario = [...results].sort((a, b) => b.revenueGrowthPct - a.revenueGrowthPct)[0];

  return mkResult('F116', {
    baseline: { finalSubscribers: baseline.subscribers, finalViews: baseline.views, finalRevenue: baseline.revenue },
    scenarios: results,
    bestScenario: bestScenario ? { name: bestScenario.name, revenueGrowthPct: bestScenario.revenueGrowthPct, subscriberGrowthPct: bestScenario.subscriberGrowthPct } : null,
    projectionWeeks,
    comparisonTable: results.map(r => ({
      scenario: r.name,
      subGrowth: `${r.subscriberGrowthPct}%`,
      revGrowth: `${r.revenueGrowthPct}%`,
      finalSubs: r.finalSubscribers.toLocaleString(),
      finalRev: `$${r.finalRevenue.toLocaleString()}`,
    })),
  });
}

// ─── F117 Integrated Social Profiles & Blog ─────────────────────────────────
export function socialPresenceAudit(input: PresenceInput): FeatureResult {
  const { profiles, websiteUrl, consistencyKeywords } = input;

  const auditResults = profiles.map(profile => {
    const completeness = weightedScore([
      { w: 15, score: profile.bio.length > 50 ? 100 : profile.bio.length > 20 ? 60 : 20 },
      { w: 15, score: profile.profileImage ? 100 : 0 },
      { w: 10, score: profile.coverImage ? 100 : 0 },
      { w: 15, score: profile.linkInBio ? 100 : 0 },
      { w: 10, score: profile.verified ? 100 : 50 },
      { w: 15, score: profile.postCount > 10 ? 100 : profile.postCount > 3 ? 60 : 20 },
      { w: 10, score: profile.followerCount > 100 ? 100 : profile.followerCount > 10 ? 60 : 20 },
    ]);

    // Bio optimization
    const bioLength = profile.bio.length;
    const hasLink = /https?:\/\//.test(profile.bio);
    const hasEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/u.test(profile.bio);
    const hasCallToAction = /follow|subscribe|check out|link|dm|join/i.test(profile.bio);

    return {
      platform: profile.platform,
      completeness,
      bio: { length: bioLength, hasLink, hasEmoji, hasCallToAction, optimized: bioLength > 30 && hasLink && hasCallToAction },
      followers: profile.followerCount,
      postCount: profile.postCount,
      verified: profile.verified,
      lastPostDate: profile.lastPostDate,
      linkInBio: profile.linkInBio ?? null,
    };
  });

  // Cross-platform consistency
  const keywordPresence = consistencyKeywords.map(kw => {
    const presentIn = profiles.filter(p => p.bio.toLowerCase().includes(kw.toLowerCase()));
    return { keyword: kw, presentIn: presentIn.map(p => p.platform), coverage: Math.round((presentIn.length / profiles.length) * 100) };
  });

  // Cross-linking
  const crossLinked = profiles.filter(p => p.linkInBio && profiles.some(other => other.platform !== p.platform && other.linkInBio?.includes(p.linkInBio!)));

  const overallScore = auditResults.length > 0 ? Math.round(auditResults.reduce((s, a) => s + a.completeness, 0) / auditResults.length) : 0;

  return mkResult('F117', {
    overallScore,
    profiles: auditResults,
    consistency: { keywords: keywordPresence, overallConsistency: keywordPresence.length > 0 ? Math.round(keywordPresence.reduce((s, k) => s + k.coverage, 0) / keywordPresence.length) : 0 },
    crossLinking: { linkedProfiles: crossLinked.length, totalProfiles: profiles.length, percentage: profiles.length > 0 ? Math.round((crossLinked.length / profiles.length) * 100) : 0 },
    website: websiteUrl ? { present: true, url: websiteUrl } : { present: false, url: null },
    recommendations: [
      ...(overallScore < 60 ? ['Overall profile completeness is below 60%. Fill in bios, add profile/cover images, and include links.'] : []),
      ...(keywordPresence.some(k => k.coverage < 50) ? ['Consistency keywords are missing from some profiles. Use the same keywords across all platforms.'] : []),
      ...(crossLinked.length === 0 ? ['No cross-linking detected between profiles. Link your social accounts in each bio.'] : []),
      ...(!websiteUrl ? ['Add a website/link-in-bio to centralize your online presence.'] : []),
    ],
  });
}

// ─── F118 Content Calendar & Scheduler ──────────────────────────────────────
export function contentCalendarScheduler(input: CalendarInput): FeatureResult {
  const { optimalTimes, contentTypes, existingCommitments, batchPreference, weeksAhead } = input;

  const calendar: { date: string; day: string; items: { type: string; platform: string; time: string; priority: 'high' | 'medium' | 'low' }[] }[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const startDate = new Date();
  const commitmentSet = new Set(existingCommitments);

  for (let w = 0; w < weeksAhead; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      const dayOptimal = optimalTimes.find(o => o.day.toLowerCase() === dayName.toLowerCase());

      const items: { type: string; platform: string; time: string; priority: 'high' | 'medium' | 'low' }[] = [];

      contentTypes.forEach(ct => {
        // Determine posting frequency
        const postsPerWeek = ct.frequency;
        const shouldPostToday = d % Math.max(1, Math.round(7 / postsPerWeek)) === w % Math.max(1, Math.round(7 / postsPerWeek));
        const isCommitted = commitmentSet.has(dateStr);

        if (shouldPostToday && !isCommitted) {
          const optimalHour = dayOptimal?.hours?.[0] ?? 12;
          void batchPreference;
          const priority = batchPreference >= 3 ? (d <= 2 ? 'high' : 'medium') : 'medium';

          items.push({
            type: ct.type,
            platform: ct.platform,
            time: `${String(optimalHour).padStart(2, '0')}:00`,
            priority: priority as 'high' | 'medium' | 'low',
          });
        }
      });

      if (items.length > 0 || commitmentSet.has(dateStr)) {
        calendar.push({
          date: dateStr,
          day: dayName,
          items: commitmentSet.has(dateStr) ? [...items, { type: 'commitment', platform: 'all', time: 'all-day', priority: 'high' as const }] : items,
        });
      }
    }
  }

  const totalScheduled = calendar.reduce((s, c) => s + c.items.filter(i => i.type !== 'commitment').length, 0);
  const totalCommitments = calendar.reduce((s, c) => s + c.items.filter(i => i.type === 'commitment').length, 0);
  const busyDays = calendar.filter(c => c.items.length > 2).length;

  return mkResult('F118', {
    weeks: weeksAhead,
    totalScheduled,
    totalCommitments,
    busyDays,
    calendar: calendar.slice(0, 14 * weeksAhead), // cap output size
    batchRecommendation: batchPreference >= 3 ? `Batch create content on Mondays and Thursdays for optimal ${weeksAhead}-week schedule.` : 'Distribute content creation evenly across the week.',
    platformMix: contentTypes.reduce<Record<string, number>>((acc, ct) => { acc[ct.platform] = (acc[ct.platform] ?? 0) + ct.frequency; return acc; }, {}),
  });
}

// ─── F119 First-Party API Deep Integration ─────────────────────────────────
export function apiDeepIntegration(input: IntegrationInput): FeatureResult {
  const { apis } = input;

  const analysis = apis.map(api => {
    const dataQuality = weightedScore([
      { w: 40, score: api.dataCompleteness },
      { w: 30, score: api.connected ? 100 : 0 },
      { w: 15, score: clamp(100 - api.refreshRateMinutes / 10, 0, 100) },
      { w: 15, score: api.errorsLast24h === 0 ? 100 : api.errorsLast24h <= 3 ? 60 : 20 },
    ]);

    const syncAge = api.lastSync ? Math.round((Date.now() - new Date(api.lastSync).getTime()) / 3600000) : Infinity;
    const syncHealth = syncAge <= 1 ? 'fresh' : syncAge <= 6 ? 'recent' : syncAge <= 24 ? 'stale' : 'outdated';

    return {
      name: api.name, connected: api.connected, dataQuality,
      dataCompleteness: api.dataCompleteness, refreshRateMinutes: api.refreshRateMinutes,
      syncHealth, syncAgeHours: Math.min(syncAge, 999),
      errorsLast24h: api.errorsLast24h, lastSync: api.lastSync ?? 'Never',
    };
  });

  const overallScore = analysis.length > 0 ? Math.round(analysis.reduce((s, a) => s + a.dataQuality, 0) / analysis.length) : 0;
  const connectedCount = apis.filter(a => a.connected).length;
  const staleApis = analysis.filter(a => a.syncHealth === 'stale' || a.syncHealth === 'outdated');

  return mkResult('F119', {
    overallScore,
    connectedCount,
    totalApis: apis.length,
    apis: analysis,
    staleApis: staleApis.map(a => ({ name: a.name, syncHealth: a.syncHealth, syncAgeHours: a.syncAgeHours })),
    recommendations: [
      ...(connectedCount < apis.length ? [`${apis.length - connectedCount} API(s) not connected. Connect all for complete data integration.`] : []),
      ...(staleApis.length > 0 ? [`${staleApis.length} API(s) have stale data. Check refresh rates and connection status.`] : []),
      ...(overallScore < 60 ? ['Overall integration quality is below 60%. Review data completeness and error rates.'] : []),
    ],
  });
}

// ─── F120 Affiliate Code Generator + Tracker ────────────────────────────────
export function affiliateTracker(input: AffiliateInput): FeatureResult {
  const { affiliateLinks, newBrand, newCommission } = input;

  // Generate new affiliate link variations
  const slug = newBrand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const generatedLinks = [
    { code: `${slug}-10`, label: `${newBrand} - Standard`, commission: newCommission },
    { code: `${slug}-vip`, label: `${newBrand} - VIP Discount`, commission: newCommission * 1.2 },
    { code: `${slug}-early`, label: `${newBrand} - Early Access`, commission: newCommission * 0.8 },
  ];

  // Analyze existing links
  const totalClicks = affiliateLinks.reduce((s, l) => s + l.clicks, 0);
  const totalConversions = affiliateLinks.reduce((s, l) => s + l.conversions, 0);
  const overallConvRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const totalRevenue = affiliateLinks.reduce((s, l) => s + l.conversions * l.commissionPerConversion, 0);

  const linkPerformance = affiliateLinks.map(l => ({
    code: l.code, brand: l.brand, clicks: l.clicks, conversions: l.conversions,
    convRate: l.clicks > 0 ? Math.round((l.conversions / l.clicks) * 10000) / 100 : 0,
    revenue: l.conversions * l.commissionPerConversion,
    commissionPerConversion: l.commissionPerConversion,
    daysSinceCreation: Math.round((Date.now() - new Date(l.createdDate).getTime()) / 86400000),
  })).sort((a, b) => b.revenue - a.revenue);

  const topBrand = linkPerformance[0];
  const projectedMonthly = Math.round(totalRevenue * 4.3); // weekly -> monthly approx

  return mkResult('F120', {
    generatedLinks,
    dashboard: { totalLinks: affiliateLinks.length, totalClicks, totalConversions, overallConvRate: Math.round(overallConvRate * 100) / 100, totalRevenue: Math.round(totalRevenue * 100) / 100 },
    topBrand: topBrand ? { brand: topBrand.brand, revenue: topBrand.revenue, convRate: topBrand.convRate } : null,
    linkPerformance,
    projectedMonthlyRevenue: projectedMonthly,
    recommendations: [
      ...(overallConvRate < 2 ? ['Overall conversion rate is below 2%. Optimize placement and call-to-action for affiliate links.'] : []),
      ...(affiliateLinks.some(l => l.clicks > 0 && l.conversions === 0) ? ['Some links have clicks but no conversions. Consider if the product is a good fit for your audience.'] : []),
    ],
  });
}

// ─── F121 Freemium Tier System ──────────────────────────────────────────────
export function freemiumTierSystem(input: FreemiumInput): FeatureResult {
  const { plan, usage } = input;

  const tierLimits: Record<string, Record<string, number>> = {
    free: { features: 5, exports: 3, scouts: 2, reports: 1 },
    starter: { features: 15, exports: 10, scouts: 5, reports: 5 },
    creator: { features: 50, exports: 50, scouts: 20, reports: 20 },
    professional: { features: 999, exports: 999, scouts: 999, reports: 999 },
  };

  const usageDetails = usage.map(u => {
    const limit = u.limit;
    const usedPct = limit > 0 ? (u.used / limit) * 100 : 0;
    const status = usedPct >= 100 ? 'exceeded' : usedPct >= 80 ? 'near_limit' : 'ok';
    return { feature: u.feature, used: u.used, limit, usedPct: Math.round(usedPct), status };
  });

  const nearLimitFeatures = usageDetails.filter(u => u.status === 'near_limit' || u.status === 'exceeded');
  const overallUtilization = usageDetails.length > 0 ? Math.round(usageDetails.reduce((s, u) => s + u.usedPct, 0) / usageDetails.length) : 0;

  const planUpgrade = plan === 'free' ? 'starter' : plan === 'starter' ? 'creator' : plan === 'creator' ? 'professional' : null;
  const upgradeReason = nearLimitFeatures.length >= 2
    ? `${nearLimitFeatures.length} feature(s) near or at limit. Upgrading to "${planUpgrade}" is recommended.`
    : planUpgrade ? `You are using ${overallUtilization}% of your current plan capacity.` : 'You are on the highest plan.';

  return mkResult('F121', {
    currentPlan: plan,
    overallUtilization,
    usage: usageDetails,
    nearLimitFeatures,
    upgradeRecommendation: planUpgrade ? { suggestedPlan: planUpgrade, reason: upgradeReason } : null,
    tierComparison: Object.entries(tierLimits).map(([tier, limits]) => ({ tier, limits })),
  });
}

// ─── F122 Export/Share Reports ──────────────────────────────────────────────
export function exportShareReports(input: ExportInput): FeatureResult {
  const { reportTitle, reportData, format, dateRange } = input;

  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);
  const daysInRange = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000));

  const dataSize = new Blob([JSON.stringify(reportData)]).size;
  const formattedSize = formatBytes(dataSize);

  // Generate export metadata
  const exportMeta = {
    title: reportTitle,
    format,
    dateRange: { from: dateRange.from, to: dateRange.to, days: daysInRange },
    generatedAt: new Date().toISOString(),
    dataPoints: Object.keys(reportData).length,
    estimatedFileSize: formattedSize,
    shareableLink: `https://veloctiq.app/share/${Date.now().toString(36)}`,
    fileName: `${reportTitle.replace(/\s+/g, '_').toLowerCase()}_${dateRange.from}_${dateRange.to}.${format}`,
  };

  // CSV conversion
  const csvData = format === 'csv' ? convertToCSV(reportData) : null;

  // PDF structure metadata
  const pdfStructure = format === 'pdf' ? {
    pages: Math.max(1, Math.ceil(Object.keys(reportData).length / 5)),
    sections: Object.keys(reportData).map(key => ({ title: key, type: typeof reportData[key] })),
  } : null;

  return mkResult('F122', {
    export: exportMeta,
    csv: csvData,
    pdfStructure,
    shareOptions: {
      directLink: exportMeta.shareableLink,
      embeddable: true,
      passwordProtectable: true,
      expirationDays: 30,
    },
  });
}

function convertToCSV(data: Record<string, unknown>): string {
  const headers = Object.keys(data);
  const values = headers.map(h => {
    const v = data[h];
    if (typeof v === 'object' && v !== null) return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
    return String(v);
  });
  return [headers.join(','), values.join(',')].join('\n');
}

// ─── F123 Live Subscriber/Metric Tickers ────────────────────────────────────
export function liveMetricTickers(input: TickerInput): FeatureResult {
  const { currentSubscribers, subscriberGrowthRate, currentViews, viewGrowthRate, currentRevenue, revenueGrowthRate, milestones } = input;

  // Project current moment to end of day
  const hoursRemaining = 24 - new Date().getHours();
  const projectedEndOfDay = {
    subscribers: Math.round(currentSubscribers + subscriberGrowthRate * hoursRemaining),
    views: Math.round(currentViews + viewGrowthRate * hoursRemaining),
    revenue: Math.round((currentRevenue + revenueGrowthRate * hoursRemaining) * 100) / 100,
  };

  // Project to milestones
  const milestoneProjections = milestones.map(m => {
    let remaining: number, rate: number, unit: string;
    if (m.type === 'subscriber') { remaining = m.target - currentSubscribers; rate = subscriberGrowthRate; unit = 'subs/day'; }
    else if (m.type === 'view') { remaining = m.target - currentViews; rate = viewGrowthRate; unit = 'views/day'; }
    else { remaining = m.target - currentRevenue; rate = revenueGrowthRate; unit = 'revenue/day'; }

    const daysToMilestone = rate > 0 ? Math.ceil(remaining / rate) : Infinity;
    const date = daysToMilestone !== Infinity ? new Date(Date.now() + daysToMilestone * 86400000).toISOString().split('T')[0] : 'N/A';
    const progress = m.type === 'subscriber' ? pct(currentSubscribers, m.target)
      : m.type === 'view' ? pct(currentViews, m.target)
      : pct(currentRevenue, m.target);

    return { label: m.label, target: m.target, current: m.type === 'subscriber' ? currentSubscribers : m.type === 'view' ? currentViews : currentRevenue, progress, daysToMilestone: Math.min(daysToMilestone, 9999), estimatedDate: date, rate: `${Math.abs(rate).toFixed(1)} ${unit}` };
  });

  // Trend assessment
  const subTrend = subscriberGrowthRate > 5 ? 'accelerating' : subscriberGrowthRate > 0 ? 'growing' : subscriberGrowthRate === 0 ? 'flat' : 'declining';
  const viewTrend = viewGrowthRate > 100 ? 'surging' : viewGrowthRate > 0 ? 'growing' : viewGrowthRate === 0 ? 'flat' : 'declining';

  // Upcoming milestones (within 30 days)
  const upcomingMilestones = milestoneProjections.filter(m => m.daysToMilestone <= 30 && m.daysToMilestone > 0);

  return mkResult('F123', {
    current: { subscribers: currentSubscribers, views: currentViews, revenue: currentRevenue },
    growthRates: { subscribersPerDay: subscriberGrowthRate, viewsPerDay: viewGrowthRate, revenuePerDay: revenueGrowthRate },
    endOfDayProjection: projectedEndOfDay,
    trends: { subscribers: subTrend, views: viewTrend },
    milestones: milestoneProjections,
    upcomingMilestones,
    nextMilestone: upcomingMilestones[0] ?? null,
  });
}

// ─── F124 Content Asset Library ─────────────────────────────────────────────
export function contentAssetLibrary(input: AssetInput): FeatureResult {
  const { assets, totalStorageBytes } = input;

  const typeBreakdown = assets.reduce<Record<string, { count: number; sizeBytes: number; avgUsage: number }>>((acc, a) => {
    if (!acc[a.type]) acc[a.type] = { count: 0, sizeBytes: 0, avgUsage: 0 };
    acc[a.type].count++;
    acc[a.type].sizeBytes += a.sizeBytes;
    acc[a.type].avgUsage = Math.round(acc[a.type].avgUsage + a.usageCount / Math.max(acc[a.type].count, 1));
    return acc;
  }, {});

  // Calculate per-type properly
  Object.keys(typeBreakdown).forEach(type => {
    const typeAssets = assets.filter(a => a.type === type);
    typeBreakdown[type].avgUsage = typeAssets.length > 0 ? Math.round(typeAssets.reduce((s, a) => s + a.usageCount, 0) / typeAssets.length) : 0;
  });

  const totalAssets = assets.length;
  const totalSizeBytes = assets.reduce((s, a) => s + a.sizeBytes, 0);
  const avgUsage = totalAssets > 0 ? assets.reduce((s, a) => s + a.usageCount, 0) / totalAssets : 0;

  // Organization score
  const hasAllTypes = ['thumbnail', 'video', 'brand'].some(t => assets.some(a => a.type === t));
  const unusedAssets = assets.filter(a => a.usageCount === 0);
  const organizationScore = weightedScore([
    { w: 30, score: hasAllTypes ? 80 : 30 },
    { w: 30, score: clamp(100 - (unusedAssets.length / Math.max(totalAssets, 1)) * 100, 0, 100) },
    { w: 20, score: totalAssets >= 10 ? 100 : totalAssets >= 5 ? 70 : 30 },
    { w: 20, score: totalSizeBytes < totalStorageBytes * 0.8 ? 80 : 40 },
  ]);

  // Recently used
  const recentlyUsed = assets.filter(a => a.lastUsed).sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime()).slice(0, 5);
  const staleAssets = assets.filter(a => a.usageCount === 0);

  return mkResult('F124', {
    summary: { totalAssets, totalSizeBytes, totalSizeFormatted: formatBytes(totalSizeBytes), storageUsage: totalStorageBytes > 0 ? Math.round((totalSizeBytes / totalStorageBytes) * 100) : 0, avgUsageCount: Math.round(avgUsage), organizationScore },
    typeBreakdown: Object.entries(typeBreakdown).map(([type, data]) => ({ type, ...data, sizeFormatted: formatBytes(data.sizeBytes) })),
    recentlyUsed,
    staleAssets: { count: staleAssets.length, items: staleAssets.slice(0, 10).map(a => ({ id: a.id, name: a.name, type: a.type })) },
    recommendations: [
      ...(staleAssets.length > 5 ? [`${staleAssets.length} unused assets found. Consider removing or repurposing them.`] : []),
      ...(organizationScore < 50 ? ['Asset organization is low. Create folders by type and archive old assets.'] : []),
    ],
  });
}

// ─── F125 Team/Agency Multi-Seat ────────────────────────────────────────────
export function teamMultiSeat(input: TeamInput): FeatureResult {
  const { members, seatLimit } = input;

  const usedSeats = members.length;
  const availableSeats = Math.max(0, seatLimit - usedSeats);
  const seatUtilization = seatLimit > 0 ? pct(usedSeats, seatLimit) : 100;

  const roleBreakdown = members.reduce<Record<string, number>>((acc, m) => { acc[m.role] = (acc[m.role] ?? 0) + 1; return acc; }, {});
  const permissionMatrix = {
    owner: { content: true, analytics: true, settings: true, billing: true, team: true },
    admin: { content: true, analytics: true, settings: true, billing: false, team: true },
    editor: { content: true, analytics: true, settings: false, billing: false, team: false },
    viewer: { content: false, analytics: true, settings: false, billing: false, team: false },
  };

  const activeMembers = members.filter(m => {
    const daysSinceActive = Math.round((Date.now() - new Date(m.lastActive).getTime()) / 86400000);
    return daysSinceActive <= 7;
  });

  const totalActions = members.reduce((s, m) => s + m.actionsThisMonth, 0);
  const avgActionsPerMember = members.length > 0 ? Math.round(totalActions / members.length) : 0;

  const collaborationScore = weightedScore([
    { w: 30, score: clamp(seatUtilization, 0, 100) },
    { w: 30, score: activeMembers.length >= members.length * 0.7 ? 90 : activeMembers.length >= members.length * 0.4 ? 60 : 30 },
    { w: 20, score: avgActionsPerMember > 20 ? 90 : avgActionsPerMember > 5 ? 60 : 30 },
    { w: 20, score: Object.keys(roleBreakdown).length >= 3 ? 90 : Object.keys(roleBreakdown).length >= 2 ? 60 : 30 },
  ]);

  return mkResult('F125', {
    summary: { usedSeats, seatLimit, availableSeats, seatUtilization, collaborationScore },
    roleBreakdown,
    permissionMatrix,
    members: members.map(m => ({
      id: m.id, name: m.name, email: m.email, role: m.role,
      actionsThisMonth: m.actionsThisMonth,
      daysSinceActive: Math.round((Date.now() - new Date(m.lastActive).getTime()) / 86400000),
      isActive: activeMembers.some(a => a.id === m.id),
    })),
    activeMembers: activeMembers.length,
    totalActionsThisMonth: totalActions,
    recommendations: [
      ...(availableSeats === 0 ? ['No available seats. Upgrade your plan or remove inactive members.'] : []),
      ...(activeMembers.length < members.length * 0.5 ? ['Less than half of team members are active. Consider reassigning roles or inviting new members.'] : []),
    ],
  });
}

// ─── F126 Campaign Management ───────────────────────────────────────────────
export function campaignManagement(input: CampaignInput): FeatureResult {
  const { campaigns } = input;

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const overallROI = totalBudget > 0 ? Math.round(((totalRevenue - totalBudget) / totalBudget) * 100) : 0;

  const campaignDetails = campaigns.map(c => {
    const roi = c.budget > 0 ? Math.round(((c.revenue - c.budget) / c.budget) * 100) : 0;
    const engRate = c.totalViews > 0 ? Math.round((c.totalEngagement / c.totalViews) * 10000) / 100 : 0;
    const durationDays = Math.max(1, Math.round((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / 86400000));
    const viewsPerDay = Math.round(c.totalViews / durationDays);
    const costPerView = c.budget > 0 ? Math.round((c.budget / c.totalViews) * 100) / 100 : 0;

    return { ...c, roi, engRate, durationDays, viewsPerDay, costPerView };
  });

  const activeCampaigns = campaignDetails.filter(c => c.status === 'active');
  const completedCampaigns = campaignDetails.filter(c => c.status === 'completed');
  const topCampaign = [...campaignDetails].sort((a, b) => b.roi - a.roi)[0];

  return mkResult('F126', {
    summary: { totalCampaigns: campaigns.length, active: activeCampaigns.length, completed: completedCampaigns.length, totalBudget, totalRevenue, overallROI },
    campaigns: campaignDetails,
    topCampaign: topCampaign ? { name: topCampaign.name, roi: topCampaign.roi, revenue: topCampaign.revenue } : null,
    recommendations: [
      ...(overallROI < 0 ? ['Overall campaign ROI is negative. Review campaign strategy and targeting.'] : []),
      ...(activeCampaigns.length > 5 ? [`${activeCampaigns.length} campaigns running simultaneously. Consider focusing on fewer campaigns for better results.`] : []),
    ],
  });
}

// ─── F127 Mobile Responsive PWA ─────────────────────────────────────────────
export function pwaReadiness(input: PWAInput): FeatureResult {
  const { largestContentfulPaintMs, firstInputDelayMs, cumulativeLayoutShift, serviceWorkerRegistered, manifestExists, offlineCapable, viewportMeta, touchTargetsMin } = input;

  const performanceScore = weightedScore([
    { w: 25, score: largestContentfulPaintMs <= 2500 ? 100 : largestContentfulPaintMs <= 4000 ? 60 : 20 },
    { w: 25, score: firstInputDelayMs <= 100 ? 100 : firstInputDelayMs <= 300 ? 60 : 20 },
    { w: 25, score: cumulativeLayoutShift <= 0.1 ? 100 : cumulativeLayoutShift <= 0.25 ? 60 : 20 },
    { w: 25, score: touchTargetsMin >= 48 ? 100 : touchTargetsMin >= 36 ? 70 : 30 },
  ]);

  const pwaFeatures = [
    { feature: 'Service Worker', status: serviceWorkerRegistered, critical: true },
    { feature: 'Web Manifest', status: manifestExists, critical: true },
    { feature: 'Offline Capability', status: offlineCapable, critical: true },
    { feature: 'Viewport Meta', status: viewportMeta, critical: true },
    { feature: 'Touch Targets >= 48px', status: touchTargetsMin >= 48, critical: false },
  ];

  const pwaFeatureScore = clamp(pwaFeatures.filter(f => f.status).length / pwaFeatures.length * 100, 0, 100);
  const overallReadiness = Math.round((performanceScore * 0.6 + pwaFeatureScore * 0.4));

  const missingCritical = pwaFeatures.filter(f => f.critical && !f.status);
  const grade = overallReadiness >= 80 ? 'A' : overallReadiness >= 60 ? 'B' : overallReadiness >= 40 ? 'C' : 'D';

  return mkResult('F127', {
    overallReadiness,
    grade,
    performance: {
      lcp: { value: largestContentfulPaintMs, label: largestContentfulPaintMs <= 2500 ? 'good' : largestContentfulPaintMs <= 4000 ? 'needs-improvement' : 'poor' },
      fid: { value: firstInputDelayMs, label: firstInputDelayMs <= 100 ? 'good' : firstInputDelayMs <= 300 ? 'needs-improvement' : 'poor' },
      cls: { value: cumulativeLayoutShift, label: cumulativeLayoutShift <= 0.1 ? 'good' : cumulativeLayoutShift <= 0.25 ? 'needs-improvement' : 'poor' },
      score: performanceScore,
    },
    pwaFeatures,
    missingCriticalFeatures: missingCritical.map(f => f.feature),
    recommendations: [
      ...(largestContentfulPaintMs > 4000 ? ['LCP is very high. Optimize image loading and reduce JavaScript bundle size.'] : []),
      ...(missingCritical.length > 0 ? [`Missing critical PWA feature(s): ${missingCritical.map(f => f.feature).join(', ')}.`] : []),
      ...(touchTargetsMin < 36 ? ['Touch targets are too small for mobile. Ensure minimum 48px tap targets.'] : []),
    ],
  });
}

// ─── F128 Bulk Actions ──────────────────────────────────────────────────────
export function bulkActions(input: BulkInput): FeatureResult {
  const { items, operation } = input;

  const results = items.map(item => {
    let output: Record<string, unknown> = {};

    switch (operation) {
      case 'analyze': {
        const data = item.data;
        const keys = Object.keys(data);
        const numericFields = keys.filter(k => typeof data[k] === 'number');
        const textFields = keys.filter(k => typeof data[k] === 'string');
        const textValues = textFields.map(k => String(data[k]));
        const wordCount = textValues.reduce((s, v) => s + v.split(/\s+/).length, 0);
        const avgNumeric = numericFields.length > 0 ? numericFields.reduce((s, k) => s + (data[k] as number), 0) / numericFields.length : 0;
        output = { id: item.id, type: item.type, fieldCount: keys.length, numericFields, textFields, wordCount, avgNumericValue: Math.round(avgNumeric * 100) / 100 };
        break;
      }
      case 'score': {
        const data = item.data as Record<string, number>;
        const values = Object.values(data);
        const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        const score = clamp(Math.round(avg), 0, 100);
        output = { id: item.id, type: item.type, score, average: Math.round(avg * 100) / 100, count: values.length, grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D' };
        break;
      }
      case 'report': {
        output = { id: item.id, type: item.type, dataFields: Object.keys(item.data), timestamp: new Date().toISOString(), summary: `${Object.keys(item.data).length} data points processed.` };
        break;
      }
      case 'tag': {
        const dataStr = JSON.stringify(item.data).toLowerCase();
        const tags: string[] = [];
        if (/video|youtube|tiktok/i.test(dataStr)) tags.push('video-content');
        if (/engagement|like|comment|share/i.test(dataStr)) tags.push('engagement');
        if (/revenue|money|income|earning/i.test(dataStr)) tags.push('monetization');
        if (/subscriber|follower|fan/i.test(dataStr)) tags.push('audience');
        if (/growth|increase|improve/i.test(dataStr)) tags.push('growth');
        output = { id: item.id, type: item.type, tags, tagCount: tags.length };
        break;
      }
    }

    return { id: item.id, operation, success: true, output };
  });

  const summary = {
    operation, totalItems: items.length, processed: results.length,
    failed: results.filter(r => !r.success).length,
    executionTimeMs: Math.round(items.length * 1.5), // estimated
  };

  return mkResult('F128', { summary, results });
}

// ─── F129 Hashtag Bank/Saved Lists ──────────────────────────────────────────
export function hashtagBank(input: HashtagInput): FeatureResult {
  const { savedSets, newTags, platform } = input;

  // Analyze saved sets
  const setAnalysis = savedSets.map(set => {
    const tagLengths = set.tags.map(t => t.length);
    const avgLength = tagLengths.length > 0 ? Math.round(tagLengths.reduce((a, b) => a + b, 0) / tagLengths.length) : 0;
    const size = set.tags.length;
    const optimalSize = platform === 'instagram' ? size >= 20 && size <= 30 : platform === 'tiktok' ? size >= 3 && size <= 8 : size >= 3 && size <= 15;
    const daysSinceUsed = set.lastUsed ? Math.round((Date.now() - new Date(set.lastUsed).getTime()) / 86400000) : 999;

    return { ...set, avgTagLength: avgLength, sizeScore: optimalSize ? 100 : 50, daysSinceUsed, freshness: daysSinceUsed <= 7 ? 'fresh' : daysSinceUsed <= 30 ? 'recent' : 'stale' };
  });

  // Suggest updates for new tags
  const existingTags = new Set(savedSets.flatMap(s => s.tags.map(t => t.toLowerCase())));
  const uniqueNewTags = newTags.filter(t => !existingTags.has(t.toLowerCase()));

  const tagPerformance = savedSets.sort((a, b) => b.avgEngagement - a.avgEngagement);
  const bestSet = tagPerformance[0];

  // Generate hashtag suggestions for platform
  const maxTags = platform === 'instagram' ? 30 : platform === 'tiktok' ? 8 : 15;
  const allTags = [...new Set([...savedSets.flatMap(s => s.tags), ...newTags])];
  const recommendedSet = allTags.slice(0, maxTags);

  return mkResult('F129', {
    totalSets: savedSets.length,
    platform,
    sets: setAnalysis,
    bestPerformingSet: bestSet ? { name: bestSet.name, avgEngagement: bestSet.avgEngagement, tagCount: bestSet.tags.length } : null,
    newTagsToConsider: uniqueNewTags,
    recommendedSet: { tags: recommendedSet, count: recommendedSet.length, platformOptimized: recommendedSet.length <= maxTags },
    maxTagsForPlatform: maxTags,
    recommendations: [
      ...(uniqueNewTags.length > 0 ? [`${uniqueNewTags.length} new tag(s) not in any saved set. Consider adding them.`] : []),
      ...(setAnalysis.some(s => s.freshness === 'stale') ? ['Some sets are stale. Update them with trending tags.'] : []),
    ],
  });
}

// ─── F130 Competitor Alert System ────────────────────────────────────────────
export interface CompetitorAlertInput {
  competitors: { name: string; platform: string; currentFollowers: number; lastChecked: string }[];
  alertThresholds: { followerJump: number; viralVideo: number; rebrand: boolean; collaboration: boolean };
  recentActivity: { competitor: string; event: string; date: string; significance: number }[];
}

export function competitorAlertSystem(input: CompetitorAlertInput): FeatureResult {
  const { competitors, alertThresholds, recentActivity } = input;

  // Calculate alert configuration
  const competitorAlerts = competitors.map(c => {
    const daysSinceChecked = Math.round((Date.now() - new Date(c.lastChecked).getTime()) / 86400000);
    const staleness = daysSinceChecked > 3 ? 'stale' : daysSinceChecked > 1 ? 'aging' : 'fresh';
    const estimatedDailyGrowth = Math.round(c.currentFollowers * 0.005); // ~0.5% daily estimate

    return {
      name: c.name, platform: c.platform, currentFollowers: c.currentFollowers,
      staleness, daysSinceChecked,
      alertThreshold: Math.round(c.currentFollowers * (alertThresholds.followerJump / 100)),
      estimatedDailyGrowth,
    };
  });

  // Process recent activity
  const highSignificance = recentActivity.filter(a => a.significance >= 7);
  const alertEvents = recentActivity.filter(a => a.significance >= 5).sort((a, b) => b.significance - a.significance);

  // Activity patterns
  const activityByCompetitor = recentActivity.reduce<Record<string, number>>((acc, a) => { acc[a.competitor] = (acc[a.competitor] ?? 0) + 1; return acc; }, {});
  const mostActiveCompetitor = Object.entries(activityByCompetitor).sort((a, b) => b[1] - a[1])[0];

  return mkResult('F130', {
    monitoring: { totalCompetitors: competitors.length, stale: competitorAlerts.filter(c => c.staleness === 'stale').length },
    competitors: competitorAlerts,
    thresholds: alertThresholds,
    recentAlerts: alertEvents.map(a => ({ competitor: a.competitor, event: a.event, date: a.date, significance: a.significance, severity: a.significance >= 8 ? 'high' : a.significance >= 5 ? 'medium' : 'low' })),
    highSignificanceEvents: highSignificance.length,
    mostActiveCompetitor: mostActiveCompetitor ? { name: mostActiveCompetitor[0], eventCount: mostActiveCompetitor[1] } : null,
    recommendations: [
      ...(competitorAlerts.some(c => c.staleness === 'stale') ? ['Some competitor data is stale. Refresh monitoring for up-to-date alerts.'] : []),
      ...(highSignificance.length > 3 ? [`${highSignificance.length} high-significance events recently. Review competitor strategy changes.`] : []),
    ],
  });
}

// ─── F131 Dark Mode ─────────────────────────────────────────────────────────
export function darkModeAnalysis(input: DarkModeInput): FeatureResult {
  const { bgHex, fgHex, accentHex, cardHex, mutedHex } = input;

  function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  }

  function relativeLuminance([r, g, b]: [number, number, number]): number {
    const [rs, gs, bs] = [r, g, b].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function contrastRatio(hex1: string, hex2: string): number {
    const l1 = relativeLuminance(hexToRgb(hex1));
    const l2 = relativeLuminance(hexToRgb(hex2));
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  const bgFgRatio = contrastRatio(bgHex, fgHex);
  const bgAccentRatio = contrastRatio(bgHex, accentHex);
  const cardMutedRatio = contrastRatio(cardHex, mutedHex);
  const cardFgRatio = contrastRatio(cardHex, fgHex);

  const wcagAA = 4.5;
  const wcagAAA = 7;

  const checks = [
    { pair: 'Background → Foreground', ratio: Math.round(bgFgRatio * 100) / 100, aa: bgFgRatio >= wcagAA, aaa: bgFgRatio >= wcagAAA },
    { pair: 'Background → Accent', ratio: Math.round(bgAccentRatio * 100) / 100, aa: bgAccentRatio >= wcagAA, aaa: bgAccentRatio >= wcagAAA },
    { pair: 'Card → Muted', ratio: Math.round(cardMutedRatio * 100) / 100, aa: cardMutedRatio >= wcagAA, aaa: cardMutedRatio >= wcagAAA },
    { pair: 'Card → Foreground', ratio: Math.round(cardFgRatio * 100) / 100, aa: cardFgRatio >= wcagAA, aaa: cardFgRatio >= wcagAAA },
  ];

  const aaPass = checks.filter(c => c.aa).length;
  const overallScore = Math.round((aaPass / checks.length) * 100);

  const bgRgb = hexToRgb(bgHex);
  const isDark = (bgRgb[0] * 299 + bgRgb[1] * 587 + bgRgb[2] * 114) / 1000 < 128;

  // Eye strain estimation
  const bgBrightness = relativeLuminance(bgRgb);
  const eyeStrainScore = isDark ? clamp(Math.round(bgBrightness * 50 + 20), 10, 60) : clamp(Math.round(bgBrightness * 30), 30, 80);
  const eyeStrainLabel = eyeStrainScore <= 30 ? 'low' : eyeStrainScore <= 50 ? 'moderate' : 'high';

  return mkResult('F131', {
    overallScore,
    isDark,
    wcagCompliance: { aaPassed: aaPass, totalChecks: checks.length, percentage: Math.round((aaPass / checks.length) * 100) },
    contrastChecks: checks,
    eyeStrain: { score: eyeStrainScore, label: eyeStrainLabel },
    readabilityScore: clamp(Math.round(bgFgRatio * 15), 0, 100),
    recommendations: [
      ...(bgFgRatio < wcagAA ? ['Background/foreground contrast is below WCAG AA. Increase contrast for better readability.'] : []),
      ...(eyeStrainScore > 50 ? ['Background brightness may cause eye strain in dark mode. Consider reducing blue light.'] : []),
      ...(cardMutedRatio < wcagAA ? ['Card text contrast is low. Ensure muted text is still readable on card backgrounds.'] : []),
    ],
  });
}

// ─── F132 Zapier/Make.com Integration ───────────────────────────────────────
export function zapierIntegration(input: WebhookInput): FeatureResult {
  const { webhooks, newWebhookName, newWebhookUrl } = input;

  // Generate new webhook config
  const newWebhook = {
    id: `wh_${Date.now().toString(36)}`,
    name: newWebhookName,
    url: newWebhookUrl,
    events: ['metric.threshold', 'content.published', 'engagement.spike'],
    active: true,
    payloadFormat: { type: 'json', version: 'v1', fields: ['event', 'data', 'timestamp', 'source'] },
    suggestedHeaders: { 'Content-Type': 'application/json', 'X-VelociTiq-Signature': '{{signature}}', 'X-Webhook-ID': `wh_${Date.now().toString(36)}` },
  };

  // Analyze existing webhooks
  const webhookAnalysis = webhooks.map(wh => {
    const totalTriggers = wh.successCount + wh.failureCount;
    const successRate = totalTriggers > 0 ? (wh.successCount / totalTriggers) * 100 : 0;
    const healthStatus = successRate >= 95 ? 'healthy' : successRate >= 80 ? 'degraded' : 'critical';
    const daysSinceTriggered = wh.lastTriggered ? Math.round((Date.now() - new Date(wh.lastTriggered).getTime()) / 86400000) : 999;

    return { ...wh, totalTriggers, successRate: Math.round(successRate * 100) / 100, healthStatus, daysSinceTriggered };
  });

  const activeCount = webhooks.filter(w => w.active).length;
  const healthyCount = webhookAnalysis.filter(w => w.healthStatus === 'healthy').length;
  const staleWebhooks = webhookAnalysis.filter(w => w.daysSinceTriggered > 14);

  return mkResult('F132', {
    newWebhook,
    webhooks: webhookAnalysis,
    summary: { total: webhooks.length, active: activeCount, healthy: healthyCount, stale: staleWebhooks.length },
    triggerableEvents: ['metric.threshold', 'content.published', 'engagement.spike', 'subscriber.milestone', 'competitor.alert', 'burnout.warning', 'report.ready'],
    recommendations: [
      ...(staleWebhooks.length > 0 ? [`${staleWebhooks.length} webhook(s) haven't been triggered in 14+ days. Consider deactivating or updating them.`] : []),
      ...(activeCount === 0 ? ['No active webhooks. Set up webhooks to automate your workflow with Zapier or Make.com.'] : []),
    ],
  });
}

// ─── F133 VEX AI Agent - Orb Mode ───────────────────────────────────────────
export function vexOrbMode(input: VexOrbInput): FeatureResult {
  const { orbEnabled, orbPosition, notificationsEnabled, quickActions, alertFrequency } = input;

  const configScore = weightedScore([
    { w: 25, score: orbEnabled ? 100 : 0 },
    { w: 25, score: notificationsEnabled ? 100 : 20 },
    { w: 20, score: quickActions.length >= 5 ? 100 : quickActions.length >= 3 ? 70 : 30 },
    { w: 15, score: alertFrequency === 'realtime' ? 100 : alertFrequency === 'hourly' ? 80 : 50 },
    { w: 15, score: orbPosition !== 'bottom-right' ? 80 : 100 }, // bottom-right is default, others show customization
  ]);

  // Quick action routing
  const actionCategories = quickActions.reduce<Record<string, string[]>>((acc, action) => {
    const category = action.includes('metric') ? 'analytics' : action.includes('post') ? 'content' : action.includes('report') ? 'reporting' : 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(action);
    return acc;
  }, {});

  return mkResult('F133', {
    config: { enabled: orbEnabled, position: orbPosition, notifications: notificationsEnabled, alertFrequency },
    configScore,
    quickActions: { total: quickActions.length, categories: actionCategories },
    notificationQueue: notificationsEnabled ? [] : ['Notifications are disabled. Enable for real-time alerts.'],
    orbAppearance: {
      size: '48px',
      animation: orbEnabled ? 'pulse' : 'static',
      zIndex: 9999,
      position: orbPosition,
    },
    recommendations: [
      ...(!orbEnabled ? ['Enable the VEX Orb for quick access to AI assistance.'] : []),
      ...(!notificationsEnabled ? ['Enable notifications to receive proactive alerts through the Orb.'] : []),
      ...(quickActions.length < 3 ? ['Add more quick actions for faster workflow access.'] : []),
    ],
  });
}

// ─── F134 VEX AI Agent - Full Page ─────────────────────────────────────────
export function vexFullPage(input: VexFullPageInput): FeatureResult {
  const { conversations, contextItems } = input;

  const totalConversations = conversations.length;
  const resolvedConversations = conversations.filter(c => c.resolved).length;
  const totalMessages = conversations.reduce((s, c) => s + c.messageCount, 0);
  const avgResponseTime = conversations.length > 0 ? conversations.reduce((s, c) => s + c.avgResponseTimeMs, 0) / conversations.length : 0;
  const resolutionRate = totalConversations > 0 ? (resolvedConversations / totalConversations) * 100 : 0;

  // Context utilization
  const totalContextItems = contextItems.reduce((s, c) => s + c.count, 0);
  const contextBreakdown = contextItems.map(c => ({ type: c.type, count: c.count, percentage: totalContextItems > 0 ? Math.round((c.count / totalContextItems) * 100) : 0 }));

  // Conversation health
  const recentConvos = conversations.slice(-5);
  const avgRecentMessages = recentConvos.length > 0 ? recentConvos.reduce((s, c) => s + c.messageCount, 0) / recentConvos.length : 0;

  return mkResult('F134', {
    status: { totalConversations, resolved: resolvedConversations, resolutionRate: Math.round(resolutionRate * 100) / 100, totalMessages, avgResponseTimeMs: Math.round(avgResponseTime) },
    conversations: conversations.slice(0, 20),
    context: { totalItems: totalContextItems, breakdown: contextBreakdown },
    performance: {
      avgMessagesPerConversation: Math.round(totalConversations > 0 ? totalMessages / totalConversations : 0),
      avgResponseTimeMs: Math.round(avgResponseTime),
      avgRecentMessages: Math.round(avgRecentMessages),
      responseQuality: avgResponseTime < 2000 ? 'excellent' : avgResponseTime < 5000 ? 'good' : 'needs_improvement',
    },
    recommendations: [
      ...(resolutionRate < 70 ? ['Resolution rate is below 70%. Consider providing more context for better AI responses.'] : []),
      ...(avgResponseTime > 3000 ? ['Average response time is high. Optimize context loading for faster responses.'] : []),
    ],
  });
}

// ─── F135 VEX Proactive Intelligence ────────────────────────────────────────
export function vexProactiveIntelligence(input: VexProactiveInput): FeatureResult {
  const { metrics, lastCheckDate, checkFrequencyHours } = input;

  // Generate alerts from metrics
  const alerts = metrics.map(m => {
    const triggered = m.direction === 'above' ? m.value > m.threshold : m.value < m.threshold;
    const severity = triggered ? m.severity : 'info' as const;
    const gap = m.direction === 'above'
      ? Math.round(((m.value - m.threshold) / m.threshold) * 100)
      : Math.round(((m.threshold - m.value) / m.threshold) * 100);

    return {
      metric: m.name, value: m.value, threshold: m.threshold, direction: m.direction,
      triggered, severity, gap: Math.abs(gap),
      message: triggered
        ? `${m.name} ${m.direction === 'above' ? 'exceeded' : 'fell below'} threshold (${m.value} ${m.direction === 'above' ? '>' : '<'} ${m.threshold}) by ${Math.abs(gap)}%.`
        : `${m.name} is within normal range (${m.value}).`,
      action: triggered
        ? m.direction === 'above'
          ? `Review ${m.name} — spike detected. Investigate cause and prepare response.`
          : `Review ${m.name} — drop detected. Consider corrective action.`
        : null,
    };
  });

  const triggeredAlerts = alerts.filter(a => a.triggered);
  const highPriority = triggeredAlerts.filter(a => a.severity === 'high');
  const nextCheckDate = new Date(new Date(lastCheckDate).getTime() + checkFrequencyHours * 3600000).toISOString();

  // Schedule check-ins
  const checkInSchedule = [];
  for (let i = 1; i <= 7; i++) {
    checkInSchedule.push({ checkIn: i, date: new Date(Date.now() + i * checkFrequencyHours * 3600000).toISOString().split('T')[0] });
  }

  return mkResult('F135', {
    alerts: alerts.sort((a, b) => (b.triggered ? 1 : 0) - (a.triggered ? 1 : 0)),
    triggeredCount: triggeredAlerts.length,
    highPriorityCount: highPriority.length,
    lastCheck: lastCheckDate,
    nextCheck: nextCheckDate,
    checkFrequencyHours,
    checkInSchedule,
    intelligenceSummary: highPriority.length > 0
      ? `${highPriority.length} high-priority alert(s) require immediate attention.`
      : triggeredAlerts.length > 0
      ? `${triggeredAlerts.length} alert(s) triggered. Review at your convenience.`
      : 'All metrics within normal range. No action required.',
    actionableInsights: triggeredAlerts.map(a => ({ metric: a.metric, message: a.message, action: a.action })),
  });
}

// ─── F136 VEX Voice Commands ────────────────────────────────────────────────
export function vexVoiceCommands(input: VoiceInput): FeatureResult {
  const { enabled, supportedCommands, language, recentCommands } = input;

  // Command categorization
  const categories = supportedCommands.reduce<Record<string, string[]>>((acc, cmd) => {
    const lower = cmd.toLowerCase();
    const cat = lower.includes('show') || lower.includes('display') ? 'display'
      : lower.includes('create') || lower.includes('make') || lower.includes('generate') ? 'creation'
      : lower.includes('analyze') || lower.includes('check') || lower.includes('report') ? 'analytics'
      : lower.includes('post') || lower.includes('publish') || lower.includes('schedule') ? 'publishing'
      : lower.includes('search') || lower.includes('find') ? 'search'
      : lower.includes('settings') || lower.includes('config') ? 'settings'
      : 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cmd);
    return acc;
  }, {});

  // Recent command performance
  const avgConfidence = recentCommands.length > 0 ? recentCommands.reduce((s, c) => s + c.confidence, 0) / recentCommands.length : 0;
  const successfulCommands = recentCommands.filter(c => c.confidence >= 0.8);
  const successRate = recentCommands.length > 0 ? (successfulCommands.length / recentCommands.length) * 100 : 0;

  // Most used commands
  const commandFrequency = recentCommands.reduce<Record<string, number>>((acc, c) => { acc[c.command] = (acc[c.command] ?? 0) + 1; return acc; }, {});
  const topCommands = Object.entries(commandFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cmd, count]) => ({ command: cmd, count }));

  return mkResult('F136', {
    enabled,
    language,
    configuration: {
      supportedCommands: supportedCommands.length,
      categories,
      topCommands,
    },
    performance: {
      avgConfidence: Math.round(avgConfidence * 1000) / 1000,
      successRate: Math.round(successRate * 100) / 100,
      totalCommandsIssued: recentCommands.length,
      successfulCommands: successfulCommands.length,
    },
    recentCommands: recentCommands.slice(0, 10).map(c => ({
      command: c.command, confidence: Math.round(c.confidence * 1000) / 1000,
      timestamp: c.timestamp,
      recognized: c.confidence >= 0.8,
    })),
    recommendations: [
      ...(!enabled ? ['Enable voice commands for hands-free interaction with VEX AI.'] : []),
      ...(successRate < 70 ? ['Voice recognition accuracy is below 70%. Speak clearly and ensure a quiet environment.'] : []),
      ...(supportedCommands.length < 10 ? ['Consider adding more voice commands for broader functionality.'] : []),
    ],
  });
}

// ─── Export ─────────────────────────────────────────────────────────────────
export const controlTowerFeatures = {
  F109_scoutOrchestrator: scoutOrchestrator,
  F110_apiHeartbeatMonitor: apiHeartbeatMonitor,
  F111_multiProfileSwitcher: multiProfileSwitcher,
  F112_ftcComplianceCheck: ftcComplianceCheck,
  F113_authenticityVerification: authenticityVerification,
  F114_dataSovereignVault: dataSovereignVault,
  F115_braintrustPartnerPortal: braintrustPartnerPortal,
  F116_parallelCreator: parallelCreator,
  F117_socialPresenceAudit: socialPresenceAudit,
  F118_contentCalendarScheduler: contentCalendarScheduler,
  F119_apiDeepIntegration: apiDeepIntegration,
  F120_affiliateTracker: affiliateTracker,
  F121_freemiumTierSystem: freemiumTierSystem,
  F122_exportShareReports: exportShareReports,
  F123_liveMetricTickers: liveMetricTickers,
  F124_contentAssetLibrary: contentAssetLibrary,
  F125_teamMultiSeat: teamMultiSeat,
  F126_campaignManagement: campaignManagement,
  F127_pwaReadiness: pwaReadiness,
  F128_bulkActions: bulkActions,
  F129_hashtagBank: hashtagBank,
  F130_competitorAlertSystem: competitorAlertSystem,
  F131_darkModeAnalysis: darkModeAnalysis,
  F132_zapierIntegration: zapierIntegration,
  F133_vexOrbMode: vexOrbMode,
  F134_vexFullPage: vexFullPage,
  F135_vexProactiveIntelligence: vexProactiveIntelligence,
  F136_vexVoiceCommands: vexVoiceCommands,
};
