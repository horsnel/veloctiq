import type { 
  LiveSignal, RevenueData, ChannelHealth, GoldenHour, ActivityItem,
  ShieldData, ListenerData, BankData, ArenaData, ActionHubData,
  StudioData, GrowthData, ControlTowerData, LiminalData 
} from '@/types';

// Live Signals
export const mockLiveSignals: LiveSignal[] = [
  { id: '1', type: 'alert', message: 'Unusual bot activity detected on Instagram post', module: 'Shield', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), isRead: false },
  { id: '2', type: 'success', message: 'Viral signal detected: +340% engagement', module: 'Listener', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), isRead: false },
  { id: '3', type: 'warning', message: 'Shadow ban risk: Medium on TikTok', module: 'Shield', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), isRead: true },
  { id: '4', type: 'info', message: 'New sponsor opportunity: ₦250,000', module: 'Bank', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), isRead: false },
  { id: '5', type: 'success', message: 'Affiliate match found: 94% fit score', module: 'Bank', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), isRead: true },
  { id: '6', type: 'alert', message: 'Competitor launched similar content', module: 'Arena', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), isRead: false },
];

// Revenue Heatmap Data
export const mockRevenueData: RevenueData[] = [
  { date: '2024-01-01', amount: 45000, source: 'Sponsorship' },
  { date: '2024-01-02', amount: 32000, source: 'Affiliate' },
  { date: '2024-01-03', amount: 58000, source: 'Sponsorship' },
  { date: '2024-01-04', amount: 41000, source: 'Merch' },
  { date: '2024-01-05', amount: 67000, source: 'Sponsorship' },
  { date: '2024-01-06', amount: 39000, source: 'Affiliate' },
  { date: '2024-01-07', amount: 72000, source: 'Sponsorship' },
];

// Channel Health
export const mockChannelHealth: ChannelHealth = {
  score: 78,
  status: 'good',
  metrics: [
    { name: 'Engagement Rate', value: 4.2, target: 5.0, status: 'good' },
    { name: 'Subscriber Growth', value: 2.8, target: 3.0, status: 'warning' },
    { name: 'Watch Time', value: 68, target: 70, status: 'good' },
    { name: 'Click-Through Rate', value: 6.5, target: 8.0, status: 'warning' },
    { name: 'Audience Retention', value: 45, target: 50, status: 'warning' },
  ],
};

// Golden Hour
export const mockGoldenHour: GoldenHour = {
  optimalTimes: ['6:00 PM', '8:30 PM', '11:00 AM'],
  timezone: 'WAT (GMT+1)',
  nextBestTime: 'Today at 6:00 PM',
};

// Recent Activity
export const mockRecentActivity: ActivityItem[] = [
  { id: '1', type: 'feature_use', description: 'Ran Behavioral Bot Identification', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), vqtCost: 1 },
  { id: '2', type: 'token_purchase', description: 'Purchased 1,200 VQT', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '3', type: 'feature_use', description: 'Generated Weekly Intelligence Report', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), vqtCost: 6 },
  { id: '4', type: 'platform_connect', description: 'Connected TikTok account', timestamp: new Date(Date.now() - 48 * 3600000).toISOString() },
];

// Shield Data
export const mockShieldData: ShieldData = {
  botQuarantine: [
    { id: '1', username: 'suspicious_bot_1', platform: 'Instagram', confidence: 94, detectedAt: new Date(Date.now() - 2 * 3600000).toISOString(), reason: 'Behavioral pattern match' },
    { id: '2', username: 'spam_account_42', platform: 'YouTube', confidence: 87, detectedAt: new Date(Date.now() - 5 * 3600000).toISOString(), reason: 'Rapid commenting' },
    { id: '3', username: 'fake_follower_99', platform: 'TikTok', confidence: 91, detectedAt: new Date(Date.now() - 8 * 3600000).toISOString(), reason: 'Bot network detected' },
  ],
  shadowBanStatus: {
    isShadowBanned: false,
    platforms: ['YouTube', 'Instagram', 'TikTok'],
    lastChecked: new Date(Date.now() - 1 * 3600000).toISOString(),
    riskLevel: 'medium',
  },
  linkLockStatus: {
    activeLocks: 12,
    totalProtected: 156,
    recentViolations: 0,
  },
  toxicitySettings: {
    threshold: 0.7,
    autoFilter: true,
    customWords: ['spam', 'scam', 'fake'],
  },
};

