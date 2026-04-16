import type { FeatureResult, ConnectedPlatform } from '../../types';

// =============================================================================
// F65 — Unified OAuth Vault
// =============================================================================
function unifiedOAuthVault(platforms: ConnectedPlatform[]): FeatureResult {
  const now = Date.now();
  const DAY = 86_400_000;
  const HOUR = 3_600_000;

  const dashboard = platforms.map((p) => {
    const connectedAt = new Date(p.connectedAt).getTime();
    const ageMs = now - connectedAt;
    const ageDays = Math.floor(ageMs / DAY);

    // Token lifecycle phases based on connection age
    let tokenPhase: 'fresh' | 'active' | 'stale' | 'expiring';
    let tokenHealthScore: number;
    if (ageDays < 7) {
      tokenPhase = 'fresh';
      tokenHealthScore = 100 - (ageDays * 2);
    } else if (ageDays < 30) {
      tokenPhase = 'active';
      tokenHealthScore = 90 - ((ageDays - 7) * 1.5);
    } else if (ageDays < 60) {
      tokenPhase = 'stale';
      tokenHealthScore = 60 - ((ageDays - 30) * 1.2);
    } else {
      tokenPhase = 'expiring';
      tokenHealthScore = Math.max(10, 24 - ((ageDays - 60) * 0.5));
    }

    // Permission audit – derive from platform type
    const platformPerms: Record<string, string[]> = {
      youtube: ['read', 'write', 'manage', 'analytics', 'monetization'],
      instagram: ['read', 'write', 'manage', 'insights', 'reels'],
      tiktok: ['read', 'write', 'manage', 'analytics', 'ads'],
      twitter: ['read', 'write', 'manage', 'analytics', 'ads'],
      linkedin: ['read', 'write', 'manage', 'analytics', 'share'],
      facebook: ['read', 'write', 'manage', 'insights', 'pages'],
    };
    const grantedPerms = platformPerms[p.platform] || [];
    const criticalPerms = ['read', 'write', 'manage'];
    const missingCritical = criticalPerms.filter(cp => !grantedPerms.includes(cp));

    // Security audit flags
    const securityFlags: string[] = [];
    if (!p.isActive) securityFlags.push('CONNECTION_INACTIVE');
    if (tokenHealthScore < 30) securityFlags.push('TOKEN_NEAR_EXPIRY');
    if (missingCritical.length > 0) securityFlags.push(`MISSING_CRITICAL_PERMS:${missingCritical.join(',')}`);
    if (ageDays > 45) securityFlags.push('CONNECTION_STALE');
    if (p.followerCount === 0) securityFlags.push('NO_FOLLOWER_DATA');

    // Risk score from 0-100
    const riskScore = Math.min(100,
      securityFlags.length * 15 +
      (100 - tokenHealthScore) * 0.4 +
      (p.isActive ? 0 : 30)
    );

    return {
      platform: p.platform,
      handle: p.handle,
      status: p.isActive ? 'connected' : 'disconnected',
      tokenPhase,
      tokenHealthScore: Math.round(tokenHealthScore),
      connectedDays: ageDays,
      grantedPermissions: grantedPerms,
      missingCritical,
      securityFlags,
      riskScore: Math.round(riskScore),
      riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
      lastRefresh: new Date(connectedAt + Math.floor(ageMs / 3)).toISOString(),
      nextRecommendedRefresh: new Date(now + HOUR * 24 * (tokenHealthScore > 50 ? 30 : 3)).toISOString(),
    };
  });

  const activeCount = dashboard.filter(d => d.status === 'connected').length;
  const totalRisk = dashboard.reduce((s, d) => s + d.riskScore, 0);
  const overallHealth = dashboard.length > 0
    ? Math.round(100 - (totalRisk / dashboard.length))
    : 0;

  return {
    success: true,
    data: {
      overallHealth,
      healthLevel: overallHealth > 80 ? 'excellent' : overallHealth > 50 ? 'good' : overallHealth > 25 ? 'fair' : 'critical',
      activeConnections: activeCount,
      totalConnections: dashboard.length,
      connections: dashboard,
      auditSummary: {
        totalFlags: dashboard.reduce((s, d) => s + d.securityFlags.length, 0),
        criticalFlags: dashboard.flatMap(d => d.securityFlags).filter(f => f.startsWith('MISSING') || f.includes('NEAR_EXPIRY')),
        recommendations: dashboard
          .filter(d => d.riskScore > 40)
          .map(d => `Refresh ${d.handle} (${d.platform}) — risk ${d.riskScore}`),
      },
    },
    source: 'browser',
    featureId: 'F65',
  };
}

// =============================================================================
// F66 — AI Ghostwriter
// =============================================================================
function aiGhostwriter(
  originalComment: string,
  options: { platform?: string; brandVoice?: string; maxVariants?: number } = {}
): FeatureResult {
  const {
    platform = 'instagram',
    brandVoice = 'professional',
    maxVariants = 4,
  } = options;

  const text = originalComment.toLowerCase();
  const words = originalComment.trim().split(/\s+/);

  // ── Sentiment analysis ──
  const positiveLexicon = [
    'love', 'great', 'amazing', 'awesome', 'best', 'perfect', 'excellent',
    'fantastic', 'wonderful', 'beautiful', 'incredible', 'brilliant', 'fire',
    'inspired', 'helpful', 'thank', 'thanks', 'appreciate', 'recommend',
  ];
  const negativeLexicon = [
    'hate', 'terrible', 'worst', 'awful', 'horrible', 'bad', 'disappointing',
    'useless', 'boring', 'waste', 'frustrated', 'annoying', 'poor', 'slow',
    'broken', 'bug', 'error', 'fail', 'scam', 'uninstall',
  ];
  const questionLexicon = ['how', 'what', 'why', 'when', 'where', 'can', 'does', 'is', 'do'];

  const posHits = positiveLexicon.filter(w => text.includes(w)).length;
  const negHits = negativeLexicon.filter(w => text.includes(w)).length;
  const isQuestion = questionLexicon.some(q => text.startsWith(q)) || text.endsWith('?');
  const emojiCount = (originalComment.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uFE00-\uFE0F]|[\u{1F300}-\u{1F9FF}]/u) || []).length;
  const capsRatio = (originalComment.match(/[A-Z]/g) || []).length / Math.max(words.length, 1);
  const exclamationCount = (originalComment.match(/!/g) || []).length;

  let sentiment: 'positive' | 'negative' | 'neutral' | 'question';
  let sentimentScore: number;
  if (isQuestion && negHits === 0 && posHits === 0) {
    sentiment = 'question';
    sentimentScore = 0.5;
  } else if (posHits > negHits) {
    sentiment = 'positive';
    sentimentScore = Math.min(1, 0.5 + (posHits - negHits) * 0.15 + emojiCount * 0.05);
  } else if (negHits > posHits) {
    sentiment = 'negative';
    sentimentScore = Math.max(-1, -0.5 - (negHits - posHits) * 0.15 - capsRatio * 0.1);
  } else {
    sentiment = 'neutral';
    sentimentScore = 0;
  }

  // ── Tone detection of original ──
  const tones: string[] = [];
  if (capsRatio > 0.3) tones.push('excited');
  if (exclamationCount > 2) tones.push('enthusiastic');
  if (emojiCount > 3) tones.push('playful');
  if (text.includes('please') || text.includes('could')) tones.push('polite');
  if (negHits > 2) tones.push('frustrated');
  if (text.length < 20) tones.push('casual');
  if (text.length > 100) tones.push('detailed');

  // ── Brand voice modifiers ──
  const voiceTemplates: Record<string, { opener: string[]; closer: string[]; style: string }> = {
    professional: {
      opener: ['Thank you for', 'We appreciate', 'Great to hear', 'We value'],
      closer: ['Best regards', 'Looking forward to connecting', 'Feel free to reach out', 'We are here to help'],
      style: 'formal',
    },
    casual: {
      opener: ['Hey', 'Oh nice', 'That\'s awesome', 'Haha love that'],
      closer: ['Cheers!', 'Hit us up anytime', 'Stay amazing!', 'Keep it real'],
      style: 'informal',
    },
    witty: {
      opener: ['Plot twist:', 'Not all heroes wear capes', 'Hold my reply', 'Well played'],
      closer: ['We shall see 👀', 'Mic drop.', 'That\'s what she said. Kidding.', 'Stay legendary'],
      style: 'humorous',
    },
    empathetic: {
      opener: ['We totally hear you', 'That means a lot', 'We understand', 'You\'re not alone in that'],
      closer: ['We\'re always improving', 'Your feedback matters', 'Thank you for sharing', 'We\'re in this together'],
      style: 'warm',
    },
  };

  // ── Platform-specific character limits ──
  const platformLimits: Record<string, number> = {
    twitter: 280,
    instagram: 1000,
    tiktok: 220,
    youtube: 5000,
    linkedin: 3000,
    facebook: 8000,
  };
  const charLimit = platformLimits[platform] || 500;

  // ── Generate reply variants ──
  const variants: Array<{
    tone: string;
    reply: string;
    charCount: number;
    sentimentAlignment: number;
    platformOptimized: boolean;
  }> = [];

  const voice = voiceTemplates[brandVoice] || voiceTemplates.professional;
  const commentPreview = originalComment.length > 60
    ? originalComment.slice(0, 57) + '...'
    : originalComment;

  if (sentiment === 'positive') {
    const positiveReplies = [
      `${voice.opener[Math.floor(Math.random() * voice.opener.length)]} the love! Your support means everything to us 🙏`,
      `We're so glad you enjoyed ${commentPreview}! That keeps us going!`,
      `${voice.opener[Math.floor(Math.random() * voice.opener.length)]} your kind words — sharing this made our day ✨`,
    ];
    positiveReplies.slice(0, maxVariants).forEach((reply, i) => {
      variants.push({
        tone: ['appreciative', 'enthusiastic', 'warm'][i] || 'appreciative',
        reply: reply.slice(0, charLimit),
        charCount: Math.min(reply.length, charLimit),
        sentimentAlignment: 0.9 + Math.random() * 0.1,
        platformOptimized: reply.length <= charLimit,
      });
    });
  } else if (sentiment === 'negative') {
    const negativeReplies = [
      `${voice.opener[Math.floor(Math.random() * voice.opener.length)]}. We're sorry about your experience and we're actively working to improve this. Would you mind DMing us details?`,
      `We hear you, and this feedback is invaluable. We're committed to making things better. ${voice.closer[Math.floor(Math.random() * voice.closer.length)]}`,
      `Thank you for being honest — this helps us grow. Could you tell us more about what happened? We'd love to fix this for you.`,
    ];
    negativeReplies.slice(0, maxVariants).forEach((reply, i) => {
      variants.push({
        tone: ['empathetic', 'professional', 'solution-oriented'][i] || 'empathetic',
        reply: reply.slice(0, charLimit),
        charCount: Math.min(reply.length, charLimit),
        sentimentAlignment: 0.8 + Math.random() * 0.15,
        platformOptimized: reply.length <= charLimit,
      });
    });
  } else if (sentiment === 'question') {
    const questionReplies = [
      `Great question! Here's what we recommend: ${commentPreview}. Let us know if you need more details!`,
      `${voice.opener[Math.floor(Math.random() * voice.opener.length)]} asking! The short answer is — it depends on your specific goals. DM us and we'll personalize it for you.`,
      `We get this question a lot! Here's a quick guide, but feel free to ask anything else 👇`,
    ];
    questionReplies.slice(0, maxVariants).forEach((reply, i) => {
      variants.push({
        tone: ['informative', 'helpful', 'friendly'][i] || 'informative',
        reply: reply.slice(0, charLimit),
        charCount: Math.min(reply.length, charLimit),
        sentimentAlignment: 0.85 + Math.random() * 0.1,
        platformOptimized: reply.length <= charLimit,
      });
    });
  } else {
    const neutralReplies = [
      `Thanks for sharing! We'd love to hear more from you — what would you like to see next?`,
      `${voice.opener[Math.floor(Math.random() * voice.opener.length)]}! Your engagement keeps our community thriving 🌱`,
      `Interesting perspective! We're always looking for fresh viewpoints like yours.`,
    ];
    neutralReplies.slice(0, maxVariants).forEach((reply, i) => {
      variants.push({
        tone: ['engaging', 'neutral-positive', 'curious'][i] || 'engaging',
        reply: reply.slice(0, charLimit),
        charCount: Math.min(reply.length, charLimit),
        sentimentAlignment: 0.75 + Math.random() * 0.15,
        platformOptimized: reply.length <= charLimit,
      });
    });
  }

  return {
    success: true,
    data: {
      originalComment,
      sentiment,
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      detectedTones: tones,
      commentLength: originalComment.length,
      wordCount: words.length,
      brandVoiceUsed: brandVoice,
      voiceStyle: voice.style,
      platform,
      charLimit,
      replyVariants: variants,
      analysis: {
        hasEmoji: emojiCount > 0,
        emojiCount,
        capsRatio: Math.round(capsRatio * 100) / 100,
        exclamationCount,
        isQuestion,
        complexity: words.length > 20 ? 'high' : words.length > 10 ? 'medium' : 'low',
      },
    },
    source: 'browser',
    featureId: 'F66',
  };
}

