// VELOCTIQ - Listener Feature Engine
// Comprehensive browser-side audience intelligence, sentiment, and content features
// All functions use real NLP, heuristics, pattern matching, and statistical analysis

export interface FeatureResult {
  success: boolean;
  data: any;
  source: 'browser' | 'api' | 'cache';
  featureId: string;
}

// ============================================================================
// Shared NLP Utilities
// ============================================================================
const POSITIVE_WORDS = new Set([
  'love', 'great', 'amazing', 'awesome', 'best', 'excellent', 'fantastic',
  'perfect', 'beautiful', 'wonderful', 'incredible', 'brilliant', 'outstanding',
  'superb', 'happy', 'enjoy', 'nice', 'good', 'cool', 'fire', 'lit', 'slay',
  'goated', 'based', 'facts', 'real', 'insane', 'phenomenal', 'magnificent',
  'legendary', 'impressive', 'remarkable', 'splendid', 'gorgeous', 'delightful',
  'marvelous', 'exceptional', 'stellar', 'solid', 'classic', 'banger', 'dope',
  'hard', 'clean', 'smooth', 'vibes', 'vibe', 'chef', 'kiss', 'bless', 'blessed',
  'gem', 'treasure', 'masterpiece', 'art', 'artistic', 'creative', 'innovative',
  'unique', 'original', 'fresh', 'raw', 'authentic', 'genuine', 'real', 'facts',
]);

const NEGATIVE_WORDS = new Set([
  'hate', 'terrible', 'awful', 'horrible', 'disgusting', 'pathetic', 'worst',
  'boring', 'waste', 'trash', 'garbage', 'cringe', 'lame', 'poor', 'bad',
  'disappointing', 'useless', 'pointless', 'stupid', 'dumb', 'ugly', 'annoying',
  'frustrating', 'overrated', 'mid', 'dry', 'weak', 'bland', 'generic',
  'repetitive', 'unoriginal', 'clickbait', 'skip', 'meh', 'yikes', 'ew',
  'toxic', 'negative', 'hostile', 'aggressive', 'rude', 'mean', 'harsh',
  'unfair', 'wrong', 'fake', 'phony', 'scam', 'lie', 'lies', 'misleading',
  'biased', 'one-sided', 'inaccurate', 'uninformed', 'lazy', 'low-effort',
]);

const URGENCY_WORDS = new Set([
  'please', 'need', 'must', 'urgently', 'asap', 'desperately', 'begging',
  'really', 'badly', 'hope', 'wish', 'want', 'craving', 'dying', 'dying for',
  'cannot wait', 'can\'t wait', 'sooner', 'already', 'when', 'how come',
]);

// Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function stringSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(w => w.length > 1);
}

function computeSentiment(text: string): number {
  const tokens = tokenize(text);
  let score = 0;
  for (const token of tokens) {
    if (POSITIVE_WORDS.has(token)) score += 1;
    if (NEGATIVE_WORDS.has(token)) score -= 1;
  }
  const positiveEmojis = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
  const negativeEmojis = (text.match(/[\u{1F921}\u{1F608}\u{1F47B}\u{1F480}\u{1F44E}\u{1F621}\u{1F4A2}\u{1F4A9}]/gu) || []).length;
  score += positiveEmojis * 0.5 - negativeEmojis * 0.5;
  return tokens.length > 0 ? score / tokens.length : 0;
}

