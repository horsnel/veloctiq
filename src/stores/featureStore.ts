import { create } from 'zustand';
import type { Feature, FeatureModule, FeatureCategory } from '@/types';

interface FeatureStore {
  modules: FeatureModule[];
  allFeatures: Feature[];
  getFeaturesByCategory: (category: FeatureCategory) => Feature[];
  getFeatureById: (id: string) => Feature | undefined;
  getModuleById: (id: FeatureCategory) => FeatureModule | undefined;
}

// All 136 Features
const allFeatures: Feature[] = [
  // SHIELD (1-15)
  { id: 'f1', code: 'F1', name: 'Behavioral Bot Identification', description: 'Detect bots using behavioral patterns', vqtCost: 1, nairaEquivalent: 10, category: 'shield', isFree: false, isAvailable: true, icon: 'Bot' },
  { id: 'f2', code: 'F2', name: 'Link-Lock Protocol', description: 'Secure your links from unauthorized access', vqtCost: 0, nairaEquivalent: 0, category: 'shield', isFree: true, isAvailable: true, icon: 'Link' },
  { id: 'f3', code: 'F3', name: 'Toxicity Threshold Slider', description: 'Adjust content filtering sensitivity', vqtCost: 0, nairaEquivalent: 0, category: 'shield', isFree: true, isAvailable: true, icon: 'SlidersHorizontal' },
  { id: 'f4', code: 'F4', name: 'Shadow-Ban Early Warning System', description: 'Get alerts before shadow bans hit', vqtCost: 5, nairaEquivalent: 50, category: 'shield', isFree: false, isAvailable: true, icon: 'AlertTriangle' },
  { id: 'f5', code: 'F5', name: 'Narrative Hijack Alert', description: 'Detect when your narrative is being hijacked', vqtCost: 3, nairaEquivalent: 30, category: 'shield', isFree: false, isAvailable: true, icon: 'MessageSquareWarning' },
  { id: 'f6', code: 'F6', name: 'The Ghost Function', description: 'Ghost mode for sensitive operations', vqtCost: 2, nairaEquivalent: 20, category: 'shield', isFree: false, isAvailable: true, icon: 'Ghost' },
  { id: 'f7', code: 'F7', name: 'IP Leak Protection', description: 'Protect your IP address from leaks', vqtCost: 0, nairaEquivalent: 0, category: 'shield', isFree: true, isAvailable: true, icon: 'Shield' },
  { id: 'f8', code: 'F8', name: 'Prompt Injection Filter', description: 'Filter malicious prompt injections', vqtCost: 0, nairaEquivalent: 0, category: 'shield', isFree: true, isAvailable: true, icon: 'Filter' },
  { id: 'f9', code: 'F9', name: 'Two-Factor Terminal Auth', description: 'Secure 2FA for terminal access', vqtCost: 0, nairaEquivalent: 0, category: 'shield', isFree: true, isAvailable: true, icon: 'KeyRound' },
  { id: 'f10', code: 'F10', name: 'Deepfake & Biometric Guard', description: 'Detect deepfakes and biometric spoofing', vqtCost: 10, nairaEquivalent: 100, category: 'shield', isFree: false, isAvailable: true, icon: 'ScanFace' },
  { id: 'f11', code: 'F11', name: 'Community Note Early Warning', description: 'Get early warnings on community notes', vqtCost: 2, nairaEquivalent: 20, category: 'shield', isFree: false, isAvailable: true, icon: 'Users' },
  { id: 'f12', code: 'F12', name: 'LLM Narrative Auditor', description: 'Audit narratives using LLM analysis', vqtCost: 15, nairaEquivalent: 150, category: 'shield', isFree: false, isAvailable: true, icon: 'FileSearch' },
  { id: 'f13', code: 'F13', name: 'Shadow Ban Ouija Board', description: 'Advanced shadow ban diagnostics', vqtCost: 25, nairaEquivalent: 250, category: 'shield', isFree: false, isAvailable: true, icon: 'Mystery' },
  { id: 'f14', code: 'F14', name: 'Thumbnail Color Exorcist', description: 'Optimize thumbnail colors for engagement', vqtCost: 5, nairaEquivalent: 50, category: 'shield', isFree: false, isAvailable: true, icon: 'Palette' },
  { id: 'f15', code: 'F15', name: 'Prompt Injection Shield 2.0', description: 'Advanced prompt injection protection', vqtCost: 0, nairaEquivalent: 0, category: 'shield', isFree: true, isAvailable: true, icon: 'ShieldCheck' },

  // LISTENER (16-32)
  { id: 'f16', code: 'F16', name: 'Wishlist Extraction Engine', description: 'Extract audience wishlists from comments', vqtCost: 3, nairaEquivalent: 30, category: 'listener', isFree: false, isAvailable: true, icon: 'ListTodo' },
  { id: 'f17', code: 'F17', name: 'Technical Friction Monitor', description: 'Monitor technical issues affecting engagement', vqtCost: 2, nairaEquivalent: 20, category: 'listener', isFree: false, isAvailable: true, icon: 'Activity' },
  { id: 'f18', code: 'F18', name: 'Super-Fan Leaderboard', description: 'Track and rank your most engaged fans', vqtCost: 1, nairaEquivalent: 10, category: 'listener', isFree: false, isAvailable: true, icon: 'Trophy' },
  { id: 'f19', code: 'F19', name: 'Question Deduplication', description: 'Remove duplicate questions from comments', vqtCost: 2, nairaEquivalent: 20, category: 'listener', isFree: false, isAvailable: true, icon: 'CopyX' },
  { id: 'f20', code: 'F20', name: 'Tone-Shift Detection', description: 'Detect sudden tone changes in comments', vqtCost: 5, nairaEquivalent: 50, category: 'listener', isFree: false, isAvailable: true, icon: 'Waveform' },
  { id: 'f21', code: 'F21', name: 'Viral Signal Predictor', description: 'Predict viral potential of content', vqtCost: 10, nairaEquivalent: 100, category: 'listener', isFree: false, isAvailable: true, icon: 'TrendingUp' },
  { id: 'f22', code: 'F22', name: 'Audience Demographic Estimation', description: 'Estimate audience demographics', vqtCost: 3, nairaEquivalent: 30, category: 'listener', isFree: false, isAvailable: true, icon: 'PieChart' },
  { id: 'f23', code: 'F23', name: 'Engagement Heatmap', description: 'Visualize engagement patterns', vqtCost: 4, nairaEquivalent: 40, category: 'listener', isFree: false, isAvailable: true, icon: 'Grid3x3' },
  { id: 'f24', code: 'F24', name: 'Multi-Language Sentiment Translation', description: 'Translate and analyze sentiment across languages', vqtCost: 2, nairaEquivalent: 20, category: 'listener', isFree: false, isAvailable: true, icon: 'Languages' },
  { id: 'f25', code: 'F25', name: 'Dark Social Signal Capture', description: 'Capture signals from dark social sharing', vqtCost: 8, nairaEquivalent: 80, category: 'listener', isFree: false, isAvailable: true, icon: 'EyeOff' },
  { id: 'f26', code: 'F26', name: 'Commenter Soul Age Estimator', description: 'Estimate the maturity level of commenters', vqtCost: 5, nairaEquivalent: 50, category: 'listener', isFree: false, isAvailable: true, icon: 'Brain' },
  { id: 'f27', code: 'F27', name: 'Ghost Audience Detector', description: 'Detect inactive or ghost followers', vqtCost: 6, nairaEquivalent: 60, category: 'listener', isFree: false, isAvailable: true, icon: 'UserX' },
  { id: 'f28', code: 'F28', name: 'Audience Dream Content Generator', description: 'Generate content based on audience desires', vqtCost: 15, nairaEquivalent: 150, category: 'listener', isFree: false, isAvailable: true, icon: 'Sparkles' },
  { id: 'f29', code: 'F29', name: 'The Haunting', description: 'Detect anomalous audience behavior', vqtCost: 20, nairaEquivalent: 200, category: 'listener', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'Ghost' },
  { id: 'f30', code: 'F30', name: 'Parasocial Intimacy Leak Detector', description: 'Detect unhealthy parasocial relationships', vqtCost: 12, nairaEquivalent: 120, category: 'listener', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'HeartCrack' },
  { id: 'f31', code: 'F31', name: 'Content Seance', description: 'Analyze deleted or hidden content', vqtCost: 25, nairaEquivalent: 250, category: 'listener', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'Candle' },
  { id: 'f32', code: 'F32', name: 'Comment Section Seance', description: 'Recover and analyze deleted comments', vqtCost: 18, nairaEquivalent: 180, category: 'listener', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'MessageSquare' },

  // BANK (33-48)
  { id: 'f33', code: 'F33', name: 'Buying Intent Scoring', description: 'Score audience buying intent', vqtCost: 2, nairaEquivalent: 20, category: 'bank', isFree: false, isAvailable: true, icon: 'ShoppingCart' },
  { id: 'f34', code: 'F34', name: 'Affiliate Matchmaker', description: 'Find optimal affiliate partnerships', vqtCost: 5, nairaEquivalent: 50, category: 'bank', isFree: false, isAvailable: true, icon: 'Handshake' },
  { id: 'f35', code: 'F35', name: 'Trend Blue Ocean Radar', description: 'Discover untapped trend opportunities', vqtCost: 8, nairaEquivalent: 80, category: 'bank', isFree: false, isAvailable: true, icon: 'Radar' },
  { id: 'f36', code: 'F36', name: 'ROI Forecaster', description: 'Forecast return on investment', vqtCost: 10, nairaEquivalent: 100, category: 'bank', isFree: false, isAvailable: true, icon: 'LineChart' },
  { id: 'f37', code: 'F37', name: 'Product Trend Lab', description: 'Research product trends', vqtCost: 6, nairaEquivalent: 60, category: 'bank', isFree: false, isAvailable: true, icon: 'FlaskConical' },
  { id: 'f38', code: 'F38', name: 'Link Health Monitor', description: 'Monitor affiliate link health', vqtCost: 1, nairaEquivalent: 10, category: 'bank', isFree: false, isAvailable: true, icon: 'HeartPulse' },
  { id: 'f39', code: 'F39', name: 'Niche Profitability Benchmarking', description: 'Benchmark niche profitability', vqtCost: 4, nairaEquivalent: 40, category: 'bank', isFree: false, isAvailable: true, icon: 'BarChart3' },
  { id: 'f40', code: 'F40', name: 'Automated Revenue Reporting', description: 'Automate revenue reports', vqtCost: 3, nairaEquivalent: 30, category: 'bank', isFree: false, isAvailable: true, icon: 'FileBarChart' },
  { id: 'f41', code: 'F41', name: 'Campaign Lifecycle Manager', description: 'Manage campaign lifecycles', vqtCost: 2, nairaEquivalent: 20, category: 'bank', isFree: false, isAvailable: true, icon: 'CalendarDays' },
  { id: 'f42', code: 'F42', name: 'Social-to-Ledger Financial Sync', description: 'Sync social data with financial records', vqtCost: 0, nairaEquivalent: 0, category: 'bank', isFree: true, isAvailable: true, icon: 'RefreshCw' },
  { id: 'f43', code: 'F43', name: 'Sponsor Shadow Inventory', description: 'Track hidden sponsorship opportunities', vqtCost: 20, nairaEquivalent: 200, category: 'bank', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'Building2' },
  { id: 'f44', code: 'F44', name: 'Sponsorship Rate Calculator', description: 'Calculate optimal sponsorship rates', vqtCost: 8, nairaEquivalent: 80, category: 'bank', isFree: false, isAvailable: true, icon: 'Calculator' },
  { id: 'f45', code: 'F45', name: 'Content Debt Forecaster', description: 'Forecast content creation debt', vqtCost: 12, nairaEquivalent: 120, category: 'bank', isFree: false, isAvailable: true, icon: 'AlertCircle' },
  { id: 'f46', code: 'F46', name: 'Sponsor Jingle Trauma Score', description: 'Analyze sponsor content reception', vqtCost: 6, nairaEquivalent: 60, category: 'bank', isFree: false, isAvailable: true, icon: 'Music' },
  { id: 'f47', code: 'F47', name: 'Affiliate Link Placement Optimizer', description: 'Optimize affiliate link placement', vqtCost: 5, nairaEquivalent: 50, category: 'bank', isFree: false, isAvailable: true, icon: 'MousePointerClick' },
  { id: 'f48', code: 'F48', name: 'Revenue Leak Detection', description: 'Detect revenue leaks', vqtCost: 10, nairaEquivalent: 100, category: 'bank', isFree: false, isAvailable: true, icon: 'Droplets' },

  // ARENA (49-64)
  { id: 'f49', code: 'F49', name: 'Share of Voice Benchmarking', description: 'Benchmark your share of voice', vqtCost: 5, nairaEquivalent: 50, category: 'arena', isFree: false, isAvailable: true, icon: 'Volume2' },
  { id: 'f50', code: 'F50', name: 'Engagement Velocity Alerts', description: 'Get alerts on engagement velocity changes', vqtCost: 3, nairaEquivalent: 30, category: 'arena', isFree: false, isAvailable: true, icon: 'Zap' },
  { id: 'f51', code: 'F51', name: 'The Hook Library', description: 'Access proven hook templates', vqtCost: 8, nairaEquivalent: 80, category: 'arena', isFree: false, isAvailable: true, icon: 'Library' },
  { id: 'f52', code: 'F52', name: 'Ad-Spend Transparency', description: 'Analyze competitor ad spend', vqtCost: 12, nairaEquivalent: 120, category: 'arena', isFree: false, isAvailable: true, icon: 'Eye' },
  { id: 'f53', code: 'F53', name: 'AI Visibility Toolkit', description: 'Tools for AI search visibility', vqtCost: 10, nairaEquivalent: 100, category: 'arena', isFree: false, isAvailable: true, icon: 'Search' },
  { id: 'f54', code: 'F54', name: 'Content Counter-Strike Logic', description: 'Strategic content response planning', vqtCost: 15, nairaEquivalent: 150, category: 'arena', isFree: false, isAvailable: true, icon: 'Sword' },
  { id: 'f55', code: 'F55', name: 'Follower Migration Tracker', description: 'Track follower movements', vqtCost: 6, nairaEquivalent: 60, category: 'arena', isFree: false, isAvailable: true, icon: 'UsersRound' },
  { id: 'f56', code: 'F56', name: 'Cross-Niche Rivalry Map', description: 'Map competition across niches', vqtCost: 8, nairaEquivalent: 80, category: 'arena', isFree: false, isAvailable: true, icon: 'Map' },
  { id: 'f57', code: 'F57', name: 'Historical Growth Auditing', description: 'Audit historical growth patterns', vqtCost: 4, nairaEquivalent: 40, category: 'arena', isFree: false, isAvailable: true, icon: 'History' },
  { id: 'f58', code: 'F58', name: 'Multi-Modal Vision Scout', description: 'Analyze visual content across platforms', vqtCost: 7, nairaEquivalent: 70, category: 'arena', isFree: false, isAvailable: true, icon: 'Scan' },
  { id: 'f59', code: 'F59', name: 'Dead Creator Inheritance Protocol', description: 'Analyze inactive creator audiences', vqtCost: 25, nairaEquivalent: 250, category: 'arena', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'Scroll' },
  { id: 'f60', code: 'F60', name: 'The Uncanny Valley of You', description: 'Analyze your digital persona', vqtCost: 30, nairaEquivalent: 300, category: 'arena', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'UserCircle' },
  { id: 'f61', code: 'F61', name: 'Competitor Thumbnail Face Micro-Expression Analyzer', description: 'Analyze competitor thumbnail expressions', vqtCost: 10, nairaEquivalent: 100, category: 'arena', isFree: false, isAvailable: true, icon: 'Face' },
  { id: 'f62', code: 'F62', name: 'Collaboration Matchmaker (Asymmetric)', description: 'Find asymmetric collaboration opportunities', vqtCost: 8, nairaEquivalent: 80, category: 'arena', isFree: false, isAvailable: true, icon: 'UserPlus' },
  { id: 'f63', code: 'F63', name: 'Viral Mechanism Reverse-Engineer', description: 'Reverse-engineer viral content', vqtCost: 12, nairaEquivalent: 120, category: 'arena', isFree: false, isAvailable: true, icon: 'Cog' },
  { id: 'f64', code: 'F64', name: 'Competitive Keyword Gap Analysis', description: 'Analyze keyword gaps vs competitors', vqtCost: 5, nairaEquivalent: 50, category: 'arena', isFree: false, isAvailable: true, icon: 'AlignLeft' },

  // ACTION HUB (65-78)
  { id: 'f65', code: 'F65', name: 'Unified OAuth Vault', description: 'Centralized OAuth token management', vqtCost: 0, nairaEquivalent: 0, category: 'actionHub', isFree: true, isAvailable: true, icon: 'Vault' },
  { id: 'f66', code: 'F66', name: 'AI Ghostwriter', description: 'AI-powered content writing', vqtCost: 2, nairaEquivalent: 20, category: 'actionHub', isFree: false, isAvailable: true, icon: 'PenTool' },
  { id: 'f67', code: 'F67', name: 'The Action Slider UI', description: 'Intuitive action control interface', vqtCost: 0, nairaEquivalent: 0, category: 'actionHub', isFree: true, isAvailable: true, icon: 'Sliders' },
  { id: 'f68', code: 'F68', name: 'Engagement Priority Queue', description: 'Prioritize engagement actions', vqtCost: 1, nairaEquivalent: 10, category: 'actionHub', isFree: false, isAvailable: true, icon: 'ListOrdered' },
  { id: 'f69', code: 'F69', name: 'Smart Thread Summarization', description: 'Summarize long comment threads', vqtCost: 3, nairaEquivalent: 30, category: 'actionHub', isFree: false, isAvailable: true, icon: 'Text' },
  { id: 'f70', code: 'F70', name: 'Brand Voice Trainer', description: 'Train AI on your brand voice', vqtCost: 0, nairaEquivalent: 0, category: 'actionHub', isFree: true, isAvailable: true, icon: 'Mic' },
  { id: 'f71', code: 'F71', name: 'Automated Media Resizer', description: 'Auto-resize media for platforms', vqtCost: 1, nairaEquivalent: 10, category: 'actionHub', isFree: false, isAvailable: true, icon: 'Image' },
  { id: 'f72', code: 'F72', name: 'The Agentic Auto-Pilot Toggle', description: 'Enable autonomous actions', vqtCost: 0, nairaEquivalent: 0, category: 'actionHub', isFree: true, isAvailable: true, icon: 'Plane' },
  { id: 'f73', code: 'F73', name: 'Comment-to-Content Pipeline', description: 'Turn comments into content ideas', vqtCost: 5, nairaEquivalent: 50, category: 'actionHub', isFree: false, isAvailable: true, icon: 'ArrowRightLeft' },
  { id: 'f74', code: 'F74', name: 'Sentiment-Based Response Routing', description: 'Route responses based on sentiment', vqtCost: 2, nairaEquivalent: 20, category: 'actionHub', isFree: false, isAvailable: true, icon: 'Route' },
  { id: 'f75', code: 'F75', name: 'Contextual Cross-Reference Engine', description: 'Cross-reference content context', vqtCost: 3, nairaEquivalent: 30, category: 'actionHub', isFree: false, isAvailable: true, icon: 'GitCompare' },
  { id: 'f76', code: 'F76', name: 'Influencer Mention Auto-Response', description: 'Auto-respond to influencer mentions', vqtCost: 4, nairaEquivalent: 40, category: 'actionHub', isFree: false, isAvailable: true, icon: 'AtSign' },
  { id: 'f77', code: 'F77', name: 'Crisis Response Protocol', description: 'Automated crisis management', vqtCost: 10, nairaEquivalent: 100, category: 'actionHub', isFree: false, isAvailable: true, icon: 'Siren' },
  { id: 'f78', code: 'F78', name: 'Engagement Fatigue Predictor', description: 'Predict audience fatigue', vqtCost: 6, nairaEquivalent: 60, category: 'actionHub', isFree: false, isAvailable: true, icon: 'BatteryWarning' },

  // STUDIO (79-96)
  { id: 'f79', code: 'F79', name: 'Content Architect', description: 'AI content structure planning', vqtCost: 8, nairaEquivalent: 80, category: 'studio', isFree: false, isAvailable: true, icon: 'DraftingCompass' },
  { id: 'f80', code: 'F80', name: 'Watermark Stripper', description: 'Remove watermarks from media', vqtCost: 3, nairaEquivalent: 30, category: 'studio', isFree: false, isAvailable: true, icon: 'Droplet' },
  { id: 'f81', code: 'F81', name: 'The Video Auditor', description: 'Comprehensive video analysis', vqtCost: 5, nairaEquivalent: 50, category: 'studio', isFree: false, isAvailable: true, icon: 'Video' },
  { id: 'f82', code: 'F82', name: 'Thumbnail Oracle', description: 'AI thumbnail optimization', vqtCost: 6, nairaEquivalent: 60, category: 'studio', isFree: false, isAvailable: true, icon: 'ImagePlus' },
  { id: 'f83', code: 'F83', name: 'Transcript Extractor & Copier', description: 'Extract and copy video transcripts', vqtCost: 2, nairaEquivalent: 20, category: 'studio', isFree: false, isAvailable: true, icon: 'FileText' },
  { id: 'f84', code: 'F84', name: 'SEO Meta-Generator', description: 'Generate SEO metadata', vqtCost: 4, nairaEquivalent: 40, category: 'studio', isFree: false, isAvailable: true, icon: 'Tags' },
  { id: 'f85', code: 'F85', name: 'Predictive Retention Heatmaps', description: 'Predict viewer retention patterns', vqtCost: 7, nairaEquivalent: 70, category: 'studio', isFree: false, isAvailable: true, icon: 'Flame' },
  { id: 'f86', code: 'F86', name: 'The Evergreen Re-Generator', description: 'Refresh evergreen content', vqtCost: 10, nairaEquivalent: 100, category: 'studio', isFree: false, isAvailable: true, icon: 'Recycle' },
  { id: 'f87', code: 'F87', name: 'The Voice Cracks', description: 'Analyze voice patterns', vqtCost: 12, nairaEquivalent: 120, category: 'studio', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'AudioLines' },
  { id: 'f88', code: 'F88', name: 'The ASMR of Your Editing', description: 'Analyze editing rhythm', vqtCost: 8, nairaEquivalent: 80, category: 'studio', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'Waves' },
  { id: 'f89', code: 'F89', name: 'Video Autopsy: The Death Replay', description: 'Deep video performance analysis', vqtCost: 15, nairaEquivalent: 150, category: 'studio', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'Skull' },
  { id: 'f90', code: 'F90', name: 'Voice Crunchiness Detector', description: 'Detect voice quality issues', vqtCost: 6, nairaEquivalent: 60, category: 'studio', isFree: false, isAvailable: true, icon: 'Mic2' },
  { id: 'f91', code: 'F91', name: 'Thumbnail A/B Test Predictor', description: 'Predict A/B test winners', vqtCost: 5, nairaEquivalent: 50, category: 'studio', isFree: false, isAvailable: true, icon: 'Split' },
  { id: 'f92', code: 'F92', name: 'Title Optimizer / Viral Score Checker', description: 'Optimize titles for virality', vqtCost: 3, nairaEquivalent: 30, category: 'studio', isFree: false, isAvailable: true, icon: 'Type' },
  { id: 'f93', code: 'F93', name: 'Hashtag/Keyword Extractor', description: 'Extract optimal hashtags', vqtCost: 2, nairaEquivalent: 20, category: 'studio', isFree: false, isAvailable: true, icon: 'Hash' },
  { id: 'f94', code: 'F94', name: 'Content Rhythm Composer', description: 'Optimize content pacing', vqtCost: 7, nairaEquivalent: 70, category: 'studio', isFree: false, isAvailable: true, icon: 'Music2' },
  { id: 'f95', code: 'F95', name: 'Visual Pattern Interrupt Generator', description: 'Generate attention-grabbing visuals', vqtCost: 4, nairaEquivalent: 40, category: 'studio', isFree: false, isAvailable: true, icon: 'Sparkle' },
  { id: 'f96', code: 'F96', name: 'Quantum Content — The Unuploaded', description: 'Analyze unpublished content potential', vqtCost: 25, nairaEquivalent: 250, category: 'studio', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'Atom' },

  // GROWTH (97-108)
  { id: 'f97', code: 'F97', name: 'Road to Monetization Daily HUD', description: 'Daily monetization progress dashboard', vqtCost: 0, nairaEquivalent: 0, category: 'growth', isFree: true, isAvailable: true, icon: 'Target' },
  { id: 'f98', code: 'F98', name: 'Channel Health Auditor', description: 'Comprehensive channel health check', vqtCost: 5, nairaEquivalent: 50, category: 'growth', isFree: false, isAvailable: true, icon: 'Stethoscope' },
  { id: 'f99', code: 'F99', name: 'Golden Hour Command', description: 'Optimal posting time calculator', vqtCost: 3, nairaEquivalent: 30, category: 'growth', isFree: false, isAvailable: true, icon: 'Sun' },
  { id: 'f100', code: 'F100', name: 'Keyword Planner & Generator', description: 'Plan and generate keywords', vqtCost: 4, nairaEquivalent: 40, category: 'growth', isFree: false, isAvailable: true, icon: 'Key' },
  { id: 'f101', code: 'F101', name: 'Weekly Intelligence Reports', description: 'Automated weekly reports', vqtCost: 6, nairaEquivalent: 60, category: 'growth', isFree: false, isAvailable: true, icon: 'Newspaper' },
  { id: 'f102', code: 'F102', name: 'The Last Video Syndrome', description: 'Predict and prevent creator block', vqtCost: 30, nairaEquivalent: 300, category: 'growth', isFree: false, isAvailable: true, requiresLiminal: true, icon: 'VideoOff' },
  { id: 'f103', code: 'F103', name: 'Best Time to Post Calculator', description: 'Calculate optimal posting times', vqtCost: 2, nairaEquivalent: 20, category: 'growth', isFree: false, isAvailable: true, icon: 'Clock' },
  { id: 'f104', code: 'F104', name: 'Subscriber Quality Score', description: 'Score subscriber engagement quality', vqtCost: 3, nairaEquivalent: 30, category: 'growth', isFree: false, isAvailable: true, icon: 'Award' },
  { id: 'f105', code: 'F105', name: 'Content Gap Analyzer', description: 'Find content opportunities', vqtCost: 5, nairaEquivalent: 50, category: 'growth', isFree: false, isAvailable: true, icon: 'SearchX' },
  { id: 'f106', code: 'F106', name: 'Viral Coefficient Tracker', description: 'Track viral potential metrics', vqtCost: 4, nairaEquivalent: 40, category: 'growth', isFree: false, isAvailable: true, icon: 'TrendingUp' },
  { id: 'f107', code: 'F107', name: 'Platform Migration Advisor', description: 'Advise on platform transitions', vqtCost: 8, nairaEquivalent: 80, category: 'growth', isFree: false, isAvailable: true, icon: 'ArrowRight' },
  { id: 'f108', code: 'F108', name: 'Burnout Early Warning System', description: 'Detect creator burnout signs', vqtCost: 10, nairaEquivalent: 100, category: 'growth', isFree: false, isAvailable: true, icon: 'AlertOctagon' },

  // CONTROL TOWER (109-117)
  { id: 'f109', code: 'F109', name: 'Scout Orchestrator', description: 'Manage data collection scouts', vqtCost: 0, nairaEquivalent: 0, category: 'controlTower', isFree: true, isAvailable: true, icon: 'Satellite' },
  { id: 'f110', code: 'F110', name: 'API Heartbeat Monitor', description: 'Monitor API health status', vqtCost: 0, nairaEquivalent: 0, category: 'controlTower', isFree: true, isAvailable: true, icon: 'Activity' },
  { id: 'f111', code: 'F111', name: 'Multi-Profile Identity Switcher', description: 'Switch between profiles easily', vqtCost: 0, nairaEquivalent: 0, category: 'controlTower', isFree: true, isAvailable: true, icon: 'SwitchCamera' },
  { id: 'f112', code: 'F112', name: 'FTC & Legal Compliance Auto-Check', description: 'Automated compliance checking', vqtCost: 2, nairaEquivalent: 20, category: 'controlTower', isFree: false, isAvailable: true, icon: 'Scale' },
  { id: 'f113', code: 'F113', name: 'Sovereign Authenticity Verification', description: 'Verify content authenticity', vqtCost: 5, nairaEquivalent: 50, category: 'controlTower', isFree: false, isAvailable: true, icon: 'BadgeCheck' },
  { id: 'f114', code: 'F114', name: 'Local-First Data Sovereign Vault', description: 'Local data storage solution', vqtCost: 0, nairaEquivalent: 0, category: 'controlTower', isFree: true, isAvailable: true, icon: 'HardDrive' },
  { id: 'f115', code: 'F115', name: 'The Braintrust Partner Portal', description: 'Partner collaboration portal', vqtCost: 3, nairaEquivalent: 30, category: 'controlTower', isFree: false, isAvailable: true, icon: 'Network' },
  { id: 'f116', code: 'F116', name: 'The Parallel Creator', description: 'Simulate creator scenarios', vqtCost: 20, nairaEquivalent: 200, category: 'controlTower', isFree: false, isAvailable: true, icon: 'Copy' },
  { id: 'f117', code: 'F117', name: 'Integrated Social Profiles & Blog', description: 'Unified social presence', vqtCost: 0, nairaEquivalent: 0, category: 'controlTower', isFree: true, isAvailable: true, icon: 'Globe' },

  // NEW FEATURES (118-136)
  // CONTENT & SCHEDULING (118-120)
  { id: 'f118', code: 'F118', name: 'Content Calendar & Scheduler', description: 'Schedule posts to 5 premium platforms with drag-and-drop', vqtCost: 3, nairaEquivalent: 30, category: 'studio', isFree: false, isAvailable: true, icon: 'Calendar' },
  { id: 'f119', code: 'F119', name: 'First-Party API Deep Integration', description: 'Fetch private analytics from platform APIs', vqtCost: 5, nairaEquivalent: 50, category: 'controlTower', isFree: false, isAvailable: true, icon: 'Plug' },
  { id: 'f120', code: 'F120', name: 'Affiliate Code Generator + Tracker', description: 'Create trackable affiliate links with conversion tracking', vqtCost: 4, nairaEquivalent: 40, category: 'bank', isFree: false, isAvailable: true, icon: 'Link2' },
  
  // FREEMIUM & REPORTING (121-124)
  { id: 'f121', code: 'F121', name: 'Freemium Tier System', description: '50 free VQT on signup, 3 free analyses daily', vqtCost: 0, nairaEquivalent: 0, category: 'controlTower', isFree: true, isAvailable: true, icon: 'Gift' },
  { id: 'f122', code: 'F122', name: 'Export/Share Reports', description: 'PDF export and shareable links for all reports', vqtCost: 2, nairaEquivalent: 20, category: 'controlTower', isFree: false, isAvailable: true, icon: 'FileOutput' },
  { id: 'f123', code: 'F123', name: 'Live Subscriber/Metric Tickers', description: 'Real-time subscriber count with milestone alerts', vqtCost: 1, nairaEquivalent: 10, category: 'growth', isFree: false, isAvailable: true, icon: 'Activity' },
  { id: 'f124', code: 'F124', name: 'Content Asset Library', description: 'Cloud storage for thumbnails, videos, brand assets', vqtCost: 2, nairaEquivalent: 20, category: 'studio', isFree: false, isAvailable: true, icon: 'FolderOpen' },
  
  // TEAM & CAMPAIGNS (125-127)
  { id: 'f125', code: 'F125', name: 'Team/Agency Multi-Seat', description: 'Role-based permissions for team members', vqtCost: 10, nairaEquivalent: 100, category: 'controlTower', isFree: false, isAvailable: true, icon: 'Users2' },
  { id: 'f126', code: 'F126', name: 'Campaign Management', description: 'Group posts into campaigns with aggregated analytics', vqtCost: 3, nairaEquivalent: 30, category: 'bank', isFree: false, isAvailable: true, icon: 'Flag' },
  { id: 'f127', code: 'F127', name: 'Mobile Responsive PWA', description: 'Progressive Web App with offline mode', vqtCost: 0, nairaEquivalent: 0, category: 'controlTower', isFree: true, isAvailable: true, icon: 'Smartphone' },
  
  // EFFICIENCY FEATURES (128-131)
  { id: 'f128', code: 'F128', name: 'Bulk Actions', description: 'Batch approve/reply/block with discount pricing', vqtCost: 1, nairaEquivalent: 10, category: 'actionHub', isFree: false, isAvailable: true, icon: 'Layers' },
  { id: 'f129', code: 'F129', name: 'Hashtag Bank/Saved Lists', description: 'Save and categorize effective hashtags', vqtCost: 1, nairaEquivalent: 10, category: 'studio', isFree: false, isAvailable: true, icon: 'Bookmark' },
  { id: 'f130', code: 'F130', name: 'Competitor Alert System', description: 'SMS/push alerts when competitor posts', vqtCost: 4, nairaEquivalent: 40, category: 'arena', isFree: false, isAvailable: true, icon: 'BellRing' },
  { id: 'f131', code: 'F131', name: 'Dark Mode', description: 'Invert color scheme for night usage', vqtCost: 0, nairaEquivalent: 0, category: 'controlTower', isFree: true, isAvailable: true, icon: 'Moon' },
  
  // INTEGRATIONS (132)
  { id: 'f132', code: 'F132', name: 'Zapier/Make.com Integration', description: 'Webhook system for 5000+ app connections', vqtCost: 5, nairaEquivalent: 50, category: 'actionHub', isFree: false, isAvailable: true, icon: 'Webhook' },
  
  // VEX AI AGENT (133-136)
  { id: 'f133', code: 'F133', name: 'VEX AI Agent - Orb Mode', description: 'Floating AI assistant with quick actions', vqtCost: 1, nairaEquivalent: 10, category: 'vex', isFree: false, isAvailable: true, icon: 'Bot' },
  { id: 'f134', code: 'F134', name: 'VEX AI Agent - Full Page', description: 'Command center with 3D avatar and voice input', vqtCost: 2, nairaEquivalent: 20, category: 'vex', isFree: false, isAvailable: true, icon: 'BotMessageSquare' },
  { id: 'f135', code: 'F135', name: 'VEX Proactive Intelligence', description: 'Auto-detect issues and suggest actions', vqtCost: 3, nairaEquivalent: 30, category: 'vex', isFree: false, isAvailable: true, icon: 'Sparkles' },
  { id: 'f136', code: 'F136', name: 'VEX Voice Commands', description: 'Speech-to-text for natural language commands', vqtCost: 1, nairaEquivalent: 10, category: 'vex', isFree: false, isAvailable: true, icon: 'Mic' },
];