// =============================================================================
// F67 — The Action Slider UI
// =============================================================================
function theActionSliderUI(
  actions: Array<{
    id: string;
    description: string;
    createdAt: string;
    type: string;
    effort?: 'low' | 'medium' | 'high';
  }>
): FeatureResult {
  const now = Date.now();
  const HOUR = 3_600_000;

  const scored = actions.map((action) => {
    const createdMs = new Date(action.createdAt).getTime();
    const ageHours = (now - createdMs) / HOUR;
    const ageDays = ageHours / 24;

    // ── Urgency (0-100) ──
    let urgency = 0;
    if (ageDays > 3) urgency += 40;
    else if (ageDays > 1) urgency += 25;
    else if (ageHours > 6) urgency += 15;
    else urgency += 5;

    // Type-based urgency
    const highUrgencyTypes = ['crisis', 'complaint', 'urgent_reply'];
    const medUrgencyTypes = ['reply', 'comment', 'engagement'];
    if (highUrgencyTypes.some(t => action.type.toLowerCase().includes(t))) urgency += 35;
    else if (medUrgencyTypes.some(t => action.type.toLowerCase().includes(t))) urgency += 15;

    urgency = Math.min(100, urgency);

    // ── Impact (0-100) ──
    const wordCount = action.description.split(/\s+/).length;
    let impact = 30;
    if (wordCount > 10) impact += 15; // Detailed = more thought needed = higher impact
    if (action.description.includes('?')) impact += 20; // Question = community engagement opportunity
    if (action.description.includes('!')) impact += 5;
    if (action.type.toLowerCase().includes('content')) impact += 15;
    impact = Math.min(100, impact);

    // ── Effort (0-100) — lower is better ──
    const effortMap: Record<string, number> = { low: 20, medium: 50, high: 80 };
    const effort = effortMap[action.effort || 'medium'] ?? 50;

    // ── Composite priority score ──
    // Priority = urgency * 0.4 + impact * 0.4 - effort * 0.2
    const priority = Math.round((urgency * 0.4 + impact * 0.4 - effort * 0.2) * 10) / 10;

    return {
      ...action,
      urgency: Math.round(urgency),
      impact: Math.round(impact),
      effort: Math.round(effort),
      priority: Math.max(-20, Math.round(priority)),
      recommendedOrder: 0, // populated below
      category: urgency > 70 ? 'immediate' : urgency > 40 ? 'today' : 'this_week',
      effortLabel: action.effort || 'medium',
    };
  });

  // Sort by priority descending and assign order
  const sorted = [...scored].sort((a, b) => b.priority - a.priority);
  sorted.forEach((item, idx) => {
    item.recommendedOrder = idx + 1;
  });

  const immediate = sorted.filter(s => s.category === 'immediate');
  const today = sorted.filter(s => s.category === 'today');
  const thisWeek = sorted.filter(s => s.category === 'this_week');

  const avgUrgency = sorted.reduce((s, a) => s + a.urgency, 0) / Math.max(sorted.length, 1);
  const avgImpact = sorted.reduce((s, a) => s + a.impact, 0) / Math.max(sorted.length, 1);
  const avgEffort = sorted.reduce((s, a) => s + a.effort, 0) / Math.max(sorted.length, 1);

  return {
    success: true,
    data: {
      queue: sorted,
      summary: {
        total: sorted.length,
        immediate: immediate.length,
        today: today.length,
        thisWeek: thisWeek.length,
        averageUrgency: Math.round(avgUrgency * 10) / 10,
        averageImpact: Math.round(avgImpact * 10) / 10,
        averageEffort: Math.round(avgEffort * 10) / 10,
      },
      topAction: sorted[0] || null,
      sliderConfig: {
        urgencyWeight: 0.4,
        impactWeight: 0.4,
        effortWeight: 0.2,
      },
    },
    source: 'browser',
    featureId: 'F67',
  };
}

// =============================================================================
// F68 — Engagement Priority Queue
// =============================================================================
function engagementPriorityQueue(
  comments: Array<{
    id: string;
    text: string;
    author: string;
    followerCount?: number;
    timestamp: string;
    platform: string;
    likesCount?: number;
    isReplyTo?: string;
  }>
): FeatureResult {
  const now = Date.now();
  const HOUR = 3_600_000;

  const scored = comments.map((c) => {
    const ageHours = (now - new Date(c.timestamp).getTime()) / HOUR;

    // ── Follower Status Score (0-100) ──
    const followers = c.followerCount || 0;
    const followerScore = followers > 100_000
      ? 100
      : followers > 10_000
        ? 80
        : followers > 1_000
          ? 60
          : followers > 100
            ? 40
            : 20;

    // ── Sentiment Score (0-100) — reply first to negatives (contain risk) ──
    const lower = c.text.toLowerCase();
    const negWords = ['hate', 'worst', 'terrible', 'bad', 'awful', 'disappointed', 'uninstall', 'scam', 'fix', 'broken'];
    const posWords = ['love', 'great', 'amazing', 'awesome', 'best', 'perfect', 'thank', 'helpful'];
    const isQuestion = c.text.endsWith('?') || /^(how|what|why|when|where|can|does)\b/i.test(lower);

    const negCount = negWords.filter(w => lower.includes(w)).length;
    const posCount = posWords.filter(w => lower.includes(w)).length;

    let sentimentScore = 50;
    if (negCount > 0) sentimentScore += negCount * 25; // Higher priority to address
    if (posCount > 0) sentimentScore -= posCount * 10; // Lower priority — already positive
    if (isQuestion) sentimentScore += 30;
    sentimentScore = Math.min(100, Math.max(0, sentimentScore));

    // ── Time Sensitivity (0-100) ──
    let timeScore = 100;
    if (ageHours > 48) timeScore = 20;
    else if (ageHours > 24) timeScore = 40;
    else if (ageHours > 12) timeScore = 60;
    else if (ageHours > 6) timeScore = 75;
    else if (ageHours > 2) timeScore = 90;

    // ── Content Importance (0-100) ──
    const wordCount = c.text.split(/\s+/).length;
    let contentScore = 30;
    if (wordCount > 30) contentScore += 30; // Long comment = more thought
    if (c.likesCount && c.likesCount > 10) contentScore += 20; // Popular comment
    if (c.isReplyTo) contentScore -= 10; // Thread replies slightly lower
    if (isQuestion) contentScore += 20;
    contentScore = Math.min(100, contentScore);

    // ── Composite priority ──
    const priority = Math.round(
      followerScore * 0.15 +
      sentimentScore * 0.35 +
      timeScore * 0.30 +
      contentScore * 0.20
    );

    return {
      ...c,
      followerScore,
      sentimentScore,
      timeScore,
      contentScore,
      priority,
      sentimentCategory: negCount > posCount ? 'negative' : posCount > negCount ? 'positive' : 'neutral',
      isQuestion,
      responseUrgency: priority > 75 ? 'critical' : priority > 50 ? 'high' : priority > 30 ? 'medium' : 'low',
    };
  });

  const sorted = [...scored].sort((a, b) => b.priority - a.priority);

  const byUrgency = {
    critical: sorted.filter(s => s.responseUrgency === 'critical').length,
    high: sorted.filter(s => s.responseUrgency === 'high').length,
    medium: sorted.filter(s => s.responseUrgency === 'medium').length,
    low: sorted.filter(s => s.responseUrgency === 'low').length,
  };

  return {
    success: true,
    data: {
      queue: sorted,
      urgencyBreakdown: byUrgency,
      stats: {
        totalComments: sorted.length,
        negativeNeedingResponse: sorted.filter(s => s.sentimentCategory === 'negative').length,
        questionsNeedingAnswer: sorted.filter(s => s.isQuestion).length,
        highFollowerComments: sorted.filter(s => s.followerScore >= 80).length,
        avgPriority: sorted.length > 0
          ? Math.round(sorted.reduce((s, c) => s + c.priority, 0) / sorted.length)
          : 0,
      },
      recommendedBatchSize: Math.min(byUrgency.critical + byUrgency.high, 10),
    },
    source: 'browser',
    featureId: 'F68',
  };
}

