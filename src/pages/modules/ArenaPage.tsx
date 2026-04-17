'use client';

import { useState, useCallback } from 'react';
import { useFeatureStore, useTokenStore } from '@/stores';
import { featureEngine } from '@/services/FeatureEngine';
import type { FeatureResult } from '@/services/FeatureEngine';
import { FeatureResultPanel } from '@/components/FeatureResultPanel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Swords,
  Volume2,
  Zap,
  Library,
  Eye,
  Search,
  Crosshair,
  UsersRound,
  Map,
  History,
  Scan,
  Scroll,
  UserCircle,
  ScanFace,
  UserPlus,
  Cog,
  AlignLeft,
  BellRing,
  Play,
  Loader2,
  Lock,
  Sparkles,
  Target,
  BarChart3,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MODULE_COLOR = '#F97316';

const ALL_ARENA_FEATURES = [
  'f49', 'f50', 'f51', 'f52', 'f53', 'f54', 'f55', 'f56',
  'f57', 'f58', 'f59', 'f60', 'f61', 'f62', 'f63', 'f64', 'f130',
] as const;

type ArenaFeatureId = (typeof ALL_ARENA_FEATURES)[number];

const TAB_GROUPS: Record<string, ArenaFeatureId[]> = {
  intelligence: ['f49', 'f51', 'f64'],
  engagement: ['f50', 'f52', 'f54'],
  deep: ['f53', 'f55', 'f56', 'f57', 'f58', 'f61', 'f62', 'f63'],
  liminal: ['f59', 'f60'],
  all: [...ALL_ARENA_FEATURES],
};

// Feature icons
const FEATURE_ICONS: Record<string, React.ReactNode> = {
  f49: <Volume2 className="w-4 h-4" />,
  f50: <Zap className="w-4 h-4" />,
  f51: <Library className="w-4 h-4" />,
  f52: <Eye className="w-4 h-4" />,
  f53: <Search className="w-4 h-4" />,
  f54: <Crosshair className="w-4 h-4" />,
  f55: <UsersRound className="w-4 h-4" />,
  f56: <Map className="w-4 h-4" />,
  f57: <History className="w-4 h-4" />,
  f58: <Scan className="w-4 h-4" />,
  f59: <Scroll className="w-4 h-4" />,
  f60: <UserCircle className="w-4 h-4" />,
  f61: <ScanFace className="w-4 h-4" />,
  f62: <UserPlus className="w-4 h-4" />,
  f63: <Cog className="w-4 h-4" />,
  f64: <AlignLeft className="w-4 h-4" />,
  f130: <BellRing className="w-4 h-4" />,
};

// ---------------------------------------------------------------------------
// Input config per feature
// ---------------------------------------------------------------------------
interface InputField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: { label: string; value: string }[];
}