// Listener Data
export const mockListenerData: ListenerData = {
  audienceSegments: [
    { id: '1', name: 'Gen Z Creatives', percentage: 35, soulAge: '22', interests: ['Design', 'Tech', 'Fashion'] },
    { id: '2', name: 'Millennial Professionals', percentage: 28, soulAge: '31', interests: ['Career', 'Finance', 'Travel'] },
    { id: '3', name: 'Gen X Enthusiasts', percentage: 22, soulAge: '45', interests: ['Health', 'Investing', 'Lifestyle'] },
    { id: '4', name: 'Digital Natives', percentage: 15, soulAge: '19', interests: ['Gaming', 'Crypto', 'Memes'] },
  ],
  sentimentAnalysis: {
    overall: 72,
    breakdown: { positive: 58, neutral: 28, negative: 14 },
    trends: [
      { date: '2024-01-01', score: 68 },
      { date: '2024-01-02', score: 70 },
      { date: '2024-01-03', score: 69 },
      { date: '2024-01-04', score: 72 },
      { date: '2024-01-05', score: 74 },
      { date: '2024-01-06', score: 71 },
      { date: '2024-01-07', score: 72 },
    ],
  },
  superFans: [
    { id: '1', username: 'superfan_sarah', platform: 'YouTube', engagementScore: 98, lastActive: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: '2', username: 'devoted_dave', platform: 'Instagram', engagementScore: 95, lastActive: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: '3', username: 'loyal_lisa', platform: 'TikTok', engagementScore: 92, lastActive: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: '4', username: 'engaged_eric', platform: 'Twitter', engagementScore: 89, lastActive: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: '5', username: 'active_anna', platform: 'YouTube', engagementScore: 87, lastActive: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  ghostAudience: {
    total: 12500,
    percentage: 18,
    riskLevel: 'medium',
  },
  wishlist: [
    { id: '1', content: 'More behind-the-scenes content', mentions: 234, sentiment: 'positive' },
    { id: '2', content: 'Longer video format', mentions: 189, sentiment: 'positive' },
    { id: '3', content: 'Collaboration with other creators', mentions: 156, sentiment: 'positive' },
    { id: '4', content: 'Q&A sessions', mentions: 142, sentiment: 'positive' },
  ],
};

// Bank Data
export const mockBankData: BankData = {
  buyingIntent: [
    { id: '1', keyword: 'camera gear', score: 87, volume: 4500, trend: 'up' },
    { id: '2', keyword: 'editing software', score: 82, volume: 3200, trend: 'stable' },
    { id: '3', keyword: 'lighting setup', score: 78, volume: 2800, trend: 'up' },
    { id: '4', keyword: 'microphone', score: 75, volume: 2100, trend: 'down' },
    { id: '5', keyword: 'course', score: 71, volume: 1900, trend: 'up' },
  ],
  sponsorInventory: {
    totalSlots: 8,
    filledSlots: 5,
    pendingDeals: 3,
    estimatedValue: 1250000,
  },
  affiliateMatches: [
    { id: '1', brand: 'TechGear Pro', fitScore: 94, commission: '15%', category: 'Technology' },
    { id: '2', brand: 'CreatorSuite', fitScore: 91, commission: '20%', category: 'Software' },
    { id: '3', brand: 'LightMax', fitScore: 88, commission: '12%', category: 'Equipment' },
    { id: '4', brand: 'EditFlow', fitScore: 85, commission: '18%', category: 'Software' },
  ],
  revenueForecast: {
    next30Days: 850000,
    next90Days: 2800000,
    confidence: 78,
  },
};

// Arena Data
export const mockArenaData: ArenaData = {
  competitors: [
    { id: '1', name: 'Creator Alpha', handle: '@creatoralpha', platform: 'YouTube', followerCount: 125000, engagementRate: 4.8, growthVelocity: 12 },
    { id: '2', name: 'Studio Beta', handle: '@studiobeta', platform: 'Instagram', followerCount: 89000, engagementRate: 5.2, growthVelocity: 8 },
    { id: '3', name: 'Content Gamma', handle: '@contentgamma', platform: 'TikTok', followerCount: 210000, engagementRate: 6.1, growthVelocity: 15 },
    { id: '4', name: 'Media Delta', handle: '@mediadelta', platform: 'YouTube', followerCount: 67000, engagementRate: 3.9, growthVelocity: 5 },
  ],
  shareOfVoice: {
    yourPercentage: 28,
    competitors: [
      { name: 'Creator Alpha', percentage: 32 },
      { name: 'Content Gamma', percentage: 24 },
      { name: 'Studio Beta', percentage: 10 },
      { name: 'Others', percentage: 6 },
    ],
  },
  hookLibrary: [
    { id: '1', content: 'I spent 30 days doing X and here\'s what happened...', performance: 94, category: 'Challenge' },
    { id: '2', content: 'The truth about [industry] that no one talks about', performance: 91, category: 'Revelation' },
    { id: '3', content: 'Stop doing X if you want to grow in 2024', performance: 88, category: 'Advice' },
    { id: '4', content: 'This mistake cost me $X (don\'t let it happen to you)', performance: 85, category: 'Warning' },
  ],
  keywordGaps: [
    { keyword: 'content strategy', yourRank: 8, competitorRank: 2, opportunity: 92 },
    { keyword: 'creator tips', yourRank: 12, competitorRank: 3, opportunity: 87 },
    { keyword: 'social growth', yourRank: 15, competitorRank: 5, opportunity: 82 },
    { keyword: 'audience building', yourRank: 9, competitorRank: 4, opportunity: 78 },
  ],
};

// Action Hub Data
export const mockActionHubData: ActionHubData = {
  ghostwriterQueue: [
    { id: '1', type: 'Instagram Caption', status: 'completed', content: 'Just dropped something special... ✨', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: '2', type: 'Tweet Thread', status: 'in_progress', createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: '3', type: 'YouTube Description', status: 'pending', createdAt: new Date(Date.now() - 10 * 60000).toISOString() },
  ],
  engagementQueue: [
    { id: '1', platform: 'Instagram', priority: 1, action: 'Reply to 5 comments', dueTime: new Date(Date.now() + 30 * 60000).toISOString() },
    { id: '2', platform: 'YouTube', priority: 2, action: 'Heart 10 comments', dueTime: new Date(Date.now() + 60 * 60000).toISOString() },
    { id: '3', platform: 'TikTok', priority: 3, action: 'Pin best comment', dueTime: new Date(Date.now() + 90 * 60000).toISOString() },
  ],
  autoPilotStatus: {
    isActive: true,
    activeModules: ['Comment Response', 'Engagement Tracking'],
    lastAction: 'Replied to 12 comments',
  },
  crisisProtocols: [
    { id: '1', name: 'Negative Viral', trigger: 'Sentiment drops below 30%', isActive: true },
    { id: '2', name: 'Bot Attack', trigger: 'Bot detection > 50/hour', isActive: true },
    { id: '3', name: 'Copyright Claim', trigger: 'Claim detected', isActive: false },
  ],
};

// Studio Data
export const mockStudioData: StudioData = {
  contentQueue: [
    { id: '1', title: 'How I Grew to 100K in 6 Months', status: 'Ready to Publish', platform: 'YouTube', scheduledTime: new Date(Date.now() + 4 * 3600000).toISOString() },
    { id: '2', title: 'Behind the Scenes: My Setup', status: 'Editing', platform: 'Instagram' },
    { id: '3', title: '3 Tools Every Creator Needs', status: 'Thumbnail Needed', platform: 'TikTok' },
  ],
  thumbnailTests: [
    { 
      id: '1', 
      variants: [
        { id: 'a', url: '/thumb-a.jpg', predictedCTR: 8.4 },
        { id: 'b', url: '/thumb-b.jpg', predictedCTR: 9.1 },
      ],
      predictedWinner: 'b',
      confidence: 73,
    },
  ],
  videoAudits: [
    { 
      id: '1', 
      videoId: 'vid_123', 
      score: 82, 
      issues: [
        { type: 'Audio', severity: 'medium', description: 'Voice levels inconsistent at 2:34' },
        { type: 'Visual', severity: 'low', description: 'Thumbnail could use more contrast' },
      ],
    },
  ],
  titleOptimizations: {
    original: 'My Content Creation Process',
    suggestions: [
      'How I Create Viral Content (Exact Process)',
      'The Content System That Got Me 100K Subs',
      'I Analyzed 500 Viral Videos. Here\'s What Works.',
    ],
    viralScores: [72, 85, 91],
  },
};

// Growth Data
export const mockGrowthData: GrowthData = {
  monetizationProgress: {
    current: 87500,
    target: 100000,
    requirements: [
      { name: 'Subscribers', current: 87500, target: 100000, isMet: false },
      { name: 'Watch Hours', current: 4200, target: 4000, isMet: true },
      { name: 'Public Videos', current: 45, target: 30, isMet: true },
    ],
  },
  contentGaps: [
    { topic: 'AI for Creators', searchVolume: 12500, competition: 'low', yourCoverage: 15 },
    { topic: 'Monetization Strategies', searchVolume: 8900, competition: 'medium', yourCoverage: 35 },
    { topic: 'Platform Algorithm', searchVolume: 15600, competition: 'high', yourCoverage: 20 },
    { topic: 'Creator Burnout', searchVolume: 6700, competition: 'low', yourCoverage: 10 },
  ],
  viralCoefficient: {
    current: 1.34,
    trend: 'up',
    factors: [
      { name: 'Share Rate', impact: 0.42 },
      { name: 'Comment Velocity', impact: 0.38 },
      { name: 'Save Rate', impact: 0.31 },
      { name: 'Watch Through', impact: 0.23 },
    ],
  },
  burnoutRisk: {
    score: 42,
    level: 'medium',
    warningSigns: ['Posting frequency declining', 'Engagement response time increasing'],
    recommendations: ['Schedule break in 2 weeks', 'Batch content creation', 'Delegate community management'],
  },
};

// Control Tower Data
export const mockControlTowerData: ControlTowerData = {
  scoutStatus: {
    active: 12,
    queued: 8,
    completed: 156,
    failed: 3,
  },
  apiHealth: {
    overall: 98,
    services: [
      { name: 'YouTube API', status: 'healthy', latency: 120 },
      { name: 'Instagram API', status: 'healthy', latency: 95 },
      { name: 'TikTok API', status: 'degraded', latency: 450 },
      { name: 'Twitter API', status: 'healthy', latency: 80 },
    ],
  },
  parallelCreators: [
    { id: '1', name: 'Content Clone Alpha', status: 'Running', progress: 67 },
    { id: '2', name: 'Engagement Bot Beta', status: 'Paused', progress: 34 },
  ],
  complianceStatus: {
    ftc: true,
    gdpr: true,
    lastAudit: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    issues: 0,
  },
};

// Liminal Data
export const mockLiminalData: LiminalData = {
  dopamineDebt: {
    score: 68,
    metrics: [
      { name: 'Scroll Time', value: 4.2 },
      { name: 'Notification Checks', value: 89 },
      { name: 'Engagement Anxiety', value: 6.5 },
    ],
    recommendations: ['Set app time limits', 'Turn off non-essential notifications', 'Schedule digital detox days'],
  },
  commentArchaeology: [
    { id: '1', content: 'This changed my perspective completely', date: '2023-06-15', significance: 'High engagement driver' },
    { id: '2', content: 'First video I watched from you', date: '2023-03-22', significance: 'Audience origin point' },
  ],
  voiceCracks: [
    { timestamp: '2:34', type: 'Pitch drop', severity: 7 },
    { timestamp: '5:12', type: 'Volume spike', severity: 5 },
  ],
  lastVideoSyndrome: {
    riskScore: 73,
    pattern: 'Declining engagement on final videos of series',
    prediction: 'High risk of creator block in next 2 weeks',
  },
};