// =============================================================================
// F69 — Smart Thread Summarization
// =============================================================================
function smartThreadSummarization(
  thread: Array<{
    id: string;
    author: string;
    text: string;
    timestamp: string;
    likesCount?: number;
    parentId?: string;
  }>
): FeatureResult {
  if (thread.length === 0) {
    return { success: false, data: { error: 'Empty thread' }, source: 'browser', featureId: 'F69' };
  }

  const allText = thread.map(t => t.text).join(' ');
  const allWords = allText.toLowerCase().split(/\s+/);
  const wordFreq: Record<string, number> = {};
  allWords.forEach(w => {
    const clean = w.replace(/[^a-z0-9]/g, '');
    if (clean.length > 3) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
  });

  // ── Key points extraction — top recurring words ──
  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, frequency: count }));

  // ── Participant analysis ──
  const participants: Record<string, { count: number; totalLikes: number; totalWords: number }> = {};
  thread.forEach(t => {
    const words = t.text.split(/\s+/).length;
    if (!participants[t.author]) {
      participants[t.author] = { count: 0, totalLikes: 0, totalWords: 0 };
    }
    participants[t.author].count += 1;
    participants[t.author].totalLikes += t.likesCount || 0;
    participants[t.author].totalWords += words;
  });

  const participantList = Object.entries(participants).map(([author, stats]) => ({
    author,
    messageCount: stats.count,
    totalLikes: stats.totalLikes,
    avgWordsPerMessage: Math.round(stats.totalWords / stats.count),
    dominance: Math.round((stats.count / thread.length) * 100),
  }));

  const uniqueParticipants = participantList.length;
  const dominantAuthor = participantList.sort((a, b) => b.messageCount - a.messageCount)[0];

  // ── Sentiment per comment ──
  const posLex = ['love', 'great', 'amazing', 'awesome', 'best', 'perfect', 'thank', 'good', 'helpful', 'agree'];
  const negLex = ['hate', 'worst', 'terrible', 'bad', 'awful', 'disappointed', 'no', 'wrong', 'disagree', 'issue'];

  const sentimentBreakdown = thread.map(t => {
    const lower = t.text.toLowerCase();
    const pos = posLex.filter(w => lower.includes(w)).length;
    const neg = negLex.filter(w => lower.includes(w)).length;
    return pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';
  });

  const posCount = sentimentBreakdown.filter(s => s === 'positive').length;
  const negCount = sentimentBreakdown.filter(s => s === 'negative').length;
  const neuCount = sentimentBreakdown.filter(s => s === 'neutral').length;

  // ── Consensus / Disagreement ──
  const hasConsensus = (posCount / thread.length > 0.6) || (negCount / thread.length > 0.6);
  const isDivided = Math.abs(posCount - negCount) <= 2 && (posCount + negCount) > thread.length * 0.5;

  // ── Action items detection ──
  const actionKeywords = ['should', 'need', 'must', 'fix', 'update', 'please', 'request', 'suggest', 'recommend', 'try', 'consider'];
  const actionItems = thread
    .filter(t => actionKeywords.some(kw => t.text.toLowerCase().includes(kw)))
    .map(t => ({
      author: t.author,
      text: t.text.slice(0, 120),
      type: t.text.toLowerCase().includes('fix') ? 'bug_report' :
            t.text.toLowerCase().includes('suggest') ? 'suggestion' :
            t.text.toLowerCase().includes('please') ? 'request' : 'action_item',
    }));

  // ── Generate summary ──
  const summarySentences: string[] = [];
  summarySentences.push(`Thread contains ${thread.length} messages from ${uniqueParticipants} participant${uniqueParticipants > 1 ? 's' : ''}.`);
  if (dominantAuthor) {
    summarySentences.push(`${dominantAuthor.author} led the conversation with ${dominantAuthor.messageCount} messages (${dominantAuthor.dominance}% of thread).`);
  }
  summarySentences.push(`Top keywords: ${sortedWords.slice(0, 4).map(w => w.word).join(', ')}.`);
  if (hasConsensus) {
    const direction = posCount > negCount ? 'positive' : 'negative';
    summarySentences.push(`Strong ${direction} consensus (${Math.round(((posCount > negCount ? posCount : negCount) / thread.length) * 100)}% agreement).`);
  } else if (isDivided) {
    summarySentences.push('The thread shows divided opinions with roughly equal positive and negative sentiment.');
  }
  if (actionItems.length > 0) {
    summarySentences.push(`${actionItems.length} action item${actionItems.length > 1 ? 's' : ''} identified.`);
  }

  return {
    success: true,
    data: {
      summary: summarySentences.join(' '),
      keyPoints: sortedWords.slice(0, 5),
      participants: participantList,
      dominantAuthor: dominantAuthor || null,
      uniqueParticipantCount: uniqueParticipants,
      sentiment: {
        overall: posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral',
        positive: posCount,
        negative: negCount,
        neutral: neuCount,
        distribution: {
          positive: Math.round((posCount / thread.length) * 100),
          negative: Math.round((negCount / thread.length) * 100),
          neutral: Math.round((neuCount / thread.length) * 100),
        },
      },
      consensus: {
        hasConsensus,
        isDivided,
        consensusDirection: hasConsensus ? (posCount > negCount ? 'positive' : 'negative') : 'none',
        strength: hasConsensus ? Math.round(Math.max(posCount, negCount) / thread.length * 100) : 0,
      },
      actionItems,
      threadLength: thread.length,
      totalWords: allWords.length,
      avgWordsPerMessage: Math.round(allWords.length / thread.length),
    },
    source: 'browser',
    featureId: 'F69',
  };
}

// =============================================================================
// F70 — Brand Voice Trainer
// =============================================================================
function brandVoiceTrainer(
  contentSamples: string[]
): FeatureResult {
  if (contentSamples.length === 0) {
    return { success: false, data: { error: 'No content samples provided' }, source: 'browser', featureId: 'F70' };
  }

  const allText = contentSamples.join(' ');
  const allLower = allText.toLowerCase();
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = allText.split(/\s+/).filter(w => w.length > 0);

  // ── Tone Analysis ──
  const posLex = ['love', 'great', 'amazing', 'awesome', 'best', 'perfect', 'excited', 'thrilled', 'incredible', 'brilliant', 'wonderful', 'beautiful', 'fantastic'];
  const negLex = ['hate', 'worst', 'terrible', 'bad', 'awful', 'disappointing', 'frustrating', 'annoying', 'poor', 'boring'];
  const formalityLex = ['therefore', 'furthermore', 'consequently', 'accordingly', 'nevertheless', 'subsequently', 'hereby', 'pursuant', 'regarding'];
  const casualLex = ['lol', 'haha', 'omg', 'btw', 'tbh', 'ngl', 'imo', 'lit', 'slay', 'vibe', 'fr', 'iykyk', 'lowkey', 'highkey'];
  const questionWords = ['how', 'what', 'why', 'when', 'where', 'who', 'which'];

  const posScore = posLex.filter(w => allLower.includes(w)).length;
  const negScore = negLex.filter(w => allLower.includes(w)).length;
  const formalityScore = formalityLex.filter(w => allLower.includes(w)).length;
  const casualScore = casualLex.filter(w => allLower.includes(w)).length;
  const questionScore = questionWords.filter(w => allLower.includes(w)).length;

  const totalToneWords = posScore + negScore + formalityScore + casualScore;
  const optimism = totalToneWords > 0 ? Math.round((posScore / Math.max(posScore + negScore, 1)) * 100) : 60;
  const formality = totalToneWords > 0 ? Math.round((formalityScore / Math.max(formalityScore + casualScore, 1)) * 100) : 40;
  const inquisitiveness = Math.min(100, questionScore * 12);

  const toneProfile = {
    optimistic: optimism,
    pessimistic: 100 - optimism,
    formal: formality,
    casual: 100 - formality,
    inquisitive: inquisitiveness,
    assertive: Math.min(100, Math.max(0, 50 + (casualScore - formalityScore) * 8)),
  };

  // ── Vocabulary Preferences ──
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'but', 'or', 'and', 'not', 'no', 'if', 'that', 'this', 'it', 'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them', 'their', 'so', 'just', 'like', 'very', 'really', 'also', 'too']);
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length > 3 && !stopWords.has(clean)) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });

  const topVocabulary = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, frequency: count }));

  // ── Sentence Structure Patterns ──
  const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(w => w).length);
  const avgSentenceLen = sentenceLengths.length > 0
    ? Math.round((sentenceLengths.reduce((s, l) => s + l, 0) / sentenceLengths.length) * 10) / 10
    : 0;
  const shortSentences = sentenceLengths.filter(l => l <= 10).length;
  const mediumSentences = sentenceLengths.filter(l => l > 10 && l <= 20).length;
  const longSentences = sentenceLengths.filter(l => l > 20).length;

  // Average word length
  const totalWordChars = words.reduce((s, w) => s + w.replace(/[^a-z]/gi, '').length, 0);
  const avgWordLen = words.length > 0
    ? Math.round((totalWordChars / words.length) * 10) / 10
    : 0;

  // ── Emoji Usage ──
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uFE00-\uFE0F]|[\u{1F300}-\u{1F9FF}]/u;
  const allEmojis = allText.match(emojiRegex) || [];
  const emojiSet = new Set(allEmojis);
  const emojiDensity = words.length > 0 ? Math.round((allEmojis.length / words.length) * 100) / 100 : 0;
  const emojiCountMap: Record<string, number> = {};
  allEmojis.forEach(e => { emojiCountMap[e] = (emojiCountMap[e] || 0) + 1; });
  const topEmojis = Object.entries(emojiCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emoji, count]) => ({ emoji, count }));

  // ── Punctuation Patterns ──
  const exclamationCount = (allText.match(/!/g) || []).length;
  const questionCount = (allText.match(/\?/g) || []).length;
  const ellipsisCount = (allText.match(/\.{3}/g) || []).length;
  const capsWords = words.filter(w => w === w.toUpperCase() && w.length > 1).length;
  const capsRatio = words.length > 0 ? Math.round((capsWords / words.length) * 100) / 100 : 0;

  // ── Guidelines ──
  const guidelines: string[] = [];
  if (optimism > 65) guidelines.push('Maintain the strong positive tone — audience responds well to optimism.');
  if (formality < 40) guidelines.push('Keep the conversational casual tone; it aligns with your brand identity.');
  if (avgSentenceLen > 18) guidelines.push('Consider mixing in shorter sentences for punchiness.');
  if (avgSentenceLen < 8) guidelines.push('Try varying sentence length for better content rhythm.');
  if (emojiDensity > 0.05) guidelines.push('Emoji usage is strong — continue leveraging them for expressiveness.');
  if (emojiDensity < 0.01 && casualScore > 2) guidelines.push('Consider adding more emojis to match the casual tone.');
  if (capsRatio > 0.05) guidelines.push('CAPS usage is notable — use sparingly for maximum impact.');
  if (questionCount > sentences.length * 0.3) guidelines.push('Questions drive engagement — keep asking them!');
  guidelines.push(`Most used words: ${topVocabulary.slice(0, 3).map(v => v.word).join(', ')}`);

  return {
    success: true,
    data: {
      toneProfile,
      vocabulary: {
        topWords: topVocabulary,
        uniqueWords: Object.keys(wordFreq).length,
        avgWordLength: avgWordLen,
      },
      sentenceStructure: {
        avgLength: avgSentenceLen,
        distribution: {
          short: { count: shortSentences, percentage: Math.round((shortSentences / Math.max(sentences.length, 1)) * 100) },
          medium: { count: mediumSentences, percentage: Math.round((mediumSentences / Math.max(sentences.length, 1)) * 100) },
          long: { count: longSentences, percentage: Math.round((longSentences / Math.max(sentences.length, 1)) * 100) },
        },
      },
      emojiUsage: {
        totalUsed: allEmojis.length,
        uniqueCount: emojiSet.size,
        density: emojiDensity,
        topEmojis,
      },
      punctuation: {
        exclamationPerPost: Math.round((exclamationCount / Math.max(contentSamples.length, 1)) * 10) / 10,
        questionsPerPost: Math.round((questionCount / Math.max(contentSamples.length, 1)) * 10) / 10,
        ellipsisCount,
        capsRatio,
      },
      guidelines,
      sampleSize: contentSamples.length,
      totalWordsAnalyzed: words.length,
      totalSentencesAnalyzed: sentences.length,
    },
    source: 'browser',
    featureId: 'F70',
  };
}

