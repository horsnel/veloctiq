import type { FeatureResult } from '../../types';

// =============================================================================
// F79 — Content Architect
// =============================================================================
function contentArchitect(
  topic: string,
  platform: string,
  options: { contentGoal?: string; audienceLevel?: string; targetLength?: string } = {}
): FeatureResult {
  const {
    contentGoal = 'engage',
    audienceLevel = 'intermediate',
    targetLength = 'medium',
  } = options;

  const topicWords = topic.split(/\s+/).filter(w => w.length > 0);

  // ── Platform-specific configurations ──
  const platformConfigs: Record<string, {
    optimalLength: Record<string, { min: number; max: number; ideal: number }>;
    sectionCount: number;
    hookWindow: number;
    formatTypes: string[];
    engagementMultiplier: number;
  }> = {
    youtube: {
      optimalLength: { short: { min: 300, max: 2000, ideal: 800 }, medium: { min: 1000, max: 5000, ideal: 2500 }, long: { min: 3000, max: 15000, ideal: 8000 } },
      sectionCount: 5,
      hookWindow: 10,
      formatTypes: ['tutorial', 'listicle', 'story', 'comparison', 'deep_dive'],
      engagementMultiplier: 1.0,
    },
    instagram: {
      optimalLength: { short: { min: 50, max: 500, ideal: 200 }, medium: { min: 300, max: 1200, ideal: 700 }, long: { min: 1000, max: 2200, ideal: 1500 } },
      sectionCount: 3,
      hookWindow: 3,
      formatTypes: ['carousel', 'reel', 'single_post', 'story_series', 'guide'],
      engagementMultiplier: 1.3,
    },
    tiktok: {
      optimalLength: { short: { min: 30, max: 200, ideal: 100 }, medium: { min: 100, max: 600, ideal: 300 }, long: { min: 300, max: 1500, ideal: 800 } },
      sectionCount: 3,
      hookWindow: 2,
      formatTypes: ['short_video', 'storytelling', 'tutorial', 'trend_jack', 'duet'],
      engagementMultiplier: 1.5,
    },
    twitter: {
      optimalLength: { short: { min: 50, max: 280, ideal: 200 }, medium: { min: 280, max: 800, ideal: 500 }, long: { min: 800, max: 2500, ideal: 1500 } },
      sectionCount: 4,
      hookWindow: 2,
      formatTypes: ['thread', 'single_tweet', 'poll', 'quote_tweet', 'space_promo'],
      engagementMultiplier: 0.9,
    },
    linkedin: {
      optimalLength: { short: { min: 200, max: 800, ideal: 500 }, medium: { min: 800, max: 2500, ideal: 1500 }, long: { min: 2000, max: 5000, ideal: 3000 } },
      sectionCount: 4,
      hookWindow: 3,
      formatTypes: ['article', 'post', 'carousel_doc', 'poll', 'story'],
      engagementMultiplier: 0.7,
    },
  };

  const config = platformConfigs[platform] || platformConfigs.instagram;
  const lengthConfig = config.optimalLength[targetLength] || config.optimalLength.medium;

  // ── Hook generation ──
  const hookTemplates = [
    `Stop scrolling — here's what nobody tells you about ${topic}`,
    `${topicWords.length > 2 ? topic.slice(0, topic.lastIndexOf(' ')) : topic}: The complete truth in ${targetLength === 'short' ? '60 seconds' : targetLength === 'medium' ? '5 minutes' : '10 minutes'}`,
    `I spent weeks researching ${topic} so you don't have to. Here's what I found:`,
    `Everyone gets ${topic} wrong. Here's the right way 👇`,
    `The #1 mistake people make with ${topic} (and how to fix it):`,
    `If you're struggling with ${topic}, this is your sign to keep going. Here's why:`,
  ];

  const hooks = hookTemplates.map(hook => {
    const hasQuestion = hook.includes('?');
    const hasNumber = /\d/.test(hook);
    const hasEmoji = /[�-�][�-�]|[\u2600-\u27BF]|[\uFE00-\uFE0F]|[\u{1F300}-\u{1F9FF}]/u.test(hook);
    let hookScore = 50;
    if (hasQuestion) hookScore += 15;
    if (hasNumber) hookScore += 10;
    if (hasEmoji) hookScore += 5;
    if (hook.length < config.hookWindow * 15) hookScore += 10; // concise for platform
    if (hook.includes('mistake') || hook.includes('wrong') || hook.includes('truth')) hookScore += 15;
    return { hook, score: Math.min(100, hookScore) };
  }).sort((a, b) => b.score - a.score);

  // ── Section generation ──
  const sectionTypes: Record<string, string[]> = {
    engage: ['Hook / Attention Grab', 'Problem Statement', 'Main Insight', 'Proof / Example', 'Action Takeaway', 'Community Question'],
    educate: ['Introduction', 'Background Context', 'Core Concept 1', 'Core Concept 2', 'Practical Application', 'Summary & Resources'],
    entertain: ['Cold Open', 'Setup / Context', 'Escalation', 'Climax / Punchline', 'Reaction / Takeaway', 'Call to Action'],
    convert: ['Pain Point Hook', 'Agitate the Problem', 'Reveal the Solution', 'Social Proof', 'Offer / CTA', 'Urgency Close'],
  };

  const goalSections = sectionTypes[contentGoal] || sectionTypes.engage;
  const totalSections = config.sectionCount;

  const sections = goalSections.slice(0, totalSections).map((name, idx) => {
    const sectionLength = Math.round(lengthConfig.ideal / totalSections);
    const startWord = Math.round((idx / totalSections) * topicWords.length);
    const endWord = Math.round(((idx + 1) / totalSections) * topicWords.length);
    const sectionKeywords = topicWords.slice(startWord, endWord).join(' ') || topic;

    return {
      order: idx + 1,
      name,
      suggestedLength: `${Math.max(30, sectionLength - 50)}–${sectionLength + 50} words`,
      keywordFocus: sectionKeywords || topic,
      purpose: idx === 0 ? 'hook_attention' : idx === totalSections - 1 ? 'cta_closure' : 'value_delivery',
    };
  });

  // ── Recommended format ──
  const formatScores = config.formatTypes.map(fmt => {
    let score = 50;
    if (contentGoal === 'educate' && (fmt.includes('tutorial') || fmt.includes('guide'))) score += 25;
    if (contentGoal === 'engage' && (fmt.includes('story') || fmt.includes('poll'))) score += 20;
    if (contentGoal === 'convert' && fmt.includes('single')) score += 15;
    if (targetLength === 'short' && (fmt.includes('short') || fmt.includes('single'))) score += 15;
    if (targetLength === 'long' && (fmt.includes('thread') || fmt.includes('article') || fmt.includes('deep'))) score += 20;
    return { format: fmt, score: Math.min(100, score) };
  }).sort((a, b) => b.score - a.score);

  // ── Estimated engagement calculation ──
  const topicEngagement = topicWords.length > 3 ? 1.1 : 0.9;
  const goalMultiplier = { engage: 1.2, educate: 1.0, entertain: 1.4, convert: 0.8 }[contentGoal] || 1.0;
  const lengthPenalty = targetLength === 'long' ? 0.8 : 1.0;
  const estimatedEngagement = Math.round(
    (config.engagementMultiplier * topicEngagement * goalMultiplier * lengthPenalty) * 100
  );

  return {
    success: true,
    data: {
      topic,
      platform,
      contentGoal,
      audienceLevel,
      targetLength,
      architecture: {
        hooks,
        topHook: hooks[0] || null,
        sections,
        totalSections,
        recommendedFormat: formatScores[0] || null,
        formatRankings: formatScores,
      },
      length: {
        ...lengthConfig,
        unit: platform === 'youtube' || platform === 'tiktok' ? 'words' : 'characters',
      },
      estimatedEngagement,
      engagementRating: estimatedEngagement > 120 ? 'excellent' : estimatedEngagement > 80 ? 'good' : estimatedEngagement > 50 ? 'fair' : 'needs_work',
    },
    source: 'browser',
    featureId: 'F79',
  };
}

// =============================================================================
// F80 — Watermark Stripper
// =============================================================================
function watermarkStripper(image: {
  width: number;
  height: number;
  dominantColors?: Array<{ r: number; g: number; b: number; percentage: number }>;
  hasTextOverlay?: boolean;
  cornerRegions?: Array<{ corner: string; color: string; opacity: number }>;
}): FeatureResult {
  const { width, height } = image;
  const dominantColors = image.dominantColors || [
    { r: 255, g: 255, b: 255, percentage: 60 },
    { r: 128, g: 128, b: 128, percentage: 20 },
    { r: 0, g: 0, b: 0, percentage: 15 },
  ];

  // ── Detect watermark patterns ──
  const detections: Array<{
    type: string;
    region: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
    removalStrategy: string;
  }> = [];

  // Check corners for logo patterns (semi-transparent overlays)
  const corners = [
    { name: 'top_left', x: 0, y: 0, w: Math.round(width * 0.15), h: Math.round(height * 0.15) },
    { name: 'top_right', x: Math.round(width * 0.85), y: 0, w: Math.round(width * 0.15), h: Math.round(height * 0.15) },
    { name: 'bottom_left', x: 0, y: Math.round(height * 0.85), w: Math.round(width * 0.15), h: Math.round(height * 0.15) },
    { name: 'bottom_right', x: Math.round(width * 0.85), y: Math.round(height * 0.85), w: Math.round(width * 0.15), h: Math.round(height * 0.15) },
  ];

  corners.forEach(corner => {
    // Check if corner region has different dominant color than main (indicates overlay)
    const cornerPixels = corner.w * corner.h;
    const cornerRatio = cornerPixels / (width * height);
    if (cornerRatio > 0.02) {
      // Detect semi-transparent overlay by checking for unusual color presence in corners
      const semiTransparentColors = dominantColors.filter(c =>
        (c.r > 200 && c.g > 200 && c.b > 200 && c.percentage < 10) ||
        (c.r < 50 && c.g < 50 && c.b < 50 && c.percentage < 10)
      );
      if (semiTransparentColors.length > 0 && image.cornerRegions) {
        const cornerData = image.cornerRegions.find(cr => cr.corner === corner.name);
        if (cornerData && cornerData.opacity < 0.7) {
          detections.push({
            type: 'semi_transparent_overlay',
            region: corner.name,
            confidence: Math.round(70 + (1 - cornerData.opacity) * 30),
            severity: 'medium',
            removalStrategy: `Inpaint region (${corner.w}x${corner.h}px) at ${corner.name} using surrounding content texture`,
          });
        }
      }
    }
  });

  // Detect text watermarks (center or bottom-center patterns)
  if (image.hasTextOverlay !== false) {
    // Text watermarks often appear in repeating diagonal patterns or at bottom center
    const bottomCenterRegion = {
      x: Math.round(width * 0.3),
      y: Math.round(height * 0.88),
      w: Math.round(width * 0.4),
      h: Math.round(height * 0.08),
    };
    detections.push({
      type: 'text_watermark',
      region: 'bottom_center',
      confidence: 65,
      severity: 'medium',
      removalStrategy: `Content-aware fill of region (${bottomCenterRegion.w}x${bottomCenterRegion.h}px) at bottom-center. May require manual touch-up for complex backgrounds.`,
    });
  }

  // Check for full-width banner watermarks (common in stock photos)
  const bannerRegion = { y: Math.round(height * 0.92), h: Math.round(height * 0.05) };
  if (dominantColors.some(c => c.percentage > 5 && c.percentage < 15 && (c.r + c.g + c.b) / 3 > 200)) {
    detections.push({
      type: 'banner_watermark',
      region: 'bottom_full_width',
      confidence: 55,
      severity: 'low',
      removalStrategy: `Crop ${bannerRegion.h}px from bottom (loss: ${Math.round((bannerRegion.h / height) * 100)}% of height) or content-aware fill.`,
    });
  }

  // If no strong detections, check for subtle patterns
  if (detections.length === 0) {
    detections.push({
      type: 'diagonal_pattern',
      region: 'full_image',
      confidence: 30,
      severity: 'low',
      removalStrategy: 'Frequency domain filtering — detect and remove repeating diagonal patterns using FFT analysis.',
    });
  }

  // ── Compute removal recommendations ──
  const cropRecommendation: Array<{ strategy: string; region: string; dimensions: { width: number; height: number }; qualityLoss: number }> = [];
  const inpaintRecommendation: Array<{ strategy: string; region: string; complexity: string }> = [];

  detections.forEach(d => {
    if (d.type === 'semi_transparent_overlay') {
      inpaintRecommendation.push({
        strategy: 'inpaint',
        region: d.region,
        complexity: d.confidence > 80 ? 'low' : 'medium',
      });
    } else if (d.type === 'banner_watermark') {
      const cropH = Math.round(height * 0.05);
      cropRecommendation.push({
        strategy: 'crop_bottom',
        region: d.region,
        dimensions: { width, height: height - cropH },
        qualityLoss: Math.round((cropH / height) * 100),
      });
    } else if (d.type === 'text_watermark') {
      inpaintRecommendation.push({
        strategy: 'inpaint_content_aware',
        region: d.region,
        complexity: 'high',
      });
    }
  });

  // Calculate overall quality impact
  const maxConfidence = detections.length > 0 ? Math.max(...detections.map(d => d.confidence)) : 0;
  const watermarkDetected = maxConfidence > 50;
  const qualityPreservation = watermarkDetected
    ? Math.round(100 - (detections.reduce((s, d) => s + d.severity === 'high' ? 25 : d.severity === 'medium' ? 15 : 5, 0)))
    : 100;

  return {
    success: true,
    data: {
      imageDimensions: { width, height },
      watermarkDetected,
      detectionConfidence: maxConfidence,
      detections,
      removalStrategies: {
        crop: cropRecommendation,
        inpaint: inpaintRecommendation,
        recommended: detections.length > 0
          ? detections.sort((a, b) => b.confidence - a.confidence)[0].removalStrategy
          : 'No watermark detected — image appears clean.',
      },
      qualityAssessment: {
        qualityPreservation,
        postRemovalRating: qualityPreservation > 85 ? 'excellent' : qualityPreservation > 65 ? 'good' : qualityPreservation > 40 ? 'acceptable' : 'degraded',
        manualRetouchNeeded: detections.some(d => d.severity === 'high'),
      },
    },
    source: 'browser',
    featureId: 'F80',
  };
}

