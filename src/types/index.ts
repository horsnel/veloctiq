// VELOCTIQ - Type Definitions

// Feature Result
export interface FeatureResult {
  success: boolean;
  data: any;
  source: 'browser' | 'api' | 'cache';
  featureId: string;
}

// Token System
export interface TokenPackage {
  id: string;
  name: string;
  vqtAmount: number;
  nairaPrice: number;
  bonus: number;
  popular?: boolean;
}

export interface TokenBalance {
  vqt: number;
  nairaEquivalent: number;
}

export interface TokenTransaction {
  id: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  amount: number;
  description: string;
  timestamp: string;
  featureId?: string;
}

// Feature System
export interface Feature {
  id: string;
  code: string;
  name: string;
  description: string;
  vqtCost: number;
  nairaEquivalent: number;
  category: FeatureCategory;
  subCategory?: string;
  isFree: boolean;
  isAvailable: boolean;
  requiresLiminal?: boolean;
  icon: string;
}

export type FeatureCategory = 
  | 'shield' 
  | 'listener' 
  | 'bank' 
  | 'arena' 
  | 'actionHub' 
  | 'studio' 
  | 'growth' 
  | 'controlTower'
  | 'liminal'
  | 'subliminal'
  | 'temporal'
  | 'vex';

export interface FeatureModule {
  id: FeatureCategory;
  name: string;
  description: string;
  badge: string;
  features: Feature[];
  color: string;
}

// User System
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  handle?: string;
  plan: 'free' | 'starter' | 'creator' | 'professional' | 'sovereign' | 'whale';
  tokenBalance: number;
  isLiminalOptIn: boolean;
  createdAt: string;
  lastLogin: string;
  connectedPlatforms: ConnectedPlatform[];
}

export interface ConnectedPlatform {
  id: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook';
  handle: string;
  followerCount: number;
  isActive: boolean;
  connectedAt: string;
}

// Auth System
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
}

// Dashboard Data
export interface DashboardData {
  liveSignals: LiveSignal[];
  revenueHeatmap: RevenueData[];
  channelHealth: ChannelHealth;
  goldenHour: GoldenHour;
  recentActivity: ActivityItem[];
}

export interface LiveSignal {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  message: string;
  module: string;
  timestamp: string;
  isRead: boolean;
}

export interface RevenueData {
  date: string;
  amount: number;
  source: string;
}

export interface ChannelHealth {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  metrics: HealthMetric[];
}

export interface HealthMetric {
  name: string;
  value: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
}

export interface GoldenHour {
  optimalTimes: string[];
  timezone: string;
  nextBestTime: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  vqtCost?: number;
}

// Shield Module Data
export interface ShieldData {
  botQuarantine: BotEntry[];
  shadowBanStatus: ShadowBanStatus;
  linkLockStatus: LinkLockStatus;
  toxicitySettings: ToxicitySettings;
}

export interface BotEntry {
  id: string;
  username: string;
  platform: string;
  confidence: number;
  detectedAt: string;
  reason: string;
}