// =============================================================================
// F71 — Automated Media Resizer
// =============================================================================
function automatedMediaResizer(
  source: { width: number; height: number; format?: string },
  targetPlatforms: string[]
): FeatureResult {
  const { width, height, format = 'png' } = source;
  const aspectRatio = width / height;
  const orientation = width > height ? 'landscape' : height > width ? 'portrait' : 'square';
  const megapixels = Math.round((width * height) / 1_000_000 * 10) / 10;

  // Platform specs database
  const platformSpecs: Record<string, Array<{ name: string; width: number; height: number; type: string }>> = {
    instagram: [
      { name: 'Post (Square)', width: 1080, height: 1080, type: 'post' },
      { name: 'Post (Portrait)', width: 1080, height: 1350, type: 'post' },
      { name: 'Post (Landscape)', width: 1080, height: 566, type: 'post' },
      { name: 'Story / Reel', width: 1080, height: 1920, type: 'story' },
      { name: 'Carousel', width: 1080, height: 1080, type: 'carousel' },
      { name: 'IGTV Cover', width: 420, height: 654, type: 'cover' },
    ],
    youtube: [
      { name: 'Thumbnail', width: 1280, height: 720, type: 'thumbnail' },
      { name: 'Channel Banner', width: 2560, height: 1440, type: 'banner' },
      { name: 'Video (16:9)', width: 1920, height: 1080, type: 'video' },
      { name: 'Shorts', width: 1080, height: 1920, type: 'shorts' },
    ],
    tiktok: [
      { name: 'Video (9:16)', width: 1080, height: 1920, type: 'video' },
      { name: 'Profile Picture', width: 200, height: 200, type: 'profile' },
      { name: 'Cover', width: 1080, height: 1920, type: 'cover' },
    ],
    twitter: [
      { name: 'In-Stream Photo', width: 1600, height: 900, type: 'post' },
      { name: 'Header Banner', width: 1500, height: 500, type: 'banner' },
      { name: 'Square Post', width: 1080, height: 1080, type: 'post' },
    ],
    linkedin: [
      { name: 'Post Image', width: 1200, height: 627, type: 'post' },
      { name: 'Company Banner', width: 1584, height: 396, type: 'banner' },
      { name: 'Profile Photo', width: 400, height: 400, type: 'profile' },
    ],
    facebook: [
      { name: 'Shared Link', width: 1200, height: 630, type: 'post' },
      { name: 'Cover Photo', width: 820, height: 312, type: 'cover' },
      { name: 'Ad Image', width: 1200, height: 628, type: 'ad' },
      { name: 'Story', width: 1080, height: 1920, type: 'story' },
    ],
  };

  const specs = targetPlatforms.flatMap(p => platformSpecs[p] || []);

  const resizeRecommendations = specs.map((spec) => {
    const targetAR = spec.width / spec.height;
    const arDiff = Math.abs(aspectRatio - targetAR);

    // Compute crop / pad strategy
    let strategy: 'crop_top_bottom' | 'crop_left_right' | 'crop_sides' | 'pad' | 'stretch';
    let cropRegion: { x: number; y: number; w: number; h: number } | null = null;
    let padding: { top: number; bottom: number; left: number; right: number } | null = null;
    let scaleFactor: number;
    let qualityWarning: string | null = null;

    if (arDiff < 0.01) {
      // Nearly matching — just scale
      strategy = 'stretch';
      scaleFactor = Math.min(spec.width / width, spec.height / height);
    } else if (aspectRatio > targetAR) {
      // Source is wider — crop sides
      strategy = 'crop_left_right';
      const cropWidth = height * targetAR;
      const cropHeight = height;
      cropRegion = {
        x: Math.round((width - cropWidth) / 2),
        y: 0,
        w: Math.round(cropWidth),
        h: cropHeight,
      };
      scaleFactor = spec.width / cropWidth;
    } else {
      // Source is taller — crop top/bottom
      strategy = 'crop_top_bottom';
      const cropWidth = width;
      const cropHeight = width / targetAR;
      cropRegion = {
        x: 0,
        y: Math.round((height - cropHeight) * 0.4), // bias toward top (faces usually there)
        w: cropWidth,
        h: Math.round(cropHeight),
      };
      scaleFactor = spec.height / cropHeight;
    }

    // Quality check — upscaling warning
    if (scaleFactor > 1.5) {
      qualityWarning = `Upscaling ${Math.round((scaleFactor - 1) * 100)}% — may reduce quality. Consider a higher resolution source.`;
    }
    if (scaleFactor < 0.5) {
      qualityWarning = `Significant downscaling (${Math.round((1 - scaleFactor) * 100)}%). Good quality retention expected.`;
    }

    const wastePercent = cropRegion
      ? Math.round((1 - (cropRegion.w * cropRegion.h) / (width * height)) * 100)
      : 0;

    return {
      platform: targetPlatforms.find(p => (platformSpecs[p] || []).includes(spec)) || 'unknown',
      format: spec.name,
      type: spec.type,
      targetDimensions: { width: spec.width, height: spec.height },
      targetAspectRatio: `${spec.width}:${spec.height}`,
      targetMegapixels: Math.round((spec.width * spec.height) / 1_000_000 * 10) / 10,
      strategy,
      cropRegion,
      padding,
      scaleFactor: Math.round(scaleFactor * 100) / 100,
      contentWaste: wastePercent,
      qualityWarning,
      fitScore: Math.round((1 - arDiff * 2) * 100),
    };
  });

  const bestFit = [...resizeRecommendations].sort((a, b) => b.fitScore - a.fitScore)[0];
  const needsResizing = resizeRecommendations.filter(r => r.fitScore < 90).length;

  return {
    success: true,
    data: {
      source: { width, height, aspectRatio: Math.round(aspectRatio * 100) / 100, orientation, megapixels, format },
      recommendations: resizeRecommendations,
      bestFit: bestFit || null,
      summary: {
        totalSpecs: resizeRecommendations.length,
        perfectFits: resizeRecommendations.filter(r => r.fitScore >= 95).length,
        goodFits: resizeRecommendations.filter(r => r.fitScore >= 80 && r.fitScore < 95).length,
        needsResizing,
        hasQualityWarnings: resizeRecommendations.filter(r => r.qualityWarning !== null).length,
      },
    },
    source: 'browser',
    featureId: 'F71',
  };
}