// =============================================================================
// F81 — The Video Auditor
// =============================================================================
function theVideoAuditor(video: {
  duration: number; // seconds
  resolution: { width: number; height: number };
  hasCaptions: boolean;
  hasIntro: boolean;
  hasOutro: boolean;
  chapterCount?: number;
  audioTrackCount?: number;
  averageBitrate?: number; // kbps
  fileSizes?: Array<{ segment: string; sizeMB: number }>;
}): FeatureResult {
  const { duration, resolution } = video;
  const durationMin = duration / 60;
  const isHD = resolution.width >= 1280 && resolution.height >= 720;
  const is4K = resolution.width >= 3840;
  const aspectRatio = resolution.width / resolution.height;

  // ── Pacing Analysis ──
  // Estimate cuts per minute based on content length and structure
  const estimatedCutsPerMinute = video.chapterCount
    ? Math.round((video.chapterCount * 2) / Math.max(durationMin, 1))
    : durationMin < 3 ? 8 : durationMin < 10 ? 5 : durationMin < 20 ? 3 : 2;

  const pacingRating = estimatedCutsPerMinute > 6 ? 'fast' : estimatedCutsPerMinute > 3 ? 'moderate' : 'slow';
  const idealCutsForLength = durationMin < 5 ? 12 : durationMin < 10 ? 8 : durationMin < 20 ? 5 : 3;
  const pacingScore = Math.round(100 - Math.abs(estimatedCutsPerMinute - idealCutsForLength) * 10);

  // ── Audio Quality Assessment ──
  const bitrate = video.averageBitrate || 128;
  const audioQuality = bitrate >= 320 ? 'excellent' : bitrate >= 256 ? 'good' : bitrate >= 128 ? 'acceptable' : 'poor';
  const audioScore = Math.min(100, Math.round(bitrate / 4));
  const hasMultipleTracks = (video.audioTrackCount || 1) > 1;
  const hasCaptions = video.hasCaptions;

  // ── Visual Quality Scoring ──
  const totalPixels = resolution.width * resolution.height;
  const megapixels = Math.round(totalPixels / 1_000_000 * 10) / 10;
  let visualScore = 50;
  if (is4K) visualScore += 30;
  else if (isHD) visualScore += 20;
  else visualScore += 5;
  if (aspectRatio >= 1.7 && aspectRatio <= 1.85) visualScore += 10; // 16:9 optimal
  else if (aspectRatio >= 0.55 && aspectRatio <= 0.6) visualScore += 8; // 9:16 for short-form
  if (hasCaptions) visualScore += 5;
  visualScore = Math.min(100, visualScore);

  // ── Content Structure Breakdown ──
  const introLength = durationMin * 0.08; // ~8% intro
  const outroLength = durationMin * 0.05; // ~5% outro
  const coreLength = durationMin - introLength - outroLength;
  const chapters = video.chapterCount || Math.max(1, Math.floor(coreLength / 3));
  const avgChapterLength = coreLength / Math.max(chapters, 1);

  const structureBreakdown = {
    intro: {
      estimatedLength: Math.round(introLength * 60),
      present: video.hasIntro,
      optimal: introLength < 0.2, // under 12 seconds
    },
    core: {
      estimatedLength: Math.round(coreLength * 60),
      chapters,
      avgChapterLength: Math.round(avgChapterLength * 60),
    },
    outro: {
      estimatedLength: Math.round(outroLength * 60),
      present: video.hasOutro,
      hasCTA: video.hasOutro,
    },
  };

  // ── Issues detection ──
  const issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; description: string; fix: string }> = [];

  if (!video.hasCaptions) {
    issues.push({ type: 'accessibility', severity: 'high', description: 'No captions/subtitles detected', fix: 'Add captions for accessibility and engagement (boosts watch time by 12%)' });
  }
  if (!video.hasIntro) {
    issues.push({ type: 'structure', severity: 'medium', description: 'No clear intro detected', fix: 'Add a 5-10 second intro establishing the topic and hooking the viewer' });
  }
  if (!video.hasOutro) {
    issues.push({ type: 'engagement', severity: 'medium', description: 'No outro or call-to-action detected', fix: 'Add an outro with subscribe prompt, next video suggestion, or engagement question' });
  }
  if (pacingScore < 60) {
    issues.push({ type: 'pacing', severity: 'medium', description: `Pacing is ${pacingRating} — ${estimatedCutsPerMinute} cuts/min vs ideal ${idealCutsForLength}`, fix: `Add more scene changes and visual variety. Target ~${idealCutsForLength} cuts per minute.` });
  }
  if (audioScore < 50) {
    issues.push({ type: 'audio', severity: 'high', description: `Audio bitrate ${bitrate}kbps — ${audioQuality} quality`, fix: 'Re-encode audio at 256kbps minimum (320kbps preferred)' });
  }
  if (!isHD) {
    issues.push({ type: 'visual', severity: 'low', description: `Resolution ${resolution.width}x${resolution.height} is below HD`, fix: 'Upload in 1080p or higher for best viewer experience' });
  }
  if (durationMin > 20 && chapters < 2) {
    issues.push({ type: 'structure', severity: 'low', description: `Long video (${Math.round(durationMin)}min) without chapters`, fix: 'Add chapter markers every 2-5 minutes for better navigation' });
  }
  if (!hasMultipleTracks) {
    issues.push({ type: 'audio', severity: 'low', description: 'Only single audio track detected', fix: 'Consider adding background music layer for production value' });
  }

  // ── Overall score ──
  const weights = { pacing: 0.2, audio: 0.25, visual: 0.25, structure: 0.2, accessibility: 0.1 };
  const structureScore = (video.hasIntro ? 30 : 0) + (video.hasOutro ? 30 : 0) + (chapters > 1 ? 20 : 0) + 20;
  const accessibilityScore = hasCaptions ? 100 : 30;
  const overallScore = Math.round(
    pacingScore * weights.pacing +
    audioScore * weights.audio +
    visualScore * weights.visual +
    structureScore * weights.structure +
    accessibilityScore * weights.accessibility
  );

  return {
    success: true,
    data: {
      overview: {
        duration: `${Math.floor(durationMin)}:${String(Math.round(duration % 60)).padStart(2, '0')}`,
        durationSeconds: duration,
        resolution: `${resolution.width}x${resolution.height}`,
        megapixels,
        isHD,
        is4K,
        aspectRatio: Math.round(aspectRatio * 100) / 100,
      },
      pacing: {
        estimatedCutsPerMinute,
        pacingRating,
        pacingScore,
        idealCutsPerMinute: idealCutsForLength,
      },
      audio: {
        bitrate,
        quality: audioQuality,
        score: audioScore,
        hasMultipleTracks,
        hasCaptions,
      },
      visual: {
        score: visualScore,
        qualityRating: visualScore > 80 ? 'excellent' : visualScore > 60 ? 'good' : visualScore > 40 ? 'acceptable' : 'poor',
      },
      structure: structureBreakdown,
      issues,
      overallScore,
      overallRating: overallScore > 80 ? 'excellent' : overallScore > 60 ? 'good' : overallScore > 40 ? 'needs_improvement' : 'poor',
    },
    source: 'browser',
    featureId: 'F81',
  };
}

// =============================================================================
// F82 — Thumbnail Oracle
// =============================================================================
function thumbnailOracle(thumbnail: {
  width: number;
  height: number;
  hasFace: boolean;
  faceSize?: number; // percentage of image
  dominantColors: Array<{ r: number; g: number; b: number; percentage: number }>;
  hasText: boolean;
  textOverlayCount?: number;
  estimatedTextReadability?: number; // 0-1
  emotionDetected?: string;
  compositionRule?: string; // 'rule_of_thirds', 'center', 'golden_ratio', 'symmetry'
}): FeatureResult {
  const { width, height, dominantColors } = thumbnail;
  const aspectRatio = width / height;

  // ── Face Analysis ──
  const faceScore = thumbnail.hasFace
    ? Math.min(100, 40 + (thumbnail.faceSize || 20) * 2 + (thumbnail.emotionDetected ? 20 : 0))
    : 15;
  const faceSizeOptimal = (thumbnail.faceSize || 0) >= 15 && (thumbnail.faceSize || 0) <= 50;

  // ── Color Contrast Analysis ──
  let maxContrast = 0;
  let avgBrightness = 0;
  for (let i = 0; i < dominantColors.length; i++) {
    for (let j = i + 1; j < dominantColors.length; j++) {
      const c1 = dominantColors[i];
      const c2 = dominantColors[j];
      const brightness1 = (c1.r * 0.299 + c1.g * 0.587 + c1.b * 0.114);
      const brightness2 = (c2.r * 0.299 + c2.g * 0.587 + c2.b * 0.114);
      const contrast = Math.abs(brightness1 - brightness2);
      maxContrast = Math.max(maxContrast, contrast);
      avgBrightness += (brightness1 + brightness2) / 2;
    }
  }
  avgBrightness = dominantColors.length > 0
    ? avgBrightness / (dominantColors.length * (dominantColors.length - 1) / 2)
    : 128;
  const contrastScore = Math.min(100, Math.round(maxContrast / 2.55));

  // ── Warm color detection (attracts attention) ──
  const warmColors = dominantColors.filter(c => c.r > c.b * 1.3 && c.r > 100);
  const warmColorBoost = warmColors.length > 0 ? 15 : 0;

  // ── Text Readability ──
  const textReadability = thumbnail.estimatedTextReadability ?? 0;
  const textScore = thumbnail.hasText
    ? Math.round(textReadability * 80 + 20)
    : 10;
  const textCountOptimal = !thumbnail.hasText || (thumbnail.textOverlayCount ?? 0) <= 6;

  // ── Emotion Analysis ──
  const emotionScores: Record<string, number> = {
    surprise: 95, fear: 80, joy: 85, anger: 75, disgust: 60,
    neutral: 40, sadness: 45, contempt: 50,
  };
  const emotionScore = thumbnail.emotionDetected
    ? (emotionScores[thumbnail.emotionDetected] || 50)
    : 20;

  // ── Composition Analysis ──
  const compositionScores: Record<string, number> = {
    rule_of_thirds: 90, golden_ratio: 85, center: 70, symmetry: 65,
  };
  const compositionScore = thumbnail.compositionRule
    ? (compositionScores[thumbnail.compositionRule] || 50)
    : 40;

  // ── Aspect Ratio Check ──
  const is16x9 = Math.abs(aspectRatio - 16 / 9) < 0.15;
  const aspectScore = is16x9 ? 100 : Math.max(50, 100 - Math.abs(aspectRatio - 16 / 9) * 50);

  // ── CTR Prediction ──
  const weights = {
    face: 0.25,
    contrast: 0.20,
    text: 0.15,
    emotion: 0.15,
    composition: 0.10,
    aspect: 0.05,
    warmColor: 0.10,
  };
  const ctrPrediction = Math.round(
    (faceScore * weights.face +
     contrastScore * weights.contrast +
     textScore * weights.text +
     emotionScore * weights.emotion +
     compositionScore * weights.composition +
     aspectScore * weights.aspect +
     warmColorBoost) * 10
  ) / 10;

  // ── Issues ──
  const issues: string[] = [];
  const strengths: string[] = [];
  if (!thumbnail.hasFace) issues.push('Add a human face — thumbnails with faces get 38% higher CTR');
  else if (faceSizeOptimal) strengths.push(`Face is well-sized (${thumbnail.faceSize}% of image)`);
  if (contrastScore < 50) issues.push('Increase color contrast — low contrast thumbnails blend into feeds');
  else strengths.push(`Strong color contrast (${contrastScore}/100)`);
  if (!thumbnail.hasText) issues.push('Add 2-5 words of text overlay for context');
  if (textCountOptimal && thumbnail.hasText) strengths.push('Text count is optimal');
  if (!thumbnail.emotionDetected) issues.push('Emotional expression on face increases CTR by 17%');
  else strengths.push(`Emotion "${thumbnail.emotionDetected}" detected — high-impact`);
  if (warmColorBoost > 0) strengths.push('Warm color tones detected — attention-grabbing');
  if (!is16x9) issues.push('Optimal thumbnail ratio is 16:9 for YouTube');

  return {
    success: true,
    data: {
      dimensions: { width, height, aspectRatio: Math.round(aspectRatio * 100) / 100 },
      scores: {
        face: { score: faceScore, optimal: faceSizeOptimal },
        contrast: { score: contrastScore, maxContrast: Math.round(maxContrast) },
        text: { score: textScore, optimal: textCountOptimal },
        emotion: { score: emotionScore, detected: thumbnail.emotionDetected || null },
        composition: { score: compositionScore, rule: thumbnail.compositionRule || 'unknown' },
        aspectRatio: { score: aspectScore, isOptimal: is16x9 },
      },
      ctrPrediction,
      ctrRating: ctrPrediction > 70 ? 'excellent' : ctrPrediction > 50 ? 'good' : ctrPrediction > 35 ? 'average' : 'needs_improvement',
      estimatedClickRate: `${(ctrPrediction / 100 * 15).toFixed(1)}%`,
      issues,
      strengths,
      quickWins: issues.slice(0, 3),
    },
    source: 'browser',
    featureId: 'F82',
  };
}

// =============================================================================
// F83 — Transcript Extractor & Copier
// =============================================================================
function transcriptExtractor(
  rawText: string,
  options: { speakers?: string[]; highlightKeywords?: string[] } = {}
): FeatureResult {
  const {
    speakers = ['Speaker A', 'Speaker B'],
    highlightKeywords = [],
  } = options;

  const paragraphs = rawText.split(/\n\n+/).filter(p => p.trim().length > 0);
  const sentences = rawText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalWords = rawText.split(/\s+/).filter(w => w).length;
  const durationEstimate = totalWords / 150; // ~150 words per minute speaking rate
  const durationMin = Math.floor(durationEstimate);
  const durationSec = Math.round((durationEstimate - durationMin) * 60);

  // ── Format with timestamps ──
  const words = rawText.split(/\s+/);
  let timeCursor = 0;

  const formattedTranscript = sentences.map((sentence) => {
    const wordCount = sentence.split(/\s+/).length;
    const sentenceDuration = wordCount / 2.5; // ~150 wpm = 2.5 words/sec
    const timestampMin = Math.floor(timeCursor / 60);
    const timestampSec = Math.floor(timeCursor % 60);
    const timestampMs = Math.round((timeCursor % 1) * 1000);
    const timestamp = `${String(timestampMin).padStart(2, '0')}:${String(timestampSec).padStart(2, '0')}.${String(timestampMs).padStart(3, '0')}`;

    timeCursor += sentenceDuration;

    // ── Speaker identification (round-robin based on paragraph boundaries) ──
    const currentParagraph = paragraphs.findIndex(p => p.includes(sentence.trim()));
    const speaker = speakers[currentParagraph % speakers.length] || speakers[0];

    // ── Keyword highlighting ──
    const lower = sentence.toLowerCase();
    const matchedKeywords = highlightKeywords.filter(kw => lower.includes(kw.toLowerCase()));

    return {
      timestamp,
      speaker,
      text: sentence.trim(),
      wordCount,
      highlightedKeywords: matchedKeywords,
      isHighlighted: matchedKeywords.length > 0,
    };
  });

  // ── Summary generation ──
  // Extract first and last sentence, and sentences with most keyword matches
  const keySentences = [...formattedTranscript]
    .sort((a, b) => b.highlightedKeywords.length - a.highlightedKeywords.length)
    .slice(0, 3)
    .map(s => s.text);

  const summary = [
    `Transcript duration: ~${durationMin}:${String(durationSec).padStart(2, '0')}`,
    `Total words: ${totalWords} across ${sentences.length} sentences`,
    `Speakers: ${speakers.join(', ')}`,
    `Key highlights: ${keySentences.slice(0, 2).join('. ')}.`,
  ].join('. ');

  // ── Speaker statistics ──
  const speakerStats = speakers.map(speaker => {
    const speakerEntries = formattedTranscript.filter(t => t.speaker === speaker);
    const totalWords = speakerEntries.reduce((s, e) => s + e.wordCount, 0);
    const talkTime = totalWords / 2.5;
    return {
      speaker,
      sentenceCount: speakerEntries.length,
      totalWords,
      talkPercentage: Math.round((talkTime / Math.max(timeCursor, 1)) * 100),
      avgWordsPerSentence: speakerEntries.length > 0
        ? Math.round(totalWords / speakerEntries.length)
        : 0,
    };
  });

  // ── Keyword density analysis ──
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length > 3) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
  });
  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count, density: Math.round((count / totalWords) * 10000) / 100 }));

  return {
    success: true,
    data: {
      transcript: formattedTranscript,
      metadata: {
        totalSentences: sentences.length,
        totalWords,
        totalParagraphs: paragraphs.length,
        estimatedDuration: `${durationMin}:${String(durationSec).padStart(2, '0')}`,
        speakersCount: speakers.length,
        speakingRate: `${Math.round(totalWords / Math.max(durationEstimate, 0.1))} words/min`,
      },
      summary,
      speakerStats,
      topKeywords,
      highlightedEntries: formattedTranscript.filter(e => e.isHighlighted),
      copyReadyText: formattedTranscript.map(e => `[${e.timestamp}] ${e.speaker}: ${e.text}`).join('\n'),
    },
    source: 'browser',
    featureId: 'F83',
  };
}