// ============================================================================
// F16: Wishlist Extraction Engine
// ============================================================================
export function wishlistExtractionEngine(comments: {
  text: string;
  username?: string;
  timestamp?: string;
}[]): FeatureResult {
  const wishPatterns = [
    { regex: /(?:i\s+)?(?:wish|wished|wishing)\s+(?:i\s+|you\s+(?:would|could|had)|there\s+was|to\s+have|we\s+could)\s+(.+)/i, weight: 1.0 },
    { regex: /(?:i\s+)?(?:want|wants|wanted|wanting)\s+(?:to\s+see|you\s+to|more|a\s+|an?\s+)(.+)/i, weight: 0.9 },
    { regex: /(?:i\s+)?(?:need|needs|needed)\s+(?:a\s+|an?\s+|more|to\s+see|you\s+to)\s+(.+)/i, weight: 0.95 },
    { regex: /(?:i\s+)?(?:hope|hoping|hoped)\s+(?:you\s+(?:do|make|create|can)|to\s+see|for)\s+(.+)/i, weight: 0.85 },
    { regex: /(?:please|pl[sz])\s+(?:make|do|create|show|cover|release|drop)\s+(.+)/i, weight: 0.8 },
    { regex: /(?:can\s+you|could\s+you|will\s+you|would\s+you)\s+(?:make|do|create|show|cover|release|drop|try)\s+(.+)/i, weight: 0.75 },
    { regex: /(?:would\s+be\s+(?:great|nice|cool|amazing|fire|incredible))\s+(?:if\s+you|to)\s+(.+)/i, weight: 0.7 },
    { regex: /(?:it\s+(?:would|'d)\s+be\s+(?:great|nice|cool))\s+(?:if|when)\s+(.+)/i, weight: 0.65 },
    { regex: /(?:suggestion|idea|recommendation|request)(?:\s*:|\s+[-–])\s*(.+)/i, weight: 0.9 },
    { regex: /(?:make\s+a|do\s+a|create\s+a)\s+(?:video|post|content|tutorial|review|reaction)\s+(?:on|about|for)\s+(.+)/i, weight: 0.85 },
    { regex: /(?:more)\s+(?:of|about|content\s+(?:like|on|about))\s+(.+)/i, weight: 0.6 },
    { regex: /(?:drop|release|bring\s+back|bring)\s+(?:the|a|more)\s+(.+)/i, weight: 0.7 },
    { regex: /(?:where(?:'s|\s+is)\s+the|where(?:'s|\s+are)\s+the)\s+(.+)/i, weight: 0.8 },
    { regex: /(?:i've\s+been\s+(?:waiting|looking|asking))\s+(?:for)\s+(.+)/i, weight: 0.85 },
  ];

  const wishes: {
    text: string;
    originalComment: string;
    username?: string;
    urgencyScore: number;
    sentimentScore: number;
    confidence: number;
  }[] = [];

  for (const comment of comments) {
    const text = comment.text;
    for (const { regex, weight } of wishPatterns) {
      const match = text.match(regex);
      if (match) {
        const extractedWish = match[1].trim().replace(/[.!?,;]+$/, '');
        if (extractedWish.length < 5) continue;

        const sentiment = computeSentiment(text);
        const urgency = calculateWishUrgency(text);
        const confidence = weight * (0.7 + Math.abs(sentiment) * 0.3);

        wishes.push({
          text: extractedWish,
          originalComment: text.slice(0, 200),
          username: comment.username,
          urgencyScore: Math.round(urgency * 1000) / 1000,
          sentimentScore: Math.round(sentiment * 1000) / 1000,
          confidence: Math.round(confidence * 1000) / 1000,
        });
        break; // Only extract first wish per comment
      }
    }
  }

  // Cluster similar wishes using string similarity
  const clusters: { representative: string; items: typeof wishes; frequency: number; avgUrgency: number; avgSentiment: number }[] = [];

  for (const wish of wishes) {
    let matched = false;
    for (const cluster of clusters) {
      if (stringSimilarity(cluster.representative, wish.text) > 0.55) {
        cluster.items.push(wish);
        matched = true;
        break;
      }
    }
    if (!matched) {
      clusters.push({
        representative: wish.text,
        items: [wish],
        frequency: 1,
        avgUrgency: wish.urgencyScore,
        avgSentiment: wish.sentimentScore,
      });
    }
  }

  // Calculate cluster aggregates
  for (const cluster of clusters) {
    cluster.frequency = cluster.items.length;
    cluster.avgUrgency = Math.round(
      cluster.items.reduce((s, w) => s + w.urgencyScore, 0) / cluster.items.length * 1000
    ) / 1000;
    cluster.avgSentiment = Math.round(
      cluster.items.reduce((s, w) => s + w.sentimentScore, 0) / cluster.items.length * 1000
    ) / 1000;
  }

  // Rank by composite score (frequency * urgency * (1 + sentiment))
  const ranked = clusters.map(c => ({
    wish: c.representative,
    mentionCount: c.frequency,
    urgencyScore: c.avgUrgency,
    sentimentScore: c.avgSentiment,
    demandScore: Math.round(
      c.frequency * 0.4 + c.avgUrgency * 0.3 + Math.max(c.avgSentiment, 0) * 0.3
    ),
    sampleComments: c.items.slice(0, 3).map(w => w.originalComment.slice(0, 100)),
    uniqueRequesters: [...new Set(c.items.filter(w => w.username).map(w => w.username!))].length,
  })).sort((a, b) => b.demandScore - a.demandScore);

  return {
    success: true,
    data: {
      totalWishesExtracted: wishes.length,
      uniqueWishClusters: ranked.length,
      topWishes: ranked.slice(0, 20),
      summary: {
        avgUrgency: wishes.length > 0
          ? Math.round(wishes.reduce((s, w) => s + w.urgencyScore, 0) / wishes.length * 1000) / 1000
          : 0,
        avgSentiment: wishes.length > 0
          ? Math.round(wishes.reduce((s, w) => s + w.sentimentScore, 0) / wishes.length * 1000) / 1000
          : 0,
        commentsWithWishes: wishes.length,
        extractionRate: comments.length > 0
          ? Math.round(wishes.length / comments.length * 100) / 100
          : 0,
      },
    },
    source: 'browser',
    featureId: 'F16',
  };
}

function calculateWishUrgency(text: string): number {
  let urgency = 0;
  const tokens = tokenize(text);
  for (const token of tokens) {
    if (URGENCY_WORDS.has(token)) urgency += 0.15;
  }
  // Time indicators
  if (/already|still|finally|about\s+time|long\s+time/i.test(text)) urgency += 0.2;
  if (/please|pl[sz]|begging|desperately/i.test(text)) urgency += 0.15;
  if (/[\!\?]{2,}/.test(text)) urgency += 0.1;
  return Math.min(urgency, 1);
}

// ============================================================================
// F17: Technical Friction Monitor
// ============================================================================
export function technicalFrictionMonitor(comments: {
  text: string;
  username?: string;
  timestamp?: string;
}[]): FeatureResult {
  const frictionCategories: {
    category: string;
    patterns: RegExp[];
    keywords: string[];
    issues: { text: string; comment: string; username?: string; severity: number }[];
  }[] = [
    {
      category: 'Loading Performance',
      patterns: [
        /(?:takes?\s+(?:too\s+)?long|slow|loading|buffering|lag|laggy|stutter)\b/i,
        /(?:video|audio|page|site|app|stream)\s+(?:is\s+)?(?:taking|loading|buffering)\s+(?:forever|fore)/i,
        /(?:waiting\s+(?:for\s+it\s+to\s+)?load|spent\s+\d+\s+seconds?\s+waiting)/i,
        /\d+\s+(?:seconds?|minutes?)\s+(?:to\s+)?(?:load|buffer|start)/i,
      ],
      keywords: ['slow', 'lag', 'buffer', 'loading', 'wait', 'frozen', 'freeze', 'crash'],
      issues: [],
    },
    {
      category: 'Audio/Video Quality',
      patterns: [
        /(?:audio|sound|volume|mic|microphone)\s+(?:is\s+)?(?:too\s+)?(?:quiet|loud|low|bad|terrible|muffled|echo|feedback)/i,
        /(?:can'?t\s+hear|can'?t\s+see|unreadable|unclear|blurry|pixelat|low\s+(?:res|quality))/i,
        /(?:video\s+quality|audio\s+quality|resolution|fps|frame\s+rate)\s+(?:is\s+)?(?:bad|poor|terrible|low)/i,
        /(?:overexposed|underexposed|dark|too\s+bright|washed\s+out|color\s+(?:is\s+)?off)/i,
      ],
      keywords: ['quality', 'audio', 'sound', 'video', 'blurry', 'dark', 'loud', 'quiet'],
      issues: [],
    },
    {
      category: 'Accessibility Issues',
      patterns: [
        /(?:can'?t\s+read|unreadable|text\s+(?:is\s+)?(?:too\s+)?(?:small|big|fast))/i,
        /(?:captions?|subtitles?)\s+(?:are\s+)?(?:missing|wrong|too\s+(?:small|fast|slow)|out\s+of\s+sync)/i,
        /(?:no\s+captions?|need\s+captions?|add\s+captions?|where(?:'s|\s+are)\s+(?:the\s+)?captions?)/i,
        /(?:font|text|subtitle)\s+(?:is\s+)?(?:too\s+)?(?:small|large|hard\s+to\s+read)/i,
      ],
      keywords: ['captions', 'subtitles', 'read', 'font', 'text', 'accessibility'],
      issues: [],
    },
    {
      category: 'Playback Issues',
      patterns: [
        /(?:video\s+)?(?:keeps\s+)?(?:stopping|pausing|freezing|skipping|jumping|cutting)/i,
        /(?:audio\s+)?(?:out\s+of\s+sync|not\s+synced|desync|sync\s+issue)/i,
        /(?:won'?t\s+play|doesn'?t\s+play|not\s+playing|broken\s+video|broken\s+link)/i,
        /(?:glitch|bug|error|not\s+working|something\s+went\s+wrong)/i,
      ],
      keywords: ['play', 'stop', 'freeze', 'skip', 'sync', 'error', 'bug', 'glitch'],
      issues: [],
    },
    {
      category: 'UI/UX Complaints',
      patterns: [
        /(?:layout|design|ui|interface|navigation)\s+(?:is\s+)?(?:confusing|bad|terrible|hard|messy|cluttered)/i,
        /(?:can'?t\s+find|hard\s+to\s+find|where\s+is|lost|buried)/i,
        /(?:too\s+many\s+(?:ads|notifications|popups|clicks)|annoying|intrusive)/i,
        /(?:thumbnail|preview|cover)\s+(?:is\s+)?(?:misleading|clickbait|wrong|irrelevant)/i,
      ],
      keywords: ['layout', 'design', 'ui', 'clickbait', 'ads', 'popups', 'confusing'],
      issues: [],
    },
    {
      category: 'Content Delivery',
      patterns: [
        /(?:not\s+uploading|no\s+(?:new\s+)?content|waiting\s+for|when\s+(?:is\s+the\s+)?next)/i,
        /(?:content\s+(?:is\s+)?(?:too\s+)?(?:short|long|infrequent|irregular))/i,
        /(?:schedule|timing|upload\s+time|release)\s+(?:is\s+)?(?:inconsistent|unpredictable|late)/i,
        /(?:missed|skipped)\s+(?:a\s+)?(?:week|day|upload|post|video)/i,
      ],
      keywords: ['upload', 'schedule', 'content', 'release', 'wait', 'missed'],
      issues: [],
    },
  ];

  // Scan each comment against categories
  for (const comment of comments) {
    const text = comment.text;
    for (const category of frictionCategories) {
      for (const pattern of category.patterns) {
        const match = text.match(pattern);
        if (match) {
          const severity = /(?:terrible|worst|unusable|broken|can'?t|impossible)/i.test(text) ? 0.9 :
            /(?:bad|poor|frustrating|annoying|really|very)/i.test(text) ? 0.7 : 0.5;
          category.issues.push({
            text: match[0].slice(0, 100),
            comment: text.slice(0, 200),
            username: comment.username,
            severity,
          });
          break;
        }
      }
    }
  }

  // Calculate friction index per category
  const categoryReports = frictionCategories.map(cat => {
    const issueCount = cat.issues.length;
    const avgSeverity = issueCount > 0
      ? cat.issues.reduce((s, i) => s + i.severity, 0) / issueCount
      : 0;
    const frictionIndex = Math.min(issueCount * 0.15 + avgSeverity * 0.3, 1);

    return {
      category: cat.category,
      issueCount,
      frictionIndex: Math.round(frictionIndex * 1000) / 1000,
      avgSeverity: Math.round(avgSeverity * 1000) / 1000,
      priority: frictionIndex > 0.6 ? 'critical' : frictionIndex > 0.3 ? 'high' : frictionIndex > 0.1 ? 'medium' : 'low',
      sampleIssues: cat.issues.slice(0, 3).map(i => i.text),
    };
  }).sort((a, b) => b.frictionIndex - a.frictionIndex);

  const totalIssues = categoryReports.reduce((s, c) => s + c.issueCount, 0);
  const overallFrictionIndex = comments.length > 0
    ? Math.min(totalIssues / (comments.length * 0.3), 1)
    : 0;

  return {
    success: true,
    data: {
      overallFrictionIndex: Math.round(overallFrictionIndex * 1000) / 1000,
      frictionGrade: overallFrictionIndex >= 0.5 ? 'F' : overallFrictionIndex >= 0.35 ? 'D' : overallFrictionIndex >= 0.2 ? 'C' : overallFrictionIndex >= 0.1 ? 'B' : 'A',
      totalIssuesDetected: totalIssues,
      commentsAnalyzed: comments.length,
      categoryBreakdown: categoryReports,
      priorityActions: categoryReports.filter(c => c.priority === 'critical' || c.priority === 'high').map(c => ({
        action: `Address ${c.category} issues`,
        severity: c.priority,
        affectedComments: c.issueCount,
      })),
    },
    source: 'browser',
    featureId: 'F17',
  };
}

// ============================================================================
// F18: Super-Fan Leaderboard
// ============================================================================
export function superFanLeaderboard(comments: {
  text: string;
  username: string;
  timestamp?: string;
  likes?: number;
  replies?: number;
}[]): FeatureResult {
  // Aggregate per-user metrics
  const userProfiles: Record<string, {
    username: string;
    commentCount: number;
    totalWords: number;
    avgCommentLength: number;
    totalLikes: number;
    totalReplies: number;
    sentimentScores: number[];
    mentionCount: number;
    hasQuestion: boolean;
    helpfulIndicators: number;
    emojiUsage: number;
    firstSeen: string | undefined;
    lastSeen: string | undefined;
  }> = {};

  // Track mentions
  const allUsernames = new Set(comments.map(c => c.username));

  for (const comment of comments) {
    const { username, text, timestamp, likes = 0, replies = 0 } = comment;

    if (!userProfiles[username]) {
      userProfiles[username] = {
        username,
        commentCount: 0,
        totalWords: 0,
        avgCommentLength: 0,
        totalLikes: 0,
        totalReplies: 0,
        sentimentScores: [],
        mentionCount: 0,
        hasQuestion: false,
        helpfulIndicators: 0,
        emojiUsage: 0,
        firstSeen: timestamp,
        lastSeen: timestamp,
      };
    }

    const profile = userProfiles[username];
    profile.commentCount++;
    profile.totalWords += text.split(/\s+/).length;
    profile.totalLikes += likes;
    profile.totalReplies += replies;
    profile.sentimentScores.push(computeSentiment(text));
    profile.emojiUsage += (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;

    if (/\?/.test(text)) profile.hasQuestion = true;

    // Count how many other users this person mentions
    for (const other of allUsernames) {
      if (other !== username && text.toLowerCase().includes(`@${other.toLowerCase()}`)) {
        profile.mentionCount++;
      }
    }

    // Helpful indicators
    if (/\b(thanks|thank you|helpful|great tip|good point|agreed|this|exactly|fact|true)\b/i.test(text)) {
      profile.helpfulIndicators++;
    }

    if (timestamp) {
      if (!profile.firstSeen || timestamp < profile.firstSeen) profile.firstSeen = timestamp;
      if (!profile.lastSeen || timestamp > profile.lastSeen) profile.lastSeen = timestamp;
    }
  }

  // Calculate engagement scores
  const leaderboard = Object.values(userProfiles)
    .filter(p => p.commentCount >= 2) // At least 2 comments to be considered
    .map(profile => {
      const avgCommentLength = profile.totalWords / profile.commentCount;
      const avgSentiment = profile.sentimentScores.reduce((a, b) => a + b, 0) / Math.max(profile.sentimentScores.length, 1);
      const avgEmojis = profile.emojiUsage / profile.commentCount;

      // Frequency score (more comments = more engaged)
      const frequencyScore = Math.min(profile.commentCount * 0.05, 0.25);

      // Length score (thoughtful comments)
      const lengthScore = avgCommentLength > 30 ? 0.15 : avgCommentLength > 15 ? 0.1 : 0.05;

      // Positive sentiment score
      const sentimentScore = Math.max(avgSentiment, 0) * 0.15;

      // Community engagement (likes + replies generated)
      const communityScore = Math.min((profile.totalLikes + profile.totalReplies * 2) * 0.01, 0.2);

      // Helpfulness score
      const helpfulScore = Math.min(profile.helpfulIndicators * 0.05, 0.1);

      // Mention score (tags others, community builder)
      const mentionScore = Math.min(profile.mentionCount * 0.05, 0.1);

      // Engagement score
      const totalScore = frequencyScore + lengthScore + sentimentScore + communityScore + helpfulScore + mentionScore;

      return {
        username: profile.username,
        rank: 0,
        engagementScore: Math.round(totalScore * 1000) / 1000,
        tier: totalScore >= 0.8 ? 'legendary' : totalScore >= 0.6 ? 'superfan' : totalScore >= 0.4 ? 'regular' : totalScore >= 0.2 ? 'casual' : 'newcomer',
        stats: {
          commentCount: profile.commentCount,
          avgCommentLength: Math.round(avgCommentLength * 10) / 10,
          totalLikes: profile.totalLikes,
          totalReplies: profile.totalReplies,
          avgSentiment: Math.round(avgSentiment * 1000) / 1000,
          avgEmojis: Math.round(avgEmojis * 100) / 100,
          mentions: profile.mentionCount,
          helpfulIndicators: profile.helpfulIndicators,
          hasQuestion: profile.hasQuestion,
        },
      };
    })
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const tierBreakdown = {
    legendary: leaderboard.filter(e => e.tier === 'legendary').length,
    superfan: leaderboard.filter(e => e.tier === 'superfan').length,
    regular: leaderboard.filter(e => e.tier === 'regular').length,
    casual: leaderboard.filter(e => e.tier === 'casual').length,
    newcomer: leaderboard.filter(e => e.tier === 'newcomer').length,
  };

  return {
    success: true,
    data: {
      totalCommenters: Object.keys(userProfiles).length,
      qualifiedFans: leaderboard.length,
      leaderboard: leaderboard.slice(0, 50),
      tierBreakdown,
      summary: {
        topFan: leaderboard[0]?.username || 'N/A',
        avgEngagementScore: leaderboard.length > 0
          ? Math.round(leaderboard.reduce((s, f) => s + f.engagementScore, 0) / leaderboard.length * 1000) / 1000
          : 0,
        totalCommunityInteractions: leaderboard.reduce((s, f) => s + f.stats.totalLikes + f.stats.totalReplies, 0),
      },
    },
    source: 'browser',
    featureId: 'F18',
  };
}

// ============================================================================
// F19: Question Deduplication
// ============================================================================
export function questionDeduplication(comments: {
  text: string;
  username?: string;
  timestamp?: string;
}[]): FeatureResult {
  // Extract questions from comments
  const questions: { text: string; username?: string; originalComment: string; timestamp?: string }[] = [];

  for (const comment of comments) {
    const sentences = comment.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (/\?$/.test(trimmed) || /^(?:what|when|where|why|how|who|which|is|are|can|could|would|should|do|does|did)\b/i.test(trimmed)) {
        // Normalize: lowercase, remove punctuation
        const normalized = trimmed.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
        if (normalized.length >= 10) {
          questions.push({
            text: normalized,
            username: comment.username,
            originalComment: comment.text.slice(0, 200),
            timestamp: comment.timestamp,
          });
        }
      }
    }
  }

  // Cluster similar questions using string similarity
  const clusters: { representative: string; items: typeof questions }[] = [];
  const SIMILARITY_THRESHOLD = 0.6;

  for (const question of questions) {
    let bestCluster = -1;
    let bestSimilarity = 0;

    for (let i = 0; i < clusters.length; i++) {
      const sim = stringSimilarity(clusters[i].representative, question.text);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestCluster = i;
      }
    }

    if (bestCluster >= 0 && bestSimilarity >= SIMILARITY_THRESHOLD) {
      clusters[bestCluster].items.push(question);
      // Update representative to shorter/more common version
      if (question.text.length < clusters[bestCluster].representative.length) {
        clusters[bestCluster].representative = question.text;
      }
    } else {
      clusters.push({
        representative: question.text,
        items: [question],
      });
    }
  }

  // Build deduplicated list
  const deduplicated = clusters
    .map(cluster => ({
      question: cluster.representative.charAt(0).toUpperCase() + cluster.representative.slice(1),
      originalCount: cluster.items.length,
      uniqueAskers: [...new Set(cluster.items.filter(q => q.username).map(q => q.username!))].length,
      sampleVariations: cluster.items.slice(0, 3).map(q => q.originalComment.slice(0, 100)),
      timestamps: cluster.items.filter(q => q.timestamp).map(q => q.timestamp).sort(),
    }))
    .sort((a, b) => b.originalCount - a.originalCount);

  // Stats
  const totalQuestions = questions.length;
  const uniqueQuestions = deduplicated.length;
  const duplicateRate = totalQuestions > 0 ? (totalQuestions - uniqueQuestions) / totalQuestions : 0;

  return {
    success: true,
    data: {
      totalQuestionsFound: totalQuestions,
      uniqueQuestions: uniqueQuestions,
      duplicateRate: Math.round(duplicateRate * 1000) / 1000,
      deduplicatedQuestions: deduplicated.slice(0, 30),
      highFrequencyQuestions: deduplicated.filter(d => d.originalCount >= 3),
      summary: {
        questionsPerComment: comments.length > 0
          ? Math.round(totalQuestions / comments.length * 100) / 100
          : 0,
        avgDuplicates: deduplicated.length > 0
          ? Math.round(totalQuestions / deduplicated.length * 100) / 100
          : 0,
        mostAskedQuestion: deduplicated[0]?.question || 'N/A',
        mostAskedCount: deduplicated[0]?.originalCount || 0,
      },
    },
    source: 'browser',
    featureId: 'F19',
  };
}

// ============================================================================
// F20: Tone-Shift Detection
// ============================================================================
export function toneShiftDetection(commentBatches: {
  text: string;
  timestamp?: string;
  batchIndex?: number;
}[]): FeatureResult {
  if (commentBatches.length < 2) {
    return {
      success: true,
      data: {
        toneShifts: [],
        overallStability: 1,
        message: 'Need at least 2 batches for tone shift analysis',
      },
      source: 'browser',
      featureId: 'F20',
    };
  }

  // Group by batch index or timestamp-based chunks
  const batchMap = new Map<number, string[]>();
  for (const comment of commentBatches) {
    const batch = comment.batchIndex ?? 0;
    if (!batchMap.has(batch)) batchMap.set(batch, []);
    batchMap.get(batch)!.push(comment.text);
  }

  // If no explicit batches, create temporal chunks
  if (batchMap.size <= 1) {
    const chunkSize = Math.max(Math.floor(commentBatches.length / 5), 2);
    batchMap.clear();
    let batchIdx = 0;
    for (let i = 0; i < commentBatches.length; i += chunkSize) {
      batchMap.set(batchIdx, commentBatches.slice(i, i + chunkSize).map(c => c.text));
      batchIdx++;
    }
  }

  const sortedBatches = [...batchMap.entries()].sort((a, b) => a[0] - b[0]);

  // Calculate sentiment per batch
  const batchSentiments: {
    batchIndex: number;
    avgSentiment: number;
    commentCount: number;
    positiveRatio: number;
    negativeRatio: number;
    neutralRatio: number;
    intensity: number;
  }[] = [];

  for (const [batchIdx, texts] of sortedBatches) {
    const sentiments = texts.map(t => computeSentiment(t));
    const avg = sentiments.reduce((a, b) => a + b, 0) / Math.max(sentiments.length, 1);
    const positive = sentiments.filter(s => s > 0.1).length;
    const negative = sentiments.filter(s => s < -0.1).length;
    const neutral = sentiments.length - positive - negative;

    const variance = sentiments.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / Math.max(sentiments.length, 1);

    batchSentiments.push({
      batchIndex: batchIdx,
      avgSentiment: Math.round(avg * 1000) / 1000,
      commentCount: texts.length,
      positiveRatio: Math.round(positive / texts.length * 1000) / 1000,
      negativeRatio: Math.round(negative / texts.length * 1000) / 1000,
      neutralRatio: Math.round(neutral / texts.length * 1000) / 1000,
      intensity: Math.round(Math.sqrt(variance) * 1000) / 1000,
    });
  }

  // Detect tone shifts between consecutive batches
  const shifts: {
    fromBatch: number;
    toBatch: number;
    sentimentDelta: number;
    magnitude: number;
    direction: 'positive' | 'negative' | 'neutral';
    label: string;
  }[] = [];

  for (let i = 1; i < batchSentiments.length; i++) {
    const prev = batchSentiments[i - 1];
    const curr = batchSentiments[i];
    const delta = curr.avgSentiment - prev.avgSentiment;
    const magnitude = Math.abs(delta);

    if (magnitude > 0.15) {
      shifts.push({
        fromBatch: prev.batchIndex,
        toBatch: curr.batchIndex,
        sentimentDelta: Math.round(delta * 1000) / 1000,
        magnitude: Math.round(magnitude * 1000) / 1000,
        direction: delta > 0 ? 'positive' : 'negative',
        label: magnitude > 0.4
          ? `DRAMATIC ${delta > 0 ? 'POSITIVE' : 'NEGATIVE'} SHIFT`
          : magnitude > 0.25
          ? `MODERATE ${delta > 0 ? 'UPWARD' : 'DOWNWARD'} SHIFT`
          : `Mild ${delta > 0 ? 'improvement' : 'decline'}`,
      });
    }
  }

  // Sentiment velocity (rate of change)
  const sentimentVelocity = batchSentiments.length > 1
    ? (batchSentiments[batchSentiments.length - 1].avgSentiment - batchSentiments[0].avgSentiment) / batchSentiments.length
    : 0;

  // Overall stability
  const avgSentiment = batchSentiments.reduce((s, b) => s + b.avgSentiment, 0) / batchSentiments.length;
  const sentimentVariance = batchSentiments.reduce((s, b) => s + Math.pow(b.avgSentiment - avgSentiment, 2), 0) / batchSentiments.length;
  const overallStability = Math.max(1 - Math.sqrt(sentimentVariance) * 2, 0);

  return {
    success: true,
    data: {
      toneShifts: shifts,
      timeline: batchSentiments,
      overallStability: Math.round(overallStability * 1000) / 1000,
      stabilityGrade: overallStability >= 0.8 ? 'stable' : overallStability >= 0.5 ? 'moderate' : 'volatile',
      sentimentVelocity: Math.round(sentimentVelocity * 10000) / 10000,
      overallSentiment: Math.round(avgSentiment * 1000) / 1000,
      summary: {
        totalBatches: batchSentiments.length,
        shiftsDetected: shifts.length,
        dramaticShifts: shifts.filter(s => s.magnitude > 0.4).length,
        dominantDirection: sentimentVelocity > 0.05 ? 'improving' : sentimentVelocity < -0.05 ? 'declining' : 'stable',
      },
      recommendations: shifts.length > 2
        ? [
            'Multiple tone shifts detected - content may be polarizing',
            'Investigate what triggers negative shifts',
            'Consider content that maintains consistent tone',
          ]
        : shifts.length === 1
        ? [
            `Single tone shift detected between batches ${shifts[0].fromBatch} and ${shifts[0].toBatch}`,
            'Review content changes that may have caused this shift',
          ]
        : [
            'Tone is consistent across batches',
          ],
    },
    source: 'browser',
    featureId: 'F20',
  };
}

// ============================================================================
// F21: Viral Signal Predictor
// ============================================================================
export function viralSignalPredictor(content: {
  text: string;
  platform?: string;
  hashtags?: string[];
  mediaType?: 'image' | 'video' | 'carousel' | 'text' | 'reel' | 'short';
}): FeatureResult {
  const { text, platform = 'instagram', hashtags = [], mediaType = 'image' } = content;

  // 1. Hook Strength (first 60 characters)
  const hook = text.slice(0, 60);
  let hookScore = 0.3; // base

  const hookPatterns = [
    { pattern: /^(?:did you|have you|what if|imagine|stop|don't|never|always|why|how|when)/i, score: 0.25 },
    { pattern: /\?/i, score: 0.15 },
    { pattern: /(?:secret|truth|revealed|nobody|everyone|hidden|real\s+reason)/i, score: 0.2 },
    { pattern: /(?:shocking|unbelievable|insane|crazy|incredible|mind.?blowing)/i, score: 0.15 },
    { pattern: /[\u{1F525}\u{1F4A1}\u{1F6A8}\u{1F389}\u{26A1}\u{2B50}\u{1F4AF}]/u, score: 0.1 },
    { pattern: /\d{1,3}(?:%|x|K|M|B|k|m)/, score: 0.15 },
    { pattern: /(?:mistake|error|wrong|myth|lie)\b/i, score: 0.2 },
    { pattern: /(?:free|giveaway|win|hack|trick|tip)/i, score: 0.1 },
  ];
  for (const { pattern, score } of hookPatterns) {
    if (pattern.test(hook)) hookScore += score;
  }
  hookScore = Math.min(hookScore, 1);
  if (hook.length > 50) hookScore *= 0.85; // Penalty for long hooks

  // 2. Emotional Triggers
  const emotionalTriggers = {
    awe: /(?:amazing|incredible|beautiful|stunning|breathtaking|mesmerizing)/gi,
    surprise: /(?:shocking|unexpected|surprising|unbelievable|never\s+expected|you\s+won'?t\s+believe)/gi,
    fear: /(?:dangerous|risky|warning|caution|don'?t|avoid|beware)/gi,
    anger: /(?:outrageous|unacceptable|disgusting|infuriating|unfair|wrong)/gi,
    joy: /(?:love|happy|amazing|excited|celebrate|beautiful|blessed)/gi,
    sadness: /(?:sad|heartbreaking|tragic|devastating|lost|gone)/gi,
    anticipation: /(?:coming\s+soon|stay\s+tuned|don'?t\s+miss|coming\s+up|about\s+to)/gi,
    trust: /(?:proven|research|study|expert|science|data|fact)/gi,
  };

  const emotionScores: Record<string, number> = {};
  let totalEmotionHits = 0;
  for (const [emotion, pattern] of Object.entries(emotionalTriggers)) {
    const matches = text.match(pattern) || [];
    emotionScores[emotion] = matches.length;
    totalEmotionHits += matches.length;
  }
  const emotionScore = Math.min(0.2 + totalEmotionHits * 0.12, 1);
  const dominantEmotion = Object.entries(emotionScores).sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutral';

  // 3. Engagement Elements
  let engagementScore = 0.2;
  if (/\?/.test(text)) engagementScore += 0.15;
  if (/(?:comment|tell\s+me|what\s+do\s+you|your\s+thoughts|below)/i.test(text)) engagementScore += 0.15;
  if (/(?:share|tag|send|forward|repost)/i.test(text)) engagementScore += 0.1;
  if (/(?:save|bookmark|pin|reminder)/i.test(text)) engagementScore += 0.1;
  if (/(?:like\s+if|double\s+tap|react)/i.test(text)) engagementScore += 0.05;
  if (/(?:follow|subscribe|join|sign\s+up)/i.test(text)) engagementScore += 0.05;
  engagementScore = Math.min(engagementScore, 1);

  // 4. Hashtag Analysis
  const hashtagCount = hashtags.length;
  let hashtagScore = 0.3;
  if (hashtagCount >= 3 && hashtagCount <= 15) hashtagScore = 0.7;
  else if (hashtagCount >= 1 && hashtagCount <= 25) hashtagScore = 0.5;
  else if (hashtagCount > 25) hashtagScore = 0.3;

  // Check for trending/mix of broad and niche tags
  const trendingTags = ['viral', 'trending', 'fyp', 'explore', 'foryou', 'foryoupage', 'reels', 'tiktok', 'instagood'];
  const hasTrending = hashtags.some(h => trendingTags.includes(h.toLowerCase()));
  if (hasTrending) hashtagScore += 0.15;
  hashtagScore = Math.min(hashtagScore, 1);

  // 5. Content Length Optimization
  const wordCount = text.split(/\s+/).length;
  const lengthConfig: Record<string, { optimal: [number, number]; good: [number, number] }> = {
    instagram: { optimal: [50, 150], good: [20, 300] },
    twitter: { optimal: [15, 40], good: [5, 280] },
    tiktok: { optimal: [20, 80], good: [10, 150] },
    youtube: { optimal: [100, 300], good: [50, 1000] },
    linkedin: { optimal: [100, 250], good: [50, 500] },
  };
  const config = lengthConfig[platform] || lengthConfig.instagram;
  const lengthScore = wordCount >= config.optimal[0] && wordCount <= config.optimal[1] ? 1 :
    wordCount >= config.good[0] && wordCount <= config.good[1] ? 0.6 : 0.3;

  // 6. Media Type Bonus
  const mediaBonus: Record<string, number> = {
    video: 0.15, reel: 0.2, short: 0.2, carousel: 0.1, image: 0.05, text: -0.05,
  };
  const mediaScore = 0.5 + (mediaBonus[mediaType] || 0);

  // 7. Controversy/Polarization Factor
  const controversyScore = /(?:debate|opinion|hot\s+take|unpopular|controversial|agree|disagree)/i.test(text) ? 0.6 : 0.2;

  // Weighted viral probability
  const weights = { hook: 0.2, emotion: 0.2, engagement: 0.15, hashtag: 0.1, length: 0.1, media: 0.1, controversy: 0.05 };
  const factorScores = {
    hookStrength: hookScore,
    emotionalTriggers: emotionScore,
    engagementElements: engagementScore,
    hashtagOptimization: hashtagScore,
    lengthOptimization: lengthScore,
    mediaTypeScore: mediaScore,
    controversyPotential: controversyScore,
  };

  const viralProbability = Object.entries(factorScores).reduce(
    (sum, [key, val]) => sum + val * (weights[key as keyof typeof weights] || 0.1), 0
  );
  const clamped = Math.min(Math.max(viralProbability, 0), 1);

  const recommendations: string[] = [];
  if (hookScore < 0.6) recommendations.push('Strengthen your hook - use questions, numbers, or curiosity gaps in the first line');
  if (emotionScore < 0.4) recommendations.push('Add more emotional trigger words (amazing, shocking, love, etc.)');
  if (engagementScore < 0.5) recommendations.push('Include engagement prompts (questions, tag a friend, save this)');
  if (hashtagScore < 0.5) recommendations.push(`Optimize hashtags - use 5-15 for ${platform}`);
  if (lengthScore < 0.5) recommendations.push(`Adjust content length to ${config.optimal[0]}-${config.optimal[1]} words for ${platform}`);

  return {
    success: true,
    data: {
      viralProbability: Math.round(clamped * 1000) / 1000,
      viralPercentile: Math.round(clamped * 100),
      prediction: clamped >= 0.7 ? 'high_viral_potential' : clamped >= 0.5 ? 'moderate_potential' : clamped >= 0.3 ? 'low_potential' : 'unlikely_viral',
      factors: factorScores,
      dominantEmotion,
      emotionBreakdown: emotionScores,
      estimatedEngagement: {
        likes: Math.round(clamped * 1000 * (platform === 'tiktok' ? 5 : platform === 'instagram' ? 3 : 1)),
        comments: Math.round(clamped * 100 * (engagementScore > 0.6 ? 2 : 1)),
        shares: Math.round(clamped * 50 * (controversyScore > 0.4 ? 2 : 1)),
      },
      recommendations: recommendations.length > 0 ? recommendations : ['Content is well-optimized for virality!'],
    },
    source: 'browser',
    featureId: 'F21',
  };
}

// ============================================================================
// F22: Audience Demographic Estimation
// ============================================================================
export function audienceDemographicEstimation(comments: {
  text: string;
  username?: string;
  timestamp?: string;
}[]): FeatureResult {
  if (comments.length === 0) {
    return {
      success: false,
      data: { error: 'No comments to analyze' },
      source: 'browser',
      featureId: 'F22',
    };
  }

  // Age estimation signals
  const genZSlang = new Set([
    'slay', 'no cap', 'cap', 'bet', 'fr', 'periodt', 'stan', 'simp',
    'rizz', 'bussin', 'glow up', 'ghosted', 'vibe', 'vibes', 'iykyk',
    'lowkey', 'highkey', 'mid', 'fire', 'lit', 'based', 'cooked', 'edging',
    'rent free', 'touch grass', 'delulu', 'pookie', 'skibidi', 'sigma',
    'chad', 'goat', 'w', 'l', 'ratio', 'smh', 'tbh', 'ngl', 'rn',
    'rn', 'rn', 'af', 'goated', 'bussin', 'slaps', 'hits different',
  ]);
  const millennialSlang = new Set([
    'literally', 'obviously', 'tbh', 'fomo', 'adulting', 'on fleek',
    'yolo', 'squad', 'goals', 'relationship goals', 'bae', 'selfie',
    'netflix and chill', 'adulting', 'side hustle', 'thirty', 'forty',
    'kids', 'parenting', 'mortgage', 'career', 'work from home', 'remote',
  ]);
  const boomerSlang = new Set([
    'back in my day', 'kids these days', 'in my time', 'young people',
    'when i was young', 'respect your elders', 'hard work', 'common sense',
    'snowflake', 'cancel culture', ' entitled', 'entitlement',
  ]);

  const genZEmojis = new Set(['💀', '😭', '😤', '🥺', '🫠', '💅', '✨', '🤭', '👻', '👀', '🫶', '🥹', '😈', '🤡', '💅']);
  const olderEmojis = new Set(['👍', '😂', '❤️', '😊', '🙏', '😎', '💯', '🎉', '👏', '✅']);

  // Interest categories
  const interestKeywords: Record<string, string[]> = {
    technology: ['tech', 'code', 'programming', 'software', 'app', 'ai', 'crypto', 'blockchain', 'developer', 'data', 'algorithm', 'gadget'],
    entertainment: ['movie', 'film', 'music', 'song', 'album', 'concert', 'series', 'show', 'anime', 'gaming', 'game', 'stream'],
    lifestyle: ['food', 'recipe', 'travel', 'fashion', 'style', 'fitness', 'workout', 'health', 'wellness', 'self-care'],
    business: ['business', 'startup', 'entrepreneur', 'marketing', 'brand', 'money', 'invest', 'finance', 'income', 'profit'],
    education: ['learn', 'study', 'book', 'course', 'tutorial', 'school', 'university', 'student', 'degree', 'knowledge'],
    relationships: ['relationship', 'dating', 'love', 'marriage', 'partner', 'single', 'ex', 'breakup', 'couple', 'family'],
    creative: ['art', 'design', 'creative', 'photo', 'video', 'drawing', 'painting', 'music', 'writing', 'dance'],
  };

  // Geographic hints
  const geographicKeywords: Record<string, string[]> = {
    'Nigeria/West Africa': ['naija', 'nigeria', 'lagos', 'abuja', 'gadaffi', 'owambe', 'jollof', 'aso-ebi', 'gele', 'agbada', 'yahoo'],
    'East Africa': ['kenya', 'nairobi', 'uganda', 'tanzania', 'dar', 'kampala', 'mombasa', 'safaricom'],
    'South Africa': ['south africa', 'cape town', 'joburg', 'johannesburg', 'mzansi', 'saffa', 'braai', 'load shedding', 'loadshedding'],
    'UK/Europe': ['mate', 'lad', 'sorted', 'cheers', 'bloody', 'rubbish', 'reckon', 'uni', 'brexit', 'quid'],
    'North America': ['yall', 'y\'all', 'bro', 'dude', 'hella', 'wassup', 'aint', 'gotta', 'kinda', 'lmao'],
    'South Asia': ['bhai', 'yaar', 'desi', 'salaam', 'jaldi', 'accha', 'kya', 'hai', 'macha', 'supari'],
  };

  // Analyze each comment
  let genZScore = 0, millennialScore = 0, boomerScore = 0;
  let genZEmojiCount = 0, olderEmojiCount = 0;
  const interestCounts: Record<string, number> = {};
  const geoCounts: Record<string, number> = {};
  let totalVocabularyComplexity = 0;
  let abbreviationCount = 0;
  let longWordCount = 0;
  let totalWords = 0;
  let totalSentences = 0;

  for (const comment of comments) {
    const tokens = tokenize(comment.text);
    totalWords += tokens.length;
    totalSentences += (comment.text.match(/[.!?]+/g) || []).length || 1;

    // Age signals
    for (const token of tokens) {
      if (genZSlang.has(token)) genZScore++;
      if (millennialSlang.has(token)) millennialScore++;
      if (boomerSlang.has(token)) boomerScore++;
      if (token.length > 8) longWordCount++;
      if (/^(?:tbh|ngl|rn|imo|imho|idk|irl|smh|fyi|btw|omg|lol|idc|afk|brb|jk|ily|ily2)$/i.test(token)) abbreviationCount++;
    }

    // Emoji usage
    const emojis = comment.text.match(/[\u{1F300}-\u{1F9FF}]/gu) || [];
    for (const emoji of emojis) {
      if (genZEmojis.has(emoji)) genZEmojiCount++;
      if (olderEmojis.has(emoji)) olderEmojiCount++;
    }

    // Interests
    const lowerText = comment.text.toLowerCase();
    for (const [interest, keywords] of Object.entries(interestKeywords)) {
      for (const kw of keywords) {
        if (lowerText.includes(kw)) {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        }
      }
    }

    // Geographic
    for (const [region, keywords] of Object.entries(geographicKeywords)) {
      for (const kw of keywords) {
        if (lowerText.includes(kw)) {
          geoCounts[region] = (geoCounts[region] || 0) + 1;
        }
      }
    }

    // Vocabulary complexity (avg word length)
    const avgWordLen = tokens.reduce((s, t) => s + t.length, 0) / Math.max(tokens.length, 1);
    totalVocabularyComplexity += avgWordLen;
  }

  // Normalize age scores
  const maxAgeScore = Math.max(genZScore, millennialScore, boomerScore, 1);
  const ageDistribution = {
    genZ: Math.round((genZScore / maxAgeScore) * 100),
    millennial: Math.round((millennialScore / maxAgeScore) * 100),
    genX_boomer: Math.round((boomerScore / maxAgeScore) * 100),
  };

  // Normalize to percentages that sum to 100
  const ageTotal = ageDistribution.genZ + ageDistribution.millennial + ageDistribution.genX_boomer || 1;
  ageDistribution.genZ = Math.round(ageDistribution.genZ / ageTotal * 100);
  ageDistribution.millennial = Math.round(ageDistribution.millennial / ageTotal * 100);
  ageDistribution.genX_boomer = 100 - ageDistribution.genZ - ageDistribution.millennial;

  // Emoji preference
  const emojiPreference = genZEmojiCount > olderEmojiCount ? 'modern' :
    olderEmojiCount > genZEmojiCount ? 'classic' : 'mixed';

  // Interests
  const topInterests = Object.entries(interestCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([interest, count]) => ({
      interest,
      score: Math.round(count / comments.length * 100),
    }));

  // Geographic hints
  const topRegions = Object.entries(geoCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([region, count]) => ({
      region,
      confidence: Math.round(count / comments.length * 100),
    }));

  // Vocabulary complexity
  const avgComplexity = totalVocabularyComplexity / Math.max(comments.length, 1);
  const abbreviationRate = totalWords > 0 ? abbreviationCount / totalWords : 0;
  const longWordRate = totalWords > 0 ? longWordCount / totalWords : 0;

  return {
    success: true,
    data: {
      ageEstimation: {
        distribution: ageDistribution,
        dominantGeneration: ageDistribution.genZ >= ageDistribution.millennial && ageDistribution.genZ >= ageDistribution.genX_boomer
          ? 'Gen Z (born 1997-2012)' :
          ageDistribution.millennial >= ageDistribution.genX_boomer
          ? 'Millennials (born 1981-1996)' :
          'Gen X / Boomers (born 1965-1980)',
        confidence: Math.round(Math.max(genZScore, millennialScore, boomerScore) / Math.max(genZScore + millennialScore + boomerScore, 1) * 100),
      },
      geographicHints: topRegions,
      topInterests,
      languageProfile: {
        avgVocabularyComplexity: Math.round(avgComplexity * 100) / 100,
        abbreviationRate: Math.round(abbreviationRate * 1000) / 1000,
        longWordRate: Math.round(longWordRate * 1000) / 1000,
        avgWordsPerComment: Math.round(totalWords / Math.max(comments.length, 1) * 10) / 10,
        avgSentencesPerComment: Math.round(totalSentences / Math.max(comments.length, 1) * 10) / 10,
        emojiPreference,
        emojiStats: {
          genZStyle: genZEmojiCount,
          classicStyle: olderEmojiCount,
          total: genZEmojiCount + olderEmojiCount,
        },
      },
      commentsAnalyzed: comments.length,
    },
    source: 'browser',
    featureId: 'F22',
  };
}

// ============================================================================
// F23: Engagement Heatmap
// ============================================================================
export function engagementHeatmap(historicalData: {
  timestamp: string;
  engagement: number;
  impressions: number;
}[]): FeatureResult {
  // Initialize 7x24 grid (days x hours)
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const counts: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

  for (const entry of historicalData) {
    const date = new Date(entry.timestamp);
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    const hour = date.getHours();
    const engagementRate = entry.impressions > 0
      ? entry.engagement / entry.impressions
      : entry.engagement;

    heatmap[dayOfWeek][hour] += engagementRate;
    counts[dayOfWeek][hour]++;
  }

  // Calculate averages
  const avgHeatmap: number[][] = [];
  let maxEngagement = 0;
  let minEngagement = Infinity;

  for (let d = 0; d < 7; d++) {
    avgHeatmap[d] = [];
    for (let h = 0; h < 24; h++) {
      const avg = counts[d][h] > 0 ? heatmap[d][h] / counts[d][h] : 0;
      avgHeatmap[d][h] = avg;
      if (avg > maxEngagement) maxEngagement = avg;
      if (avg < minEngagement && avg > 0) minEngagement = avg;
    }
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Find top 5 engagement windows
  const topWindows: { day: string; hour: number; avgEngagement: number; score: number }[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (counts[d][h] > 0) {
        topWindows.push({
          day: dayNames[d],
          hour: h,
          avgEngagement: Math.round(avgHeatmap[d][h] * 10000) / 10000,
          score: maxEngagement > 0 ? avgHeatmap[d][h] / maxEngagement : 0,
        });
      }
    }
  }
  topWindows.sort((a, b) => b.score - a.score);

  // Calculate daily averages
  const dailyAverages = dayNames.map((day, d) => {
    const dayValues = avgHeatmap[d].filter(v => v > 0);
    return {
      day,
      avgEngagement: dayValues.length > 0
        ? Math.round(dayValues.reduce((a, b) => a + b, 0) / dayValues.length * 10000) / 10000
        : 0,
      peakHour: avgHeatmap[d].indexOf(Math.max(...avgHeatmap[d])),
    };
  });

  // Calculate hourly averages
  const hourlyAverages = Array.from({ length: 24 }, (_, h) => {
    const hourValues = avgHeatmap.map(day => day[h]).filter(v => v > 0);
    return {
      hour: h,
      avgEngagement: hourValues.length > 0
        ? Math.round(hourValues.reduce((a, b) => a + b, 0) / hourValues.length * 10000) / 10000
        : 0,
    };
  });

  // Normalize heatmap for display (0-1 scale)
  const normalizedHeatmap = avgHeatmap.map(row =>
    row.map(val => maxEngagement > 0 ? Math.round(val / maxEngagement * 1000) / 1000 : 0)
  );

  return {
    success: true,
    data: {
      heatmap: normalizedHeatmap,
      rawHeatmap: avgHeatmap,
      dayNames,
      topEngagementWindows: topWindows.slice(0, 5),
      dailyBreakdown: dailyAverages.sort((a, b) => b.avgEngagement - a.avgEngagement),
      hourlyBreakdown: hourlyAverages.sort((a, b) => b.avgEngagement - a.avgEngagement),
      summary: {
        bestDay: dailyAverages.sort((a, b) => b.avgEngagement - a.avgEngagement)[0]?.day || 'N/A',
        bestHour: topWindows[0]?.hour ?? -1,
        worstDay: dailyAverages.sort((a, b) => a.avgEngagement - b.avgEngagement)[0]?.day || 'N/A',
        totalDataPoints: historicalData.length,
      },
      recommendation: topWindows.length > 0
        ? `Best posting time: ${topWindows[0].day} at ${topWindows[0].hour}:00`
        : 'Insufficient data for recommendations',
    },
    source: 'browser',
    featureId: 'F23',
  };
}

// ============================================================================
// F24: Multi-Language Sentiment Translation
// ============================================================================
const LANGUAGE_DETECTORS: { name: string; code: string; patterns: RegExp[]; commonWords: string[]; positive: string[]; negative: string[] }[] = [
  {
    name: 'English', code: 'en',
    patterns: [/^[a-zA-Z\s'.,!?]+$/],
    commonWords: ['the', 'is', 'are', 'was', 'were', 'have', 'has', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'not', 'and', 'but', 'or', 'if', 'then'],
    positive: ['good', 'great', 'love', 'amazing', 'awesome', 'best', 'excellent', 'wonderful', 'perfect', 'happy', 'nice', 'beautiful', 'fantastic', 'incredible'],
    negative: ['bad', 'hate', 'terrible', 'awful', 'worst', 'horrible', 'poor', 'boring', 'waste', 'ugly', 'stupid', 'useless', 'disgusting', 'pathetic'],
  },
  {
    name: 'Yoruba', code: 'yo',
    patterns: [/[àáâèéêìíîòóôùúû]/, /\b(?:kí|ní|fún|jẹ|sí|pẹ̀lú|àti|lórí|nítorí|wá|gán|dáradára|burúkú|èyín|ọmọ|bàbá|ìyá)\b/i],
    commonWords: ['ki', 'ni', 'fun', 'je', 'si', 'pelu', 'ati', 'lori', 'nitori', 'wa', 'gan', 'dara', 'buruku'],
    positive: ['da', 'dara', 'adan', 'feran', 'ayò', 'ire', 'ireti', 'alafia', 'bukata', 'ayanfe'],
    negative: ['buru', 'buruku', 'iya', 'binu', 'se', 'pane', 'ikorira', 'idin', 'oku', 'foju'],
  },
  {
    name: 'Igbo', code: 'ig',
    patterns: [/[ịịụụọọẹẹ]/, /\b(?:na|nke|ka|maka|na\-a|bụ|ị bụ|ị ga|ihe|mmadụ|ụlọ|nwa|otu|aha)\b/i],
    commonWords: ['na', 'nke', 'ka', 'maka', 'bu', 'ihe', 'mmadu', 'ulo', 'nwa', 'otu', 'aha', 'ime'],
    positive: ['mma', 'nma', 'ife', 'joy', 'ugbo', 'chi', 'ifeoma', 'udara', 'amara', 'ma'],
    negative: ['jo', 'njo', 'ajo', 'iwe', 'ijo', 'ogu', 'ego', 'achaa', 'ime', 'ihe'],
  },
  {
    name: 'Hausa', code: 'ha',
    patterns: [/[ƴƴƙƙ][a-z]/, /\b(?:a|ya|ta|na|da|ka|ga|ci|ke|ne|wa|shi|ta|sun|cikin|daidai|kyakkyawan)\b/i],
    commonWords: ['a', 'ya', 'ta', 'na', 'da', 'ka', 'ga', 'ci', 'ke', 'ne', 'wa', 'shi', 'sun', 'cikin'],
    positive: ['kyakkyawan', 'kya', 'daidai', 'alheri', 'gamsi', 'ra', 'yayi', 'kwarai', 'mai', 'kala'],
    negative: ['kunci', 'mummunan', 'baci', 'zafi', 'kunci', 'karya', 'sauki', 'nuna', 'bacin', 'rashin'],
  },
  {
    name: 'French', code: 'fr',
    patterns: [/(?:très|bonjour|merci|bonne|pour|avec|dans|mais|pourquoi|comment|sont|nous|vous)\b/i],
    commonWords: ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'est', 'sont', 'que', 'qui', 'pour', 'dans', 'avec', 'mais', 'pas'],
    positive: ['bon', 'excellent', 'superbe', 'merveilleux', 'magnifique', 'parfait', 'génial', 'chouette', 'content', 'heureux', 'amour', 'beau'],
    negative: ['mauvais', 'terrible', 'horrible', 'nul', 'pourri', 'pathétique', 'dégoûtant', 'ennuyeux', 'méchant', 'stupide'],
  },
  {
    name: 'Spanish', code: 'es',
    patterns: [/(?:muy|bueno|grande|pero|porque|cuando|también|nosotros|ellos|ellas|hola|gracias)\b/i],
    commonWords: ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'en', 'que', 'por', 'con', 'para', 'pero', 'es', 'son', 'muy'],
    positive: ['bueno', 'excelente', 'increíble', 'maravilloso', 'perfecto', 'genial', 'fantástico', 'hermoso', 'feliz', 'amor', 'grande'],
    negative: ['malo', 'terrible', 'horrible', 'feo', 'aburrido', 'estúpido', 'inútil', 'asco', 'odio', 'basura'],
  },
  {
    name: 'Arabic', code: 'ar',
    patterns: [/[\u0600-\u06FF]/],
    commonWords: ['في', 'من', 'على', 'إلى', 'هذا', 'هذه', 'التي', 'الذي', 'مع', 'كان', 'كل', 'لم', 'لن', 'بين', 'عن'],
    positive: ['ممتاز', 'رائع', 'جميل', 'حسن', 'سعيد', 'مبدع', 'عظيم', 'مذهل', 'مبارك', 'أحب'],
    negative: ['سيء', 'فظيع', 'مريع', 'قبيح', 'ملل', 'غبي', 'باطل', 'كره', 'حزين', 'فاشل'],
  },
  {
    name: 'Portuguese', code: 'pt',
    patterns: [/(?:muito|obrigado|porque|também|nós|eles|elas|por|para|mas|que|como|essa)\b/i],
    commonWords: ['o', 'a', 'os', 'as', 'de', 'em', 'que', 'um', 'uma', 'para', 'com', 'por', 'mas', 'não', 'seu', 'sua'],
    positive: ['bom', 'excelente', 'incrível', 'maravilhoso', 'perfeito', 'genial', 'fantástico', 'lindo', 'feliz', 'amor', 'ótimo'],
    negative: ['mau', 'péssimo', 'horrível', 'feio', 'chato', 'estúpido', 'inútil', 'nojo', 'ódio', 'lixo'],
  },
];

export function multiLanguageSentimentTranslation(comments: {
  text: string;
  username?: string;
}[]): FeatureResult {
  if (comments.length === 0) {
    return {
      success: false,
      data: { error: 'No comments provided' },
      source: 'browser',
      featureId: 'F24',
    };
  }

  const languageBreakdown: {
    language: string;
    code: string;
    commentCount: number;
    percentage: number;
    avgSentiment: number;
    positiveRatio: number;
    negativeRatio: number;
    sampleComments: string[];
  }[] = [];

  const languageAssignments: { language: string; code: string; sentiment: number }[] = [];

  for (const comment of comments) {
    const text = comment.text;
    const lower = text.toLowerCase();
    let bestLanguage = LANGUAGE_DETECTORS[0];
    let bestScore = 0;

    for (const lang of LANGUAGE_DETECTORS) {
      let score = 0;

      // Check character patterns
      for (const pattern of lang.patterns) {
        const matches = text.match(pattern);
        if (matches) score += matches.length * 2;
      }

      // Check common words
      const words = lower.split(/\s+/);
      for (const word of words) {
        if (lang.commonWords.includes(word)) score += 3;
      }

      if (score > bestScore) {
        bestScore = score;
        bestLanguage = lang;
      }
    }

    // Calculate sentiment using language-specific word lists
    const words = lower.split(/\s+/);
    let posScore = 0, negScore = 0;
    for (const word of words) {
      if (bestLanguage.positive.some(p => word.includes(p))) posScore++;
      if (bestLanguage.negative.some(n => word.includes(n))) negScore++;
    }

    // Also use emoji-based sentiment
    const positiveEmojis = (text.match(/[\u{1F600}-\u{1F64F}\u{1F319}\u{1F31F}\u{1F496}\u{1F49B}\u{1F4AF}\u{2764}\u{1F525}]/gu) || []).length;
    const negativeEmojis = (text.match(/[\u{1F621}\u{1F624}\u{1F92C}\u{1F4A2}\u{1F44E}\u{1F480}\u{1F4A9}]/gu) || []).length;

    const sentiment = words.length > 0
      ? (posScore + positiveEmojis * 0.5 - negScore - negativeEmojis * 0.5) / words.length
      : 0;

    languageAssignments.push({
      language: bestLanguage.name,
      code: bestLanguage.code,
      sentiment,
    });
  }

  // Aggregate by language
  const languageGroups: Record<string, { sentiments: number[]; texts: string[] }> = {};
  for (const assignment of languageAssignments) {
    if (!languageGroups[assignment.language]) {
      languageGroups[assignment.language] = { sentiments: [], texts: [] };
    }
    languageGroups[assignment.language].sentiments.push(assignment.sentiment);
  }

  for (const comment of comments) {
    const idx = comments.indexOf(comment);
    if (idx < languageAssignments.length) {
      const lang = languageAssignments[idx].language;
      if (languageGroups[lang]) {
        languageGroups[lang].texts.push(comment.text.slice(0, 100));
      }
    }
  }

  for (const [language, data] of Object.entries(languageGroups)) {
    const sentiments = data.sentiments;
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / Math.max(sentiments.length, 1);
    const positive = sentiments.filter(s => s > 0.05).length;
    const negative = sentiments.filter(s => s < -0.05).length;

    languageBreakdown.push({
      language,
      code: LANGUAGE_DETECTORS.find(l => l.name === language)?.code || 'unknown',
      commentCount: sentiments.length,
      percentage: Math.round(sentiments.length / comments.length * 1000) / 1000,
      avgSentiment: Math.round(avgSentiment * 1000) / 1000,
      positiveRatio: Math.round(positive / sentiments.length * 1000) / 1000,
      negativeRatio: Math.round(negative / sentiments.length * 1000) / 1000,
      sampleComments: data.texts.slice(0, 3),
    });
  }

  languageBreakdown.sort((a, b) => b.commentCount - a.commentCount);

  return {
    success: true,
    data: {
      languagesDetected: languageBreakdown.length,
      breakdown: languageBreakdown,
      dominantLanguage: languageBreakdown[0]?.language || 'unknown',
      isMultilingual: languageBreakdown.length > 1,
      overallSentiment: languageAssignments.length > 0
        ? Math.round(languageAssignments.reduce((s, a) => s + a.sentiment, 0) / languageAssignments.length * 1000) / 1000
        : 0,
      summary: {
        mostPositiveLang: [...languageBreakdown].sort((a, b) => b.avgSentiment - a.avgSentiment)[0]?.language,
        mostNegativeLang: [...languageBreakdown].sort((a, b) => a.avgSentiment - b.avgSentiment)[0]?.language,
        diversityIndex: Math.round(languageBreakdown.length / LANGUAGE_DETECTORS.length * 100) / 100,
      },
    },
    source: 'browser',
    featureId: 'F24',
  };
}

// ============================================================================
// F25: Dark Social Signal Capture
// ============================================================================
export function darkSocialSignalCapture(data: {
  totalShares: number;
  trackedShares: number;
  comments: {
    text: string;
    timestamp?: string;
  }[];
  referralData: { source: string; count: number }[];
  directTraffic: number;
  indirectMentions: number;
}): FeatureResult {
  const { totalShares, trackedShares, comments, referralData, directTraffic } = data;

  // Calculate dark social share estimate
  const estimatedDarkShares = Math.max(totalShares - trackedShares, 0);

  // Analyze comments for dark social indicators
  const darkSocialIndicators = [
    { pattern: /(?:someone\s+(?:shared|sent|forwarded|sent\s+me|showed)\s+(?:this|me|it))/i, type: 'shared_dm', weight: 0.9 },
    { pattern: /(?:my\s+(?:friend|brother|sister|mom|dad|colleague|coworker)\s+(?:sent|shared|showed))/i, type: 'shared_dm', weight: 0.85 },
    { pattern: /(?:found\s+(?:this|you|your\s+content)\s+(?:on|through|via)\s+(?:dm|direct|message|whatsapp|telegram))/i, type: 'dm_discovery', weight: 0.8 },
    { pattern: /(?:saw\s+(?:this|your\s+post)\s+(?:on|in)\s+(?:a\s+)?(?:group|chat|dm|forward))/i, type: 'group_share', weight: 0.85 },
    { pattern: /(?:screenshot(?:ed)?(?:\s+this|\s+your|\s+it))/i, type: 'screenshot', weight: 0.7 },
    { pattern: /(?:saved\s+(?:this|it|the\s+(?:video|post|photo)))/i, type: 'saved', weight: 0.5 },
    { pattern: /(?:came\s+here\s+from|got\s+here\s+from|landed\s+here)/i, type: 'referral_unknown', weight: 0.6 },
    { pattern: /(?:link\s+(?:in|was\s+in)\s+(?:bio|story|description|pinned))/i, type: 'link_click', weight: 0.4 },
    { pattern: /(?:notified|got\s+a\s+notification|was\s+(?:notified|tagged))/i, type: 'notification', weight: 0.3 },
    { pattern: /(?:shared\s+(?:this|your\s+video|your\s+post)\s+(?:with\s+)?(?:my\s+)?(?:team|class|group|friends))/i, type: 'group_share', weight: 0.8 },
  ];

  let dmShareCount = 0;
  let groupShareCount = 0;
  let screenshotCount = 0;
  let savedCount = 0;
  let otherDarkSignals = 0;

  const signalDetails: { type: string; comment: string; confidence: number }[] = [];

  for (const comment of comments) {
    const text = comment.text;
    for (const { pattern, type, weight } of darkSocialIndicators) {
      if (pattern.test(text)) {
        const detail = { type, comment: text.slice(0, 100), confidence: weight };
        signalDetails.push(detail);

        switch (type) {
          case 'shared_dm': case 'dm_discovery': dmShareCount++; break;
          case 'group_share': groupShareCount++; break;
          case 'screenshot': screenshotCount++; break;
          case 'saved': savedCount++; break;
          default: otherDarkSignals++; break;
        }
        break;
      }
    }
  }

  // Analyze referral data for dark social patterns
  const unknownReferrals = referralData.filter(r =>
    r.source === 'direct' || r.source === 'unknown' || r.source === 'other' || r.source === ''
  );
  const darkReferralTraffic = unknownReferrals.reduce((s, r) => s + r.count, 0);

  // Estimate dark social volume
  const dmVolumeEstimate = dmShareCount * 5; // Each DM share reaches ~5 people
  const groupVolumeEstimate = groupShareCount * 15; // Each group share reaches ~15 people
  const screenshotVolumeEstimate = screenshotCount * 3;
  const estimatedDarkAudience = dmVolumeEstimate + groupVolumeEstimate + screenshotVolumeEstimate;

  // Dark social index
  const totalTrackable = trackedShares + referralData.reduce((s, r) => s + r.count, 0);
  const darkSocialRatio = totalTrackable > 0 ? estimatedDarkShares / (totalTrackable + estimatedDarkShares) : 0.3;

  return {
    success: true,
    data: {
      darkSocialIndex: Math.round(darkSocialRatio * 1000) / 1000,
      darkSocialGrade: darkSocialRatio >= 0.6 ? 'high' : darkSocialRatio >= 0.3 ? 'moderate' : 'low',
      estimatedDarkShares: estimatedDarkShares + Math.round(dmShareCount * 3 + groupShareCount * 5),
      trackedShares,
      totalShares,
      estimatedDarkAudience,
      signalBreakdown: {
        directMessageShares: dmShareCount,
        groupShares: groupShareCount,
        screenshots: screenshotCount,
        saves: savedCount,
        otherIndicators: otherDarkSignals,
      },
      signalDetails: signalDetails.slice(0, 20),
      referralAnalysis: {
        knownReferrals: referralData.filter(r => r.source !== 'direct' && r.source !== 'unknown').reduce((s, r) => s + r.count, 0),
        darkReferralTraffic,
        directTraffic,
      },
      summary: {
        darkSocialPercentage: Math.round(darkSocialRatio * 100),
        mostCommonChannel: dmShareCount >= groupShareCount && dmShareCount >= screenshotCount ? 'Direct Messages' :
          groupShareCount >= screenshotCount ? 'Group Chats' : 'Screenshots',
        signalsPerComment: comments.length > 0
          ? Math.round(signalDetails.length / comments.length * 100) / 100
          : 0,
      },
      recommendations: darkSocialRatio >= 0.5
        ? [
            'Strong dark social presence - leverage with shareable content',
            'Create content that invites DM sharing (relatable, exclusive)',
            'Use CTAs like "Send this to someone who needs to see it"',
            'Consider creating WhatsApp/Telegram share links',
          ]
        : [
            'Encourage more sharing by adding clear CTAs',
            'Create save-worthy content (tips, tutorials, references)',
          ],
    },
    source: 'browser',
    featureId: 'F25',
  };
}

// ============================================================================
// F26: Commenter Soul Age Estimator
// ============================================================================
export function commenterSoulAgeEstimator(comments: {
  text: string;
  username?: string;
}[]): FeatureResult {
  if (comments.length === 0) {
    return { success: false, data: { error: 'No comments' }, source: 'browser', featureId: 'F26' };
  }

  return {
    success: true,
    data: {
      estimates: comments.map(comment => {
        const text = comment.text;
        const lower = text.toLowerCase();
        const words = lower.split(/\s+/);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

        let ageScore = 25; // default starting point

        // Slang & colloquialisms
        const modernSlang = ['slay', 'no cap', 'cap', 'bet', 'fr', 'periodt', 'stan', 'simp', 'rizz', 'bussin', 'glow up', 'iykyk', 'lowkey', 'highkey', 'mid', 'based', 'rent free', 'touch grass', 'delulu', 'pookie', 'skibidi', 'sigma', 'goated', 'w', 'l', 'ratio', 'ngl', 'rn', 'af'];
        const millennialSlang = ['adulting', 'yolo', 'squad', 'goals', 'bae', 'fomo', 'netflix and chill', 'side hustle', 'humble brag', 'extra', 'shook', 'mood', 'savage', 'lit'];
        const olderSlang = ['back in my day', 'kids these days', 'young people', 'respect', 'common sense', 'snowflake', 'entitled'];
        const academicLanguage = ['furthermore', 'moreover', 'consequently', 'nevertheless', 'therefore', 'thus', 'hence', 'notwithstanding', 'arguably', 'perhaps'];

        let modernCount = 0, millennialCount = 0, olderCount = 0, academicCount = 0;
        for (const w of words) {
          if (modernSlang.includes(w)) modernCount++;
          if (millennialSlang.includes(w)) millennialCount++;
          if (olderSlang.includes(w)) olderCount++;
          if (academicLanguage.includes(w)) academicCount++;
        }

        if (modernCount >= 2) ageScore -= 10;
        if (modernCount >= 4) ageScore -= 5;
        if (millennialCount >= 2) ageScore += 5;
        if (olderCount >= 1) ageScore += 15;
        if (academicCount >= 2) ageScore += 5;

        // Abbreviation usage
        const abbreviations = (text.match(/\b(?:tbh|ngl|rn|imo|imho|idk|irl|smh|fyi|btw|omg|lol|lmao|rofl|wtf|stfu|ily|afk|brb|jk|irl|idc|nvm|ig|rn|frfr|on god|no cap)\b/gi) || []).length;
        if (abbreviations >= 3) ageScore -= 8;
        if (abbreviations >= 1) ageScore -= 3;

        // Emoji density
        const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
        const emojiDensity = emojiCount / Math.max(words.length, 1);
        if (emojiDensity > 0.3) ageScore -= 7;
        if (emojiDensity > 0.15) ageScore -= 3;
        if (emojiDensity === 0 && words.length > 20) ageScore += 5;

        // Sentence complexity
        const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : words.length;
        if (avgSentenceLength > 20) ageScore += 8;
        if (avgSentenceLength > 15) ageScore += 4;
        if (avgSentenceLength < 5) ageScore -= 5;

        // Capitalization patterns
        const allCapsWords = words.filter(w => w === w.toUpperCase() && w.length > 1 && /[a-z]/i.test(w)).length;
        if (allCapsWords > words.length * 0.3) ageScore -= 5;
        if (allCapsWords === 0 && words.length > 10) ageScore += 3;

        // Punctuation style
        const exclamationCount = (text.match(/!/g) || []).length;
        (text.match(/\?/g) || []).length;
        const ellipsisCount = (text.match(/\.{3,}/g) || []).length;
        if (exclamationCount > 3) ageScore -= 4;
        if (ellipsisCount > 1) ageScore += 3;

        // Word length complexity
        const avgWordLength = words.reduce((s, w) => s + w.length, 0) / Math.max(words.length, 1);
        if (avgWordLength > 6) ageScore += 5;
        if (avgWordLength > 5) ageScore += 2;
        if (avgWordLength < 3.5) ageScore -= 3;

        // Content themes
        if (/(?:school|homework|class|exam|teacher|grade|student|university|college|professor)/i.test(text)) ageScore -= 3;
        if (/(?:work|job|career|boss|office|colleague|meeting|project|client)/i.test(text)) ageScore += 8;
        if (/(?:kids|children|parenting|baby|toddler|marriage|spouse)/i.test(text)) ageScore += 10;
        if (/(?:retire|retirement|pension|grand|aging|grandchildren)/i.test(text)) ageScore += 15;

        // Clamp to reasonable range
        ageScore = Math.max(13, Math.min(ageScore, 75));

        // Soul age classification
        const soulAge = ageScore < 18 ? 'young_spirit' :
          ageScore < 25 ? 'digital_native' :
          ageScore < 35 ? 'established_voice' :
          ageScore < 50 ? 'seasoned_commenter' :
          'wise_elder';

        const confidence = Math.min(
          0.4 +
          (abbreviations > 0 ? 0.1 : 0) +
          (modernCount + millennialCount + olderCount > 0 ? 0.15 : 0) +
          (sentences.length > 3 ? 0.1 : 0) +
          (words.length > 20 ? 0.1 : 0) +
          (academicCount > 0 ? 0.1 : 0),
          0.95
        );

        return {
          username: comment.username,
          estimatedAge: Math.round(ageScore),
          soulAge,
          confidence: Math.round(confidence * 1000) / 1000,
          signals: {
            modernSlang: modernCount,
            millennialSlang: millennialCount,
            academicLanguage: academicCount,
            abbreviationRate: abbreviations / Math.max(words.length, 1),
            emojiDensity: Math.round(emojiDensity * 100) / 100,
            avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
            avgWordLength: Math.round(avgWordLength * 10) / 10,
          },
        };
      }),
    },
    source: 'browser',
    featureId: 'F26',
  };
}

// ============================================================================
// F27: Ghost Audience Detector
// ============================================================================
export function ghostAudienceDetector(metrics: {
  followerCount: number;
  recentImpressions: number[];
  recentLikes: number[];
  recentComments: number[];
  recentShares: number[];
  engagementHistory?: { date: string; impressions: number; likes: number; comments: number }[];
}): FeatureResult {
  const { followerCount, recentImpressions, recentLikes, recentComments, recentShares, engagementHistory } = metrics;

  const postCount = recentImpressions.length;
  if (postCount === 0 || followerCount === 0) {
    return { success: false, data: { error: 'Insufficient data' }, source: 'browser', featureId: 'F27' };
  }

  // 1. Follower-to-engagement ratio
  const avgEngagement = recentImpressions.map((_imp, i) =>
    (recentLikes[i] || 0) + (recentComments[i] || 0) + (recentShares[i] || 0)
  );
  const avgEngRate = avgEngagement.reduce((a, b) => a + b, 0) / postCount;
  const engagementPerFollower = avgEngRate / followerCount;

  // 2. Impression-to-follower ratio (organic reach)
  const avgImpressions = recentImpressions.reduce((a, b) => a + b, 0) / postCount;
  const reachRate = avgImpressions / followerCount;

  // 3. Ghost audience estimation
  // Ghost = followers who never see or engage with content
  const nonEngagers = 1 - Math.min(engagementPerFollower * 100, 1);
  const nonViewers = 1 - Math.min(reachRate, 1);
  const ghostPercentage = Math.max(nonEngagers, nonViewers) * 0.6 + Math.min(nonEngagers, nonViewers) * 0.4;

  // 4. Engagement consistency (to detect bot/bought followers)
  const engVariance = avgEngagement.reduce((s, e) => s + Math.pow(e - avgEngRate, 2), 0) / postCount;
  const engStdDev = Math.sqrt(engVariance);
  const engCV = avgEngRate > 0 ? engStdDev / avgEngRate : 0;
  // Bot followers tend to create inconsistent engagement
  const botFollowerIndicator = engCV > 0.8 ? 0.3 : engCV > 0.5 ? 0.15 : 0;

  // 5. Like-to-comment ratio (organic: 10:1, bots: higher like ratio)
  const totalLikes = recentLikes.reduce((a, b) => a + b, 0);
  const totalComments = recentComments.reduce((a, b) => a + b, 0);
  const likeCommentRatio = totalComments > 0 ? totalLikes / totalComments : 50;
  const organicLikeRatio = likeCommentRatio < 20 ? 0 : Math.min((likeCommentRatio - 20) / 80, 1) * 0.2;

  // 6. Historical trend analysis
  let historicalDecline = 0;
  if (engagementHistory && engagementHistory.length > 5) {
    const firstHalf = engagementHistory.slice(0, Math.floor(engagementHistory.length / 2));
    const secondHalf = engagementHistory.slice(Math.floor(engagementHistory.length / 2));
    const firstAvgEng = firstHalf.reduce((s, h) => s + (h.likes + h.comments) / Math.max(h.impressions, 1), 0) / firstHalf.length;
    const secondAvgEng = secondHalf.reduce((s, h) => s + (h.likes + h.comments) / Math.max(h.impressions, 1), 0) / secondHalf.length;
    if (firstAvgEng > 0) {
      historicalDecline = Math.max(0, 1 - secondAvgEng / firstAvgEng);
    }
  }

  // 7. Ghost audience segments
  const segments = [
    {
      name: 'Active Engagers',
      percentage: Math.round(Math.min(engagementPerFollower * 100, 1) * 100),
      description: 'Followers who regularly see and engage with content',
    },
    {
      name: 'Casual Viewers',
      percentage: Math.round(Math.max(reachRate - engagementPerFollower * 100, 0) * 100),
      description: 'Followers who see content but rarely engage',
    },
    {
      name: 'Ghost Followers',
      percentage: Math.round(Math.max(ghostPercentage - organicLikeRatio - botFollowerIndicator, 0) * 100),
      description: 'Followers who never see or engage with content',
    },
    {
      name: 'Suspect Followers',
      percentage: Math.round((organicLikeRatio + botFollowerIndicator) * 100),
      description: 'Potentially fake or inactive accounts',
    },
  ];

  const totalGhost = Math.round(ghostPercentage * followerCount);
  const ghostRisk = ghostPercentage > 0.7 ? 'critical' : ghostPercentage > 0.5 ? 'high' : ghostPercentage > 0.3 ? 'moderate' : 'healthy';

  return {
    success: true,
    data: {
      ghostAudiencePercentage: Math.round(ghostPercentage * 1000) / 1000,
      estimatedGhostFollowers: totalGhost,
      ghostRisk,
      segments,
      analysis: {
        engagementPerFollower: Math.round(engagementPerFollower * 10000) / 10000,
        reachRate: Math.round(reachRate * 1000) / 1000,
        likeCommentRatio: Math.round(likeCommentRatio * 10) / 10,
        engagementConsistency: Math.round(engCV * 1000) / 1000,
        historicalDecline: Math.round(historicalDecline * 1000) / 1000,
        botFollowerRisk: Math.round((botFollowerIndicator + organicLikeRatio) * 1000) / 1000,
      },
      recommendations: ghostRisk === 'critical'
        ? [
            'Critical: Over 70% of followers are inactive ghosts',
            'Consider an audit of follower acquisition methods',
            'Focus on content that reaches non-ghosts',
            'Avoid further follower acquisition until ghost ratio improves',
          ]
        : ghostRisk === 'high'
        ? [
            'High ghost follower ratio detected',
            'Review recent follower growth for authenticity',
            'Focus engagement on active segment',
            'Create content that encourages re-engagement',
          ]
        : [
            'Follower base appears healthy',
            'Continue focusing on authentic engagement',
          ],
    },
    source: 'browser',
    featureId: 'F27',
  };
}

// ============================================================================
// F28: Audience Dream Content Generator
// ============================================================================
export function audienceDreamContentGenerator(data: {
  wishes: string[];
  comments: {
    text: string;
    username?: string;
  }[];
  trendingTopics?: string[];
  currentContentCategories?: string[];
}): FeatureResult {
  const { wishes, comments, trendingTopics = [], currentContentCategories = [] } = data;

  // Analyze all wishes and comments for desire patterns
  const allText = [...wishes, ...comments.map(c => c.text)].join(' ').toLowerCase();

  // Content type detection from wishes
  const contentFormats: { type: string; keywords: string[]; count: number }[] = [
    { type: 'tutorial', keywords: ['how to', 'tutorial', 'guide', 'learn', 'step by step', 'explain', 'teach', 'walkthrough'], count: 0 },
    { type: 'review', keywords: ['review', 'honest review', 'testing', 'tested', 'try', 'hands on', 'first look'], count: 0 },
    { type: 'comparison', keywords: ['vs', 'versus', 'compare', 'difference', 'better', 'best', 'worst', 'ranking'], count: 0 },
    { type: 'storytime', keywords: ['story', 'happened', 'told me', 'experience', 'time when', 'one time'], count: 0 },
    { type: 'challenge', keywords: ['challenge', 'try this', 'can you', 'survive', '24 hours', 'day', 'week'], count: 0 },
    { type: 'reaction', keywords: ['reaction', 'react to', 'responding to', 'replying to', 'what do you think'], count: 0 },
    { type: 'listicle', keywords: ['top', 'best', 'worst', 'favorite', 'recommend', 'must try', 'things', 'ways', 'tips'], count: 0 },
    { type: 'behind_the_scenes', keywords: ['behind the scenes', 'process', 'how i', 'my process', 'setup', 'routine', 'workflow'], count: 0 },
    { type: 'q&a', keywords: ['question', 'answer', 'q&a', 'ama', 'ask me', 'faq', 'common question'], count: 0 },
    { type: 'collaboration', keywords: ['collaborate', 'collab', 'together', 'with me', 'joined by', 'featuring'], count: 0 },
  ];

  for (const { keywords } of contentFormats) {
    for (const kw of keywords) {
      if (allText.includes(kw)) {
        contentFormats.find(f => f.keywords.includes(kw))!.count++;
      }
    }
  }

  // Extract topics from wishes
  const topicKeywords: Record<string, number> = {};
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'in', 'that', 'it', 'for', 'on', 'with', 'as', 'be', 'this', 'can', 'you', 'your', 'more', 'i', 'we', 'my', 'would', 'could', 'please', 'about', 'do', 'does', 'did']);
  for (const wish of wishes) {
    const tokens = tokenize(wish);
    for (const token of tokens) {
      if (!stopWords.has(token) && token.length > 2) {
        topicKeywords[token] = (topicKeywords[token] || 0) + 1;
      }
    }
  }

  const topTopics = Object.entries(topicKeywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, demandScore: count }));

  // Generate content ideas by combining formats + topics
  const contentIdeas: {
    title: string;
    format: string;
    topics: string[];
    demandScore: number;
    rationale: string;
  }[] = [];

  const sortedFormats = [...contentFormats].sort((a, b) => b.count - a.count);
  const usedTitles = new Set<string>();

  for (const format of sortedFormats.slice(0, 5)) {
    for (const topic of topTopics.slice(0, 5)) {
      if (format.count === 0 && topic.demandScore < 2) continue;

      const titleTemplates: Record<string, string[]> = {
        tutorial: [`${capitalize(topic.topic)} Tutorial: Everything You Need to Know`, `How to Master ${capitalize(topic.topic)} - Complete Guide`, `${capitalize(topic.topic)} for Beginners: Step by Step`],
        review: [`Honest ${capitalize(topic.topic)} Review - Is It Worth It?`, `I Tested ${capitalize(topic.topic)} So You Don't Have To`, `${capitalize(topic.topic)} Review After 30 Days`],
        comparison: [`${capitalize(topic.topic)}: The Ultimate Comparison`, `Best ${capitalize(topic.topic)} Options Ranked`, `${capitalize(topic.topic)} A vs B: Which is Better?`],
        storytime: [`My ${capitalize(topic.topic)} Story That Changed Everything`, `The Truth About ${capitalize(topic.topic)} Nobody Tells You`, `What ${capitalize(topic.topic)} Really Looks Like Behind the Scenes`],
        challenge: [`Trying ${capitalize(topic.topic)} for 30 Days Challenge`, `24 Hours With ${capitalize(topic.topic)} - Can I Survive?`, `${capitalize(topic.topic)} Challenge Gone Wrong`],
        listicle: [`Top 10 ${capitalize(topic.topic)} Tips You Need Right Now`, `5 ${capitalize(topic.topic)} Mistakes Everyone Makes`, `Best ${capitalize(topic.topic)} Hacks That Actually Work`],
        q_a: [`Answering Your ${capitalize(topic.topic)} Questions`, `${capitalize(topic.topic)} FAQ: Your Top Questions Answered`, `Everything You Asked About ${capitalize(topic.topic)}`],
        behind_the_scenes: [`Behind the Scenes: My ${capitalize(topic.topic)} Process`, `How I Create ${capitalize(topic.topic)} - Full Process`, `My ${capitalize(topic.topic)} Setup and Routine Revealed`],
        reaction: [`Reacting to ${capitalize(topic.topic)} Takes`, `${capitalize(topic.topic)} Hot Takes - My Honest Reaction`, `People Are Wrong About ${capitalize(topic.topic)}`],
        collaboration: [`${capitalize(topic.topic)} Collab You Need to See`, `Creating ${capitalize(topic.topic)} Together`, `${capitalize(topic.topic)} Challenge with Special Guest`],
      };

      const templates = titleTemplates[format.type] || titleTemplates.tutorial;
      const title = templates[Math.floor(Math.random() * templates.length)];

      if (!usedTitles.has(title)) {
        usedTitles.add(title);
        const demandScore = (format.count + 1) * (topic.demandScore + 1);
        contentIdeas.push({
          title,
          format: format.type,
          topics: [topic.topic],
          demandScore,
          rationale: `Based on ${format.count} format requests and ${topic.demandScore} topic mentions`,
        });
      }
    }
  }

  // Factor in trending topics
  for (const trend of trendingTopics) {
    const trendLower = trend.toLowerCase();
    if (!topicKeywords[trendLower]) {
      contentIdeas.push({
        title: `${capitalize(trend)}: What You Need to Know Right Now`,
        format: 'listicle',
        topics: [trendLower],
        demandScore: 5,
        rationale: 'Currently trending topic with high engagement potential',
      });
    }
  }

  // Gap analysis with current categories
  const gapAnalysis = contentIdeas.filter(idea =>
    !currentContentCategories.some(cat => idea.topics.includes(cat.toLowerCase()))
  );

  contentIdeas.sort((a, b) => b.demandScore - a.demandScore);

  return {
    success: true,
    data: {
      contentIdeas: contentIdeas.slice(0, 15),
      gapOpportunities: gapAnalysis.slice(0, 5),
      formatDemand: sortedFormats
        .filter(f => f.count > 0)
        .map(f => ({ format: f.type, demandCount: f.count }))
        .sort((a, b) => b.demandCount - a.demandCount),
      topDemandTopics: topTopics,
      summary: {
        totalIdeas: contentIdeas.length,
        gapIdeas: gapAnalysis.length,
        mostRequestedFormat: sortedFormats[0]?.type || 'none',
        highestDemandTopic: topTopics[0]?.topic || 'none',
        avgDemandScore: contentIdeas.length > 0
          ? Math.round(contentIdeas.reduce((s, i) => s + i.demandScore, 0) / contentIdeas.length * 10) / 10
          : 0,
      },
    },
    source: 'browser',
    featureId: 'F28',
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// F29: The Haunting (Liminal) - Anomalous Audience Behavior
// ============================================================================
export function theHaunting(metrics: {
  followerHistory: { date: string; count: number }[];
  engagementHistory: { date: string; likes: number; comments: number; shares: number }[];
  recentActivity: { type: string; count: number; timestamp: string }[];
  averageEngagementRate: number;
}): FeatureResult {
  const { followerHistory, engagementHistory, recentActivity } = metrics;

  const anomalies: { type: string; severity: number; description: string; value: number }[] = [];

  // 1. Follower spike detection
  if (followerHistory.length >= 5) {
    const dailyChanges = followerHistory.slice(1).map((fh, i) => ({
      change: fh.count - followerHistory[i].count,
      date: fh.date,
    }));

    const avgChange = dailyChanges.reduce((s, d) => s + d.change, 0) / dailyChanges.length;
    const changeStdDev = Math.sqrt(
      dailyChanges.reduce((s, d) => s + Math.pow(d.change - avgChange, 2), 0) / dailyChanges.length
    );

    for (const dc of dailyChanges) {
      const zScore = changeStdDev > 0 ? Math.abs(dc.change - avgChange) / changeStdDev : 0;
      if (zScore > 2.5) {
        anomalies.push({
          type: 'follower_spike',
          severity: Math.min(zScore / 5, 1),
          description: `Unusual follower change of ${dc.change > 0 ? '+' : ''}${dc.change} on ${dc.date} (${zScore.toFixed(1)}σ from mean)`,
          value: dc.change,
        });
      }
    }
  }

  // 2. Engagement anomaly detection
  if (engagementHistory.length >= 5) {
    const engRates = engagementHistory.map(h =>
      (h.likes + h.comments + h.shares) / Math.max(h.likes * 10, 100)
    );

    const avgEng = engRates.reduce((a, b) => a + b, 0) / engRates.length;
    const engStdDev = Math.sqrt(
      engRates.reduce((s, e) => s + Math.pow(e - avgEng, 2), 0) / engRates.length
    );

    for (let i = 0; i < engRates.length; i++) {
      const zScore = engStdDev > 0 ? Math.abs(engRates[i] - avgEng) / engStdDev : 0;
      if (zScore > 2.5) {
        anomalies.push({
          type: 'engagement_anomaly',
          severity: Math.min(zScore / 5, 1),
          description: `Engagement rate anomaly on ${engagementHistory[i].date} (${zScore.toFixed(1)}σ from mean)`,
          value: engRates[i],
        });
      }
    }
  }

  // 3. Coordinated activity detection
  const activityTypes = recentActivity.reduce((acc, act) => {
    acc[act.type] = (acc[act.type] || 0) + act.count;
    return acc;
  }, {} as Record<string, number>);

  for (const [type, count] of Object.entries(activityTypes)) {
    const avgCount = recentActivity.length > 0
      ? recentActivity.reduce((s, a) => s + a.count, 0) / recentActivity.length
      : 0;
    if (count > avgCount * 5 && count > 10) {
      anomalies.push({
        type: 'coordinated_activity',
        severity: Math.min(count / (avgCount * 10), 1),
        description: `Unusually high ${type} activity (${count} vs avg ${Math.round(avgCount)})`,
        value: count,
      });
    }
  }

  // 4. Engagement velocity anomaly
  if (engagementHistory.length >= 10) {
    const recent = engagementHistory.slice(-5);
    const earlier = engagementHistory.slice(0, 5);
    const recentAvg = recent.reduce((s, h) => s + h.likes + h.comments, 0) / recent.length;
    const earlierAvg = earlier.reduce((s, h) => s + h.likes + h.comments, 0) / earlier.length;

    if (earlierAvg > 0) {
      const velocity = recentAvg / earlierAvg;
      if (velocity > 3 || velocity < 0.3) {
        anomalies.push({
          type: 'engagement_velocity_shift',
          severity: Math.min(Math.abs(Math.log(velocity)) / 2, 1),
          description: velocity > 1
            ? `Engagement surged to ${(velocity * 100).toFixed(0)}% of baseline`
            : `Engagement dropped to ${(velocity * 100).toFixed(0)}% of baseline`,
          value: velocity,
        });
      }
    }
  }

  // 5. Time-based anomaly (activity at unusual hours)
  const activityHours = recentActivity.map(a => new Date(a.timestamp).getHours());
  const unusualHours = activityHours.filter(h => h >= 0 && h < 6 || h >= 22);
  if (unusualHours.length > activityHours.length * 0.5 && activityHours.length >= 5) {
    anomalies.push({
      type: 'unusual_timing',
      severity: 0.6,
      description: `Majority of activity (${Math.round(unusualHours.length / activityHours.length * 100)}%) during unusual hours (10PM-6AM)`,
      value: unusualHours.length / activityHours.length,
    });
  }

  const anomalyScore = anomalies.length > 0
    ? Math.min(anomalies.reduce((s, a) => s + a.severity, 0) / anomalies.length, 1)
    : 0;

  const riskLevel = anomalyScore >= 0.7 ? 'high' : anomalyScore >= 0.4 ? 'medium' : 'low';

  return {
    success: true,
    data: {
      anomalyScore: Math.round(anomalyScore * 1000) / 1000,
      riskLevel,
      anomalyCount: anomalies.length,
      anomalies: anomalies.sort((a, b) => b.severity - a.severity),
      summary: {
        followerAnomalies: anomalies.filter(a => a.type === 'follower_spike').length,
        engagementAnomalies: anomalies.filter(a => a.type === 'engagement_anomaly').length,
        coordinatedSignals: anomalies.filter(a => a.type === 'coordinated_activity').length,
        timingAnomalies: anomalies.filter(a => a.type === 'unusual_timing').length,
      },
      recommendations: riskLevel === 'high'
        ? [
            'Multiple anomalies detected - investigate source of unusual activity',
            'Check for potential bot/automated engagement',
            'Review follower acquisition methods',
            'Monitor for coordinated campaigns targeting your account',
          ]
        : riskLevel === 'medium'
        ? [
            'Minor anomalies detected - continue monitoring',
            'Note any unusual patterns for future reference',
          ]
        : [
            'No significant anomalous behavior detected',
          ],
    },
    source: 'browser',
    featureId: 'F29',
  };
}

// ============================================================================
// F30: Parasocial Intimacy Leak Detector (Liminal)
// ============================================================================
export function parasocialIntimacyLeakDetector(comments: {
  text: string;
  username?: string;
  timestamp?: string;
}[]): FeatureResult {
  if (comments.length === 0) {
    return { success: false, data: { error: 'No comments' }, source: 'browser', featureId: 'F30' };
  }

  const intimacyPatterns: {
    category: string;
    patterns: RegExp[];
    severity: number;
    matches: { text: string; username?: string }[];
  }[] = [
    {
      category: 'possessive_language',
      patterns: [
        /(?:my|mine|our)\s+(?:creator|you|boy|girl|man|woman|husband|wife|boyfriend|girlfriend)/i,
        /(?:you(?:'re| are)\s+(?:mine|my\s+only|everything\s+to\s+me))/i,
        /(?:don'?t\s+(?:leave|go|stop|change)|please\s+don'?t\s+(?:forget|leave|stop))/i,
        /(?:i\s+(?:own|claim|called|named)\s+(?:dibs|you|this))/i,
        /(?:you\s+belong\s+(?:to\s+)?(?:me|us))/i,
      ],
      severity: 0.85,
      matches: [],
    },
    {
      category: 'personal_boundary_violation',
      patterns: [
        /(?:where\s+(?:do\s+you|are\s+you|r\s+you)\s+(?:live|stay|from|located))/i,
        /(?:what(?:'s|\s+is)\s+your\s+(?:real\s+name|address|phone|number|email|location))/i,
        /(?:i\s+(?:found|saw|know)\s+(?:your|where\s+you)\s+(?:house|home|address|location))/i,
        /(?:are\s+you\s+(?:single|dating|married|in\s+a\s+relationship))/i,
        /(?:send\s+me\s+(?:your|a\s+pic|personal|private))/i,
      ],
      severity: 0.9,
      matches: [],
    },
    {
      category: 'obsessive_tracking',
      patterns: [
        /(?:i\s+(?:check|stalk|watch|follow)\s+(?:your|every|all)\s+(?:post|story|move|update))/i,
        /(?:i\s+(?:never\s+)?miss\s+(?:a|any|your|one)\s+(?:post|video|upload|update))/i,
        /(?:i\s+(?:have|had)\s+(?:your|every|all)\s+(?:notification|alert)\s+(?:on|turned\s+on))/i,
        /(?:i\s+watch\s+(?:your|all)\s+(?:stories|posts|videos)\s+(?:first|immediately|right\s+away))/i,
        /(?:you(?:'re|are)\s+(?:the\s+first|last)\s+(?:thing|i)?\s+(?:i\s+)?(?:see|check|watch)\s+(?:every|each)\s+(?:morning|night|day))/i,
      ],
      severity: 0.75,
      matches: [],
    },
    {
      category: 'emotional_dependency',
      patterns: [
        /(?:i\s+(?:can'?t\s+(?:live|function|sleep|eat|breathe)\s+without|need)\s+you)/i,
        /(?:you(?:'re|are)\s+the\s+(?:only\s+)?(?:reason|thing|one)\s+(?:i(?:'m| am)\s+(?:alive|happy|okay)))/i,
        /(?:my\s+day\s+(?:depends|is)\s+(?:on|ruined\s+without))\s+(?:your|you)/i,
        /(?:without\s+you\s+i(?:'d| would)\s+(?:be\s+)?(?:nothing|lost|dead|empty))/i,
        /(?:you\s+saved\s+my\s+(?:life|soul|sanity|heart))/i,
      ],
      severity: 0.8,
      matches: [],
    },
    {
      category: 'identity_conflation',
      patterns: [
        /(?:we(?:'re|are)\s+(?:soulmates|meant\s+to\s+be|meant\s+for\s+each\s+other))/i,
        /(?:you(?:'re|are)\s+(?:literally|basically|practically)\s+my\s+(?:friend|best\s+friend|family))/i,
        /(?:i\s+feel\s+(?:like\s+i)?(?:know|understand)\s+you\s+(?:personally|so\s+well|better\s+than\s+anyone))/i,
        /(?:we(?:'re|are)\s+(?:the\s+same|just\s+alike|twins|kindred\s+spirits))/i,
      ],
      severity: 0.6,
      matches: [],
    },
    {
      category: 'aggressive_defense',
      patterns: [
        /(?:anyone\s+(?:who\s+)?(?:hates|dislikes|criticizes|attacks)\s+(?:on|you)\s+(?:is|are)\s+(?:jealous|stupid|crazy|wrong))/i,
        /(?:i(?:'ll|will)\s+(?:fight|defend|protect|destroy)\s+(?:anyone\s+for|for)\s+you)/i,
        /(?:don'?t\s+listen\s+to\s+(?:the\s+)?(?:haters|negative|toxic)\s+(?:people|comments))/i,
        /(?:you(?:'re|are)\s+(?:perfect|flawless|can\s+do\s+no\s+wrong))/i,
      ],
      severity: 0.55,
      matches: [],
    },
  ];

  for (const comment of comments) {
    const text = comment.text;
    for (const category of intimacyPatterns) {
      for (const pattern of category.patterns) {
        if (pattern.test(text)) {
          category.matches.push({ text: text.slice(0, 150), username: comment.username });
          break;
        }
      }
    }
  }

  // Calculate risk scores per category
  const categoryRisks = intimacyPatterns
    .filter(c => c.matches.length > 0)
    .map(c => ({
      category: c.category,
      matchCount: c.matches.length,
      riskScore: Math.min(c.matches.length * c.severity * 0.2, 1),
      severity: c.severity,
      sampleMatches: c.matches.slice(0, 3).map(m => m.text.slice(0, 80)),
    }))
    .sort((a, b) => b.riskScore - a.riskScore);

  const totalMatches = categoryRisks.reduce((s, c) => s + c.matchCount, 0);
  const overallRisk = comments.length > 0
    ? Math.min(totalMatches / (comments.length * 0.1), 1)
    : 0;

  const riskLevel = overallRisk >= 0.6 ? 'high' : overallRisk >= 0.3 ? 'medium' : 'low';

  return {
    success: true,
    data: {
      overallIntimacyRisk: Math.round(overallRisk * 1000) / 1000,
      riskLevel,
      totalFlaggedComments: totalMatches,
      commentsAnalyzed: comments.length,
      flagRate: Math.round(totalMatches / Math.max(comments.length, 1) * 1000) / 1000,
      categoryBreakdown: categoryRisks,
      recommendations: riskLevel === 'high'
        ? [
            'HIGH RISK: Significant parasocial intimacy patterns detected',
            'Consider setting clear boundaries in content',
            'Avoid content that encourages one-sided emotional investment',
            'Be mindful of language that could deepen parasocial bonds',
            'Address boundary violations when they appear',
          ]
        : riskLevel === 'medium'
        ? [
            'Some parasocial indicators present',
            'Maintain professional creator-audience boundaries',
            'Avoid content that blurs personal/professional lines',
          ]
        : [
            'Healthy creator-audience dynamic detected',
          ],
    },
    source: 'browser',
    featureId: 'F30',
  };
}

// ============================================================================
// F31: Content Seance (Liminal) - Content Archaeology
// ============================================================================
export function contentSeance(data: {
  contentHistory: {
    date: string;
    title: string;
    type?: string;
    impressions?: number;
    likes?: number;
    isAvailable?: boolean;
  }[];
  currentContentCount: number;
  accountAgeDays: number;
  platforms: string[];
}): FeatureResult {
  const { contentHistory, accountAgeDays } = data;

  // 1. Content gap detection
  if (contentHistory.length < 2) {
    return {
      success: true,
      data: {
        message: 'Insufficient content history for archaeology analysis',
        gaps: [],
        deletedEstimate: 0,
      },
      source: 'browser',
      featureId: 'F31',
    };
  }

  const sortedHistory = [...contentHistory].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate posting frequency and detect gaps
  const gaps: {
    startDate: string;
    endDate: string;
    gapDays: number;
    severity: 'normal' | 'unusual' | 'suspicious';
    possibleReason: string;
  }[] = [];

  const postingFrequencyDays = accountAgeDays / Math.max(sortedHistory.length, 1);

  for (let i = 1; i < sortedHistory.length; i++) {
    const prevDate = new Date(sortedHistory[i - 1].date);
    const currDate = new Date(sortedHistory[i].date);
    const gapDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (gapDays > postingFrequencyDays * 3) {
      const severity = gapDays > postingFrequencyDays * 10 ? 'suspicious' :
        gapDays > postingFrequencyDays * 5 ? 'unusual' : 'normal';

      const possibleReason = gapDays > 30
        ? 'Possible account hiatus, content purge, or shadow ban period'
        : gapDays > 14
        ? 'Possible content deletion or platform issue'
        : 'Normal variation in posting schedule';

      gaps.push({
        startDate: sortedHistory[i - 1].date,
        endDate: sortedHistory[i].date,
        gapDays,
        severity,
        possibleReason,
      });
    }
  }

  // 2. Deleted content estimation
  const expectedPostCount = Math.round(accountAgeDays / Math.max(postingFrequencyDays, 1));
  const deletedEstimate = Math.max(expectedPostCount - sortedHistory.length, 0);
  const deletionRate = expectedPostCount > 0 ? deletedEstimate / expectedPostCount : 0;

  // 3. Unavailable content detection
  const unavailableContent = contentHistory.filter(c => c.isAvailable === false);
  const unavailableRate = contentHistory.length > 0 ? unavailableContent.length / contentHistory.length : 0;

  // 4. Content type distribution
  const typeDistribution: Record<string, number> = {};
  for (const content of contentHistory) {
    const type = content.type || 'unknown';
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  }

  // 5. Performance-based content archaeology
  const contentPerformance = contentHistory
    .filter(c => c.impressions !== undefined && c.likes !== undefined)
    .map(c => ({
      title: c.title,
      date: c.date,
      engagementRate: c.impressions! > 0 ? c.likes! / c.impressions! : 0,
      impressions: c.impressions!,
      likes: c.likes!,
    }))
    .sort((a, b) => a.engagementRate - b.engagementRate);

  const poorlyPerforming = contentPerformance.slice(0, 5);
  const topPerforming = contentPerformance.slice(-5).reverse();

  // 6. Recovery probability analysis
  const recoveryProbability = gaps.length > 0
    ? gaps.filter(g => g.severity === 'suspicious').length > 0
      ? 0.3 // Some content likely intentionally deleted
      : 0.7 // Most gaps are probably natural
    : 0.9;

  // 7. Content continuity score
  const continuityScore = 1 - Math.min(deletionRate * 0.5 + unavailableRate * 0.3, 1);

  return {
    success: true,
    data: {
      archaeologyReport: {
        totalContentFound: sortedHistory.length,
        estimatedDeletedContent: deletedEstimate,
        deletionRate: Math.round(deletionRate * 1000) / 1000,
        unavailableContent: unavailableContent.length,
        accountAgeDays,
        expectedContentCount: expectedPostCount,
      },
      gaps,
      gapAnalysis: {
        totalGaps: gaps.length,
        suspiciousGaps: gaps.filter(g => g.severity === 'suspicious').length,
        unusualGaps: gaps.filter(g => g.severity === 'unusual').length,
        longestGap: gaps.length > 0 ? Math.max(...gaps.map(g => g.gapDays)) : 0,
      },
      contentPerformance: {
        poorlyPerforming,
        topPerforming,
        averageEngagementRate: contentPerformance.length > 0
          ? Math.round(contentPerformance.reduce((s, c) => s + c.engagementRate, 0) / contentPerformance.length * 10000) / 10000
          : 0,
      },
      typeDistribution,
      contentContinuity: {
        score: Math.round(continuityScore * 1000) / 1000,
        grade: continuityScore >= 0.8 ? 'excellent' : continuityScore >= 0.6 ? 'good' : continuityScore >= 0.4 ? 'fair' : 'poor',
      },
      recoveryProbability: Math.round(recoveryProbability * 1000) / 1000,
      recommendations: gaps.length > 0
        ? [
            `${gaps.length} content gaps detected in posting history`,
            gaps.filter(g => g.severity === 'suspicious').length > 0
              ? 'Some gaps are suspiciously long - investigate potential content deletions'
              : 'Gaps appear to be natural pauses in content creation',
            'Consider re-updating or reposting deleted high-performing content',
          ]
        : ['Content history appears consistent and complete'],
    },
    source: 'browser',
    featureId: 'F31',
  };
}

// ============================================================================
// F32: Comment Section Seance (Liminal) - Deleted Comment Analysis
// ============================================================================
export function commentSectionSeance(comments: {
  text: string;
  username?: string;
  timestamp?: string;
  replies?: { text: string; username?: string; timestamp?: string }[];
  parentUsername?: string;
  replyToUsername?: string;
}[]): FeatureResult {
  if (comments.length < 3) {
    return {
      success: true,
      data: {
        message: 'Insufficient comments for seance analysis',
        deletedEstimate: 0,
      },
      source: 'browser',
      featureId: 'F32',
    };
  }

  // 1. Detect reply chains without parents (orphaned replies)
  const allUsernames = new Set(comments.map(c => c.username).filter(Boolean));
  const orphanedReplies: { text: string; replyToUsername?: string; username?: string }[] = [];

  for (const comment of comments) {
    if (comment.replyToUsername && !allUsernames.has(comment.replyToUsername)) {
      orphanedReplies.push({
        text: comment.text.slice(0, 100),
        replyToUsername: comment.replyToUsername,
        username: comment.username,
      });
    }
    if (comment.parentUsername && !allUsernames.has(comment.parentUsername)) {
      orphanedReplies.push({
        text: comment.text.slice(0, 100),
        replyToUsername: comment.parentUsername,
        username: comment.username,
      });
    }
  }

  // 2. Temporal discontinuity detection
  const timestampedComments = comments.filter(c => c.timestamp).sort(
    (a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
  );

  const timeGaps: { start: string; end: string; gapMinutes: number; severity: 'normal' | 'unusual' | 'suspicious' }[] = [];
  let avgGapMinutes = 0;

  if (timestampedComments.length >= 2) {
    const gapMinutesList: number[] = [];
    for (let i = 1; i < timestampedComments.length; i++) {
      const gapMs = new Date(timestampedComments[i].timestamp!).getTime() -
        new Date(timestampedComments[i - 1].timestamp!).getTime();
      const gapMin = gapMs / (1000 * 60);
      gapMinutesList.push(gapMin);
    }

    avgGapMinutes = gapMinutesList.reduce((a, b) => a + b, 0) / gapMinutesList.length;
    const gapStdDev = Math.sqrt(
      gapMinutesList.reduce((s, g) => s + Math.pow(g - avgGapMinutes, 2), 0) / gapMinutesList.length
    );

    for (let i = 1; i < timestampedComments.length; i++) {
      const gapMs = new Date(timestampedComments[i].timestamp!).getTime() -
        new Date(timestampedComments[i - 1].timestamp!).getTime();
      const gapMin = gapMs / (1000 * 60);
      const zScore = gapStdDev > 0 ? Math.abs(gapMin - avgGapMinutes) / gapStdDev : 0;

      if (zScore > 2) {
        timeGaps.push({
          start: timestampedComments[i - 1].timestamp!,
          end: timestampedComments[i].timestamp!,
          gapMinutes: Math.round(gapMin),
          severity: zScore > 3 ? 'suspicious' : zScore > 2.5 ? 'unusual' : 'normal',
        });
      }
    }
  }

  // 3. Conversation discontinuity analysis
  // Check for replies that don't make sense in context (suggesting deleted parent)
  const disjointedConversations: { reply: string; reason: string }[] = [];

  for (const comment of comments) {
    if (comment.replies && comment.replies.length > 0) {
      // Check if replies reference something not in the parent comment
      for (const reply of comment.replies) {
        const replyText = reply.text.toLowerCase();
        const parentText = comment.text.toLowerCase();

        // If reply references specific things not mentioned in parent
        const referenceWords = ['you said', 'as you mentioned', 'regarding', 'about that', 'your point about'];
        for (const ref of referenceWords) {
          if (replyText.includes(ref) && !parentText.includes(ref.slice(-10))) {
            disjointedConversations.push({
              reply: reply.text.slice(0, 80),
              reason: `Reply references "${ref}" but parent doesn't contain the referenced content`,
            });
            break;
          }
        }
      }
    }
  }

  // 4. User activity pattern breaks
  const userActivity: Record<string, { timestamps: string[]; count: number }> = {};
  for (const comment of timestampedComments) {
    if (comment.username) {
      if (!userActivity[comment.username]) {
        userActivity[comment.username] = { timestamps: [], count: 0 };
      }
      userActivity[comment.username].timestamps.push(comment.timestamp!);
      userActivity[comment.username].count++;
    }
  }

  const suddenDepartures: { username: string; lastActivity: string; possibleReason: string }[] = [];
  for (const [username, activity] of Object.entries(userActivity)) {
    if (activity.count >= 3 && timestampedComments.length > 0) {
      const lastComment = new Date(activity.timestamps[activity.timestamps.length - 1]);
      const latestComment = new Date(timestampedComments[timestampedComments.length - 1].timestamp!);
      const timeSinceLast = (latestComment.getTime() - lastComment.getTime()) / (1000 * 60 * 60);

      // User was active but suddenly stopped commenting while thread continued
      const avgCommentInterval = activity.timestamps.length > 1
        ? (new Date(activity.timestamps[activity.timestamps.length - 1]).getTime() -
           new Date(activity.timestamps[0]).getTime()) / (activity.timestamps.length * 60 * 1000)
        : 60;

      if (timeSinceLast > avgCommentInterval * 10 && timeSinceLast > 24) {
        suddenDepartures.push({
          username,
          lastActivity: activity.timestamps[activity.timestamps.length - 1],
          possibleReason: 'Possible account suspension or comment deletion',
        });
      }
    }
  }

  // 5. Estimate deleted comments
  const estimatedDeleted = Math.round(
    orphanedReplies.length * 1.5 +
    timeGaps.filter(g => g.severity === 'suspicious').length * 3 +
    suddenDepartures.length * 2
  );

  // 6. Sentiment shift correlation with potential deletions
  const deletedCommentSentiments: string[] = [];
  for (const orphan of orphanedReplies) {
    const sentiment = computeSentiment(orphan.text);
    if (sentiment < -0.3) deletedCommentSentiments.push('negative');
    else if (sentiment > 0.3) deletedCommentSentiments.push('positive');
  }
  const negativeOrphanRatio = deletedCommentSentiments.length > 0
    ? deletedCommentSentiments.filter(s => s === 'negative').length / deletedCommentSentiments.length
    : 0.5;

  return {
    success: true,
    data: {
      deletedCommentEstimate: estimatedDeleted,
      deletionLikelihood: orphanedReplies.length > 0 || timeGaps.filter(g => g.severity === 'suspicious').length > 0 ? 'likely' : 'unlikely',
      orphanedReplies: orphanedReplies.slice(0, 20),
      orphanedReplyCount: orphanedReplies.length,
      temporalAnalysis: {
        timeGaps: timeGaps.slice(0, 10),
        suspiciousGaps: timeGaps.filter(g => g.severity === 'suspicious').length,
        unusualGaps: timeGaps.filter(g => g.severity === 'unusual').length,
        avgGapMinutes: Math.round(avgGapMinutes),
      },
      conversationAnalysis: {
        disjointedConversations,
        disjointedCount: disjointedConversations.length,
      },
      userActivityAnalysis: {
        suddenDepartures,
        activeCommenters: Object.keys(userActivity).length,
        usersWithGaps: suddenDepartures.length,
      },
      sentimentCorrelation: {
        negativeOrphanRatio: Math.round(negativeOrphanRatio * 1000) / 1000,
        insight: negativeOrphanRatio > 0.6
          ? 'Most orphaned replies have negative sentiment - comments may have been deleted for moderation'
          : 'No clear sentiment pattern in orphaned replies',
      },
      summary: {
        evidenceStrength: orphanedReplies.length >= 3 || estimatedDeleted >= 5 ? 'strong' : orphanedReplies.length >= 1 ? 'moderate' : 'weak',
        estimatedDeletedRange: {
          min: Math.max(orphanedReplies.length, 0),
          max: estimatedDeleted,
          likely: Math.round(orphanedReplies.length + (estimatedDeleted - orphanedReplies.length) * 0.5),
        },
      },
    },
    source: 'browser',
    featureId: 'F32',
  };
}

// ============================================================================
// Export all listener features as a single object
// ============================================================================
export const listenerFeatures = {
  wishlistExtractionEngine,
  technicalFrictionMonitor,
  superFanLeaderboard,
  questionDeduplication,
  toneShiftDetection,
  viralSignalPredictor,
  audienceDemographicEstimation,
  engagementHeatmap,
  multiLanguageSentimentTranslation,
  darkSocialSignalCapture,
  commenterSoulAgeEstimator,
  ghostAudienceDetector,
  audienceDreamContentGenerator,
  theHaunting,
  parasocialIntimacyLeakDetector,
  contentSeance,
  commentSectionSeance,
};