// =============================================================================
// F72 — The Agentic Auto-Pilot Toggle
// =============================================================================
function agenticAutoPilotToggle(
  tasks: Array<{
    id: string;
    description: string;
    type: string;
    frequency?: number; // times per week
    estimatedTimeMinutes?: number;
    riskLevel?: 'low' | 'medium' | 'high';
  }>
): FeatureResult {
  if (tasks.length === 0) {
    return { success: false, data: { error: 'No tasks provided' }, source: 'browser', featureId: 'F72' };
  }

  const analyzed = tasks.map(task => {
    const desc = task.description.toLowerCase();
    const freq = task.frequency || 1;
    const time = task.estimatedTimeMinutes || 15;

    // ── Repeatability Score (0-100) ──
    const repetitiveKeywords = ['daily', 'every', 'routine', 'schedule', 'regular', 'always', 'check', 'review', 'monitor', 'update', 'post', 'reply'];
    const repetitiveHits = repetitiveKeywords.filter(kw => desc.includes(kw)).length;
    const repeatability = Math.min(100, repetitiveHits * 15 + (freq > 3 ? 30 : freq > 1 ? 15 : 0));

    // ── Risk Score (0-100) — higher = more risky to automate ──
    const riskKeywords = ['crisis', 'complaint', 'angry', 'refund', 'legal', 'brand', 'sensitive', 'vip', 'important', 'escalate'];
    const riskHits = riskKeywords.filter(kw => desc.includes(kw)).length;
    const explicitRisk: Record<string, number> = { low: 20, medium: 50, high: 80 };
    const riskScore = Math.min(100, riskHits * 20 + (explicitRisk[task.riskLevel || 'medium'] ?? 40));

    // ── Time Savings Score (0-100) ──
    const weeklyTime = freq * time;
    const timeSavings = Math.min(100, weeklyTime > 120 ? 100 : weeklyTime > 60 ? 80 : weeklyTime > 30 ? 60 : weeklyTime > 10 ? 40 : 20);

    // ── Complexity Score (0-100) ──
    const wordCount = task.description.split(/\s+/).length;
    const complexity = Math.min(100, wordCount * 3 + (task.type.includes('complex') ? 30 : 0));

    // ── Automation Viability ──
    // Higher repeatability + lower risk + higher time savings = better candidate
    const viability = Math.round(
      repeatability * 0.35 +
      (100 - riskScore) * 0.35 +
      timeSavings * 0.20 +
      (100 - complexity) * 0.10
    );

    const shouldAutomate = viability > 65 && riskScore < 60;
    const automationLevel: 'full' | 'partial' | 'manual' =
      shouldAutomate && complexity < 40 ? 'full' :
        shouldAutomate ? 'partial' : 'manual';

    return {
      ...task,
      repeatability: Math.round(repeatability),
      riskScore: Math.round(riskScore),
      riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
      timeSavings: Math.round(timeSavings),
      weeklyTimeMinutes: weeklyTime,
      complexity: Math.round(complexity),
      automationViability: viability,
      shouldAutomate,
      automationLevel,
      estimatedWeeklySaving: shouldAutomate ? Math.round(weeklyTime * 0.7) : 0,
    };
  });

  const sorted = [...analyzed].sort((a, b) => b.automationViability - a.automationViability);
  const automatable = sorted.filter(t => t.shouldAutomate);
  const totalWeeklySavings = automatable.reduce((s, t) => s + t.estimatedWeeklySaving, 0);
  const highRiskTasks = sorted.filter(t => t.riskScore > 70);

  return {
    success: true,
    data: {
      tasks: sorted,
      recommendations: {
        fullyAutomate: sorted.filter(t => t.automationLevel === 'full').map(t => ({
          id: t.id,
          description: t.description,
          weeklySaving: t.estimatedWeeklySaving,
          viability: t.automationViability,
        })),
        partiallyAutomate: sorted.filter(t => t.automationLevel === 'partial').map(t => ({
          id: t.id,
          description: t.description,
          weeklySaving: t.estimatedWeeklySaving,
          viability: t.automationViability,
          riskNote: 'Requires human review checkpoint',
        })),
        keepManual: sorted.filter(t => t.automationLevel === 'manual').map(t => ({
          id: t.id,
          description: t.description,
          reason: t.riskScore > 70 ? 'Too risky for automation' : t.repeatability < 30 ? 'Too variable for automation' : 'Low time savings',
        })),
      },
      summary: {
        totalTasks: sorted.length,
        automatableCount: automatable.length,
        manualCount: sorted.length - automatable.length,
        highRiskCount: highRiskTasks.length,
        totalWeeklySavingsMinutes: totalWeeklySavings,
        totalWeeklySavingsHours: Math.round((totalWeeklySavings / 60) * 10) / 10,
        avgViability: sorted.length > 0
          ? Math.round(sorted.reduce((s, t) => s + t.automationViability, 0) / sorted.length)
          : 0,
      },
    },
    source: 'browser',
    featureId: 'F72',
  };
}

// =============================================================================
// F73 — Comment-to-Content Pipeline
// =============================================================================
function commentToContentPipeline(
  comments: Array<{ id: string; text: string; author: string; likesCount?: number }>
): FeatureResult {
  const ideaPipelines: Array<{
    type: 'tutorial' | 'improvement' | 'product' | 'faq' | 'engagement' | 'story';
    sourceComment: string;
    ideaTitle: string;
    priority: number;
    contentFormat: string;
    estimatedEngagement: number;
    sourceAuthor: string;
    sourceLikes: number;
  }> = [];

  comments.forEach((comment) => {
    const text = comment.text.toLowerCase();
    const words = text.split(/\s+/);
    const likes = comment.likesCount || 0;

    // ── Questions → Tutorial topics ──
    if (text.includes('?') || /^(how|what|why|when|where|can|do|does|is)\b/.test(text)) {
      const questionWords = words.filter(w => w.length > 4).join(' ');
      const ideaTitle = `How to ${questionWords.replace(/[?,!]/g, '').trim().slice(0, 60)}`;
      ideaPipelines.push({
        type: 'tutorial',
        sourceComment: comment.text.slice(0, 150),
        ideaTitle,
        priority: 70 + (likes > 5 ? 15 : 0) + (words.length > 10 ? 10 : 0),
        contentFormat: 'video_tutorial',
        estimatedEngagement: 60 + likes * 2,
        sourceAuthor: comment.author,
        sourceLikes: likes,
      });
    }

    // ── Complaints → Improvement content ──
    const complaintWords = ['hate', 'disappointed', 'frustrating', 'wish', 'better', 'improve', 'fix', 'annoying', 'missing', 'need'];
    const complaintHits = complaintWords.filter(w => text.includes(w)).length;
    if (complaintHits > 0) {
      const topic = words.filter(w => w.length > 3 && !complaintWords.includes(w)).slice(0, 6).join(' ');
      ideaPipelines.push({
        type: 'improvement',
        sourceComment: comment.text.slice(0, 150),
        ideaTitle: `Addressing "${topic}" — What we're improving next`,
        priority: 60 + complaintHits * 10 + (likes > 10 ? 15 : 0),
        contentFormat: 'transparency_post',
        estimatedEngagement: 45 + likes * 3 + complaintHits * 10,
        sourceAuthor: comment.author,
        sourceLikes: likes,
      });
    }

    // ── Wishes / Feature Requests → Product content ──
    const wishWords = ['wish', 'want', 'would love', 'could you', 'please add', 'feature', 'if only', 'dream'];
    const wishHits = wishWords.filter(w => text.includes(w)).length;
    if (wishHits > 0) {
      const feature = words.filter(w => w.length > 3 && !wishWords.includes(w)).slice(0, 5).join(' ');
      ideaPipelines.push({
        type: 'product',
        sourceComment: comment.text.slice(0, 150),
        ideaTitle: `Community Feature Request: ${feature.charAt(0).toUpperCase() + feature.slice(1)}`,
        priority: 55 + wishHits * 12 + (likes > 3 ? 10 : 0),
        contentFormat: 'announcement_teaser',
        estimatedEngagement: 50 + likes * 2 + wishHits * 8,
        sourceAuthor: comment.author,
        sourceLikes: likes,
      });
    }

    // ── FAQ detection ──
    if (text.includes('?') && (text.includes('price') || text.includes('cost') || text.includes('free') || text.includes('plan'))) {
      ideaPipelines.push({
        type: 'faq',
        sourceComment: comment.text.slice(0, 150),
        ideaTitle: `FAQ: ${comment.text.slice(0, 80).replace('?', '')}`,
        priority: 50 + likes * 3,
        contentFormat: 'faq_stories',
        estimatedEngagement: 35 + likes * 2,
        sourceAuthor: comment.author,
        sourceLikes: likes,
      });
    }

    // ── Story-worthy comments (long + personal) ──
    if (words.length > 25 && likes > 0) {
      ideaPipelines.push({
        type: 'story',
        sourceComment: comment.text.slice(0, 150),
        ideaTitle: `Community Spotlight: "${comment.text.slice(0, 50)}..."`,
        priority: 40 + Math.min(likes * 2, 30),
        contentFormat: 'story_highlight',
        estimatedEngagement: 30 + likes * 4,
        sourceAuthor: comment.author,
        sourceLikes: likes,
      });
    }
  });

  // Sort by priority and deduplicate similar ideas
  const sorted = [...ideaPipelines].sort((a, b) => b.priority - a.priority);
  const uniqueIdeas = sorted.filter((idea, idx, arr) =>
    idx === arr.findIndex(other => other.ideaTitle.slice(0, 30) === idea.ideaTitle.slice(0, 30))
  );

  const typeCounts: Record<string, number> = {};
  uniqueIdeas.forEach(i => { typeCounts[i.type] = (typeCounts[i.type] || 0) + 1; });

  const formatCounts: Record<string, number> = {};
  uniqueIdeas.forEach(i => { formatCounts[i.contentFormat] = (formatCounts[i.contentFormat] || 0) + 1; });

  return {
    success: true,
    data: {
      pipeline: uniqueIdeas.slice(0, 20),
      summary: {
        totalIdeas: uniqueIdeas.length,
        commentsAnalyzed: comments.length,
        conversionRate: Math.round((uniqueIdeas.length / Math.max(comments.length, 1)) * 100) / 100,
        ideaTypes: typeCounts,
        contentFormats: formatCounts,
        topIdea: uniqueIdeas[0] || null,
        avgEstimatedEngagement: uniqueIdeas.length > 0
          ? Math.round(uniqueIdeas.reduce((s, i) => s + i.estimatedEngagement, 0) / uniqueIdeas.length)
          : 0,
      },
    },
    source: 'browser',
    featureId: 'F73',
  };
}