// =============================================================================
// F84 — SEO Meta-Generator
// =============================================================================
function seoMetaGenerator(
  content: string,
  options: { platform?: string; targetKeyword?: string; existingTitle?: string } = {}
): FeatureResult {
  const {
    platform = 'youtube',
    targetKeyword = '',
    existingTitle = '',
  } = options;

  const words = content.split(/\s+/).filter(w => w);
  const lowerContent = content.toLowerCase();

  // ── Extract keywords via frequency analysis ──
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'and', 'or', 'but', 'not', 'this', 'that', 'it', 'i', 'you', 'we', 'they', 'my', 'your', 'our', 'how', 'what', 'why', 'when', 'can', 'do', 'be', 'if', 'so', 'just', 'like', 'very', 'also', 'too', 'will', 'would', 'could', 'should', 'all', 'has', 'have', 'had', 'been', 'being', 'about', 'from', 'into', 'more', 'than', 'other', 'some', 'which', 'their', 'there', 'then', 'these', 'those']);
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length > 3 && !stopWords.has(clean)) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
  });
  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // ── Generate optimized titles ──
  const primaryKeyword = targetKeyword || topKeywords[0]?.word || 'content';
  const secondaryKeywords = topKeywords.slice(1, 4).map(k => k.word);
  const platformLimits: Record<string, { title: number; description: number; tags: number }> = {
    youtube: { title: 100, description: 5000, tags: 500 },
    tiktok: { title: 150, description: 2200, tags: 100 },
    instagram: { title: 2200, description: 2200, tags: 30 },
    twitter: { title: 280, description: 280, tags: 0 },
    linkedin: { title: 3000, description: 3000, tags: 0 },
  };
  const limits = platformLimits[platform] || platformLimits.youtube;

  // Power words for titles
  const powerWords = ['Ultimate', 'Complete', 'Proven', 'Secret', 'Essential', 'Master', 'Insider', 'Definitive', 'Powerful', 'Best'];
  const numberWords = ['7', '10', '5', '3', '2024', 'Top'];

  const titleCandidates: string[] = [];
  // Template 1: [Number] [Adjective] [Keyword] [Benefit]
  const pw = powerWords[Math.floor(topKeywords[0]?.word.length % powerWords.length)];
  const nw = numberWords[Math.floor(topKeywords[0]?.count % numberWords.length)];
  titleCandidates.push(`${nw} ${pw} ${primaryKeyword} Tips You Need in ${new Date().getFullYear()}`);
  // Template 2: How to [Keyword] — [Benefit]
  titleCandidates.push(`How to ${primaryKeyword}: ${pw} Guide for ${secondaryKeywords[0] || 'Beginners'}`);
  // Template 3: [Keyword] — [Emotional hook]
  titleCandidates.push(`${pw.charAt(0).toUpperCase() + pw.slice(1)} ${primaryKeyword}: What ${secondaryKeywords[0] || 'Everyone'} Gets Wrong`);
  // Template 4: [Keyword] in [Year]
  titleCandidates.push(`${primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)} in ${new Date().getFullYear()}: Everything You Need to Know`);

  const scoredTitles = titleCandidates.map(title => {
    const withinLimit = title.length <= limits.title;
    const hasNumber = /\d/.test(title);
    const hasPowerWord = powerWords.some(pw => title.includes(pw));
    const hasKeyword = title.toLowerCase().includes(primaryKeyword.toLowerCase());
    const frontLoaded = title.toLowerCase().indexOf(primaryKeyword.toLowerCase()) < title.length * 0.3;

    let score = 50;
    if (withinLimit) score += 10; else score -= 20;
    if (hasNumber) score += 15;
    if (hasPowerWord) score += 10;
    if (hasKeyword) score += 15;
    if (frontLoaded) score += 10;

    return { title, score: Math.min(100, score), withinLimit, length: title.length };
  }).sort((a, b) => b.score - a.score);

  // ── Generate description ──
  const descContent = words.slice(0, Math.min(words.length, 300)).join(' ');
  const descLimit = Math.min(limits.description, 160); // Meta description ~160 chars for search
  const description = descContent.length > descLimit
    ? descContent.slice(0, descLimit - 3) + '...'
    : descContent;
  const hasKeywordInDesc = description.toLowerCase().includes(primaryKeyword.toLowerCase());

  // ── Generate tags ──
  const tags = topKeywords
    .map(k => k.word)
    .filter(t => t.length > 2)
    .slice(0, platform === 'youtube' ? 15 : platform === 'tiktok' ? 8 : platform === 'instagram' ? 30 : 5);

  // ── SEO Score Calculation ──
  const keywordDensity = lowerContent.split(primaryKeyword.toLowerCase()).length - 1;
  const keywordDensityPercent = words.length > 0 ? (keywordDensity / words.length * 100) : 0;
  const optimalDensity = 1.5; // percent
  const densityScore = Math.max(0, 100 - Math.abs(keywordDensityPercent - optimalDensity) * 30);

  const titleScore = scoredTitles[0]?.score || 0;
  const descScore = hasKeywordInDesc ? 85 : 50;
  const tagScore = tags.length >= 3 ? 80 : 40;
  const lengthScore = words.length >= 300 ? 90 : words.length >= 150 ? 70 : 40;

  const seoScore = Math.round(
    titleScore * 0.25 +
    descScore * 0.2 +
    tagScore * 0.15 +
    densityScore * 0.2 +
    lengthScore * 0.2
  );

  return {
    success: true,
    data: {
      titleSuggestions: scoredTitles.slice(0, 4),
      recommendedTitle: scoredTitles[0]?.title || existingTitle,
      description: {
        text: description,
        length: description.length,
        maxLength: descLimit,
        withinLimit: description.length <= descLimit,
        hasKeyword: hasKeywordInDesc,
      },
      tags,
      keywordAnalysis: {
        primary: primaryKeyword,
        secondary: secondaryKeywords.slice(0, 5),
        density: Math.round(keywordDensityPercent * 100) / 100,
        densityRating: keywordDensityPercent >= 1 && keywordDensityPercent <= 3 ? 'optimal' : keywordDensityPercent > 3 ? 'over_optimized' : 'under_optimized',
      },
      seoScore,
      seoRating: seoScore > 80 ? 'excellent' : seoScore > 60 ? 'good' : seoScore > 40 ? 'fair' : 'needs_work',
      platform,
      platformLimits: limits,
      checklist: {
        titleHasKeyword: scoredTitles[0]?.title.toLowerCase().includes(primaryKeyword.toLowerCase()) || false,
        titleUnderLimit: scoredTitles[0]?.withinLimit || false,
        titleHasNumber: /\d/.test(scoredTitles[0]?.title || ''),
        descHasKeyword: hasKeywordInDesc,
        tagsPresent: tags.length > 0,
        contentLengthOk: words.length >= 200,
      },
    },
    source: 'browser',
    featureId: 'F84',
  };
}

// =============================================================================
// F85 — Predictive Retention Heatmaps
// =============================================================================
function predictiveRetentionHeatmaps(
  contentStructure: {
    sections: Array<{ name: string; type: string; wordCount: number }>;
    totalDuration: number; // seconds
    hookDescription?: string;
    hasCliffhanger?: boolean;
  }
): FeatureResult {
  const { sections, totalDuration } = contentStructure;
  const totalWords = sections.reduce((s, sec) => s + sec.wordCount, 0);
  const wordsPerSecond = totalWords / Math.max(totalDuration, 1);
  const totalDurationMin = totalDuration / 60;

  // ── Attention Hook Analysis ──
  const firstSection = sections[0];
  const hookDuration = (firstSection?.wordCount || 0) / Math.max(wordsPerSecond, 1);
  const hookWindow = 5; // seconds
  const hookStrength = hookDuration <= hookWindow ? 90 : hookDuration <= 10 ? 70 : hookDuration <= 15 ? 50 : 30;
  const hasCliffhanger = contentStructure.hasCliffhanger || false;

  // ── Complexity Curve ──
  const complexityCurve = sections.map((section, idx) => {
    const positionRatio = (idx + 1) / sections.length;
    let complexity = 50;

    // Intro sections typically lower complexity
    if (section.type === 'intro') complexity = 30;
    // Core content builds complexity
    else if (section.type === 'content') complexity = 40 + positionRatio * 30;
    // Technical / deep dives
    else if (section.type === 'technical') complexity = 70 + Math.random() * 20;
    // Conclusion simplifies
    else if (section.type === 'outro') complexity = 30;
    // Q&A / interactive
    else if (section.type === 'interactive') complexity = 35;

    return {
      section: section.name,
      position: Math.round(positionRatio * 100),
      complexity: Math.round(complexity),
      wordCount: section.wordCount,
    };
  });

  const avgComplexity = complexityCurve.reduce((s, c) => s + c.complexity, 0) / Math.max(complexityCurve.length, 1);
  const maxComplexity = Math.max(...complexityCurve.map(c => c.complexity));

  // ── Engagement Drop-off Prediction ──
  // Model: retention typically drops at intro→content transition, peaks at hooks, drops before outro
  const dropoffPoints: Array<{
    timestamp: string;
    section: string;
    predictedRetentionDrop: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    cause: string;
  }> = [];

  let timeCursor = 0;
  sections.forEach((section, idx) => {
    const sectionDuration = section.wordCount / Math.max(wordsPerSecond, 1);
    const startMin = Math.floor(timeCursor / 60);
    const startSec = Math.round(timeCursor % 60);
    const timestamp = `${startMin}:${String(startSec).padStart(2, '0')}`;

    let dropPercent = 0;
    let cause = '';

    // Intro to content transition — classic drop-off
    if (idx === 1 && section.type !== 'intro') {
      dropPercent = hookStrength > 70 ? 5 : hookStrength > 50 ? 12 : 20;
      cause = 'Intro to content transition — weak hook causes early exit';
    }

    // Mid-content attention dip (typically 30-50% through)
    const positionRatio = (idx + 1) / sections.length;
    if (positionRatio > 0.3 && positionRatio < 0.5 && avgComplexity > 60) {
      dropPercent = Math.max(dropPercent, 8);
      cause = cause || 'Mid-content complexity spike — viewer attention dips';
    }

    // Before outro — another natural exit point
    if (idx === sections.length - 2 && !hasCliffhanger) {
      dropPercent = Math.max(dropPercent, 10);
      cause = cause || 'Pre-outro drop-off — no cliffhanger to maintain interest';
    }

    // Long sections cause drop-off
    if (sectionDuration > 120) {
      dropPercent += 5;
      cause = cause || `Long section (${Math.round(sectionDuration)}s) — consider splitting`;
    }

    if (dropPercent > 3) {
      dropoffPoints.push({
        timestamp,
        section: section.name,
        predictedRetentionDrop: dropPercent,
        severity: dropPercent > 15 ? 'critical' : dropPercent > 10 ? 'high' : dropPercent > 5 ? 'medium' : 'low',
        cause,
      });
    }

    timeCursor += sectionDuration;
  });

  // ── Generate retention curve data (simulated) ──
  const retentionCurve: Array<{ timeSeconds: number; retentionPercent: number }> = [];
  const numPoints = 20;
  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * totalDuration;
    let retention = 100;

    // Natural decay curve (exponential)
    retention *= Math.exp(-0.3 * (t / totalDuration));

    // Hook boost in first 5 seconds
    if (t < 5) retention = Math.min(100, retention + hookStrength * 0.2);

    // Apply drop-offs
    dropoffPoints.forEach(dp => {
      const dpTime = parseInt(dp.timestamp.split(':')[0]) * 60 + parseInt(dp.timestamp.split(':')[1]);
      if (Math.abs(t - dpTime) < totalDuration / numPoints * 2) {
        retention -= dp.predictedRetentionDrop * 0.5;
      }
    });

    // Cliffhanger end boost
    if (t > totalDuration * 0.9 && hasCliffhanger) {
      retention += 5;
    }

    retentionCurve.push({
      timeSeconds: Math.round(t),
      retentionPercent: Math.max(5, Math.min(100, Math.round(retention * 10) / 10)),
    });
  }

  // ── Overall retention prediction ──
  const avgRetention = retentionCurve.reduce((s, r) => s + r.retentionPercent, 0) / retentionCurve.length;
  const finalRetention = retentionCurve[retentionCurve.length - 1]?.retentionPercent || 30;

  // ── Heatmap data (simplified grid) ──
  const heatmapGrid: Array<{ timeRange: string; attention: 'high' | 'medium' | 'low' | 'drop' }> = [];
  const segments = 8;
  for (let i = 0; i < segments; i++) {
    const startT = Math.round((i / segments) * totalDuration);
    const endT = Math.round(((i + 1) / segments) * totalDuration);
    const correspondingRetention = retentionCurve[Math.round((i + 0.5) / segments * numPoints)]?.retentionPercent || 50;
    heatmapGrid.push({
      timeRange: `${Math.floor(startT / 60)}:${String(startT % 60).padStart(2, '0')}–${Math.floor(endT / 60)}:${String(endT % 60).padStart(2, '0')}`,
      attention: correspondingRetention > 75 ? 'high' : correspondingRetention > 50 ? 'medium' : correspondingRetention > 30 ? 'low' : 'drop',
    });
  }

  // ── Recommendations ──
  const recommendations: string[] = [];
  if (hookStrength < 60) recommendations.push(`Strengthen your hook — first ${hookWindow}s are critical. Current hook strength: ${hookStrength}/100`);
  if (avgComplexity > 65) recommendations.push('Reduce mid-content complexity — average complexity is high. Add visual variety.');
  if (dropoffPoints.filter(d => d.severity === 'critical').length > 0) recommendations.push('Address critical drop-off points — add pattern interrupts or rehooks');
  if (!hasCliffhanger) recommendations.push('Add a cliffhanger or tease next content to improve end retention');
  if (sections.length < 3) recommendations.push('Break content into more distinct sections to maintain interest');
  if (totalDurationMin > 15) recommendations.push('Consider trimming — videos over 15 minutes see significantly lower average view duration');

  return {
    success: true,
    data: {
      retentionCurve,
      heatmapGrid,
      hookStrength,
      avgRetention: Math.round(avgRetention * 10) / 10,
      finalRetention,
      complexityCurve,
      avgComplexity: Math.round(avgComplexity),
      maxComplexity,
      dropoffPoints,
      overallRating: avgRetention > 70 ? 'excellent' : avgRetention > 50 ? 'good' : avgRetention > 35 ? 'fair' : 'poor',
      recommendations,
      estimatedAverageViewDuration: Math.round(totalDuration * (avgRetention / 100)),
    },
    source: 'browser',
    featureId: 'F85',
  };
}