export interface ShadowBanStatus {
  isShadowBanned: boolean;
  platforms: string[];
  lastChecked: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface LinkLockStatus {
  activeLocks: number;
  totalProtected: number;
  recentViolations: number;
}

export interface ToxicitySettings {
  threshold: number;
  autoFilter: boolean;
  customWords: string[];
}

// Listener Module Data
export interface ListenerData {
  audienceSegments: AudienceSegment[];
  sentimentAnalysis: SentimentData;
  superFans: SuperFan[];
  ghostAudience: GhostAudience;
  wishlist: WishlistItem[];
}

export interface AudienceSegment {
  id: string;
  name: string;
  percentage: number;
  soulAge: string;
  interests: string[];
}

export interface SentimentData {
  overall: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trends: SentimentTrend[];
}

export interface SentimentTrend {
  date: string;
  score: number;
}

export interface SuperFan {
  id: string;
  username: string;
  platform: string;
  engagementScore: number;
  lastActive: string;
}

export interface GhostAudience {
  total: number;
  percentage: number;
  riskLevel: string;
}

export interface WishlistItem {
  id: string;
  content: string;
  mentions: number;
  sentiment: string;
}

// Bank Module Data
export interface BankData {
  buyingIntent: BuyingIntent[];
  sponsorInventory: SponsorInventory;
  affiliateMatches: AffiliateMatch[];
  revenueForecast: RevenueForecast;
}

export interface BuyingIntent {
  id: string;
  keyword: string;
  score: number;
  volume: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SponsorInventory {
  totalSlots: number;
  filledSlots: number;
  pendingDeals: number;
  estimatedValue: number;
}

export interface AffiliateMatch {
  id: string;
  brand: string;
  fitScore: number;
  commission: string;
  category: string;
}

export interface RevenueForecast {
  next30Days: number;
  next90Days: number;
  confidence: number;
}

// Arena Module Data
export interface ArenaData {
  competitors: Competitor[];
  shareOfVoice: ShareOfVoice;
  hookLibrary: Hook[];
  keywordGaps: KeywordGap[];
}

export interface Competitor {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followerCount: number;
  engagementRate: number;
  growthVelocity: number;
}

export interface ShareOfVoice {
  yourPercentage: number;
  competitors: { name: string; percentage: number }[];
}

export interface Hook {
  id: string;
  content: string;
  performance: number;
  category: string;
}

export interface KeywordGap {
  keyword: string;
  yourRank: number;
  competitorRank: number;
  opportunity: number;
}

// Action Hub Data
export interface ActionHubData {
  ghostwriterQueue: GhostwriterTask[];
  engagementQueue: EngagementTask[];
  autoPilotStatus: AutoPilotStatus;
  crisisProtocols: CrisisProtocol[];
}

export interface GhostwriterTask {
  id: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed';
  content?: string;
  createdAt: string;
}

export interface EngagementTask {
  id: string;
  platform: string;
  priority: number;
  action: string;
  dueTime: string;
}

export interface AutoPilotStatus {
  isActive: boolean;
  activeModules: string[];
  lastAction: string;
}

export interface CrisisProtocol {
  id: string;
  name: string;
  trigger: string;
  isActive: boolean;
}

// Studio Module Data
export interface StudioData {
  contentQueue: ContentItem[];
  thumbnailTests: ThumbnailTest[];
  videoAudits: VideoAudit[];
  titleOptimizations: TitleOptimization;
}

export interface ContentItem {
  id: string;
  title: string;
  status: string;
  platform: string;
  scheduledTime?: string;
}

export interface ThumbnailTest {
  id: string;
  variants: ThumbnailVariant[];
  predictedWinner: string;
  confidence: number;
}

export interface ThumbnailVariant {
  id: string;
  url: string;
  predictedCTR: number;
}

export interface VideoAudit {
  id: string;
  videoId: string;
  score: number;
  issues: AuditIssue[];
}

export interface AuditIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface TitleOptimization {
  original: string;
  suggestions: string[];
  viralScores: number[];
}

// Growth Module Data
export interface GrowthData {
  monetizationProgress: MonetizationProgress;
  contentGaps: ContentGap[];
  viralCoefficient: ViralCoefficient;
  burnoutRisk: BurnoutRisk;
}

export interface MonetizationProgress {
  current: number;
  target: number;
  requirements: Requirement[];
}

export interface Requirement {
  name: string;
  current: number;
  target: number;
  isMet: boolean;
}

export interface ContentGap {
  topic: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  yourCoverage: number;
}

export interface ViralCoefficient {
  current: number;
  trend: 'up' | 'down' | 'stable';
  factors: ViralFactor[];
}

export interface ViralFactor {
  name: string;
  impact: number;
}

export interface BurnoutRisk {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  warningSigns: string[];
  recommendations: string[];
}

// Control Tower Data
export interface ControlTowerData {
  scoutStatus: ScoutStatus;
  apiHealth: ApiHealth;
  parallelCreators: ParallelCreator[];
  complianceStatus: ComplianceStatus;
}

export interface ScoutStatus {
  active: number;
  queued: number;
  completed: number;
  failed: number;
}

export interface ApiHealth {
  overall: number;
  services: ApiService[];
}

export interface ApiService {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
}

export interface ParallelCreator {
  id: string;
  name: string;
  status: string;
  progress: number;
}

export interface ComplianceStatus {
  ftc: boolean;
  gdpr: boolean;
  lastAudit: string;
  issues: number;
}

// Liminal Module Data
export interface LiminalData {
  dopamineDebt: DopamineDebt;
  commentArchaeology: ArchaeologyFind[];
  voiceCracks: VoiceCrack[];
  lastVideoSyndrome: LastVideoSyndrome;
}

export interface DopamineDebt {
  score: number;
  metrics: { name: string; value: number }[];
  recommendations: string[];
}

export interface ArchaeologyFind {
  id: string;
  content: string;
  date: string;
  significance: string;
}

export interface VoiceCrack {
  timestamp: string;
  type: string;
  severity: number;
}

export interface LastVideoSyndrome {
  riskScore: number;
  pattern: string;
  prediction: string;
}

// UI State
export interface UIState {
  sidebarOpen: boolean;
  currentModule: string;
  notifications: Notification[];
  theme: 'light' | 'dark';
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// Onboarding
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface OnboardingData {
  howDidYouHear: string;
  profileSetup: boolean;
  platformsConnected: boolean;
  tokensPurchased: boolean;
  liminalConsent: boolean;
}

// Payment
export interface PaymentData {
  reference: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  packageId: string;
  timestamp: string;
}