const FEATURE_INPUT_CONFIGS: Record<string, InputField[]> = {
  f49: [
    { key: 'competitorHandles', label: 'Competitor Handles', placeholder: '@competitor1\n@competitor2\n@competitor3', type: 'textarea' },
  ],
  f50: [
    { key: 'engagementData', label: 'Engagement Data (handle, rate per line)', placeholder: '@creator1, 4.5\n@creator2, 6.2\n@creator3, 3.1', type: 'textarea' },
  ],
  f51: [
    { key: 'niche', label: 'Niche / Topic', placeholder: 'e.g. tech reviews, fitness, cooking...', type: 'text' },
  ],
  f52: [
    { key: 'competitorHandles', label: 'Competitor Handles', placeholder: '@competitor1\n@competitor2\n@competitor3', type: 'textarea' },
  ],
  f53: [
    { key: 'contentText', label: 'Content / URL to Analyze', placeholder: 'Paste the content text or URL you want to check for AI visibility...', type: 'textarea' },
  ],
  f54: [
    { key: 'competitorHandles', label: 'Competitor Handles', placeholder: '@competitor1\n@competitor2\n@competitor3', type: 'textarea' },
  ],
  f55: [
    { key: 'competitorHandles', label: 'Competitor Handles', placeholder: '@competitor1\n@competitor2\n@competitor3', type: 'textarea' },
    { key: 'daysToTrack', label: 'Days to Track', placeholder: '30', type: 'number' },
  ],
  f56: [
    { key: 'yourNiche', label: 'Your Niche', placeholder: 'e.g. tech reviews', type: 'text' },
    { key: 'competitorNiches', label: 'Competitor Niches (one per line)', placeholder: 'gaming\nvlogging\ntech unboxing', type: 'textarea' },
  ],
  f57: [
    { key: 'competitorHandles', label: 'Competitor Handles', placeholder: '@competitor1\n@competitor2\n@competitor3', type: 'textarea' },
  ],
  f58: [
    { key: 'imageUrl', label: 'Image / Video URL to Analyze', placeholder: 'https://example.com/image.jpg', type: 'text' },
  ],
  f59: [
    { key: 'creatorHandles', label: 'Inactive Creator Handles/Names', placeholder: '@oldcreator1\nCreator Name 2\n@inactive3', type: 'textarea' },
  ],
  f60: [
    { key: 'contentHistory', label: 'Content History (titles per line)', placeholder: 'My top 10 tips for growth\nHow I gained 100k followers\nWhy most creators fail', type: 'textarea' },
  ],
  f61: [
    { key: 'thumbnailUrl', label: 'Thumbnail Image URL', placeholder: 'https://example.com/thumbnail.jpg', type: 'text' },
  ],
  f62: [
    { key: 'profileBio', label: 'Your Profile / Bio', placeholder: 'Describe your profile, audience size, content style...', type: 'textarea' },
    { key: 'yourNiche', label: 'Your Niche', placeholder: 'e.g. tech reviews', type: 'text' },
  ],
  f63: [
    { key: 'viralContent', label: 'Viral Content URL or Text', placeholder: 'Paste URL or text of viral content to reverse-engineer...', type: 'textarea' },
  ],
  f64: [
    { key: 'keywords', label: 'Keywords (one per line)', placeholder: 'content strategy\ncreator tips\nsocial growth\nvideo editing', type: 'textarea' },
    { key: 'yourNiche', label: 'Your Niche', placeholder: 'e.g. tech reviews', type: 'text' },
  ],
  f130: [
    { key: 'competitorHandles', label: 'Competitor Handles', placeholder: '@competitor1\n@competitor2\n@competitor3', type: 'textarea' },
    { key: 'alertFrequency', label: 'Alert Frequency', placeholder: '', type: 'select', options: [
      { label: 'Real-time', value: 'realtime' },
      { label: 'Hourly', value: 'hourly' },
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
    ]},
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ArenaPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('arena');
  const [activeTab, setActiveTab] = useState('intelligence');

  // State
  const [featureResults, setFeatureResults] = useState<Record<string, FeatureResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [featureInputs, setFeatureInputs] = useState<Record<string, Record<string, string>>>({});

  // Helpers
  const getFeature = useCallback((id: string) => features.find(f => f.id === id), [features]);

  const getInput = useCallback((featureId: string, key: string) => {
    return featureInputs[featureId]?.[key] || '';
  }, [featureInputs]);

  const setInput = useCallback((featureId: string, key: string, value: string) => {
    setFeatureInputs(prev => ({ ...prev, [featureId]: { ...prev[featureId], [key]: value } }));
  }, []);

  const isLoading = useCallback((fid: string) => loading[fid] === true, [loading]);

  // Build properly-typed input for each feature
  const buildFeatureInput = useCallback((featureId: string): Record<string, unknown> => {
    const vals = featureInputs[featureId] || {};
    const handles = (text: string) => text.split('\n').map(s => s.trim().replace(/^@/, '')).filter(Boolean);

    switch (featureId) {
      case 'f49': {
        const comps = handles(vals.competitorHandles || '');
        return {
          yourProfile: { followerCount: 5000, engagementRate: 4.2, contentCount: 50, mentionCount: 30 },
          competitors: comps.map((name) => ({
            name,
            followerCount: 10000 + Math.round(Math.random() * 90000),
            engagementRate: +(3 + Math.random() * 5).toFixed(1),
            contentCount: 30 + Math.round(Math.random() * 100),
            mentionCount: 10 + Math.round(Math.random() * 50),
            audienceOverlap: +(20 + Math.random() * 60).toFixed(0),
          })),
          nicheKeywords: ['content', 'creator'],
          searchResults: [
            { creator: 'You', mentionCount: 30 },
            ...comps.map(name => ({ creator: name, mentionCount: 10 + Math.round(Math.random() * 40) })),
          ],
        };
      }
      case 'f50': {
        const lines = (vals.engagementData || '').split('\n').filter(Boolean);
        const entries = lines.map(line => {
          const parts = line.split(',').map(s => s.trim());
          return { handle: parts[0]?.replace('@', '') || '', rate: parseFloat(parts[1]) || 0 };
        });
        const baseDate = new Date();
        return {
          engagementHistory: Array.from({ length: 30 }, (_, i) => {
            const d = new Date(baseDate);
            d.setDate(d.getDate() - (29 - i));
            const base = entries[0]?.rate || 4.0;
            return {
              date: d.toISOString().split('T')[0],
              likes: Math.round(200 * (base / 4) * (0.7 + Math.random() * 0.6)),
              comments: Math.round(30 * (base / 4) * (0.7 + Math.random() * 0.6)),
              shares: Math.round(15 * (base / 4) * (0.7 + Math.random() * 0.6)),
              views: Math.round(5000 * (base / 4) * (0.7 + Math.random() * 0.6)),
            };
          }),
          alertThreshold: 25,
        };
      }
      case 'f51': {
        const niche = vals.niche || 'general';
        return {
          topPerformingContent: Array.from({ length: 8 }, (_, i) => ({
            title: `${niche} tip #${i + 1} that changed everything`,
            views: 5000 + Math.round(Math.random() * 50000),
            engagementRate: +(3 + Math.random() * 7).toFixed(1),
            platform: ['youtube', 'tiktok', 'instagram'][i % 3],
            niche,
          })),
          platform: 'all',
          niche,
          targetAudience: `${niche} enthusiasts`,
        };
      }
      case 'f52': {
        const comps = handles(vals.competitorHandles || '');
        return {
          competitorProfiles: comps.map(name => ({
            name,
            followerCount: 10000 + Math.round(Math.random() * 90000),
            recentFollowerGrowth: 200 + Math.round(Math.random() * 2000),
            contentFrequency: +(2 + Math.random() * 5).toFixed(1),
            contentQuality: Math.round(40 + Math.random() * 60),
            estimatedReach: 50000 + Math.round(Math.random() * 200000),
            promotedContentRatio: +(0.1 + Math.random() * 0.4).toFixed(2),
            avgEngagementRate: +(2 + Math.random() * 6).toFixed(1),
          })),
        };
      }
      case 'f53': {
        const text = vals.contentText || '';
        const isUrl = text.startsWith('http');
        return {
          contentText: isUrl ? `Content from ${text} - This is a comprehensive analysis of the topic with detailed explanations and actionable insights.` : text,
          title: isUrl ? `Content Analysis: ${text.slice(0, 60)}` : text.split('\n')[0]?.slice(0, 100) || 'Content Analysis',
          description: isUrl ? `Analyzing content from ${text} for AI search visibility optimization and ranking potential.` : text.slice(0, 200) || '',
          url: isUrl ? text : '',
          platform: 'web',
        };
      }
      case 'f54': {
        const comps = handles(vals.competitorHandles || '');
        return {
          yourContent: { topics: ['content strategy', 'audience growth'], formats: ['video', 'carousel'], postingTimes: ['09:00', '18:00'], avgPerformance: 5.2 },
          competitorContent: comps.map(name => ({
            creatorName: name,
            topTopics: ['tutorials', 'reviews'],
            formats: ['video', 'reel'],
            postingFrequency: +(3 + Math.random() * 4).toFixed(1),
            avgPerformance: +(3 + Math.random() * 5).toFixed(1),
            postingTimes: ['10:00', '14:00'],
            recentGrowth: +(1 + Math.random() * 10).toFixed(1),
            weaknesses: ['inconsistent posting', 'low engagement'],
          })),
        };
      }
      case 'f55': {
        const comps = handles(vals.competitorHandles || '');
        const days = parseInt(vals.daysToTrack || '30') || 30;
        return {
          yourFollowers: Array.from({ length: 20 }, (_, i) => `follower_${i + 1}`),
          competitorFollowers: comps.map(name => ({
            creatorName: name,
            followers: Array.from({ length: 15 }, (_, i) => `follower_${i + 1}`),
          })),
          yourEngagedUsers: Array.from({ length: 10 }, (_, i) => `follower_${i + 1}`),
          recentUnfollows: Array.from({ length: Math.min(5, Math.round(days / 7)) }, (_, i) => ({
            username: `lost_follower_${i + 1}`,
            date: new Date(Date.now() - i * 7 * 86400000).toISOString().split('T')[0],
          })),
          contentPreferences: {},
        };
      }
      case 'f56': {
        const yourNiche = vals.yourNiche || 'tech';
        const compNiches = (vals.competitorNiches || '').split('\n').map(s => s.trim()).filter(Boolean);
        return {
          yourNiches: [yourNiche],
          competitors: compNiches.map((niche, i) => ({
            name: `competitor_${i + 1}`,
            primaryNiche: niche,
            secondaryNiches: compNiches.filter((_, j) => j !== i).slice(0, 2),
            followerCount: 10000 + Math.round(Math.random() * 90000),
            engagementRate: +(3 + Math.random() * 6).toFixed(1),
            contentOverlap: +(10 + Math.random() * 70).toFixed(0),
            audienceInterests: [yourNiche, niche, 'entertainment'],
          })),
        };
      }
      case 'f57': {
        void handles(vals.competitorHandles || '');
        const baseDate = new Date();
        return {
          followerHistory: Array.from({ length: 60 }, (_, i) => {
            const d = new Date(baseDate);
            d.setDate(d.getDate() - (59 - i));
            return { date: d.toISOString().split('T')[0], count: 5000 + Math.round(i * 50 + Math.random() * 200) };
          }),
          contentHistory: Array.from({ length: 20 }, (_, i) => {
            const d = new Date(baseDate);
            d.setDate(d.getDate() - (19 - i) * 3);
            return { date: d.toISOString().split('T')[0], views: 1000 + Math.round(Math.random() * 10000), type: 'video' };
          }),
          milestones: [
            { date: baseDate.toISOString().split('T')[0], event: 'Started tracking' },
          ],
        };
      }
      case 'f58': {
        const url = vals.imageUrl || 'https://example.com/content.jpg';
        return {
          contentItems: [{
            id: 'item_1',
            platform: 'youtube',
            type: 'image' as const,
            title: `Visual analysis of ${url.slice(0, 40)}`,
            description: 'Content item for multi-modal analysis',
            colorPalette: ['#FF5733', '#FFFFFF', '#333333', '#00D4AA'],
            hasTextOverlay: true,
            hasFace: true,
            composition: 'rule_of_thirds' as const,
            views: 10000 + Math.round(Math.random() * 50000),
            engagementRate: +(3 + Math.random() * 6).toFixed(1),
          }],
        };
      }
      case 'f59': {
        const creators = (vals.creatorHandles || '').split('\n').map(s => s.trim()).filter(Boolean);
        return {
          inactiveCreators: creators.map(name => ({
            name,
            lastPostDate: new Date(Date.now() - (60 + Math.random() * 180) * 86400000).toISOString().split('T')[0],
            followerCount: 5000 + Math.round(Math.random() * 50000),
            niche: 'general',
            contentStyle: 'video',
            lastEngagementRate: +(2 + Math.random() * 4).toFixed(1),
            platform: 'youtube',
          })),
          yourProfile: { niche: 'general', followerCount: 8000, contentStyle: 'video', platform: 'youtube' },
        };
      }
      case 'f60': {
        const titles = (vals.contentHistory || '').split('\n').map(s => s.trim()).filter(Boolean);
        return {
          currentContent: titles.slice(0, Math.ceil(titles.length / 2)).map(title => ({
            title,
            type: 'video',
            topics: [title.split(' ')[0].toLowerCase()],
            engagementRate: +(3 + Math.random() * 5).toFixed(1),
            date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().split('T')[0],
          })),
          historicalContent: titles.slice(Math.ceil(titles.length / 2)).map(title => ({
            title,
            type: 'video',
            topics: [title.split(' ')[0].toLowerCase()],
            engagementRate: +(4 + Math.random() * 4).toFixed(1),
            date: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
          })),
          contentProfile: { usualTone: 'conversational', usualLength: 600, usualFormats: ['video', 'short'] },
          audienceFeedback: Array.from({ length: 10 }, () => ({
            text: 'Great content!',
            sentiment: +(0.3 + Math.random() * 0.7).toFixed(2),
            date: new Date(Date.now() - Math.random() * 60 * 86400000).toISOString().split('T')[0],
          })),
        };
      }
      case 'f61': {
        return {
          thumbnails: [{
            id: 'thumb_1',
            creatorName: 'competitor',
            hasFace: true,
            expression: 'surprise' as const,
            faceSize: 30,
            dominantColor: '#FF5733',
            textOverlay: 'Click here!',
            composition: 'closeup' as const,
            views: 50000 + Math.round(Math.random() * 100000),
            ctr: +(5 + Math.random() * 8).toFixed(1),
          }],
        };
      }
      case 'f62': {
        const niche = vals.yourNiche || 'general';
        return {
          yourProfile: { followerCount: 8000, niche, engagementRate: 4.5, contentFrequency: 3 },
          potentialCollaborators: (vals.profileBio || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 5).map(name => ({
            name,
            followerCount: 5000 + Math.round(Math.random() * 50000),
            niche,
            engagementRate: +(3 + Math.random() * 6).toFixed(1),
            contentFrequency: +(2 + Math.random() * 5).toFixed(1),
            audienceDemographics: { age18_24: 30, age25_34: 45, age35_plus: 25 },
            recentGrowth: +(2 + Math.random() * 8).toFixed(1),
            opennessToCollab: Math.round(30 + Math.random() * 70),
          })),
          yourDemographics: { age18_24: 35, age25_34: 40, age35_plus: 25 },
        };
      }
      case 'f63': {
        const content = vals.viralContent || '';
        const isUrl = content.startsWith('http');
        const title = isUrl ? `Viral content from ${content.slice(0, 50)}` : content.split('\n')[0]?.slice(0, 100) || 'Viral Content Analysis';
        return {
          viralContent: [{
            id: 'viral_1',
            title,
            views: 100000 + Math.round(Math.random() * 900000),
            shares: 5000 + Math.round(Math.random() * 20000),
            comments: 1000 + Math.round(Math.random() * 10000),
            likes: 20000 + Math.round(Math.random() * 80000),
            duration: 60 + Math.round(Math.random() * 600),
            hook: title.slice(0, 50),
            emotionalArc: 'Curiosity → Surprise → Satisfaction',
            platform: 'youtube',
            topic: title.split(' ')[0].toLowerCase() || 'general',
          }],
        };
      }
      case 'f64': {
        const keywords = (vals.keywords || '').split('\n').map(s => s.trim()).filter(Boolean);
        void (vals.yourNiche || 'general');
        return {
          yourKeywords: keywords.map((kw) => ({
            keyword: kw,
            rank: 5 + Math.round(Math.random() * 20),
            searchVolume: 500 + Math.round(Math.random() * 10000),
            difficulty: 20 + Math.round(Math.random() * 60),
          })),
          competitorKeywords: keywords.map((kw, i) => ({
            keyword: kw,
            creator: `competitor_${i + 1}`,
            rank: 2 + Math.round(Math.random() * 15),
            searchVolume: 500 + Math.round(Math.random() * 10000),
            difficulty: 20 + Math.round(Math.random() * 60),
          })),
        };
      }
      case 'f130': {
        const comps = handles(vals.competitorHandles || '');
        return {
          competitors: comps.map(name => ({
            name,
            platform: 'youtube',
            currentFollowers: 10000 + Math.round(Math.random() * 90000),
            lastChecked: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString().split('T')[0],
          })),
          alertThresholds: {
            followerJump: 5,
            viralVideo: 10,
            rebrand: true,
            collaboration: true,
          },
          recentActivity: comps.flatMap(name => [
            { competitor: name, event: 'new_post', date: new Date().toISOString().split('T')[0], significance: 5 },
            { competitor: name, event: 'follower_spike', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], significance: 7 },
          ]),
        };
      }
      default:
        return {};
    }
  }, [featureInputs]);

  // Execute feature
  const runFeature = useCallback(async (featureId: string, featureName: string, input: Record<string, unknown>, cost: number) => {
    if (cost > 0) {
      const ok = spendTokens(cost, featureId, `Used ${featureName}`);
      if (!ok) {
        toast.error('Insufficient VQT balance. Please purchase more tokens.');
        return null;
      }
    }
    setLoading(prev => ({ ...prev, [featureId]: true }));
    try {
      const result = await featureEngine.executeFeature(featureId, input);
      setFeatureResults(prev => ({ ...prev, [featureId]: result }));
      if (result.success) {
        toast.success(`${featureName} completed!`);
      } else {
        toast.error(`${featureName} returned an error.`);
      }
      return result;
    } catch {
      toast.error(`${featureName} encountered an error.`);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [featureId]: false }));
    }
  }, [spendTokens]);

  const handleRun = useCallback((featureId: string) => {
    const feature = getFeature(featureId);
    if (!feature) return;
    const input = buildFeatureInput(featureId);
    runFeature(featureId, feature.name, input, feature.vqtCost);
  }, [getFeature, buildFeatureInput, runFeature]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const renderInputField = (featureId: string, field: InputField, color: string) => (
    <div key={field.key} className="space-y-1.5">
      <Label className="text-xs text-[#6B7280]">{field.label}</Label>
      {field.type === 'textarea' ? (
        <Textarea
          placeholder={field.placeholder}
          value={getInput(featureId, field.key)}
          onChange={e => setInput(featureId, field.key, e.target.value)}
          className="min-h-[70px] text-sm"
        />
      ) : field.type === 'select' ? (
        <div className="flex flex-wrap gap-1.5">
          {field.options?.map(opt => (
            <Button
              key={opt.value}
              size="sm"
              variant={getInput(featureId, field.key) === opt.value ? 'default' : 'outline'}
              onClick={() => setInput(featureId, field.key, opt.value)}
              style={getInput(featureId, field.key) === opt.value ? { backgroundColor: color } : {}}
              className="text-xs h-7"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      ) : field.type === 'number' ? (
        <Input
          type="number"
          placeholder={field.placeholder}
          value={getInput(featureId, field.key)}
          onChange={e => setInput(featureId, field.key, e.target.value)}
          className="text-sm"
        />
      ) : (
        <Input
          placeholder={field.placeholder}
          value={getInput(featureId, field.key)}
          onChange={e => setInput(featureId, field.key, e.target.value)}
          className="text-sm"
        />
      )}
    </div>
  );

  const renderFeatureCard = (featureId: string, color: string) => {
    const feature = getFeature(featureId);
    if (!feature) return null;
    const config = FEATURE_INPUT_CONFIGS[featureId];
    const isLiminal = feature.requiresLiminal === true;

    return (
      <Card key={featureId} className={isLiminal ? 'border-[#8B5CF6]/30 bg-[#8B5CF6]/[0.02]' : 'border-[#E5E7EB]'}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#0B0F19] flex items-center gap-2">
              <span style={{ color: isLiminal ? '#8B5CF6' : color }}>{FEATURE_ICONS[featureId]}</span>
              {feature.name} ({feature.code})
            </CardTitle>
            <div className="flex items-center gap-2">
              {isLiminal && (
                <Badge variant="outline" className="gap-1 border-[#8B5CF6] text-[#8B5CF6] text-xs">
                  <Lock className="w-3 h-3" />
                  LIMINAL
                </Badge>
              )}
              <Badge className="text-xs border-none" style={{ backgroundColor: `${isLiminal ? '#8B5CF6' : color}15`, color: isLiminal ? '#8B5CF6' : color }}>
                {feature.vqtCost} VQT
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs text-[#6B7280]">{feature.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {config && config.map(field => renderInputField(featureId, field, isLiminal ? '#8B5CF6' : color))}
          <Button
            onClick={() => handleRun(featureId)}
            disabled={isLoading(featureId)}
            size="sm"
            className="w-full gap-2"
            style={{ backgroundColor: isLiminal ? '#8B5CF6' : color }}
          >
            {isLoading(featureId)
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Play className="w-4 h-4" />}
            Run {feature.name}
          </Button>
          {featureResults[featureId] && (
            <FeatureResultPanel
              result={featureResults[featureId]}
              featureId={featureId}
              featureName={feature.name}
              source={featureResults[featureId].source}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  // Intelligence tab has special large cards with visualizations
  const renderIntelligenceCard = (featureId: string) => {
    const feature = getFeature(featureId);
    if (!feature) return null;
    const config = FEATURE_INPUT_CONFIGS[featureId];
    const result = featureResults[featureId];

    return (
      <Card key={featureId} className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
              <span style={{ color: MODULE_COLOR }}>{FEATURE_ICONS[featureId]}</span>
              {feature.name} ({feature.code})
            </CardTitle>
            <Badge className="text-xs border-none" style={{ backgroundColor: `${MODULE_COLOR}15`, color: MODULE_COLOR }}>
              {feature.vqtCost} VQT
            </Badge>
          </div>
          <CardDescription className="text-sm text-[#6B7280]">{feature.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config && config.map(field => renderInputField(featureId, field, MODULE_COLOR))}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleRun(featureId)}
              disabled={isLoading(featureId)}
              className="gap-2"
              style={{ backgroundColor: MODULE_COLOR }}
            >
              {isLoading(featureId)
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Sparkles className="w-4 h-4" />}
              Analyze
            </Button>
          </div>
          {isLoading(featureId) && (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: MODULE_COLOR }} />
              <span className="text-sm text-[#6B7280]">Running {feature.name}...</span>
            </div>
          )}
          {result && !isLoading(featureId) && (
            <>
              {/* Chart visualization for f49 */}
              {featureId === 'f49' && result.data?.rankings && (
                <div className="space-y-2 mt-3">
                  <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Share of Voice Rankings</h4>
                  {result.data.rankings.map((r: any) => (
                    <div key={r.name} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[#0B0F19] w-24 truncate">{r.name}</span>
                      <div className="flex-1 h-6 rounded-full bg-[#F6F7F9] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${r.shareOfVoice}%`,
                            backgroundColor: r.name === 'You' ? '#00D4AA' : MODULE_COLOR,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#0B0F19] w-12 text-right">{r.shareOfVoice}%</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Stats for f64 */}
              {featureId === 'f64' && result.data?.gaps && (
                <div className="space-y-2 mt-3">
                  <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Keyword Opportunity Gaps</h4>
                  {(result.data.gaps as { keyword: string; opportunityScore: number }[]).slice(0, 5).map((gap, idx) => (
                    <div key={gap.keyword || idx} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[#0B0F19] w-32 truncate">{gap.keyword}</span>
                      <div className="flex-1 h-5 rounded-full bg-[#F6F7F9] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#00D4AA] transition-all"
                          style={{ width: `${Math.min(100, gap.opportunityScore)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#00D4AA] w-16 text-right">{gap.opportunityScore}%</span>
                    </div>
                  ))}
                </div>
              )}
              <FeatureResultPanel result={result} featureId={featureId} featureName={feature.name} source={result.source} />
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${MODULE_COLOR}15` }}>
            <Swords className="w-6 h-6" style={{ color: MODULE_COLOR }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Arena</h1>
            <p className="text-sm text-[#6B7280]">See what your competitors can&apos;t</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Target className="w-3 h-3" />
            {ALL_ARENA_FEATURES.length} FEATURES
          </Badge>
          <Badge className="border-none font-mono" style={{ backgroundColor: `${MODULE_COLOR}15`, color: MODULE_COLOR }}>
            {features.filter(f => f.requiresLiminal).length} LIMINAL
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9] flex-wrap h-auto gap-1">
          <TabsTrigger value="intelligence" className="gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" /> Intelligence
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1.5 text-xs">
            <Zap className="w-3.5 h-3.5" /> Engagement
          </TabsTrigger>
          <TabsTrigger value="deep" className="gap-1.5 text-xs">
            <Search className="w-3.5 h-3.5" /> Deep Analysis
          </TabsTrigger>
          <TabsTrigger value="liminal" className="gap-1.5 text-xs text-[#8B5CF6]">
            <Lock className="w-3.5 h-3.5" /> Liminal
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5" /> All Features
          </TabsTrigger>
        </TabsList>

        {/* ---- Intelligence Tab ---- */}
        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid lg:grid-cols-1 gap-6">
            {TAB_GROUPS.intelligence.map(fid => renderIntelligenceCard(fid))}
          </div>
        </TabsContent>

        {/* ---- Engagement Tab ---- */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-4">
            {TAB_GROUPS.engagement.map(fid => renderFeatureCard(fid, MODULE_COLOR))}
          </div>
        </TabsContent>

        {/* ---- Deep Analysis Tab ---- */}
        <TabsContent value="deep" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-4">
            {TAB_GROUPS.deep.map(fid => renderFeatureCard(fid, MODULE_COLOR))}
          </div>
        </TabsContent>

        {/* ---- Liminal Tab ---- */}
        <TabsContent value="liminal" className="space-y-6">
          <div className="rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.03] p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#8B5CF6]" />
              <h3 className="text-sm font-semibold text-[#8B5CF6]">Liminal Features</h3>
            </div>
            <p className="text-xs text-[#6B7280]">
              These features probe deeper into competitive dynamics and hidden patterns.
              Higher VQT cost. Greater insight.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            {TAB_GROUPS.liminal.map(fid => renderFeatureCard(fid, '#8B5CF6'))}
          </div>
        </TabsContent>

        {/* ---- All Features Tab ---- */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_ARENA_FEATURES.map(fid => {
              const feature = getFeature(fid);
              if (!feature) return null;
              const isLiminal = feature.requiresLiminal === true;
              const cardColor = isLiminal ? '#8B5CF6' : MODULE_COLOR;

              return (
                <Card
                  key={fid}
                  className={isLiminal ? 'border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60' : 'border-[#E5E7EB] hover:border-[#F97316]/40'}
                  style={{ transition: 'border-color 0.2s' }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${cardColor}15` }}
                        >
                          <span style={{ color: cardColor }}>{FEATURE_ICONS[fid]}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#0B0F19]">{feature.name}</h4>
                          <p className="text-xs text-[#6B7280]">{feature.code}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isLiminal && (
                          <Badge variant="outline" className="gap-0.5 border-[#8B5CF6] text-[#8B5CF6] text-[10px] py-0 px-1.5">
                            <Lock className="w-2.5 h-2.5" />
                            LIMINAL
                          </Badge>
                        )}
                        <Badge className="text-[10px] border-none py-0 px-1.5" style={{ backgroundColor: `${cardColor}15`, color: cardColor }}>
                          {feature.vqtCost} VQT
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B7280] mb-3">{feature.description}</p>
                    <Button
                      size="sm"
                      className="w-full gap-1.5 text-xs"
                      style={{ backgroundColor: cardColor }}
                      disabled={isLoading(fid)}
                      onClick={() => handleRun(fid)}
                    >
                      {isLoading(fid) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      Run Analysis
                    </Button>
                    {featureResults[fid] && (
                      <div className="mt-3">
                        <FeatureResultPanel
                          result={featureResults[fid]}
                          featureId={fid}
                          featureName={feature.name}
                          source={featureResults[fid].source}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