// =============================================================================
// F86 — The Evergreen Re-Generator
// =============================================================================
function evergreenReGenerator(
  originalContent: {
    title: string;
    body: string;
    publishedAt: string;
    platform: string;
    originalPerformance?: number; // engagement score 0-100
  }
): FeatureResult {
  const { title, body, platform } = originalContent;
  const publishedDate = new Date(originalContent.publishedAt);
  const ageMs = Date.now() - publishedDate.getTime();
  const ageMonths = Math.floor(ageMs / (30 * 86_400_000));
  const ageYears = ageMonths / 12;
  const words = body.split(/\s+/).filter(w => w);
  const lower = body.toLowerCase();

  // ── Evergreen Potential Assessment ──
  // Time-sensitive indicators
  const timeSensitive = ['2023', '2024', 'this year', 'last month', 'yesterday', 'recently', 'breaking', 'update', 'new', 'latest', 'just announced'];
  const timeHits = timeSensitive.filter(ts => lower.includes(ts)).length;

  // Evergreen indicators
  const evergreenKeywords = ['how to', 'guide', 'tutorial', 'tips', 'best practices', 'principles', 'fundamentals', 'beginner', 'learn', 'step by step', 'ultimate', 'complete', 'comprehensive', 'strategies', 'techniques', 'methods'];
  const evergreenHits = evergreenKeywords.filter(ek => lower.includes(ek)).length;

  // ── Evergreen Score ──
  let evergreenScore = 50;
  evergreenScore += evergreenHits * 8;
  evergreenScore -= timeHits * 10;
  if (ageMonths > 6) evergreenScore -= (ageMonths - 6); // Older content degrades
  if (words.length > 500) evergreenScore += 10; // Long-form = more evergreen potential
  evergreenScore = Math.max(0, Math.min(100, evergreenScore));

  const isEvergreen = evergreenScore >= 60;

  // ── Generate refreshed variants ──
  const currentYear = new Date().getFullYear();
  const refreshAngleTemplates = [
    { angle: 'updated_for_year', title: `${title.replace(/\d{4}/g, String(currentYear))} (${currentYear} Update)`, description: 'Updated statistics, new examples, and current best practices' },
    { angle: 'deeper_dive', title: `${title} — The Deep Dive Edition`, description: 'Expanded content with advanced techniques and case studies' },
    { angle: 'platform_shift', title: `${title} — Now Optimized for ${platform.charAt(0).toUpperCase() + platform.slice(1)}`, description: 'Reformatted and optimized for current platform algorithms' },
    { angle: 'beginner_friendly', title: `Complete Beginner's Guide to ${title.replace(/^(How to |The |A )/i, '')}`, description: 'Simplified language, step-by-step breakdown, visual-heavy approach' },
    { angle: 'advanced', title: `Advanced ${title.replace(/^(How to |The |A |Beginner's )/i, '')} — Pro Level`, description: 'Skip the basics, focus on intermediate-to-advanced strategies' },
  ];

  // Only suggest relevant variants
  const variants = refreshAngleTemplates.filter(v => {
    if (v.angle === 'beginner_friendly' && lower.includes('advanced')) return false;
    if (v.angle === 'advanced' && lower.includes('beginner')) return false;
    if (v.angle === 'updated_for_year' && timeHits === 0) return true; // Good candidate
    return true;
  });

  // ── Identify outdated elements ──
  const outdatedElements: string[] = [];
  const yearRegex = /\b(20\d{2})\b/g;
  const yearMatches = body.match(yearRegex) || [];
  const outdatedYears = yearMatches.filter(y => parseInt(y) < currentYear - 1);
  if (outdatedYears.length > 0) {
    outdatedElements.push(`References to ${Array.from(new Set(outdatedYears)).join(', ')} should be updated to ${currentYear}`);
  }
  if (timeHits > 0) {
    outdatedElements.push(`Found ${timeHits} time-sensitive phrases that need updating`);
  }

  // ── Current trend angle suggestions ──
  const trendAngles: string[] = [];
  if (lower.includes('social media')) trendAngles.push('Add section on short-form video dominance and AI tools');
  if (lower.includes('marketing')) trendAngles.push('Include AI-powered marketing strategies and automation');
  if (lower.includes('design')) trendAngles.push('Cover AI design tools (Midjourney, DALL-E, Canva AI)');
  if (lower.includes('business')) trendAngles.push('Address remote work trends and digital transformation');
  if (lower.includes('tech') || lower.includes('software')) trendAngles.push('Update with latest tech stack and AI integration patterns');
  if (trendAngles.length === 0) trendAngles.push('Consider adding AI/current trends angle for freshness');

  // ── Performance potential estimate ──
  const perfBoost = isEvergreen ? 1.3 : 1.0;
  const agePenalty = ageMonths > 12 ? 0.7 : ageMonths > 6 ? 0.85 : 0.95;
  const estimatedNewPerformance = Math.round(
    ((originalContent.originalPerformance || 50) * perfBoost * agePenalty)
  );

  return {
    success: true,
    data: {
      evergreenScore,
      isEvergreen,
      evergreenRating: evergreenScore > 80 ? 'highly_evergreen' : evergreenScore > 60 ? 'moderately_evergreen' : evergreenScore > 40 ? 'somewhat_timeless' : 'time_sensitive',
      contentAge: { months: ageMonths, years: Math.round(ageYears * 10) / 10 },
      outdatedElements,
      refreshVariants: variants.map(v => ({
        ...v,
        estimatedPerformance: Math.round(estimatedNewPerformance * (0.9 + Math.random() * 0.2)),
      })),
      trendAngles,
      recommendedActions: [
        isEvergreen ? 'This content has strong evergreen potential — worth refreshing' : 'Content is somewhat time-sensitive — focus on updating rather than reusing',
        outdatedElements.length > 0 ? `Update ${outdatedElements.length} outdated element(s)` : 'No critical outdated elements found',
        ...trendAngles.slice(0, 2).map(t => `Add angle: ${t}`),
      ],
      estimatedNewPerformance,
      performanceBoost: Math.round(((estimatedNewPerformance - (originalContent.originalPerformance || 50)) / Math.max(originalContent.originalPerformance || 50, 1)) * 100),
    },
    source: 'browser',
    featureId: 'F86',
  };
}

// =============================================================================
// F87 — The Voice Cracks (Liminal)
// =============================================================================
function theVoiceCracks(
  transcriptText: string,
  options: { speakerName?: string; context?: string } = {}
): FeatureResult {
  const { speakerName = 'Speaker', context = 'general' } = options;
  const sentences = transcriptText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = transcriptText.split(/\s+/).filter(w => w);

  // ── Emotional Indicators Analysis ──
  const emotionalLexicon: Record<string, { words: string[]; emotion: string; intensity: number }> = {
    joy: { words: ['happy', 'excited', 'amazing', 'love', 'wonderful', 'thrilled', 'grateful', 'fantastic', 'great', 'beautiful'], emotion: 'joy', intensity: 0.8 },
    anxiety: { words: ['worried', 'nervous', 'stressed', 'anxious', 'uncertain', 'scared', 'afraid', 'tense', 'overwhelmed', 'panic'], emotion: 'anxiety', intensity: 0.9 },
    sadness: { words: ['sad', 'disappointed', 'heartbroken', 'lost', 'lonely', 'depressed', 'miss', 'regret', 'painful', 'struggle'], emotion: 'sadness', intensity: 0.7 },
    anger: { words: ['angry', 'frustrated', 'furious', 'annoyed', 'irritated', 'outraged', 'hate', 'disgusted', 'unfair', 'rage'], emotion: 'anger', intensity: 0.85 },
    passion: { words: ['passionate', 'dedicated', 'committed', 'driven', 'believe', 'powerful', 'change', 'impact', 'mission', 'fight'], emotion: 'passion', intensity: 0.75 },
    vulnerability: { words: ['honestly', 'admit', 'difficult', 'hard', 'struggle', 'weak', 'failure', 'mistake', 'sorry', 'ashamed'], emotion: 'vulnerability', intensity: 0.7 },
  };

  const emotionalMap: Array<{
    sentence: string;
    position: number;
    emotions: Array<{ emotion: string; intensity: number; confidence: number }>;
    dominantEmotion: string;
  }> = [];

  sentences.forEach((sentence, idx) => {
    const lower = sentence.toLowerCase();
    const detectedEmotions: Array<{ emotion: string; intensity: number; confidence: number }> = [];

    Object.values(emotionalLexicon).forEach(({ words: emotionWords, emotion, intensity }) => {
      const hits = emotionWords.filter(w => lower.includes(w));
      if (hits.length > 0) {
        const confidence = Math.min(1, hits.length * 0.25 + 0.3);
        detectedEmotions.push({ emotion, intensity, confidence });
      }
    });

    const dominant = detectedEmotions.length > 0
      ? detectedEmotions.sort((a, b) => b.confidence - a.confidence)[0].emotion
      : 'neutral';

    emotionalMap.push({
      sentence: sentence.trim().slice(0, 100),
      position: idx + 1,
      emotions: detectedEmotions,
      dominantEmotion: dominant,
    });
  });

  // ── Stress Markers ──
  const stressMarkers = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'sort of', 'I mean', 'right', 'so'];
  const fillerCount = stressMarkers.reduce((count, marker) => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = transcriptText.match(regex) || [];
    return count + matches.length;
  }, 0);
  const fillerRate = words.length > 0 ? (fillerCount / words.length) * 100 : 0;

  // Sentence length variance as stress indicator
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgSentenceLen = sentenceLengths.reduce((s, l) => s + l, 0) / Math.max(sentenceLengths.length, 1);
  const sentenceLengthVariance = sentenceLengths.reduce((s, l) => s + Math.pow(l - avgSentenceLen, 2), 0) / Math.max(sentenceLengths.length, 1);

  // ── Authenticity Signals ──
  const authenticitySignals: string[] = [];
  const vulnerabilityCount = emotionalMap.filter(e => e.dominantEmotion === 'vulnerability').length;
  const passionCount = emotionalMap.filter(e => e.dominantEmotion === 'passion').length;

  if (vulnerabilityCount > 0) authenticitySignals.push(`Vulnerability expressed in ${vulnerabilityCount} segment${vulnerabilityCount > 1 ? 's' : ''} — builds trust`);
  if (passionCount > 0) authenticitySignals.push(`Passionate language in ${passionCount} segment${passionCount > 1 ? 's' : ''} — shows conviction`);
  if (fillerRate < 2) authenticitySignals.push('Low filler word usage — indicates preparation and confidence');
  if (sentenceLengthVariance > 10) authenticitySignals.push('Varied sentence length — natural speech pattern');
  if (emotionalMap.filter(e => e.dominantEmotion !== 'neutral').length > sentences.length * 0.4) {
    authenticitySignals.push('High emotional range — authentic expression');
  }

  // ── Emotional Arc ──
  const emotionDistribution: Record<string, number> = {};
  emotionalMap.forEach(e => {
    emotionDistribution[e.dominantEmotion] = (emotionDistribution[e.dominantEmotion] || 0) + 1;
  });

  const emotionArc = {
    openingEmotion: emotionalMap[0]?.dominantEmotion || 'neutral',
    closingEmotion: emotionalMap[emotionalMap.length - 1]?.dominantEmotion || 'neutral',
    peakEmotion: Object.entries(emotionDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral',
    emotionalRange: Object.keys(emotionDistribution).filter(e => e !== 'neutral').length,
    distribution: emotionDistribution,
  };

  // ── Voice Cracks (high-stress moments) ──
  const voiceCracks = emotionalMap
    .filter(e => e.emotions.some(em => em.emotion === 'anxiety' || em.emotion === 'sadness' || em.emotion === 'vulnerability'))
    .map(e => ({
      position: e.position,
      sentence: e.sentence.slice(0, 80),
      likelyEmotion: e.dominantEmotion,
      intensity: Math.max(...e.emotions.map(em => em.intensity), 0),
    }));

  // ── Overall Voice Score ──
  const authenticityScore = Math.min(100,
    authenticitySignals.length * 15 +
    (vulnerabilityCount * 8) +
    (passionCount * 6) +
    (fillerRate < 3 ? 10 : 0)
  );
  const stressScore = Math.min(100, fillerRate * 8 + (sentenceLengthVariance > 15 ? 15 : sentenceLengthVariance));

  return {
    success: true,
    data: {
      speaker: speakerName,
      context,
      emotionalMap: emotionalMap.slice(0, 20),
      emotionalArc: emotionArc,
      voiceCracks,
      stressAnalysis: {
        fillerWordCount: fillerCount,
        fillerRate: Math.round(fillerRate * 100) / 100,
        stressLevel: fillerRate > 5 ? 'high' : fillerRate > 3 ? 'moderate' : fillerRate > 1.5 ? 'low' : 'minimal',
        stressScore: Math.round(stressScore),
        sentenceVariance: Math.round(sentenceLengthVariance * 10) / 10,
      },
      authenticity: {
        score: Math.round(authenticityScore),
        rating: authenticityScore > 70 ? 'highly_authentic' : authenticityScore > 45 ? 'moderately_authentic' : 'needs_work',
        signals: authenticitySignals,
        strengths: authenticitySignals.filter(s => s.includes('builds') || s.includes('shows') || s.includes('Natural')).length,
      },
      recommendations: [
        fillerRate > 4 ? 'Practice reducing filler words — they signal uncertainty' : null,
        vulnerabilityCount === 0 ? 'Consider adding vulnerable moments — they increase relatability' : null,
        emotionArc.peakEmotion === 'neutral' ? 'Content lacks emotional peaks — add storytelling or personal anecdotes' : null,
      ].filter(Boolean) as string[],
    },
    source: 'browser',
    featureId: 'F87',
  };
}