// =============================================================================
// F74 — Sentiment-Based Response Routing
// =============================================================================
function sentimentBasedResponseRouting(
  comments: Array<{ id: string; text: string; author: string; platform: string }>
): FeatureResult {
  const routed = comments.map((comment) => {
    const lower = comment.text.toLowerCase();
    const words = lower.split(/\s+/);

    // ── Sentiment scoring ──
    const strongPos = ['love', 'amazing', 'incredible', 'best', 'perfect', 'brilliant', 'fire', 'obsessed', 'masterpiece'];
    const mildPos = ['good', 'nice', 'great', 'cool', 'thanks', 'helpful', 'like', 'enjoy', 'solid'];
    const mildNeg = ['okay', 'meh', 'decent', 'fine', 'alright', 'could be better', 'not bad'];
    const strongNeg = ['hate', 'worst', 'terrible', 'awful', 'garbage', 'waste', 'scam', 'uninstall', 'disappointed', 'broken'];
    const questionWords = ['how', 'what', 'why', 'when', 'can', 'does', 'is', 'do', 'where'];
    const complaintWords = ['issue', 'bug', 'problem', 'error', 'crash', 'not working', 'fix', 'slow'];

    const strongPosScore = strongPos.filter(w => lower.includes(w)).length * 3;
    const mildPosScore = mildPos.filter(w => lower.includes(w)).length * 1.5;
    const mildNegScore = mildNeg.filter(w => lower.includes(w)).length * 1.5;
    const strongNegScore = strongNeg.filter(w => lower.includes(w)).length * 3;
    const questionScore = questionWords.some(qw => words[0]?.startsWith(qw) || lower.endsWith('?')) ? 2 : 0;
    const complaintScore = complaintWords.filter(w => lower.includes(w)).length * 2;

    const positive = strongPosScore + mildPosScore;
    const negative = strongNegScore + mildNegScore + complaintScore;

    let sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative' | 'question';
    if (questionScore > 0 && negative === 0 && positive === 0) {
      sentiment = 'question';
    } else if (strongPosScore > 0) {
      sentiment = 'very_positive';
    } else if (positive > negative) {
      sentiment = 'positive';
    } else if (strongNegScore > 0 || complaintScore > 3) {
      sentiment = 'very_negative';
    } else if (negative > positive) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    // ── Route to response template ──
    let templateType: string;
    let templateVariants: string[];
    let responsePriority: 'immediate' | 'high' | 'normal' | 'low';
    let category: string;

    switch (sentiment) {
      case 'very_positive':
        templateType = 'enthusiastic_thank_you';
        templateVariants = [
          `This absolutely made our day! 🎉 Thank you so much, @${comment.author}!`,
          `We're over the moon reading this! Your support means everything ✨`,
          `STOP — this is too kind! 💛 We appreciate you more than words can say!`,
        ];
        category = 'positive_engagement';
        responsePriority = 'normal';
        break;
      case 'positive':
        templateType = 'warm_thank_you';
        templateVariants = [
          `Thanks for the kind words, @${comment.author}! Glad you enjoyed it 🙌`,
          `Appreciate the love! We're happy this resonated with you.`,
          `Thank you! Feedback like this keeps us motivated to create more 💪`,
        ];
        category = 'positive_engagement';
        responsePriority = 'low';
        break;
      case 'very_negative':
        templateType = 'empathy_resolution_escalated';
        templateVariants = [
          `We hear you, @${comment.author}, and we're truly sorry. This is not the experience we want for you. Our team is looking into this right now — can you DM us so we can resolve it personally?`,
          `We take this seriously. We're sorry you've had this experience, @${comment.author}. Please reach out to us directly so we can make it right immediately.`,
          `This isn't okay and we want to fix it. @${comment.author}, please DM us your details and we'll prioritize this issue.`,
        ];
        category = 'crisis_prevention';
        responsePriority = 'immediate';
        break;
      case 'negative':
        templateType = 'empathy_resolution';
        templateVariants = [
          `We understand your frustration, @${comment.author}. We're working on improvements and your feedback helps. Could you share more details?`,
          `Thanks for being honest, @${comment.author}. We're committed to improving — would you mind telling us more about what happened?`,
          `We hear you, and this matters to us. We're actively working to improve this area. Stay tuned for updates.`,
        ];
        category = 'support_needed';
        responsePriority = 'high';
        break;
      case 'question':
        templateType = 'informative_response';
        templateVariants = [
          `Great question, @${comment.author}! Here's what we'd recommend: [detailed answer]. Let us know if you need more help!`,
          `Thanks for asking! The answer depends on your specific use case — DM us and we'll give you a personalized response 📩`,
          `Love this question! Short answer: [quick response]. Long answer: we're working on a full guide about this. Stay tuned!`,
        ];
        category = 'question_answer';
        responsePriority = 'high';
        break;
      case 'neutral':
      default:
        templateType = 'engagement_prompt';
        templateVariants = [
          `Thanks for sharing, @${comment.author}! What would you like to see us cover next? 👇`,
          `Appreciate you taking the time to comment! We'd love to hear more of your thoughts.`,
          `Noted! @${comment.author}, what's the one thing you'd love to see from us?`,
        ];
        category = 'engagement_boost';
        responsePriority = 'low';
        break;
    }

    return {
      commentId: comment.id,
      author: comment.author,
      platform: comment.platform,
      sentiment,
      sentimentScores: {
        positive: Math.round(positive * 10) / 10,
        negative: Math.round(negative * 10) / 10,
        isQuestion: sentiment === 'question',
      },
      templateType,
      templateVariants,
      category,
      responsePriority,
    };
  });

  const priorityCounts: Record<string, number> = {};
  routed.forEach(r => { priorityCounts[r.responsePriority] = (priorityCounts[r.responsePriority] || 0) + 1; });

  const categoryCounts: Record<string, number> = {};
  routed.forEach(r => { categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1; });

  return {
    success: true,
    data: {
      routedComments: routed,
      summary: {
        totalComments: routed.length,
        priorityBreakdown: priorityCounts,
        categoryBreakdown: categoryCounts,
        immediateActions: routed.filter(r => r.responsePriority === 'immediate').length,
        uniqueTemplates: new Set(routed.map(r => r.templateType)).size,
      },
    },
    source: 'browser',
    featureId: 'F74',
  };
}

// =============================================================================
// F75 — Contextual Cross-Reference Engine
// =============================================================================
function contextualCrossReferenceEngine(
  contentLibrary: Array<{
    id: string;
    title: string;
    description: string;
    platform: string;
    tags?: string[];
    publishedAt: string;
    performanceScore?: number;
  }>
): FeatureResult {
  if (contentLibrary.length < 2) {
    return { success: false, data: { error: 'Need at least 2 content items for cross-referencing' }, source: 'browser', featureId: 'F75' };
  }

  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'and', 'or', 'but', 'not', 'this', 'that', 'it', 'i', 'you', 'we', 'they', 'my', 'your', 'our', 'how', 'what', 'why', 'when', 'can', 'do', 'be']);
  const extractKeywords = (text: string): string[] => {
    return text.toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 3 && !stopWords.has(w));
  };

  // Build keyword maps per content item
  const enriched = contentLibrary.map(item => {
    const titleKeywords = extractKeywords(item.title);
    const descKeywords = extractKeywords(item.description);
    const tagKeywords = (item.tags || []).map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const allKeywords = Array.from(new Set([...titleKeywords, ...descKeywords, ...tagKeywords]));
    const keywordFreq: Record<string, number> = {};
    [...titleKeywords, ...descKeywords].forEach(w => { keywordFreq[w] = (keywordFreq[w] || 0) + 1; });

    return { ...item, allKeywords, keywordFreq, keywordCount: allKeywords.length };
  });

  // ── Find cross-references ──
  const crossReferences: Array<{
    sourceId: string;
    sourceTitle: string;
    targetId: string;
    targetTitle: string;
    overlapKeywords: string[];
    overlapScore: number;
    crossPromotionOpportunity: string;
    linkingSuggestion: string;
  }> = [];

  for (let i = 0; i < enriched.length; i++) {
    for (let j = i + 1; j < enriched.length; j++) {
      const a = enriched[i];
      const b = enriched[j];

      const overlap = a.allKeywords.filter(kw => b.allKeywords.includes(kw));
      const overlapScore = overlap.length > 0
        ? Math.round((overlap.length / Math.max(a.keywordCount, b.keywordCount, 1)) * 100)
        : 0;

      if (overlapScore > 10) {
        const samePlatform = a.platform === b.platform;
        const crossPlatformSuggestion = samePlatform
          ? `Link "${b.title}" in the description or pinned comment of "${a.title}"`
          : `Mention "${b.title}" (${b.platform}) when sharing "${a.title}" (${a.platform}) for cross-platform exposure`;

        const overlapTypes = overlap.slice(0, 5);
        const crossPromotionType = samePlatform ? 'internal_link' : 'cross_platform';

        crossReferences.push({
          sourceId: a.id,
          sourceTitle: a.title,
          targetId: b.id,
          targetTitle: b.title,
          overlapKeywords: overlapTypes,
          overlapScore,
          crossPromotionOpportunity: crossPromotionType,
          linkingSuggestion: crossPlatformSuggestion,
        });
      }
    }
  }

  crossReferences.sort((a, b) => b.overlapScore - a.overlapScore);

  // ── Detect content overlaps / gaps ──
  const keywordPopularity: Record<string, number> = {};
  enriched.forEach(e => {
    e.allKeywords.forEach(kw => { keywordPopularity[kw] = (keywordPopularity[kw] || 0) + 1; });
  });

  const trendingTopics = Object.entries(keywordPopularity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, appearsIn: count, percentage: Math.round((count / enriched.length) * 100) }));

  const uniqueTopics = Object.entries(keywordPopularity)
    .filter(([, count]) => count === 1)
    .map(([keyword]) => keyword);

  // ── Content clusters ──
  const clusters: Record<string, string[]> = {};
  trendingTopics.slice(0, 5).forEach(({ keyword }) => {
    const members = enriched
      .filter(e => e.allKeywords.includes(keyword))
      .map(e => e.title);
    if (members.length > 1) {
      clusters[keyword] = members;
    }
  });

  const avgPerformance = enriched
    .filter(e => e.performanceScore !== undefined)
    .reduce((s, e) => s + (e.performanceScore || 0), 0) / Math.max(enriched.filter(e => e.performanceScore !== undefined).length, 1);

  return {
    success: true,
    data: {
      crossReferences,
      trendingTopics,
      uniqueTopicsCount: uniqueTopics.length,
      contentClusters: clusters,
      summary: {
        totalContentItems: enriched.length,
        totalCrossReferences: crossReferences.length,
        strongLinks: crossReferences.filter(cr => cr.overlapScore > 50).length,
        crossPlatformOpportunities: crossReferences.filter(cr => cr.crossPromotionOpportunity === 'cross_platform').length,
        avgOverlapScore: crossReferences.length > 0
          ? Math.round(crossReferences.reduce((s, cr) => s + cr.overlapScore, 0) / crossReferences.length)
          : 0,
        avgPerformance: Math.round(avgPerformance * 10) / 10,
      },
    },
    source: 'browser',
    featureId: 'F75',
  };
}