const featureModules: FeatureModule[] = [
  {
    id: 'shield',
    name: 'Shield',
    description: 'Protection that runs quietly in the background',
    badge: 'SHIELD',
    features: allFeatures.filter(f => f.category === 'shield'),
    color: '#00D4AA',
  },
  {
    id: 'listener',
    name: 'Listener',
    description: 'Understand your audience without guessing',
    badge: 'LISTENER',
    features: allFeatures.filter(f => f.category === 'listener'),
    color: '#8B5CF6',
  },
  {
    id: 'bank',
    name: 'Bank',
    description: 'Turn attention into revenue',
    badge: 'BANK',
    features: allFeatures.filter(f => f.category === 'bank'),
    color: '#F59E0B',
  },
  {
    id: 'arena',
    name: 'Arena',
    description: 'See what your competitors can\'t',
    badge: 'ARENA',
    features: allFeatures.filter(f => f.category === 'arena'),
    color: '#EF4444',
  },
  {
    id: 'actionHub',
    name: 'Action Hub',
    description: 'Automate the repetitive. Focus on the creative',
    badge: 'ACTION HUB',
    features: allFeatures.filter(f => f.category === 'actionHub'),
    color: '#06B6D4',
  },
  {
    id: 'studio',
    name: 'Studio',
    description: 'Publish with confidence',
    badge: 'STUDIO',
    features: allFeatures.filter(f => f.category === 'studio'),
    color: '#EC4899',
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Grow smarter. Avoid burnout',
    badge: 'GROWTH',
    features: allFeatures.filter(f => f.category === 'growth'),
    color: '#10B981',
  },
  {
    id: 'controlTower',
    name: 'Control Tower',
    description: 'One dashboard. Total control',
    badge: 'CONTROL TOWER',
    features: allFeatures.filter(f => f.category === 'controlTower'),
    color: '#6366F1',
  },
  {
    id: 'vex',
    name: 'VEX AI',
    description: 'Your intelligent content companion',
    badge: 'VEX',
    features: allFeatures.filter(f => f.category === 'vex'),
    color: '#F97316',
  },
];

export const useFeatureStore = create<FeatureStore>(() => ({
  modules: featureModules,
  allFeatures,
  getFeaturesByCategory: (category: FeatureCategory) => 
    allFeatures.filter(f => f.category === category),
  getFeatureById: (id: string) => 
    allFeatures.find(f => f.id === id),
  getModuleById: (id: FeatureCategory) => 
    featureModules.find(m => m.id === id),
}));