// =============================================================================
// F88 — The ASMR of Your Editing (Liminal)
// =============================================================================
function asmrOfEditing(
  editingData: {
    totalDuration: number; // seconds
    cuts: Array<{ timeSeconds: number; type: string }>;
    transitions: Array<{ fromTime: number; toTime: number; type: string }>;
    silenceSegments: Array<{ start: number; end: number; duration: number }>;
  }
): FeatureResult {
  const { totalDuration, cuts, transitions, silenceSegments } = editingData;
  const durationMin = totalDuration / 60;

  // ── Cut Frequency Analysis ──
  const cutsPerMinute = cuts.length / Math.max(durationMin, 1);
  const avgCutInterval = cuts.length > 1
    ? cuts.reduce((sum, c, i) => i === 0 ? 0 : sum + (c.timeSeconds - cuts[i - 1].timeSeconds), 0) / (cuts.length - 1)
    : totalDuration;

  // Cut type distribution
  const cutTypes: Record<string, number> = {};
  cuts.forEach(c => { cutTypes[c.type] = (cutTypes[c.type] || 0) + 1; });

  // Cut rhythm analysis — measure consistency of intervals
  const intervals: number[] = [];
  for (let i = 1; i < cuts.length; i++) {
    intervals.push(cuts[i].timeSeconds - cuts[i - 1].timeSeconds);
  }
  const avgInterval = intervals.length > 0 ? intervals.reduce((s, i) => s + i, 0) / intervals.length : 0;
  const intervalVariance = intervals.length > 0
    ? intervals.reduce((s, i) => s + Math.pow(i - avgInterval, 2), 0) / intervals.length
    : 0;
  const rhythmConsistency = intervals.length > 0
    ? Math.max(0, 100 - Math.sqrt(intervalVariance) * 5)
    : 0;

  // ── Transition Analysis ──
  const transitionTypes: Record<string, number> = {};
  transitions.forEach(t => { transitionTypes[t.type] = (transitionTypes[t.type] || 0) + 1; });

  const transitionVariety = Object.keys(transitionTypes).length;
  const avgTransitionLength = transitions.length > 0
    ? transitions.reduce((s, t) => s + (t.toTime - t.fromTime), 0) / transitions.length
    : 0;

  // ── Silence Usage ──
  const totalSilence = silenceSegments.reduce((s, seg) => s + seg.duration, 0);
  const silenceRatio = totalDuration > 0 ? totalSilence / totalDuration : 0;
  const avgSilenceLength = silenceSegments.length > 0
    ? totalSilence / silenceSegments.length
    : 0;

  // ── Rhythm Quality Scoring ──
  // Optimal: 3-6 cuts/min for medium-form, 6-12 for short-form
  const isShortForm = totalDuration < 120;
  const idealCutsRange = isShortForm ? { min: 6, max: 12 } : { min: 2, max: 6 };
  const cutsScore = cutsPerMinute >= idealCutsRange.min && cutsPerMinute <= idealCutsRange.max
    ? 100
    : cutsPerMinute > idealCutsRange.max
      ? Math.max(30, 100 - (cutsPerMinute - idealCutsRange.max) * 8)
      : Math.max(30, 50 + (cutsPerMinute - idealCutsRange.min) * 10);

  const silenceScore = silenceRatio < 0.02
    ? 70 // Too little silence — feels rushed
    : silenceRatio < 0.08
      ? 100 // Good silence usage
      : silenceRatio < 0.15
        ? 80 // Acceptable
        : Math.max(30, 60 - (silenceRatio - 0.15) * 200); // Too much silence

  const varietyScore = Math.min(100, transitionVariety * 20 + Math.min(Object.keys(cutTypes).length * 10, 40));
  const consistencyScore = Math.round(rhythmConsistency);

  const overallRhythmScore = Math.round(
    cutsScore * 0.35 +
    silenceScore * 0.25 +
    varietyScore * 0.2 +
    consistencyScore * 0.2
  );

  // ── Rhythm Pattern Detection ──
  let detectedPattern: string;
  if (rhythmConsistency > 80 && cutsPerMinute > 3) {
    detectedPattern = 'metronomic';
  } else if (rhythmConsistency > 60) {
    detectedPattern = 'steady_pulse';
  } else if (intervalVariance > 100 && cutsPerMinute > 5) {
    detectedPattern = 'erratic_energy';
  } else if (cutsPerMinute < 2) {
    detectedPattern = 'slow_contemplative';
  } else {
    detectedPattern = 'natural_flow';
  }

  // ── ASMR Score (editing "texture") ──
  // Higher variety + good silence + rhythmic = more satisfying editing
  const asmrScore = Math.round(
    (varietyScore * 0.3 +
     silenceScore * 0.25 +
     cutsScore * 0.25 +
     consistencyScore * 0.2)
  );

  const recommendations: string[] = [];
  if (cutsPerMinute > idealCutsRange.max) recommendations.push(`Cut frequency is high (${cutsPerMinute.toFixed(1)}/min) — consider longer takes for breathing room`);
  if (cutsPerMinute < idealCutsRange.min) recommendations.push(`Cut frequency is low (${cutsPerMinute.toFixed(1)}/min) — add more visual variety`);
  if (silenceRatio > 0.15) recommendations.push('Too much silence — consider filling gaps with B-roll, music, or narration');
  if (silenceRatio < 0.01) recommendations.push('Almost no silence — add pauses for emphasis and breathing');
  if (transitionVariety === 0) recommendations.push('No transitions detected — add cut transitions for smoother flow');
  if (rhythmConsistency < 40) recommendations.push('Inconsistent pacing — establish a clearer rhythm pattern');
  if (detectedPattern === 'erratic_energy') recommendations.push('Erratic cutting may fatigue viewers — find a rhythm anchor');

  return {
    success: true,
    data: {
      editingRhythm: {
        pattern: detectedPattern,
        cutsPerMinute: Math.round(cutsPerMinute * 10) / 10,
        avgCutInterval: Math.round(avgCutInterval * 10) / 10,
        rhythmConsistency: consistencyScore,
      },
      cutAnalysis: {
        totalCuts: cuts.length,
        cutTypes,
        score: Math.round(cutsScore),
      },
      transitionAnalysis: {
        totalTransitions: transitions.length,
        types: transitionTypes,
        variety: transitionVariety,
        avgLength: Math.round(avgTransitionLength * 10) / 10,
        score: Math.round(varietyScore),
      },
      silenceAnalysis: {
        totalSegments: silenceSegments.length,
        totalDuration: Math.round(totalSilence * 10) / 10,
        ratio: Math.round(silenceRatio * 100) / 100,
        avgLength: Math.round(avgSilenceLength * 10) / 10,
        score: Math.round(silenceScore),
      },
      overallRhythmScore,
      asmrScore,
      asmrRating: asmrScore > 75 ? 'satisfying' : asmrScore > 50 ? 'pleasant' : asmrScore > 30 ? 'rough' : 'jarring',
      recommendations,
    },
    source: 'browser',
    featureId: 'F88',
  };
}

// =============================================================================
// F89 — Video Autopsy: The Death Replay (Liminal)
// =============================================================================
function videoAutopsy(
  underperformer: {
    title: string;
    platform: string;
    publishedAt: string;
    duration: number; // seconds
    views: number;
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    avgViewDuration: number; // seconds
    thumbnailDescription?: string;
    hasHook?: boolean;
    postingTime?: string;
    competitorAvgViews?: number;
  }
): FeatureResult {
  const { views, likes, comments, shares, impressions, avgViewDuration, duration } = underperformer;

  // ── Engagement Metrics Calculation ──
  const likeRate = impressions > 0 ? (likes / impressions) * 100 : 0;
  const commentRate = impressions > 0 ? (comments / impressions) * 100 : 0;
  const shareRate = impressions > 0 ? (shares / impressions) * 100 : 0;
  const clickThroughRate = impressions > 0 ? (views / impressions) * 100 : 0;
  const viewDurationRate = duration > 0 ? (avgViewDuration / duration) * 100 : 0;
  const overallEngagementRate = impressions > 0
    ? ((likes + comments + shares * 2) / impressions) * 100
    : 0;

  // Benchmark values
  const benchmarks = {
    likeRate: 3,
    commentRate: 0.5,
    shareRate: 0.3,
    ctr: 8,
    retention: 50,
  };

  // ── Failure Point Identification ──
  const failurePoints: Array<{
    area: string;
    severity: 'critical' | 'major' | 'minor';
    score: number;
    benchmark: number;
    description: string;
    fix: string;
  }> = [];

  // CTR failure (thumbnail + title problem)
  if (clickThroughRate < benchmarks.ctr) {
    const severity = clickThroughRate < benchmarks.ctr * 0.3 ? 'critical' : clickThroughRate < benchmarks.ctr * 0.6 ? 'major' : 'minor';
    failurePoints.push({
      area: 'thumbnail_and_title',
      severity,
      score: Math.round(clickThroughRate * 10) / 10,
      benchmark: benchmarks.ctr,
      description: `CTR is ${clickThroughRate.toFixed(1)}% vs benchmark ${benchmarks.ctr}%. Most impressions aren't converting to views.`,
      fix: 'Redesign thumbnail with higher contrast, face emotion, and shorter text. Rewrite title with power words and numbers.',
    });
  }

  // Retention failure (content/hook problem)
  if (viewDurationRate < benchmarks.retention) {
    const severity = viewDurationRate < benchmarks.retention * 0.3 ? 'critical' : viewDurationRate < benchmarks.retention * 0.6 ? 'major' : 'minor';
    failurePoints.push({
      area: 'content_retention',
      severity,
      score: Math.round(viewDurationRate * 10) / 10,
      benchmark: benchmarks.retention,
      description: `View duration is ${viewDurationRate.toFixed(1)}% vs benchmark ${benchmarks.retention}%. Viewers are leaving early.`,
      fix: underperformer.hasHook === false
        ? 'Add a strong hook in the first 3 seconds. Open with a question, bold claim, or visual shock.'
        : 'Content pacing may be too slow. Add visual variety, cut dead segments, and add pattern interrupts.',
    });
  }

  // Engagement failure (content not resonating)
  if (overallEngagementRate < 2) {
    failurePoints.push({
      area: 'engagement_resonance',
      severity: overallEngagementRate < 1 ? 'major' : 'minor',
      score: Math.round(overallEngagementRate * 10) / 10,
      benchmark: 4,
      description: `Overall engagement is ${overallEngagementRate.toFixed(2)}% — content isn't prompting viewer interaction.`,
      fix: 'Add calls-to-action, ask questions, create debate-worthy moments, and end with engagement hooks.',
    });
  }

  // Timing analysis
  const postingHour = underperformer.postingTime
    ? parseInt(underperformer.postingTime.split(':')[0] || '12')
    : 12;
  const isOffPeak = postingHour < 6 || (postingHour > 10 && postingHour < 16);
  if (isOffPeak) {
    failurePoints.push({
      area: 'posting_timing',
      severity: 'minor',
      score: 40,
      benchmark: 80,
      description: `Published at ${underperformer.postingTime || 'unknown'} — off-peak hours reduce initial algorithmic boost.`,
      fix: 'Reschedule to peak hours: 6-9 AM, 12-2 PM, or 7-10 PM in your audience\'s timezone.',
    });
  }

  // ── Competitive comparison ──
  const competitorViews = underperformer.competitorAvgViews || (views * 3);
  const performanceVsCompetitors = views / Math.max(competitorViews, 1) * 100;

  // ── Cause of Death ──
  let causeOfDeath: string;
  const criticalFailures = failurePoints.filter(f => f.severity === 'critical');
  if (criticalFailures.length > 0) {
    causeOfDeath = criticalFailures[0].area === 'thumbnail_and_title'
      ? 'Thumbnail/Title Failure — nobody clicked'
      : 'Content Retention Failure — everyone left early';
  } else if (failurePoints.length === 0) {
    causeOfDeath = 'Algorithmic Suppression — content is good but wasn\'t distributed';
  } else {
    causeOfDeath = `Multiple Minor Issues — ${failurePoints.length} areas need improvement`;
  }

  // ── Revival Strategy ──
  const revivalSteps: string[] = [];
  if (failurePoints.some(f => f.area === 'thumbnail_and_title')) {
    revivalSteps.push('1. Create 3 new thumbnail variants and A/B test');
    revivalSteps.push('2. Rewrite title using: [Number] + [Power Word] + [Topic] + [Year]');
  }
  if (failurePoints.some(f => f.area === 'content_retention')) {
    revivalSteps.push('3. Re-edit first 30 seconds with a compelling hook');
    revivalSteps.push('4. Add chapter markers and reduce pacing gaps');
  }
  if (failurePoints.some(f => f.area === 'posting_timing')) {
    revivalSteps.push('5. Republish/re-share during peak hours');
  }
  revivalSteps.push('6. Cross-promote on Stories and other platforms');
  revivalSteps.push('7. Engage with first 50 comments to boost algorithmic signal');

  return {
    success: true,
    data: {
      performanceMetrics: {
        views,
        impressions,
        ctr: Math.round(clickThroughRate * 100) / 100,
        likeRate: Math.round(likeRate * 100) / 100,
        commentRate: Math.round(commentRate * 100) / 100,
        shareRate: Math.round(shareRate * 100) / 100,
        overallEngagementRate: Math.round(overallEngagementRate * 100) / 100,
        avgViewDuration,
        retentionRate: Math.round(viewDurationRate * 10) / 100,
      },
      failurePoints,
      causeOfDeath,
      severity: failurePoints.some(f => f.severity === 'critical') ? 'critical' : failurePoints.some(f => f.severity === 'major') ? 'major' : 'minor',
      performanceVsCompetitors: Math.round(performanceVsCompetitors * 10) / 10,
      revivalStrategy: revivalSteps,
      revivalDifficulty: failurePoints.filter(f => f.severity === 'critical').length > 1 ? 'high' : failurePoints.length > 2 ? 'medium' : 'low',
      likelihoodOfRevival: failurePoints.some(f => f.area === 'thumbnail_and_title') ? 'moderate' : 'low',
    },
    source: 'browser',
    featureId: 'F89',
  };
}

// =============================================================================
// F90 — Voice Crunchiness Detector
// =============================================================================
function voiceCrunchinessDetector(
  audioData: {
    sampleRate?: number;
    bitDepth?: number;
    channels?: number;
    bitrate?: number;
    fileSizeKB?: number;
    duration?: number; // seconds
    codecHint?: string;
    compressionLevel?: number; // 0-1
  }
): FeatureResult {
  const {
    sampleRate = 44100,
    bitDepth = 16,
    channels = 2,
    bitrate = 128,
    fileSizeKB = 5000,
    duration = 180,
    codecHint = 'unknown',
    compressionLevel = 0.5,
  } = audioData;

  // ── Bitrate Estimation & Quality ──
  const calculatedBitrate = fileSizeKB * 8 / Math.max(duration, 1); // kbps
  const effectiveBitrate = Math.max(calculatedBitrate, bitrate);

  let bitrateQuality: string;
  let bitrateScore: number;
  if (effectiveBitrate >= 320) { bitrateQuality = 'studio'; bitrateScore = 95; }
  else if (effectiveBitrate >= 256) { bitrateQuality = 'high'; bitrateScore = 85; }
  else if (effectiveBitrate >= 192) { bitrateQuality = 'good'; bitrateScore = 70; }
  else if (effectiveBitrate >= 128) { bitrateQuality = 'acceptable'; bitrateScore = 55; }
  else if (effectiveBitrate >= 96) { bitrateQuality = 'low'; bitrateScore = 35; }
  else { bitrateQuality = 'poor'; bitrateScore = 15; }

  // ── Sample Rate Analysis ──
  const sampleRateQuality = sampleRate >= 48000 ? 'high_definition'
    : sampleRate >= 44100 ? 'cd_quality'
      : sampleRate >= 22050 ? 'standard'
        : sampleRate >= 11025 ? 'low'
          : 'very_low';
  const sampleScore = sampleRate >= 48000 ? 100 : sampleRate >= 44100 ? 90 : sampleRate >= 22050 ? 60 : 30;

  // ── Bit Depth Analysis ──
  const bitDepthQuality = bitDepth >= 24 ? 'professional' : bitDepth >= 16 ? 'standard' : 'compressed';
  const bitDepthScore = bitDepth >= 24 ? 95 : bitDepth >= 16 ? 70 : 40;

  // ── Compression Artifact Detection ──
  // Lower bitrate + longer duration = more compression artifacts
  const compressionRatio = effectiveBitrate / 320; // ratio to lossless-like
  const artifactScore = Math.min(100, Math.round(compressionRatio * 80 + (1 - compressionLevel) * 20));

  let artifactLevel: string;
  if (artifactScore > 80) artifactLevel = 'minimal';
  else if (artifactScore > 60) artifactLevel = 'noticeable';
  else if (artifactScore > 40) artifactLevel = 'moderate';
  else artifactLevel = 'severe';

  // ── Frequency Analysis Estimation ──
  const nyquistFrequency = sampleRate / 2;
  const effectiveBandwidth = effectiveBitrate > 192 ? nyquistFrequency : nyquistFrequency * 0.6;
  const missingHighFreq = nyquistFrequency - effectiveBandwidth;

  // ── Codec Quality Assessment ──
  const codecScores: Record<string, number> = {
    aac: 90, mp3: 75, opus: 85, wav: 100, flac: 100, ogg: 80,
    wma: 65, aiff: 100, unknown: 60,
  };
  const codecScore = codecScores[codecHint.toLowerCase()] || 60;

  // ── Crunchiness Score (overall audio quality) ──
  const crunchinessScore = Math.round(
    bitrateScore * 0.30 +
    sampleScore * 0.15 +
    bitDepthScore * 0.10 +
    artifactScore * 0.25 +
    codecScore * 0.20
  );

  const crunchinessLevel = crunchinessScore > 85 ? 'crisp'
    : crunchinessScore > 65 ? 'clean'
      : crunchinessScore > 45 ? 'slightly_crunchy'
        : 'crunchy';

  // ── Issues ──
  const issues: Array<{ severity: string; description: string; fix: string }> = [];
  if (effectiveBitrate < 192) issues.push({ severity: 'high', description: `Bitrate ${Math.round(effectiveBitrate)}kbps is below recommended 192kbps`, fix: 'Re-encode at 256kbps (AAC) or 320kbps (MP3) minimum' });
  if (sampleRate < 44100) issues.push({ severity: 'medium', description: `Sample rate ${sampleRate}Hz is below CD quality`, fix: 'Record and export at 44.1kHz or 48kHz' });
  if (bitDepth < 16) issues.push({ severity: 'medium', description: `Bit depth ${bitDepth}-bit produces audible quantization noise`, fix: 'Use 16-bit minimum (24-bit preferred for production)' });
  if (artifactScore < 50) issues.push({ severity: 'high', description: 'Significant compression artifacts detected', fix: 'Use higher bitrate codec. AAC at 256kbps is optimal for streaming.' });
  if (channels < 2 && duration > 60) issues.push({ severity: 'low', description: 'Mono audio detected for long-form content', fix: 'Consider stereo for richer listening experience' });

  return {
    success: true,
    data: {
      overallScore: crunchinessScore,
      crunchinessLevel,
      qualityLabel: crunchinessLevel.replace(/_/g, ' '),
      metrics: {
        bitrate: { value: Math.round(effectiveBitrate), unit: 'kbps', quality: bitrateQuality, score: bitrateScore },
        sampleRate: { value: sampleRate, unit: 'Hz', quality: sampleRateQuality, score: sampleScore },
        bitDepth: { value: bitDepth, unit: 'bit', quality: bitDepthQuality, score: bitDepthScore },
        codec: { name: codecHint, score: codecScore },
        compression: { level: Math.round(compressionLevel * 100) / 100, artifactScore, artifactLevel },
      },
      frequency: {
        nyquist: nyquistFrequency,
        effectiveBandwidth: Math.round(effectiveBandwidth),
        missingHighFreq: Math.round(missingHighFreq),
      },
      issues,
      recommendations: [
        crunchinessScore < 50 ? 'Significant audio quality issues — re-record or re-encode recommended' : null,
        effectiveBitrate < 256 ? `Increase bitrate to 256-320kbps for ${crunchinessScore > 65 ? 'optimal' : 'acceptable'} quality` : null,
        sampleRate < 48000 ? 'Consider 48kHz sample rate for modern content platforms' : null,
      ].filter(Boolean) as string[],
    },
    source: 'browser',
    featureId: 'F90',
  };
}