// =============================================================================
// F76 — Influencer Mention Auto-Response
// =============================================================================
function influencerMentionAutoResponse(
  mentions: Array<{
    id: string;
    authorHandle: string;
    text: string;
    platform: string;
    timestamp: string;
    authorFollowerCount: number;
  }>,
  options: { followerThreshold?: number; responseStyle?: string } = {}
): FeatureResult {
  const {
    followerThreshold = 10_000,
    responseStyle = 'professional',
  } = options;

  const responses = mentions.map(mention => {
    const isInf = mention.authorFollowerCount >= followerThreshold;
    const lower = mention.text.toLowerCase();
    const ageHours = (Date.now() - new Date(mention.timestamp).getTime()) / 3_600_000;

    // ── Influencer tier classification ──
    let tier: 'mega' | 'macro' | 'micro' | 'nano';
    if (mention.authorFollowerCount >= 1_000_000) tier = 'mega';
    else if (mention.authorFollowerCount >= 100_000) tier = 'macro';
    else if (mention.authorFollowerCount >= 10_000) tier = 'micro';
    else tier = 'nano';

    // ── Sentiment of mention ──
    const posWords = ['love', 'amazing', 'great', 'awesome', 'best', 'incredible', 'obsessed', 'fan'];
    const negWords = ['hate', 'worst', 'disappointed', 'terrible', 'bad', 'waste'];
    const posHits = posWords.filter(w => lower.includes(w)).length;
    const negHits = negWords.filter(w => lower.includes(w)).length;
    const mentionSentiment = posHits > negHits ? 'positive' : negHits > posHits ? 'negative' : 'neutral';

    // ── Response templates based on tier and sentiment ──
    let responseTemplates: string[];
    if (mentionSentiment === 'positive') {
      const openers = {
        professional: [`Huge thanks for the shoutout, @${mention.authorHandle}!`, `We're honored by the mention from @${mention.authorHandle}!`],
        casual: [`@${mention.authorHandle} WE SEE YOU and we love it 🔥`, `Okay @${mention.authorHandle} you made our entire week!! 💛`],
        witty: [`When @${mention.authorHandle} mentions you, you know you've made it 😎`, `Plot twist: @${mention.authorHandle} loves us. We love them back. Full circle.`],
      };
      responseTemplates = openers[responseStyle as keyof typeof openers] || openers.professional;
    } else if (mentionSentiment === 'negative') {
      responseTemplates = [
        `We appreciate the feedback from @${mention.authorHandle}. We're listening and always working to improve.`,
        `@${mention.authorHandle}, we hear you. We'd love to connect directly to understand your experience better.`,
      ];
    } else {
      responseTemplates = [
        `Thanks for mentioning us, @${mention.authorHandle}! What brought you to check us out? 👀`,
        `@${mention.authorHandle} spotted! 🙌 How can we help you today?`,
      ];
    }

    // ── Response timing optimization ──
    let optimalResponseWindow: string;
    let urgencyLevel: string;
    if (ageHours < 1) {
      optimalResponseWindow = 'within_30_minutes';
      urgencyLevel = 'critical';
    } else if (ageHours < 4) {
      optimalResponseWindow = 'within_2_hours';
      urgencyLevel = 'high';
    } else if (ageHours < 12) {
      optimalResponseWindow = 'within_6_hours';
      urgencyLevel = 'medium';
    } else {
      optimalResponseWindow = 'within_24_hours';
      urgencyLevel = 'low';
    }

    // For mega/macro influencers, always respond fast
    if (tier === 'mega' || tier === 'macro') {
      optimalResponseWindow = ageHours < 2 ? 'within_15_minutes' : 'within_1_hour';
      urgencyLevel = 'critical';
    }

    // ── Engagement multiplier estimate ──
    const engagementMultiplier = tier === 'mega' ? 15 : tier === 'macro' ? 7 : tier === 'micro' ? 3 : 1;

    return {
      mentionId: mention.id,
      authorHandle: mention.authorHandle,
      platform: mention.platform,
      isInfluencer: isInf,
      tier,
      followerCount: mention.authorFollowerCount,
      mentionSentiment,
      mentionAge: Math.round(ageHours),
      urgencyLevel,
      optimalResponseWindow,
      responseTemplates,
      recommendedResponse: responseTemplates[0],
      engagementMultiplier,
      estimatedExposure: mention.authorFollowerCount * engagementMultiplier * 0.02,
    };
  });

  const influencerResponses = responses.filter(r => r.isInfluencer);
  const sortedByUrgency = [...responses].sort((a, b) => {
    const urgencyOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (urgencyOrder[a.urgencyLevel] ?? 4) - (urgencyOrder[b.urgencyLevel] ?? 4);
  });

  return {
    success: true,
    data: {
      responses: sortedByUrgency,
      influencerResponses,
      summary: {
        totalMentions: responses.length,
        influencerMentions: influencerResponses.length,
        byTier: {
          mega: influencerResponses.filter(r => r.tier === 'mega').length,
          macro: influencerResponses.filter(r => r.tier === 'macro').length,
          micro: influencerResponses.filter(r => r.tier === 'micro').length,
        },
        criticalCount: responses.filter(r => r.urgencyLevel === 'critical').length,
        totalEstimatedExposure: Math.round(responses.reduce((s, r) => s + r.estimatedExposure, 0)),
      },
    },
    source: 'browser',
    featureId: 'F76',
  };
}

// =============================================================================
// F77 — Crisis Response Protocol
// =============================================================================
function crisisResponseProtocol(
  recentComments: Array<{ id: string; text: string; timestamp: string; platform: string }>,
  options: { windowHours?: number } = {}
): FeatureResult {
  const { windowHours = 24 } = options;
  const windowMs = windowHours * 3_600_000;
  const now = Date.now();
  const recentCommentsInWindow = recentComments.filter(
    c => now - new Date(c.timestamp).getTime() <= windowMs
  );

  // ── Negative Sentiment Spike Detection ──
  const strongNeg = ['hate', 'worst', 'terrible', 'awful', 'garbage', 'scam', 'trash', 'pathetic', 'disgusting', 'boycott', 'uninstall', 'delete', 'cancel', 'lawsuit', 'lawyer', 'report'];
  const crisisWords = ['boycott', 'cancel', 'lawsuit', 'lawyer', 'fraud', 'scam', 'expose', 'deceptive', 'manipulation', 'investigation', 'regulatory', 'class action'];

  let crisisScore = 0;
  let negativeCount = 0;
  let crisisWordCount = 0;
  const crisisComments: string[] = [];

  recentCommentsInWindow.forEach(comment => {
    const lower = comment.text.toLowerCase();
    const negHits = strongNeg.filter(w => lower.includes(w)).length;
    const crisisHits = crisisWords.filter(w => lower.includes(w)).length;

    if (negHits > 0) negativeCount++;
    if (crisisHits > 0) {
      crisisWordCount++;
      crisisScore += crisisHits * 20;
      crisisComments.push(comment.text.slice(0, 100));
    }
    crisisScore += negHits * 5;
  });

  // ── Pattern Detection ──
  const commentRate = recentCommentsInWindow.length / Math.max(windowHours, 1);
  const negRatio = negativeCount / Math.max(recentCommentsInWindow.length, 1);
  // Amplification detection: multiple comments with same crisis words
  const crisisWordFreq: Record<string, number> = {};
  recentCommentsInWindow.forEach(c => {
    crisisWords.forEach(cw => {
      if (c.text.toLowerCase().includes(cw)) {
        crisisWordFreq[cw] = (crisisWordFreq[cw] || 0) + 1;
      }
    });
  });
  const amplifyingWords = Object.entries(crisisWordFreq)
    .filter(([, count]) => count > 2)
    .map(([word, count]) => ({ word, count }));

  if (amplifyingWords.length > 0) crisisScore += amplifyingWords.length * 25;
  if (negRatio > 0.5) crisisScore += 30;
  if (commentRate > 50) crisisScore += 15; // Unusually high comment rate

  crisisScore = Math.min(100, crisisScore);

  // ── Crisis Level Classification ──
  let crisisLevel: 'none' | 'monitoring' | 'elevated' | 'high' | 'critical';
  if (crisisScore < 15) crisisLevel = 'none';
  else if (crisisScore < 30) crisisLevel = 'monitoring';
  else if (crisisScore < 55) crisisLevel = 'elevated';
  else if (crisisScore < 80) crisisLevel = 'high';
  else crisisLevel = 'critical';

  // ── Response Protocol Generation ──
  const protocols: Array<{
    level: string;
    action: string;
    description: string;
    priority: string;
  }> = [];

  if (crisisLevel === 'critical' || crisisLevel === 'high') {
    protocols.push(
      { level: 'immediate', action: 'PAUSE_ALL_SCHEDULED_CONTENT', description: 'Immediately pause all scheduled posts and automated responses to avoid tone-deaf messaging.', priority: 'critical' },
      { level: 'immediate', action: 'ASSEMBLE_CRISIS_TEAM', description: 'Notify core team members. Activate crisis communication channel.', priority: 'critical' },
      { level: 'hour_1', action: 'DRAFT_ACKNOWLEDGMENT', description: 'Prepare a brief acknowledgment statement acknowledging the situation without being defensive.', priority: 'high' },
      { level: 'hour_2', action: 'COMPREHENSIVE_RESPONSE', description: 'Draft detailed response addressing each concern category identified.', priority: 'high' },
      { level: 'hour_4', action: 'MONITOR_SENTIMENT_SHIFT', description: 'Track sentiment changes after initial response. Adjust strategy as needed.', priority: 'medium' },
      { level: 'hour_24', action: 'FOLLOW_UP_STATEMENT', description: 'Release update on concrete actions taken in response to feedback.', priority: 'medium' },
    );
  } else if (crisisLevel === 'elevated') {
    protocols.push(
      { level: 'within_1_hour', action: 'MONITOR_COMMENT_FLOW', description: 'Increase monitoring frequency. Track trending negative keywords.', priority: 'high' },
      { level: 'within_2_hours', action: 'PREPARE_HOLDING_STATEMENT', description: 'Draft preemptive response in case situation escalates.', priority: 'medium' },
      { level: 'within_4_hours', action: 'ENGAGE_KEY_CRITICS', description: 'Personally respond to the most impactful negative comments.', priority: 'medium' },
    );
  } else {
    protocols.push(
      { level: 'routine', action: 'STANDARD_ENGAGEMENT', description: 'Continue normal engagement with slightly increased attention to negative comments.', priority: 'low' },
      { level: 'weekly', action: 'SENTIMENT_REVIEW', description: 'Include sentiment trends in weekly review.', priority: 'low' },
    );
  }

  // ── Key themes from crisis comments ──
  const crisisThemes = Object.entries(crisisWordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme, count]) => ({ theme, frequency: count, severity: count > 4 ? 'critical' : count > 2 ? 'high' : 'moderate' }));

  return {
    success: true,
    data: {
      crisisLevel,
      crisisScore: Math.round(crisisScore),
      assessment: {
        commentsInWindow: recentCommentsInWindow.length,
        negativeCount,
        crisisKeywordCount: crisisWordCount,
        negativeRatio: Math.round(negRatio * 100) / 100,
        commentRatePerHour: Math.round(commentRate * 10) / 10,
        isAmplifying: amplifyingWords.length > 0,
        amplifyingKeywords: amplifyingWords,
      },
      crisisThemes,
      crisisComments: crisisComments.slice(0, 10),
      responseProtocol: protocols,
      recommendedActions: crisisLevel !== 'none'
        ? [
            crisisScore > 50 ? 'STOP all automated posting immediately' : null,
            true ? 'Increase comment monitoring to every 15 minutes' : null,
            crisisWordCount > 0 ? 'Address the most frequent complaint theme first' : null,
            amplifyingWords.length > 0 ? `Focus on addressing: ${amplifyingWords.map(w => w.word).join(', ')}` : null,
          ].filter(Boolean) as string[]
        : ['No immediate action required. Continue standard monitoring.'],
    },
    source: 'browser',
    featureId: 'F77',
  };
}