// =============================================================================
// F91 — Thumbnail A/B Test Predictor
// =============================================================================
function thumbnailABTestPredictor(
  variantA: {
    hasFace: boolean;
    faceEmotion?: string;
    colorContrast: number; // 0-100
    textCount: number;
    textReadability: number; // 0-1
    compositionRule: string;
    dominantColors: string[];
    width: number;
    height: number;
  },
  variantB: {
    hasFace: boolean;
    faceEmotion?: string;
    colorContrast: number;
    textCount: number;
    textReadability: number;
    compositionRule: string;
    dominantColors: string[];
    width: number;
    height: number;
  }
): FeatureResult {
  // ── Score each variant ──
  const scoreVariant = (v: typeof variantA, label: string) => {
    let score = 0;
    const details: Record<string, { value: number; impact: string }> = {};

    // Face presence (huge factor — 38% CTR boost with faces)
    const faceScore = v.hasFace ? 25 : 5;
    score += faceScore;
    details.face = { value: faceScore, impact: v.hasFace ? 'Strong — faces increase CTR by ~38%' : 'Weak — no face detected' };

    // Emotion (adds ~17% CTR boost)
    const emotionScores: Record<string, number> = { surprise: 15, fear: 12, joy: 14, anger: 11, neutral: 5 };
    const emotionScore = v.faceEmotion ? (emotionScores[v.faceEmotion] || 8) : 3;
    score += emotionScore;
    details.emotion = { value: emotionScore, impact: v.faceEmotion ? `"${v.faceEmotion}" is high-impact` : 'No emotion detected' };

    // Color contrast
    const contrastScore = Math.min(20, v.colorContrast / 5);
    score += contrastScore;
    details.contrast = { value: contrastScore, impact: v.colorContrast > 60 ? 'High contrast — eye-catching' : 'Low contrast — may blend into feed' };

    // Text clarity
    const textScore = v.textCount === 0 ? 2 : v.textCount > 6 ? 5 : Math.min(15, v.textReadability * 15 + (v.textCount >= 2 && v.textCount <= 5 ? 3 : 0));
    score += textScore;
    details.text = { value: textScore, impact: v.textCount === 0 ? 'No text — missing context' : v.textCount > 6 ? 'Too much text — cluttered' : 'Good text balance' };

    // Composition
    const compScores: Record<string, number> = { rule_of_thirds: 12, golden_ratio: 10, center: 7, symmetry: 6 };
    const compScore = compScores[v.compositionRule] || 5;
    score += compScore;
    details.composition = { value: compScore, impact: `Composition "${v.compositionRule}" is ${compScore > 10 ? 'optimal' : 'acceptable'}` };

    // Color warmth (warm colors attract more attention)
    const warmColorCount = v.dominantColors.filter(c => ['red', 'orange', 'yellow', 'warm', 'gold'].some(w => c.includes(w))).length;
    const warmthScore = Math.min(8, warmColorCount * 4);
    score += warmthScore;
    details.colorWarmth = { value: warmthScore, impact: warmColorCount > 0 ? 'Warm tones — attention-grabbing' : 'Consider warmer accent colors' };

    return { label, totalScore: Math.round(score * 10) / 10, details };
  };

  const scoredA = scoreVariant(variantA, 'A');
  const scoredB = scoreVariant(variantB, 'B');

  // ── Direct comparisons ──
  const comparisons: Array<{ metric: string; variantA: number; variantB: number; winner: string; analysis: string }> = [];
  comparisons.push({
    metric: 'Face Presence',
    variantA: variantA.hasFace ? 1 : 0,
    variantB: variantB.hasFace ? 1 : 0,
    winner: variantA.hasFace === variantB.hasFace ? 'tie' : variantA.hasFace ? 'A' : 'B',
    analysis: 'Faces dramatically improve thumbnail CTR',
  });
  comparisons.push({
    metric: 'Color Contrast',
    variantA: variantA.colorContrast,
    variantB: variantB.colorContrast,
    winner: variantA.colorContrast > variantB.colorContrast ? 'A' : variantB.colorContrast > variantA.colorContrast ? 'B' : 'tie',
    analysis: `Higher contrast thumbnails stand out in crowded feeds`,
  });
  comparisons.push({
    metric: 'Text Clarity',
    variantA: Math.round(variantA.textReadability * 100),
    variantB: Math.round(variantB.textReadability * 100),
    winner: variantA.textReadability > variantB.textReadability ? 'A' : variantB.textReadability > variantA.textReadability ? 'B' : 'tie',
    analysis: 'Readable text provides context and boosts click-through',
  });
  comparisons.push({
    metric: 'Text Count',
    variantA: variantA.textCount,
    variantB: variantB.textCount,
    winner: (() => {
      const idealRange = [2, 5];
      const aDist = variantA.textCount < idealRange[0] ? idealRange[0] - variantA.textCount : variantA.textCount > idealRange[1] ? variantA.textCount - idealRange[1] : 0;
      const bDist = variantB.textCount < idealRange[0] ? idealRange[0] - variantB.textCount : variantB.textCount > idealRange[1] ? variantB.textCount - idealRange[1] : 0;
      return aDist < bDist ? 'A' : bDist < aDist ? 'B' : 'tie';
    })(),
    analysis: '2-5 text elements is the sweet spot',
  });

  // ── Prediction ──
  const scoreDiff = Math.abs(scoredA.totalScore - scoredB.totalScore);
  const predictedWinner = scoredA.totalScore > scoredB.totalScore ? 'A' : 'B';
  const confidence = scoreDiff > 15 ? 85 : scoreDiff > 8 ? 70 : scoreDiff > 3 ? 55 : 45;
  const predictedCTRBoost = scoreDiff * 0.5; // percentage point boost

  return {
    success: true,
    data: {
      variantA: { score: scoredA.totalScore, details: scoredA.details },
      variantB: { score: scoredB.totalScore, details: scoredB.details },
      comparisons,
      prediction: {
        winner: predictedWinner,
        loser: predictedWinner === 'A' ? 'B' : 'A',
        confidence: Math.round(confidence),
        scoreDifference: Math.round(scoreDiff * 10) / 10,
        predictedCTRBoost: Math.round(predictedCTRBoost * 100) / 100,
        recommendation: confidence > 70
          ? `Use Variant ${predictedWinner} with ${confidence}% confidence`
          : `Difference is small (${scoreDiff.toFixed(1)} points) — both variants are competitive`,
      },
      quickWins: [
        !variantA.hasFace && !variantB.hasFace ? 'Neither variant has a face — add one to the winning design' : null,
        variantA.colorContrast < 50 && variantB.colorContrast < 50 ? 'Both variants have low contrast — increase color saturation' : null,
        Math.max(variantA.textCount, variantB.textCount) > 6 ? 'Reduce text clutter on the variant with more text elements' : null,
      ].filter(Boolean) as string[],
    },
    source: 'browser',
    featureId: 'F91',
  };
}

// =============================================================================
// F92 — Title Optimizer / Viral Score Checker
// =============================================================================
function titleOptimizer(
  title: string,
  options: { platform?: string; niche?: string } = {}
): FeatureResult {
  const { platform = 'youtube' } = options;
  const lower = title.toLowerCase();
  const words = title.split(/\s+/).filter(w => w);

  // ── Virality Factor Analysis ──
  // 1. Power Words
  const powerWords = ['ultimate', 'secret', 'proven', 'essential', 'unbelievable', 'mind-blowing', 'insane', 'shocking', 'genius', 'master', 'hack', 'trick', 'mistake', 'truth', 'exposed', 'legendary', 'powerful', 'deadly', 'critical', 'emergency'];
  const powerWordHits = powerWords.filter(pw => lower.includes(pw));
  const powerWordScore = Math.min(100, powerWordHits.length * 20);

  // 2. Emotional Triggers
  const emotionWords = ['amazing', 'incredible', 'heartbreaking', 'inspiring', 'devastating', 'beautiful', 'terrifying', 'hilarious', 'outrageous', 'emotional', 'emotional', 'rage', 'joy', 'fear', 'hope', 'love', 'hate'];
  const emotionHits = emotionWords.filter(ew => lower.includes(ew));
  const emotionScore = Math.min(100, emotionHits.length * 18);

  // 3. Curiosity Gap
  const curiosityPatterns = [/this$/, /these$/, /why$/, /how$/, /\.\.\./, /you won't/, /nobody tells/, /what happens/, /the truth about/, /things you didn't know/];
  const curiosityHits = curiosityPatterns.filter(p => p.test(lower));
  const curiosityScore = Math.min(100, curiosityHits.length * 25);

  // 4. Optimal Length
  const optimalLengths: Record<string, { min: number; max: number; ideal: number }> = {
    youtube: { min: 40, max: 70, ideal: 55 },
    tiktok: { min: 20, max: 50, ideal: 35 },
    instagram: { min: 30, max: 60, ideal: 45 },
    twitter: { min: 50, max: 80, ideal: 65 },
    linkedin: { min: 60, max: 120, ideal: 85 },
  };
  const optLen = optimalLengths[platform] || optimalLengths.youtube;
  const lengthDeviation = Math.abs(words.length - optLen.ideal) / optLen.ideal;
  const lengthScore = Math.max(0, Math.round(100 - lengthDeviation * 80));

  // 5. Number Usage
  const numberCount = (title.match(/\d+/g) || []).length;
  const hasNumberRange = /\d+[-–]\d+/.test(title); // "5-10"
  const numberScore = Math.min(100, numberCount * 30 + (hasNumberRange ? 25 : 0) + (numberCount > 0 ? 10 : 0));

  // 6. Keyword Placement (front-loaded)
  const importantWords = [...powerWordHits, ...emotionHits].map(w => w.toLowerCase());
  const firstFiveWords = words.slice(0, 5).map(w => w.toLowerCase());
  const frontLoadedKeywords = importantWords.filter(kw => firstFiveWords.some(fw => fw.includes(kw)));
  const keywordPlacementScore = Math.min(100, frontLoadedKeywords.length * 25 + 20);

  // ── Composite Viral Score ──
  const weights = {
    powerWords: 0.20,
    emotionalTriggers: 0.15,
    curiosityGap: 0.25,
    optimalLength: 0.10,
    numberUsage: 0.15,
    keywordPlacement: 0.15,
  };
  const viralScore = Math.round(
    powerWordScore * weights.powerWords +
    emotionScore * weights.emotionalTriggers +
    curiosityScore * weights.curiosityGap +
    lengthScore * weights.optimalLength +
    numberScore * weights.numberUsage +
    keywordPlacementScore * weights.keywordPlacement
  );

  // ── Generate Optimized Suggestions ──
  const baseTopic = words.filter(w => w.length > 3 && !powerWords.some(pw => w.toLowerCase().includes(pw))).join(' ');
  const currentYear = new Date().getFullYear();

  const suggestions: string[] = [];
  // Suggestion 1: Add power word + number
  if (powerWordHits.length === 0) {
    suggestions.push(`${Math.floor(Math.random() * 7) + 3} ${powerWords[Math.floor(baseTopic.length % powerWords.length)]} ${title.charAt(0).toUpperCase() + title.slice(1)} (${currentYear})`);
  }
  // Suggestion 2: Add curiosity gap
  if (curiosityHits.length === 0) {
    suggestions.push(`${title} — Here's What Nobody Tells You`);
  }
  // Suggestion 3: Number-focused
  if (numberCount === 0) {
    suggestions.push(`${Math.floor(Math.random() * 10) + 5} ${title.charAt(0).toUpperCase() + title.slice(1)} Mistakes That Are Costing You`);
  }
  // Suggestion 4: Emotional hook
  if (emotionHits.length === 0) {
    suggestions.push(`The ${emotionWords[Math.floor(baseTopic.length % emotionWords.length)]} Truth About ${title.charAt(0).toUpperCase() + title.slice(1)}`);
  }
  // Suggestion 5: Urgency
  suggestions.push(`STOP: ${title} — Do This Instead (${currentYear})`);

  // Score each suggestion
  const scoredSuggestions = suggestions.map(s => {
    const sWords = s.split(/\s+/).length;
    const sPower = powerWords.filter(pw => s.toLowerCase().includes(pw)).length;
    const sEmotion = emotionWords.filter(ew => s.toLowerCase().includes(ew)).length;
    const sNumber = (s.match(/\d+/g) || []).length;
    const sCuriosity = curiosityPatterns.filter(p => p.test(s.toLowerCase())).length;
    const sLenDev = Math.abs(sWords - optLen.ideal) / optLen.ideal;
    const sScore = Math.round(
      Math.min(100, sPower * 15) * 0.2 +
      Math.min(100, sEmotion * 15) * 0.15 +
      Math.min(100, sCuriosity * 25) * 0.25 +
      Math.max(0, 100 - sLenDev * 80) * 0.1 +
      Math.min(100, sNumber * 30) * 0.15 +
      50 * 0.15
    );
    return { title: s, score: sScore, wordCount: sWords };
  }).sort((a, b) => b.score - a.score);

  // ── Limit check ──
  const platformLimits: Record<string, number> = { youtube: 100, tiktok: 150, instagram: 2200, twitter: 280, linkedin: 3000 };
  const charLimit = platformLimits[platform] || 100;
  const withinLimit = title.length <= charLimit;

  return {
    success: true,
    data: {
      originalTitle: title,
      viralScore,
      viralRating: viralScore > 75 ? 'viral_potential' : viralScore > 50 ? 'strong' : viralScore > 30 ? 'moderate' : 'needs_optimization',
      factorScores: {
        powerWords: { score: powerWordScore, found: powerWordHits, suggestion: powerWordHits.length > 0 ? 'Good power word usage' : 'Add power words like "ultimate", "proven", "secret"' },
        emotionalTriggers: { score: emotionScore, found: emotionHits, suggestion: emotionHits.length > 0 ? 'Emotional language present' : 'Add emotional words to trigger clicks' },
        curiosityGap: { score: curiosityScore, found: curiosityHits.length, suggestion: curiosityHits.length > 0 ? 'Good curiosity gap' : 'Create a curiosity gap with "..." or unanswered question' },
        optimalLength: { score: lengthScore, wordCount: words.length, ideal: optLen, suggestion: `Optimal length is ${optLen.ideal} words (currently ${words.length})` },
        numberUsage: { score: numberScore, count: numberCount, suggestion: numberCount > 0 ? 'Numbers present — good for click-through' : 'Add specific numbers (e.g., "7 Tips", "in 2024")' },
        keywordPlacement: { score: keywordPlacementScore, frontLoaded: frontLoadedKeywords, suggestion: frontLoadedKeywords.length > 0 ? 'Important words are front-loaded' : 'Move key words to the beginning of the title' },
      },
      optimizedSuggestions: scoredSuggestions.slice(0, 5),
      bestSuggestion: scoredSuggestions[0] || null,
      platform: { name: platform, charLimit, withinLimit },
    },
    source: 'browser',
    featureId: 'F92',
  };
}

// =============================================================================
// F93 — Hashtag/Keyword Extractor
// =============================================================================
function hashtagKeywordExtractor(
  content: string,
  options: { platform?: string; existingTags?: string[] } = {}
): FeatureResult {
  const { platform = 'instagram', existingTags = [] } = options;

  const words = content.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'and', 'or', 'but', 'not', 'this', 'that', 'it', 'i', 'you', 'we', 'they', 'my', 'your', 'our', 'how', 'what', 'why', 'when', 'can', 'do', 'be', 'if', 'so', 'just', 'like', 'very', 'also', 'too', 'will', 'would', 'could', 'should', 'all', 'has', 'have', 'had', 'been', 'being', 'about', 'from', 'into', 'more', 'than', 'other', 'some', 'which', 'their', 'there', 'then', 'these', 'those']);

  // ── Keyword Extraction via TF scoring ──
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    const clean = w.replace(/[^a-z0-9]/g, '');
    if (clean.length > 2 && !stopWords.has(clean)) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });

  // Bigram extraction
  const bigrams: Record<string, number> = {};
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i].replace(/[^a-z0-9]/g, '');
    const w2 = words[i + 1].replace(/[^a-z0-9]/g, '');
    if (w1.length > 2 && w2.length > 2 && !stopWords.has(w1) && !stopWords.has(w2)) {
      const bigram = `${w1} ${w2}`;
      bigrams[bigram] = (bigrams[bigram] || 0) + 1;
    }
  }

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, freq]) => ({ word, frequency: freq, type: 'unigram' }));

  const topBigrams = Object.entries(bigrams)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase, freq]) => ({ word: phrase, frequency: freq, type: 'bigram' }));

  const allKeywords = [...topWords, ...topBigrams];

  // ── Categorize keywords ──
  const nicheKeywords = allKeywords.filter(k => k.frequency >= 2).map(k => k.word);
  const trendingKeywords = ['trending', 'viral', 'viral2024', 'fyp', 'explore', 'foryou', 'foryoupage', 'reels', 'new', 'latest'].filter(tw => content.toLowerCase().includes(tw));
  const brandedKeywords = existingTags.filter(t => t.startsWith('@') || /^[A-Z]/.test(t));

  // ── Generate platform-specific hashtag sets ──
  const platformTagLimits: Record<string, { hashtags: number; tags: number; description: string }> = {
    instagram: { hashtags: 30, tags: 30, description: 'Instagram allows up to 30 hashtags. Mix 60% niche, 25% trending, 15% branded.' },
    tiktok: { hashtags: 8, tags: 8, description: 'TikTok recommends 3-5 hashtags for best reach. 8 max.' },
    youtube: { hashtags: 15, tags: 3, description: 'YouTube tags are less important. Focus on 3-5 keyword tags in description.' },
    twitter: { hashtags: 5, tags: 2, description: 'Twitter works best with 1-3 hashtags. More than 5 hurts engagement.' },
    linkedin: { hashtags: 5, tags: 3, description: 'LinkedIn recommends 3-5 hashtags for optimal reach.' },
  };

  const tagConfig = platformTagLimits[platform] || platformTagLimits.instagram;
  const baseHashtags = nicheKeywords.map(k => `#${k.replace(/\s+/g, '')}`);

  // Build hashtag set
  const hashtagSet: string[] = [];
  const usedTags = new Set<string>();

  // Add niche hashtags (highest value)
  const nicheHashtags = baseHashtags.filter(h => !usedTags.has(h));
  nicheHashtags.slice(0, Math.ceil(tagConfig.hashtags * 0.6)).forEach(h => {
    hashtagSet.push(h);
    usedTags.add(h);
  });

  // Add trending hashtags
  const trendingHashtags = trendingKeywords.map(t => `#${t}`);
  trendingHashtags.forEach(h => {
    if (hashtagSet.length < tagConfig.hashtags && !usedTags.has(h)) {
      hashtagSet.push(h);
      usedTags.add(h);
    }
  });

  // Fill remaining with generated relevance tags
  const fillerTags = ['contentcreator', 'digitalmarketing', 'socialmediatips', 'growthtips', 'creatorlife', 'onlinebusiness', 'contentstrategy', 'socialmediagrowth', 'digitalcreator', 'creator'];
  fillerTags.forEach(h => {
    if (hashtagSet.length < tagConfig.hashtags && !usedTags.has(h)) {
      hashtagSet.push(`#${h}`);
      usedTags.add(h);
    }
  });

  // ── Keyword categorization ──
  const categorized: Record<string, string[]> = {
    niche: nicheKeywords.slice(0, 10),
    trending: trendingKeywords.length > 0 ? trendingKeywords : ['trending', 'viral'],
    branded: brandedKeywords.length > 0 ? brandedKeywords : [],
    semantic: topBigrams.slice(0, 5).map(b => b.word),
  };

  return {
    success: true,
    data: {
      extractedKeywords: allKeywords.slice(0, 25),
      categorized,
      hashtagSet: hashtagSet.slice(0, tagConfig.hashtags),
      platform: {
        name: platform,
        maxHashtags: tagConfig.hashtags,
        currentCount: Math.min(hashtagSet.length, tagConfig.hashtags),
        description: tagConfig.description,
      },
      topKeywords: topWords.slice(0, 8),
      topPhrases: topBigrams.slice(0, 5),
      recommendations: [
        nicheKeywords.length < 3 ? 'Content is too broad — focus on specific niche topics for better hashtag targeting' : null,
        trendingKeywords.length === 0 ? 'No trending keywords detected — consider adding relevant trending hashtags' : `Include trending tags: ${trendingKeywords.slice(0, 2).map(t => `#${t}`).join(', ')}`,
        hashtagSet.length < tagConfig.hashtags * 0.5 ? `Only ${hashtagSet.length} hashtags generated — add more niche-specific tags` : null,
      ].filter(Boolean) as string[],
    },
    source: 'browser',
    featureId: 'F93',
  };
}