// =============================================================================
// F78 — Engagement Fatigue Predictor
// =============================================================================
function engagementFatiguePredictor(
  postingHistory: Array<{
    date: string;
    engagementRate: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
  }>,
  options: { lookbackDays?: number } = {}
): FeatureResult {
  const { lookbackDays = 30 } = options;
  const now = new Date();
  const lookbackMs = lookbackDays * 86_400_000;

  const recent = postingHistory.filter(
    p => now.getTime() - new Date(p.date).getTime() <= lookbackMs
  );

  if (recent.length < 3) {
    return { success: false, data: { error: `Need at least 3 data points within ${lookbackDays} days. Got ${recent.length}.` }, source: 'browser', featureId: 'F78' };
  }

  // ── Sort by date ──
  const sorted = [...recent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // ── Posting frequency analysis ──
  const daysSpan = Math.max(
    (now.getTime() - new Date(sorted[0].date).getTime()) / 86_400_000,
    1
  );
  const postsPerDay = sorted.length / daysSpan;
  const postsPerWeek = postsPerDay * 7;

  // ── Engagement trend ──
  const firstHalf = sorted.slice(0, Math.ceil(sorted.length / 2));
  const secondHalf = sorted.slice(Math.ceil(sorted.length / 2));

  const avgEngFirst = firstHalf.reduce((s, p) => s + p.engagementRate, 0) / Math.max(firstHalf.length, 1);
  const avgEngSecond = secondHalf.reduce((s, p) => s + p.engagementRate, 0) / Math.max(secondHalf.length, 1);

  const engagementTrend = avgEngFirst > 0
    ? ((avgEngSecond - avgEngFirst) / avgEngFirst) * 100
    : 0; // percentage change

  // ── Engagement volatility ──
  const meanEng = sorted.reduce((s, p) => s + p.engagementRate, 0) / sorted.length;
  const varianceEng = sorted.reduce((s, p) => s + Math.pow(p.engagementRate - meanEng, 2), 0) / sorted.length;
  const stdDevEng = Math.sqrt(varianceEng);
  const coefficientOfVariation = meanEng > 0 ? (stdDevEng / meanEng) * 100 : 0;

  // ── Comment quality decline detection ──
  const avgCommentsFirst = firstHalf.reduce((s, p) => s + p.comments, 0) / Math.max(firstHalf.length, 1);
  const avgCommentsSecond = secondHalf.reduce((s, p) => s + p.comments, 0) / Math.max(secondHalf.length, 1);
  const commentTrend = avgCommentsFirst > 0
    ? ((avgCommentsSecond - avgCommentsFirst) / avgCommentsFirst) * 100
    : 0;

  const avgLikesFirst = firstHalf.reduce((s, p) => s + p.likes, 0) / Math.max(firstHalf.length, 1);
  const avgLikesSecond = secondHalf.reduce((s, p) => s + p.likes, 0) / Math.max(secondHalf.length, 1);
  const likeTrend = avgLikesFirst > 0
    ? ((avgLikesSecond - avgLikesFirst) / avgLikesFirst) * 100
    : 0;

  const avgSharesFirst = firstHalf.reduce((s, p) => s + p.shares, 0) / Math.max(firstHalf.length, 1);
  const avgSharesSecond = secondHalf.reduce((s, p) => s + p.shares, 0) / Math.max(secondHalf.length, 1);
  const shareTrend = avgSharesFirst > 0
    ? ((avgSharesSecond - avgSharesFirst) / avgSharesFirst) * 100
    : 0;

  // ── Fatigue signals ──
  const fatigueSignals: string[] = [];
  let fatigueScore = 0;

  // Signal 1: Declining engagement despite consistent posting
  if (engagementTrend < -15 && postsPerWeek > 3) {
    fatigueSignals.push('Engagement declining while posting frequency is high');
    fatigueScore += 25;
  }

  // Signal 2: Comment quality declining
  if (commentTrend < -20) {
    fatigueSignals.push('Comment volume dropping significantly');
    fatigueScore += 20;
  }

  // Signal 3: High posting frequency
  if (postsPerWeek > 10) {
    fatigueSignals.push(`Very high posting frequency (${Math.round(postsPerWeek * 10) / 10}/week) may be diluting quality`);
    fatigueScore += 20;
  } else if (postsPerWeek > 7) {
    fatigueSignals.push('Posting frequency above recommended range');
    fatigueScore += 10;
  }

  // Signal 4: Engagement volatility increasing
  if (coefficientOfVariation > 60) {
    fatigueSignals.push('Engagement rates becoming highly unpredictable');
    fatigueScore += 15;
  }

  // Signal 5: Like-to-impression ratio declining
  const avgLTRFirst = firstHalf.reduce((s, p) => s + (p.impressions > 0 ? p.likes / p.impressions : 0), 0) / Math.max(firstHalf.length, 1);
  const avgLTRSecond = secondHalf.reduce((s, p) => s + (p.impressions > 0 ? p.likes / p.impressions : 0), 0) / Math.max(secondHalf.length, 1);
  if (avgLTRFirst > 0 && (avgLTRSecond - avgLTRFirst) / avgLTRFirst < -0.15) {
    fatigueSignals.push('Like-to-impression ratio declining — content may be reaching audience but not resonating');
    fatigueScore += 15;
  }

  // Signal 6: Share rate declining
  if (shareTrend < -25) {
    fatigueSignals.push('Share rate declining sharply — content losing viral potential');
    fatigueScore += 10;
  }

  fatigueScore = Math.min(100, fatigueScore);

  // ── Fatigue classification ──
  let fatigueLevel: 'none' | 'early' | 'moderate' | 'high' | 'critical';
  if (fatigueScore < 15) fatigueLevel = 'none';
  else if (fatigueScore < 30) fatigueLevel = 'early';
  else if (fatigueScore < 55) fatigueLevel = 'moderate';
  else if (fatigueScore < 75) fatigueLevel = 'high';
  else fatigueLevel = 'critical';

  // ── Schedule recommendations ──
  const recommendations: string[] = [];
  if (postsPerWeek > 7) {
    recommendations.push(`Reduce posting from ${Math.round(postsPerWeek)}/week to 4-5/week. Quality over quantity.`);
  }
  if (engagementTrend < -10) {
    recommendations.push('Consider a 2-3 day posting break to reset audience engagement patterns.');
  }
  if (commentTrend < -15) {
    recommendations.push('Shift content strategy to encourage more comments (questions, polls, controversial takes).');
  }
  if (fatigueLevel === 'none' || fatigueLevel === 'early') {
    recommendations.push('Current pace is sustainable. Focus on content quality optimization.');
  }
  if (shareTrend < -20) {
    recommendations.push('Create more share-worthy content (infographics, actionable tips, relatable moments).');
  }
  // Optimal frequency recommendation
  const optimalFrequency = fatigueScore > 40 ? 3 : fatigueScore > 20 ? 4 : 5;
  recommendations.push(`Recommended optimal posting frequency: ${optimalFrequency} posts per week.`);
  recommendations.push('Mix content types: 60% value content, 25% engagement posts, 15% promotional.');

  // ── Predicted next-period engagement ──
  const trendFactor = 1 + (engagementTrend / 200);
  const predictedEngagement = Math.round(meanEng * trendFactor * 100) / 100;

  return {
    success: true,
    data: {
      fatigueLevel,
      fatigueScore: Math.round(fatigueScore),
      fatigueSignals,
      analysis: {
        periodDays: Math.round(daysSpan),
        totalPosts: sorted.length,
        postsPerWeek: Math.round(postsPerWeek * 10) / 10,
        currentEngagementRate: Math.round(meanEng * 100) / 100,
        engagementTrend: Math.round(engagementTrend * 10) / 10,
        commentTrend: Math.round(commentTrend * 10) / 10,
        likeTrend: Math.round(likeTrend * 10) / 10,
        shareTrend: Math.round(shareTrend * 10) / 10,
        engagementVolatility: Math.round(coefficientOfVariation * 10) / 10,
        predictedNextEngagement: predictedEngagement,
      },
      scheduleRecommendations: recommendations,
      optimalSchedule: {
        postsPerWeek: optimalFrequency,
        restDays: Math.max(7 - optimalFrequency, 0),
        bestDays: ['Tuesday', 'Thursday', 'Saturday'].slice(0, Math.ceil(optimalFrequency / 2)),
      },
    },
    source: 'browser',
    featureId: 'F78',
  };
}

// =============================================================================
// Export
// =============================================================================
export const actionHubFeatures = {
  unifiedOAuthVault,
  aiGhostwriter,
  theActionSliderUI,
  engagementPriorityQueue,
  smartThreadSummarization,
  brandVoiceTrainer,
  automatedMediaResizer,
  agenticAutoPilotToggle,
  commentToContentPipeline,
  sentimentBasedResponseRouting,
  contextualCrossReferenceEngine,
  influencerMentionAutoResponse,
  crisisResponseProtocol,
  engagementFatiguePredictor,
};

export default actionHubFeatures;