// =============================================================================
// F94 — Content Rhythm Composer
// =============================================================================
function contentRhythmComposer(
  postingHistory: Array<{ date: string; type: string; platform: string; engagementRate?: number }>,
  options: { platforms?: string[]; contentTypes?: string[] } = {}
): FeatureResult {
  const { platforms = ['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin'] } = options;
  const { contentTypes = ['educational', 'entertainment', 'engagement', 'promotional'] } = options;

  const now = new Date();
  const last30Days = postingHistory.filter(p => now.getTime() - new Date(p.date).getTime() <= 30 * 86_400_000);

  // ── Current rhythm analysis ──
  const postsByDay: Record<string, number> = {};
  const postsByType: Record<string, number> = {};
  const postsByPlatform: Record<string, number> = {};
  const dayEngagement: Record<string, { total: number; count: number }> = {};

  last30Days.forEach(post => {
    const day = new Date(post.date).toLocaleDateString('en', { weekday: 'long' });
    postsByDay[day] = (postsByDay[day] || 0) + 1;
    postsByType[post.type] = (postsByType[post.type] || 0) + 1;
    postsByPlatform[post.platform] = (postsByPlatform[post.platform] || 0) + 1;
    if (!dayEngagement[day]) dayEngagement[day] = { total: 0, count: 0 };
    if (post.engagementRate !== undefined) {
      dayEngagement[day].total += post.engagementRate;
      dayEngagement[day].count += 1;
    }
  });

  const totalPosts = last30Days.length;
  const postsPerWeek = totalPosts / 4.33;

  // ── Find best performing days ──
  const dayPerformance = Object.entries(dayEngagement)
    .map(([day, data]) => ({
      day,
      avgEngagement: data.count > 0 ? data.total / data.count : 0,
      postCount: postsByDay[day] || 0,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  const bestDays = dayPerformance.filter(d => d.postCount > 0).slice(0, 3).map(d => d.day);
  const worstDays = dayPerformance.filter(d => d.postCount > 0).slice(-2).map(d => d.day);

  // ── Content type rotation analysis ──
  const currentTypeDistribution: Record<string, number> = {};
  contentTypes.forEach(ct => {
    currentTypeDistribution[ct] = postsByType[ct] || 0;
  });

  // Recommended ratio
  const recommendedRatio: Record<string, number> = {
    educational: 0.35,
    entertainment: 0.25,
    engagement: 0.25,
    promotional: 0.15,
  };

  const typeRecommendations = contentTypes.map(ct => ({
    type: ct,
    current: currentTypeDistribution[ct],
    currentPercentage: totalPosts > 0 ? Math.round((currentTypeDistribution[ct] / totalPosts) * 100) : 0,
    recommendedPercentage: Math.round(recommendedRatio[ct] * 100),
    gap: Math.round((recommendedRatio[ct] - (totalPosts > 0 ? currentTypeDistribution[ct] / totalPosts : 0)) * 100),
    action: (currentTypeDistribution[ct] / Math.max(totalPosts, 1)) < recommendedRatio[ct] - 0.05
      ? 'Increase this content type'
      : (currentTypeDistribution[ct] / Math.max(totalPosts, 1)) > recommendedRatio[ct] + 0.1
        ? 'Slightly reduce this content type'
        : 'Good balance',
  }));

  // ── Optimal frequency recommendation ──
  let optimalWeeklyPosts: number;
  if (postsPerWeek < 2) optimalWeeklyPosts = 3;
  else if (postsPerWeek < 5) optimalWeeklyPosts = 5;
  else if (postsPerWeek < 8) optimalWeeklyPosts = 7;
  else if (postsPerWeek > 14) optimalWeeklyPosts = 10;
  else optimalWeeklyPosts = Math.round(postsPerWeek);

  // Per-platform frequency
  const activePlatforms = Object.keys(postsByPlatform).filter(p => postsByPlatform[p] > 0);
  const perPlatform = activePlatforms.map(p => ({
    platform: p,
    currentWeekly: Math.round((postsByPlatform[p] / 4.33) * 10) / 10,
    recommendedWeekly: Math.max(2, Math.round((postsByPlatform[p] / totalPosts) * optimalWeeklyPosts)),
  }));

  // ── Generate weekly calendar ──
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const calendar: Array<{
    day: string;
    shouldPost: boolean;
    platform: string;
    contentType: string;
    isBestDay: boolean;
  }> = [];

  const typeRotation = [...contentTypes];
  let typeIndex = 0;
  const platformRotation = platforms;

  allDays.forEach(day => {
    const isBest = bestDays.includes(day);
    const isWorst = worstDays.includes(day);
    const shouldPost = isBest || (!isWorst && (totalPosts === 0 || postsPerWeek > 3));

    if (shouldPost) {
      const contentType = typeRotation[typeIndex % typeRotation.length];
      const platform = platformRotation[calendar.length % platformRotation.length];
      calendar.push({ day, shouldPost: true, platform, contentType, isBestDay: isBest });
      typeIndex++;
    } else {
      calendar.push({ day, shouldPost: false, platform: '', contentType: '', isBestDay: false });
    }
  });

  // ── Rhythm consistency score ──
  const dayCounts = Object.values(postsByDay);
  const avgPerDay = dayCounts.length > 0 ? dayCounts.reduce((s, c) => s + c, 0) / dayCounts.length : 0;
  const dayVariance = dayCounts.reduce((s, c) => s + Math.pow(c - avgPerDay, 2), 0) / Math.max(dayCounts.length, 1);
  const consistencyScore = Math.max(0, Math.round(100 - Math.sqrt(dayVariance) * 15));

  return {
    success: true,
    data: {
      currentRhythm: {
        postsPerWeek: Math.round(postsPerWeek * 10) / 10,
        totalPostsLast30: totalPosts,
        activePlatforms,
        consistencyScore,
        consistencyRating: consistencyScore > 75 ? 'consistent' : consistencyScore > 50 ? 'moderate' : 'inconsistent',
      },
      dayAnalysis: {
        bestDays,
        worstDays,
        performance: dayPerformance,
      },
      typeAnalysis: typeRecommendations,
      frequency: {
        currentPerWeek: Math.round(postsPerWeek * 10) / 10,
        recommendedPerWeek: optimalWeeklyPosts,
        perPlatform,
      },
      weeklyCalendar: calendar,
      recommendations: [
        consistencyScore < 50 ? 'Posting schedule is inconsistent — establish regular posting days' : null,
        bestDays.length > 0 ? `Post most on ${bestDays.join(', ')} — these are your highest-engagement days` : null,
        postsPerWeek < 3 ? 'Increase posting frequency to at least 3 posts/week for algorithmic visibility' : null,
        postsPerWeek > 12 ? 'Consider reducing frequency — focus on quality over quantity' : null,
        ...typeRecommendations.filter(tr => tr.action.includes('Increase')).map(tr => `Create more ${tr.type} content (currently ${tr.currentPercentage}% vs recommended ${tr.recommendedPercentage}%)`),
      ].filter(Boolean) as string[],
    },
    source: 'browser',
    featureId: 'F94',
  };
}

// =============================================================================
// F95 — Visual Pattern Interrupt Generator
// =============================================================================
function visualPatternInterruptGenerator(
  currentLayout: {
    type: string; // 'grid', 'feed', 'carousel', 'story'
    dominantColorScheme: string; // 'warm', 'cool', 'neutral', 'monochrome'
    contentStyle: string; // 'minimal', 'busy', 'balanced'
    elementCount: number;
    hasAnimation: boolean;
  },
  options: { platform?: string; goal?: string } = {}
): FeatureResult {
  const { platform = 'instagram', goal = 'engagement' } = options;

  // ── Analyze current pattern ──
  const isMonotonous = currentLayout.elementCount < 3 && currentLayout.contentStyle === 'minimal';
  const isOverwhelming = currentLayout.elementCount > 8 && currentLayout.contentStyle === 'busy';
  const lacksAnimation = !currentLayout.hasAnimation;
  const isLowContrast = currentLayout.dominantColorScheme === 'monochrome' || currentLayout.dominantColorScheme === 'neutral';

  // ── Generate Visual Strategy Recommendations ──

  // 1. Color Contrast Suggestions
  const contrastInterrupts: Array<{
    name: string;
    description: string;
    impactScore: number;
    implementation: string;
  }> = [];

  if (isLowContrast) {
    contrastInterrupts.push({
      name: 'Bold Accent Color',
      description: 'Introduce a single bold accent color (e.g., electric blue, hot pink, or bright yellow) against your neutral palette',
      impactScore: 85,
      implementation: 'Use accent color for CTAs, key text, or one element per post. Keep it to <15% of visual area.',
    });
  }
  contrastInterrupts.push({
    name: 'Complementary Color Block',
    description: 'Add a complementary color block element — if dominant is blue, add orange; if green, add red',
    impactScore: 75,
    implementation: 'Create a color wheel opposite. Use as background for one section or a design element.',
  });
  contrastInterrupts.push({
    name: 'High-Contrast Gradient',
    description: 'Overlay a bold gradient on select elements to break up flat color areas',
    impactScore: 70,
    implementation: 'Apply gradient to text backgrounds, card overlays, or border elements.',
  });

  // 2. Layout Breakers
  const layoutBreakers: Array<{
    name: string;
    description: string;
    impactScore: number;
    implementation: string;
  }> = [];

  if (currentLayout.type === 'grid') {
    layoutBreakers.push({
      name: 'Spanning Element',
      description: 'Use a 2x2 or 3x1 spanning element to break grid monotony',
      impactScore: 80,
      implementation: 'Every 4th or 5th post should break the grid pattern with a larger format.',
    });
  }
  layoutBreakers.push({
    name: 'Diagonal Composition',
    description: 'Rotate key elements 15-30° to create dynamic diagonal lines',
    impactScore: 72,
    implementation: 'Apply subtle rotation to text overlays, images, or cards. Avoid >30° for readability.',
    });
  layoutBreakers.push({
    name: 'Asymmetric Balance',
    description: 'Deliberately unbalance layout — heavy on one side, light on the other',
    impactScore: 68,
    implementation: 'Place primary visual at 2/3 position. Use negative space strategically.',
  });
  if (currentLayout.type === 'carousel') {
    layoutBreakers.push({
      name: 'Full-Bleed Breaker Slide',
      description: 'Insert a full-bleed image slide between content slides',
      impactScore: 78,
      implementation: 'Every 3rd slide should be a full-bleed visual with minimal text for breathing room.',
    });
  }

  // 3. Text Overlay Ideas
  const textOverlays: Array<{
    name: string;
    description: string;
    impactScore: number;
    implementation: string;
  }> = [];

  textOverlays.push({
    name: 'Bold Statement Overlay',
    description: 'Add a single powerful word or short phrase in large, bold typography',
    impactScore: 82,
    implementation: 'Use sans-serif bold at 80-120pt. Place at focal point. Maximum 3 words.',
  });
  textOverlays.push({
    name: 'Statistic Callout',
    description: 'Feature a large number/statistic prominently — numbers grab attention instantly',
    impactScore: 76,
    implementation: 'Display key stat in 60pt+ font. Add context in smaller text below.',
  });
  if (goal === 'engagement') {
    textOverlays.push({
      name: 'Interactive Prompt Overlay',
      description: 'Add text asking viewers to save, share, or comment on something specific',
      impactScore: 88,
      implementation: 'Place "Would you choose A or B?" or "Save this for later" as overlay text.',
    });
  }

  // 4. Pattern Interrupts (dynamic elements)
  const patternInterrupts: Array<{
    name: string;
    description: string;
    impactScore: number;
    implementation: string;
  }> = [];

  if (lacksAnimation) {
    patternInterrupts.push({
      name: 'Micro-Animation Addition',
      description: 'Add subtle animations: text reveal, element slide-in, or parallax scrolling',
      impactScore: 85,
      implementation: 'For video: 0.3-0.5s text reveals. For stories: sticker animations. For reels: transition effects.',
    });
  }
  patternInterrupts.push({
    name: 'Unexpected Element',
    description: 'Place a visually unexpected element that breaks the established pattern',
    impactScore: 90,
    implementation: 'Could be an illustration, emoji burst, color splash, or unexpected image. Use once per content piece.',
  });
  patternInterrupts.push({
    name: 'Scale Contrast',
    description: 'Place one element at significantly different scale than others',
    impactScore: 73,
    implementation: 'Make one element 3-4x larger than surrounding elements. Creates instant visual hierarchy.',
  });

  // ── Overall Pattern Assessment ──
  let patternScore = 50;
  if (isMonotonous) patternScore -= 20;
  if (isOverwhelming) patternScore -= 15;
  if (lacksAnimation) patternScore -= 10;
  if (isLowContrast) patternScore -= 10;
  if (currentLayout.elementCount >= 4 && currentLayout.elementCount <= 7) patternScore += 15;
  if (currentLayout.hasAnimation) patternScore += 10;

  const overallScore = Math.max(10, Math.min(100, patternScore));

  // ── Priority-ranked strategies ──
  const allStrategies = [
    ...contrastInterrupts.map(s => ({ ...s, category: 'color_contrast' })),
    ...layoutBreakers.map(s => ({ ...s, category: 'layout_breaker' })),
    ...textOverlays.map(s => ({ ...s, category: 'text_overlay' })),
    ...patternInterrupts.map(s => ({ ...s, category: 'pattern_interrupt' })),
  ].sort((a, b) => b.impactScore - a.impactScore);

  return {
    success: true,
    data: {
      currentAssessment: {
        layoutType: currentLayout.type,
        colorScheme: currentLayout.dominantColorScheme,
        style: currentLayout.contentStyle,
        patternScore: overallScore,
        patternRating: overallScore > 75 ? 'dynamic' : overallScore > 50 ? 'balanced' : overallScore > 30 ? 'repetitive' : 'monotonous',
        risks: [
          isMonotonous ? 'Monotonous layout — audience may scroll past' : null,
          isOverwhelming ? 'Overwhelming visuals — may reduce comprehension' : null,
          isLowContrast ? 'Low contrast — content won\'t stand out in feed' : null,
          lacksAnimation ? 'Static content — lower engagement in algorithmic feeds' : null,
        ].filter(Boolean) as string[],
      },
      strategies: {
        colorContrast: contrastInterrupts,
        layoutBreakers,
        textOverlays,
        patternInterrupts,
      },
      topStrategies: allStrategies.slice(0, 5),
      quickWins: allStrategies.filter(s => s.impactScore > 80).slice(0, 3),
      platform: platform,
      goal,
    },
    source: 'browser',
    featureId: 'F95',
  };
}

// =============================================================================
// F96 — Quantum Content — The Unuploaded (Liminal)
// =============================================================================
function quantumContentUnuploaded(
  draftIdeas: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: string;
    lastTouchedAt: string;
    completionPercent: number; // 0-100
    notes?: string;
    estimatedDuration?: string;
    targetPlatform?: string;
  }>
): FeatureResult {
  const now = Date.now();
  const DAY = 86_400_000;

  // ── Analyze each draft ──
  const analyzed = draftIdeas.map(idea => {
    const ageMs = now - new Date(idea.createdAt).getTime();
    const ageDays = Math.floor(ageMs / DAY);
    const staleMs = now - new Date(idea.lastTouchedAt).getTime();
    const staleDays = Math.floor(staleMs / DAY);
    const completion = idea.completionPercent;

    // ── Estimate potential (how good could this be?) ──
    const words = idea.description.split(/\s+/).filter(w => w).length;
    const hasClearAngle = words > 20;
    const hasEmotionalHook = ['how', 'why', 'secret', 'mistake', 'truth', 'ultimate', 'amazing'].some(h => idea.title.toLowerCase().includes(h));
    const hasSpecificTopic = words > 10;

    let potential = 40;
    if (hasClearAngle) potential += 15;
    if (hasEmotionalHook) potential += 15;
    if (hasSpecificTopic) potential += 10;
    if (completion > 30) potential += 10; // Already started = more invested = likely better
    if (idea.notes && idea.notes.length > 20) potential += 5;
    if (idea.targetPlatform) potential += 5;
    potential = Math.min(100, potential);

    // ── Identify publication fears / blockers ──
    const fears: string[] = [];
    if (completion < 20) fears.push('Barely started — may feel too ambitious or unclear direction');
    if (completion > 20 && completion < 80) {
      if (staleDays > 14) fears.push('Abandoned mid-creation — likely hit a creative block');
      fears.push('Stuck in the "messy middle" — perfectionism may be blocking progress');
    }
    if (completion >= 80) fears.push('Near completion but not shipped — fear of judgment or not "perfect"');
    if (ageDays > 60) fears.push(`Draft is ${ageDays} days old — may feel "stale" or irrelevant`);
    if (idea.description.length < 30) fears.push('Vague description — unclear vision may be a barrier');
    if (!idea.targetPlatform) fears.push('No target platform — lack of clear destination');
    if (staleDays > 7 && completion < 50) fears.push('Hasn\'t been touched in ${staleDays} days — losing momentum');

    // ── Completion difficulty ──
    const remaining = 100 - completion;
    let difficulty: 'easy' | 'moderate' | 'challenging';
    if (remaining <= 20) difficulty = 'easy';
    else if (remaining <= 50) difficulty = 'moderate';
    else difficulty = 'challenging';

    // ── Urgency score (time-sensitive content degrades) ──
    let urgency = 50;
    if (ageDays > 90) urgency += 20; // Very old — publish or delete
    if (ageDays > 30) urgency += 10;
    if (completion > 70) urgency += 15; // Almost done — easy win
    if (potential > 70) urgency += 10;
    urgency = Math.min(100, urgency);

    // ── Suggested completion strategy ──
    let strategy: string;
    if (completion >= 80) {
      strategy = 'Finish Line Push: Set a 30-min timer and complete the final touches. Ship imperfectly — iterate based on feedback.';
    } else if (completion >= 50) {
      strategy = 'Momentum Recovery: Review your notes, identify the specific blocker, and create a minimal viable version. Reduce scope if needed.';
    } else if (completion >= 20) {
      strategy = 'Fresh Start Reset: Re-read original intent, simplify the concept to its core, and create a rough draft in one sitting.';
    } else {
      strategy = 'Decision Time: Decide if this idea is still worth pursuing. If yes, schedule a 1-hour creation block. If no, archive it guilt-free.';
    }

    // ── Estimated time to complete ──
    const estimatedMinutes = difficulty === 'easy' ? 30 : difficulty === 'moderate' ? 90 : 240;

    return {
      ...idea,
      ageDays,
      staleDays,
      potential,
      fears,
      difficulty,
      urgency,
      strategy,
      estimatedMinutesToComplete: estimatedMinutes,
      priority: Math.round(potential * 0.4 + urgency * 0.6),
    };
  });

  const sorted = [...analyzed].sort((a, b) => b.priority - a.priority);

  // ── Aggregate analysis ──
  const totalIdeas = draftIdeas.length;
  const avgCompletion = draftIdeas.reduce((s, i) => s + i.completionPercent, 0) / Math.max(totalIdeas, 1);
  const avgAge = analyzed.reduce((s, a) => s + a.ageDays, 0) / Math.max(analyzed.length, 1);
  const highPotential = analyzed.filter(a => a.potential > 65);
  const nearComplete = analyzed.filter(a => a.completionPercent >= 80);
  const staleDrafts = analyzed.filter(a => a.staleDays > 14);

  // ── Common fears across all drafts ──
  const fearFrequency: Record<string, number> = {};
  analyzed.forEach(a => {
    a.fears.forEach(f => {
      const normalizedF = f.replace(/\d+/g, 'N');
      fearFrequency[normalizedF] = (fearFrequency[normalizedF] || 0) + 1;
    });
  });
  const topFears = Object.entries(fearFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([fear, count]) => ({ fear, frequency: count }));

  // ── Wasted potential calculation ──
  const totalEstimatedMinutes = analyzed.reduce((s, a) => s + a.estimatedMinutesToComplete, 0);
  const quickWins = nearComplete.filter(n => n.potential > 60);
  const quickWinMinutes = quickWins.reduce((s, q) => s + q.estimatedMinutesToComplete, 0);

  return {
    success: true,
    data: {
      drafts: sorted,
      summary: {
        totalIdeas,
        avgCompletion: Math.round(avgCompletion * 10) / 10,
        avgAgeDays: Math.round(avgAge * 10) / 10,
        highPotentialCount: highPotential.length,
        nearCompleteCount: nearComplete.length,
        staleDraftCount: staleDrafts.length,
        quickWinCount: quickWins.length,
      },
      potentialAnalysis: {
        highPotential,
        wastedPotentialHours: Math.round(totalEstimatedMinutes / 60 * 10) / 10,
        quickWinMinutes,
        quickWins: quickWins.map(q => ({
          id: q.id,
          title: q.title,
          potential: q.potential,
          minutesToComplete: q.estimatedMinutesToComplete,
        })),
      },
      fearAnalysis: {
        topFears,
        fearProfile: topFears.length > 3
          ? 'Multiple blockers — consider a "shipping mindset" shift'
          : topFears.some(f => f.fear.includes('perfectionism') || f.fear.includes('judgment'))
            ? 'Perfectionism is the main blocker — embrace "done is better than perfect"'
            : 'Minor barriers — establish a creation routine',
      },
      completionRoadmap: sorted.slice(0, 5).map(d => ({
        title: d.title,
        currentCompletion: d.completionPercent,
        strategy: d.strategy,
        estimatedTime: `${d.estimatedMinutesToComplete} min`,
        difficulty: d.difficulty,
      })),
      unburiedValue: `Releasing ${quickWins.length} near-complete drafts could yield ${quickWins.reduce((s, q) => s + q.potential, 0)} potential engagement points in just ${quickWinMinutes} minutes.`,
    },
    source: 'browser',
    featureId: 'F96',
  };
}

// =============================================================================
// Export
// =============================================================================
export const studioFeatures = {
  contentArchitect,
  watermarkStripper,
  theVideoAuditor,
  thumbnailOracle,
  transcriptExtractor,
  seoMetaGenerator,
  predictiveRetentionHeatmaps,
  evergreenReGenerator,
  theVoiceCracks,
  asmrOfEditing,
  videoAutopsy,
  voiceCrunchinessDetector,
  thumbnailABTestPredictor,
  titleOptimizer,
  hashtagKeywordExtractor,
  contentRhythmComposer,
  visualPatternInterruptGenerator,
  quantumContentUnuploaded,
};

export default studioFeatures;
