import { useState, useEffect, useCallback } from 'react';
import { useFeatureStore, useTokenStore } from '@/stores';
import { featureEngine, type FeatureResult } from '@/services/FeatureEngine';
import { FeatureResultPanel } from '@/components/FeatureResultPanel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContentCalendar } from '@/components/calendar/ContentCalendar';

import {
  Clapperboard,
  Image as ImageIcon,
  Type,
  Play,
  Wand2,
  Sparkles,
  TrendingUp,
  Hash,
  Cpu,
  Loader2,
  FileText,
  Video,
  Droplets,
  Flame,
  Recycle,
  AudioLines,
  Waves,
  Skull,
  Mic2,
  Split,
  Music2,
  Sparkle,
  Atom,
  Lock,
} from 'lucide-react';

const PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin'] as const;

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#FF0000',
  instagram: '#E1306C',
  tiktok: '#00F2EA',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
};

function PlatformSelector({
  value,
  onChange,
  color = '#EC4899',
}: {
  value: string;
  onChange: (p: string) => void;
  color?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORMS.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={value === p ? 'default' : 'outline'}
          onClick={() => onChange(p)}
          className={value === p ? '' : ''}
          style={value === p ? { backgroundColor: color } : {}}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </Button>
      ))}
    </div>
  );
}

interface FeatureInputField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: { label: string; value: string }[];
  multiline?: boolean;
}

const FEATURE_INPUT_CONFIGS: Record<string, FeatureInputField[]> = {
  f79: [
    { key: 'topic', label: 'Topic', placeholder: 'Enter your content topic...', type: 'text' },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
    { key: 'contentGoal', label: 'Content Goal', placeholder: '', type: 'select', options: [{ label: 'Engage', value: 'engage' }, { label: 'Educate', value: 'educate' }, { label: 'Entertain', value: 'entertain' }, { label: 'Convert', value: 'convert' }] },
    { key: 'audienceLevel', label: 'Audience Level', placeholder: '', type: 'select', options: [{ label: 'Beginner', value: 'beginner' }, { label: 'Intermediate', value: 'intermediate' }, { label: 'Advanced', value: 'advanced' }] },
    { key: 'targetLength', label: 'Target Length', placeholder: '', type: 'select', options: [{ label: 'Short (30s-2min)', value: 'short' }, { label: 'Medium (3-10min)', value: 'medium' }, { label: 'Long (10min+)', value: 'long' }] },
  ],
  f80: [
    { key: 'imageDescription', label: 'Image Description', placeholder: 'Describe the image with watermark...', type: 'textarea' },
    { key: 'dominantColors', label: 'Dominant Colors (comma-separated)', placeholder: '#FFFFFF, #000000, #FF0000', type: 'text' },
    { key: 'imageWidth', label: 'Image Width (px)', placeholder: '1920', type: 'number' },
    { key: 'imageHeight', label: 'Image Height (px)', placeholder: '1080', type: 'number' },
  ],
  f81: [
    { key: 'title', label: 'Video Title', placeholder: 'Enter your video title...', type: 'text' },
    { key: 'duration', label: 'Duration (seconds)', placeholder: '600', type: 'number' },
    { key: 'resolution', label: 'Resolution', placeholder: '1080p', type: 'text' },
    { key: 'hasCaptions', label: 'Has Captions', placeholder: '', type: 'select', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
  ],
  f82: [
    { key: 'title', label: 'Thumbnail Context / Title', placeholder: 'What is the thumbnail for?', type: 'text' },
    { key: 'hasFace', label: 'Contains Face', placeholder: '', type: 'select', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
    { key: 'faceEmotion', label: 'Face Emotion', placeholder: 'surprised, happy, serious', type: 'text' },
    { key: 'colorContrast', label: 'Color Contrast (low/medium/high)', placeholder: 'high', type: 'text' },
    { key: 'textCount', label: 'Text Elements Count', placeholder: '3', type: 'number' },
    { key: 'dominantColors', label: 'Dominant Colors (comma-separated)', placeholder: '#FF0000, #FFFFFF', type: 'text' },
  ],
  f83: [
    { key: 'transcriptText', label: 'Transcript Text', placeholder: 'Paste or type the transcript to extract and copy...', type: 'textarea', multiline: true },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
  ],
  f84: [
    { key: 'content', label: 'Content Description', placeholder: 'Describe your content for SEO metadata generation...', type: 'textarea' },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
    { key: 'targetKeyword', label: 'Target Keyword', placeholder: 'e.g., "how to grow on YouTube"', type: 'text' },
    { key: 'existingTitle', label: 'Existing Title (optional)', placeholder: 'Your current title if any...', type: 'text' },
  ],
  f85: [
    { key: 'content', label: 'Content Sections (one per line)', placeholder: 'Intro - Hook with question\nMain Point 1 - Data analysis\nStory - Personal anecdote\nCTA - Subscribe reminder', type: 'textarea', multiline: true },
    { key: 'totalDuration', label: 'Total Duration (seconds)', placeholder: '600', type: 'number' },
  ],
  f86: [
    { key: 'title', label: 'Original Content Title', placeholder: 'Title of the content to refresh...', type: 'text' },
    { key: 'body', label: 'Original Content Body', placeholder: 'Paste the original content body...', type: 'textarea', multiline: true },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
    { key: 'publishedAt', label: 'Original Publish Date', placeholder: '2024-06-15', type: 'text' },
  ],
  f87: [
    { key: 'transcriptText', label: 'Transcript / Audio Text', placeholder: 'Paste the transcript to analyze voice patterns...', type: 'textarea', multiline: true },
    { key: 'duration', label: 'Audio Duration (seconds)', placeholder: '300', type: 'number' },
  ],
  f88: [
    { key: 'totalDuration', label: 'Video Duration (seconds)', placeholder: '600', type: 'number' },
    { key: 'cuts', label: 'Number of Cuts', placeholder: '45', type: 'number' },
    { key: 'transitions', label: 'Number of Transitions', placeholder: '12', type: 'number' },
    { key: 'silenceSegments', label: 'Silence Segments Count', placeholder: '5', type: 'number' },
  ],
  f89: [
    { key: 'title', label: 'Video Title', placeholder: 'Title of the video to autopsy...', type: 'text' },
    { key: 'views', label: 'Total Views', placeholder: '5000', type: 'number' },
    { key: 'impressions', label: 'Total Impressions', placeholder: '50000', type: 'number' },
    { key: 'avgWatchTime', label: 'Average Watch Time (seconds)', placeholder: '120', type: 'number' },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
  ],
  f90: [
    { key: 'sampleRate', label: 'Sample Rate (Hz)', placeholder: '44100', type: 'number' },
    { key: 'bitrate', label: 'Bitrate (kbps)', placeholder: '128', type: 'number' },
    { key: 'audioDescription', label: 'Audio Description', placeholder: 'Describe the audio quality issue...', type: 'text' },
  ],
  f91: [
    { key: 'variantADescription', label: 'Variant A Description', placeholder: 'Describe thumbnail A: colors, text, face emotion, composition...', type: 'textarea' },
    { key: 'variantBDescription', label: 'Variant B Description', placeholder: 'Describe thumbnail B: colors, text, face emotion, composition...', type: 'textarea' },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
    { key: 'audienceSize', label: 'Audience Size', placeholder: '10000', type: 'number' },
  ],
  f92: [
    { key: 'title', label: 'Original Title', placeholder: 'Enter your video or post title...', type: 'text' },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
    { key: 'niche', label: 'Niche (optional)', placeholder: 'e.g., tech, fitness, cooking', type: 'text' },
  ],
  f93: [
    { key: 'content', label: 'Content', placeholder: 'Paste your content to extract hashtags and keywords...', type: 'textarea' },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: ['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin'].map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
    { key: 'existingTags', label: 'Existing Tags (comma-separated, optional)', placeholder: '#tech, #youtube', type: 'text' },
  ],
  f94: [
    { key: 'postingHistory', label: 'Posting History (one per line: date,views,likes)', placeholder: '2024-01-01,5000,200\n2024-01-08,4500,180\n2024-01-15,6000,300', type: 'textarea', multiline: true },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
  ],
  f95: [
    { key: 'contentType', label: 'Content Type', placeholder: 'youtube-video, instagram-reel, tiktok', type: 'text' },
    { key: 'dominantColorScheme', label: 'Current Color Scheme', placeholder: 'warm, cool, dark, bright, pastel', type: 'text' },
    { key: 'audienceTrend', label: 'Current Engagement Trend', placeholder: 'rising, stable, declining', type: 'text' },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
  ],
  f96: [
    { key: 'ideas', label: 'Unpublished Ideas (one per line)', placeholder: 'A day in my life as a creator\nReacting to my first viral video\nThe tool that changed everything\nBehind the scenes of brand deal', type: 'textarea', multiline: true },
    { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) },
    { key: 'audienceSize', label: 'Current Audience Size', placeholder: '15000', type: 'number' },
  ],
};

function getFeatureIcon(featureId: string) {
  const icons: Record<string, React.ReactNode> = {
    f79: <Clapperboard className="w-4 h-4" />,
    f80: <Droplets className="w-4 h-4" />,
    f81: <Video className="w-4 h-4" />,
    f82: <ImageIcon className="w-4 h-4" />,
    f83: <FileText className="w-4 h-4" />,
    f84: <TrendingUp className="w-4 h-4" />,
    f85: <Flame className="w-4 h-4" />,
    f86: <Recycle className="w-4 h-4" />,
    f87: <AudioLines className="w-4 h-4" />,
    f88: <Waves className="w-4 h-4" />,
    f89: <Skull className="w-4 h-4" />,
    f90: <Mic2 className="w-4 h-4" />,
    f91: <Split className="w-4 h-4" />,
    f92: <Type className="w-4 h-4" />,
    f93: <Hash className="w-4 h-4" />,
    f94: <Music2 className="w-4 h-4" />,
    f95: <Sparkle className="w-4 h-4" />,
    f96: <Atom className="w-4 h-4" />,
  };
  return icons[featureId] || <Sparkles className="w-4 h-4" />;
}

export function StudioPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('studio');
  const [activeTab, setActiveTab] = useState('overview');

  // Running states
  const [runningFeatures, setRunningFeatures] = useState<Record<string, boolean>>({});

  // Result states
  const [overviewResults, setOverviewResults] = useState<Record<string, FeatureResult>>({});
  const [featureResults, setFeatureResults] = useState<Record<string, FeatureResult>>({});
  const [aiSource, setAiSource] = useState<string>('browser');

  // Feature form state
  const [featureInputs, setFeatureInputs] = useState<Record<string, Record<string, string>>>({});

  const getFeatureInput = useCallback((featureId: string, key: string) => {
    return featureInputs[featureId]?.[key] || '';
  }, [featureInputs]);

  const setFeatureInput = useCallback((featureId: string, key: string, value: string) => {
    setFeatureInputs(prev => ({
      ...prev,
      [featureId]: { ...prev[featureId], [key]: value },
    }));
  }, []);

  const isLoading = useCallback(
    (featureId: string) => runningFeatures[featureId] === true,
    [runningFeatures]
  );

  // Run overview features on load (free - no cost for overview)
  useEffect(() => {
    const loadOverview = async () => {
      const ids = ['f79', 'f84', 'f92'];
      setRunningFeatures((prev) => {
        const next = { ...prev };
        ids.forEach((id) => { next[id] = true; });
        return next;
      });

      const [architectResult, seoResult, titleResult] = await Promise.all([
        featureEngine.executeFeature('f79', { topic: 'content creation for creators', platform: 'youtube' }),
        featureEngine.executeFeature('f84', { content: 'How to grow on YouTube as a beginner creator in 2024', platform: 'youtube' }),
        featureEngine.executeFeature('f92', { title: 'My Content Creation Process', platform: 'youtube' }),
      ]);

      setOverviewResults({
        f79: architectResult,
        f84: seoResult,
        f92: titleResult,
      });
      setAiSource(architectResult.source);
      setRunningFeatures((prev) => {
        const next = { ...prev };
        ids.forEach((id) => { next[id] = false; });
        return next;
      });
    };
    loadOverview();
  }, []);

  const executeFeature = async (featureId: string, input: Record<string, unknown> = {}) => {
    setRunningFeatures((prev) => ({ ...prev, [featureId]: true }));
    try {
      const result = await featureEngine.executeFeature(featureId, input);
      setFeatureResults((prev) => ({ ...prev, [featureId]: result }));
      setAiSource(result.source);
      if (result.success) {
        toast.success(`Feature ${featureId} completed!`);
      } else {
        toast.error(`Feature ${featureId} returned an error.`);
      }
      return result;
    } catch {
      toast.error(`Feature ${featureId} failed.`);
      return null;
    } finally {
      setRunningFeatures((prev) => ({ ...prev, [featureId]: false }));
    }
  };

  const handleRunFeature = async (featureId: string, cost: number, name: string, input: Record<string, unknown> = {}) => {
    // Overview tab features are free
    if (cost > 0) {
      const success = spendTokens(cost, featureId, `Used ${name}`);
      if (!success) {
        toast.error('Insufficient VQT balance. Please purchase more tokens.');
        return;
      }
    }
    await executeFeature(featureId, input);
  };

  // Build input object from form state for a feature
  const buildInput = (featureId: string): Record<string, unknown> => {
    const config = FEATURE_INPUT_CONFIGS[featureId];
    if (!config) return {};

    const input: Record<string, unknown> = {};
    for (const field of config) {
      const value = getFeatureInput(featureId, field.key);
      if (field.type === 'number' && value) {
        input[field.key] = parseFloat(value) || 0;
      } else if (field.key === 'platform' && value) {
        input[field.key] = value;
      } else if (field.key === 'hasCaptions' && value) {
        input[field.key] = value === 'true';
      } else if (field.key === 'hasFace' && value) {
        input[field.key] = value === 'true';
      } else if (field.type === 'textarea' && value && (field.key === 'ideas' || field.key === 'postingHistory' || field.key === 'content')) {
        // Parse multi-line fields into arrays where needed
        if (field.key === 'ideas') {
          input[field.key] = value.split('\n').filter(Boolean).map((idea, i) => ({
            id: `idea_${i + 1}`,
            title: idea.trim(),
            description: idea.trim(),
          }));
        } else if (field.key === 'postingHistory') {
          input[field.key] = value.split('\n').filter(Boolean).map(line => {
            const parts = line.split(',').map(p => p.trim());
            return { date: parts[0] || '', views: parseInt(parts[1]) || 0, likes: parseInt(parts[2]) || 0 };
          });
        } else if (field.key === 'content' && featureId === 'f85') {
          input[field.key] = {
            sections: value.split('\n').filter(Boolean).map((s, i) => ({
              id: `s${i + 1}`,
              title: s.split('-')[0]?.trim() || `Section ${i + 1}`,
              description: s.includes('-') ? s.substring(s.indexOf('-') + 1).trim() : s.trim(),
            })),
          };
        } else {
          input[field.key] = value;
        }
      } else if (value) {
        input[field.key] = value;
      }
    }

    // Special mapping for f91 Thumbnail A/B
    if (featureId === 'f91') {
      input.variants = {
        a: input.variantADescription || 'variant_a',
        b: input.variantBDescription || 'variant_b',
      };
      if (input.variantADescription) delete input.variantADescription;
      if (input.variantBDescription) delete input.variantBDescription;
    }

    return input;
  };

  const runFeatureWithForm = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (!feature) return;

    const input = buildInput(featureId);
    handleRunFeature(featureId, feature.vqtCost, feature.name, input);
  };

  const getFeature = (id: string) => features.find(f => f.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#EC4899]/10 flex items-center justify-center">
            <Clapperboard className="w-6 h-6 text-[#EC4899]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Studio</h1>
            <p className="text-sm text-[#6B7280]">Publish with confidence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Cpu className="w-3 h-3" />
            AI: {aiSource}
          </Badge>
          <Badge className="bg-[#EC4899]/10 text-[#EC4899] border-none font-mono">
            {features.length} FEATURES
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9] flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="thumbnails">Thumbnails</TabsTrigger>
          <TabsTrigger value="titles">Titles</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="liminal">Liminal</TabsTrigger>
          <TabsTrigger value="features">All Features</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['f79', 'f84', 'f92'] as const).map((fid) => {
              const f = getFeature(fid);
              return (
                <Card key={fid} className="border-[#E5E7EB]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center text-[#EC4899]">
                        {getFeatureIcon(fid)}
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">{f?.name}</p>
                        <p className="text-sm font-bold text-[#EC4899]">{fid}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            {(['f79', 'f84', 'f92'] as const).map((fid) => {
              const f = getFeature(fid);
              return (
                <div key={fid}>
                  {isLoading(fid) && (
                    <Card className="border-[#E5E7EB]">
                      <CardContent className="p-6 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-[#EC4899] mr-2" />
                        <span className="text-sm text-[#6B7280]">Running {f?.name}...</span>
                      </CardContent>
                    </Card>
                  )}
                  {overviewResults[fid] && !isLoading(fid) && (
                    <FeatureResultPanel
                      result={overviewResults[fid]}
                      featureId={fid}
                      featureName={f?.name || fid}
                      source={overviewResults[fid].source}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <ContentCalendar />
        </TabsContent>

        {/* AI Tools Tab - F79, F84, F93 */}
        <TabsContent value="ai-tools" className="space-y-4">
          {(['f79', 'f84', 'f93'] as const).map((featureId) => {
            const feature = getFeature(featureId);
            if (!feature) return null;
            const config = FEATURE_INPUT_CONFIGS[featureId];
            const colors: Record<string, string> = { f79: '#EC4899', f84: '#00D4AA', f93: '#6366F1' };
            const color = colors[featureId] || '#EC4899';

            return (
              <Card key={featureId} className="border-[#E5E7EB]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                      <span className="text-[#EC4899]">{getFeatureIcon(featureId)}</span>
                      {feature.name} ({feature.code})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {feature.requiresLiminal && (
                        <Badge variant="outline" className="gap-1 border-[#F59E0B] text-[#F59E0B]">
                          <Lock className="w-3 h-3" />
                          LIMINAL
                        </Badge>
                      )}
                      <Badge className="bg-[#EC4899]/10 text-[#EC4899] border-none">
                        {feature.vqtCost} VQT
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm text-[#6B7280]">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config && config.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-sm text-[#6B7280]">{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          placeholder={field.placeholder}
                          value={getFeatureInput(featureId, field.key)}
                          onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                          className="min-h-[80px]"
                        />
                      ) : field.type === 'select' ? (
                        <div className="flex flex-wrap gap-2">
                          {field.options?.map((opt) => (
                            <Button
                              key={opt.value}
                              size="sm"
                              variant={getFeatureInput(featureId, field.key) === opt.value ? 'default' : 'outline'}
                              onClick={() => setFeatureInput(featureId, field.key, opt.value)}
                              style={getFeatureInput(featureId, field.key) === opt.value ? { backgroundColor: color } : {}}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                      ) : field.type === 'number' ? (
                        <Input
                          type="number"
                          placeholder={field.placeholder}
                          value={getFeatureInput(featureId, field.key)}
                          onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                        />
                      ) : (
                        <Input
                          placeholder={field.placeholder}
                          value={getFeatureInput(featureId, field.key)}
                          onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => runFeatureWithForm(featureId)}
                    disabled={isLoading(featureId)}
                    className="gap-2"
                    style={{ backgroundColor: color }}
                  >
                    {isLoading(featureId) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
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
          })}
        </TabsContent>

        {/* Thumbnails Tab - F91, F82 */}
        <TabsContent value="thumbnails" className="space-y-4">
          {(['f91', 'f82'] as const).map((featureId) => {
            const feature = getFeature(featureId);
            if (!feature) return null;
            const config = FEATURE_INPUT_CONFIGS[featureId];
            const color = featureId === 'f91' ? '#EC4899' : '#F59E0B';

            return (
              <Card key={featureId} className="border-[#E5E7EB]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                      <span style={{ color }}>{getFeatureIcon(featureId)}</span>
                      {feature.name} ({feature.code})
                    </CardTitle>
                    <Badge className="bg-[#EC4899]/10 text-[#EC4899] border-none">
                      {feature.vqtCost} VQT
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-[#6B7280]">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config && config.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-sm text-[#6B7280]">{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          placeholder={field.placeholder}
                          value={getFeatureInput(featureId, field.key)}
                          onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                          className="min-h-[80px]"
                        />
                      ) : field.type === 'select' ? (
                        <div className="flex flex-wrap gap-2">
                          {field.options?.map((opt) => (
                            <Button
                              key={opt.value}
                              size="sm"
                              variant={getFeatureInput(featureId, field.key) === opt.value ? 'default' : 'outline'}
                              onClick={() => setFeatureInput(featureId, field.key, opt.value)}
                              style={getFeatureInput(featureId, field.key) === opt.value ? { backgroundColor: color } : {}}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                      ) : field.type === 'number' ? (
                        <Input
                          type="number"
                          placeholder={field.placeholder}
                          value={getFeatureInput(featureId, field.key)}
                          onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                        />
                      ) : (
                        <Input
                          placeholder={field.placeholder}
                          value={getFeatureInput(featureId, field.key)}
                          onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => runFeatureWithForm(featureId)}
                    disabled={isLoading(featureId)}
                    className="gap-2"
                    style={{ backgroundColor: color }}
                  >
                    {isLoading(featureId) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
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
          })}
        </TabsContent>

        {/* Titles Tab - F92 */}
        <TabsContent value="titles" className="space-y-4">
          {(() => {
            const feature = getFeature('f92');
            const featureId = 'f92';
            const config = FEATURE_INPUT_CONFIGS[featureId];
            const color = '#EC4899';
            return feature && config && (
              <Card className="border-[#E5E7EB]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                      <span style={{ color }}>{getFeatureIcon(featureId)}</span>
                      {feature.name} ({feature.code})
                    </CardTitle>
                    <Badge className="bg-[#EC4899]/10 text-[#EC4899] border-none">
                      {feature.vqtCost} VQT
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-[#6B7280]">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-sm text-[#6B7280]">{field.label}</Label>
                      {field.type === 'select' ? (
                        <div className="flex flex-wrap gap-2">
                          {field.options?.map((opt) => (
                            <Button
                              key={opt.value}
                              size="sm"
                              variant={getFeatureInput(featureId, field.key) === opt.value ? 'default' : 'outline'}
                              onClick={() => setFeatureInput(featureId, field.key, opt.value)}
                              style={getFeatureInput(featureId, field.key) === opt.value ? { backgroundColor: color } : {}}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <Input
                          placeholder={field.placeholder}
                          value={getFeatureInput(featureId, field.key)}
                          onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => runFeatureWithForm(featureId)}
                    disabled={isLoading(featureId) || !getFeatureInput(featureId, 'title').trim()}
                    className="gap-2"
                    style={{ backgroundColor: color }}
                  >
                    {isLoading(featureId) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    Optimize Title
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
          })()}
        </TabsContent>

        {/* Content Tab - F83, F85, F86, F94, F95, F96 */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {(['f83', 'f85', 'f86', 'f94', 'f95', 'f96'] as const).map((featureId) => {
              const feature = getFeature(featureId);
              if (!feature) return null;
              const config = FEATURE_INPUT_CONFIGS[featureId];
              const color = '#10B981';

              return (
                <Card key={featureId} className="border-[#E5E7EB]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-[#0B0F19] flex items-center gap-2">
                        <span className="text-[#10B981]">{getFeatureIcon(featureId)}</span>
                        {feature.code}: {feature.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {feature.requiresLiminal && (
                          <Badge variant="outline" className="gap-1 border-[#F59E0B] text-[#F59E0B] text-xs">
                            <Lock className="w-3 h-3" />
                            LIMINAL
                          </Badge>
                        )}
                        <Badge className="bg-[#10B981]/10 text-[#10B981] border-none text-xs">
                          {feature.vqtCost} VQT
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-xs text-[#6B7280]">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {config && config.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs text-[#6B7280]">{field.label}</Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            placeholder={field.placeholder}
                            value={getFeatureInput(featureId, field.key)}
                            onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                        ) : field.type === 'select' ? (
                          <div className="flex flex-wrap gap-1">
                            {field.options?.map((opt) => (
                              <Button
                                key={opt.value}
                                size="sm"
                                variant={getFeatureInput(featureId, field.key) === opt.value ? 'default' : 'outline'}
                                onClick={() => setFeatureInput(featureId, field.key, opt.value)}
                                style={getFeatureInput(featureId, field.key) === opt.value ? { backgroundColor: color } : {}}
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
                            value={getFeatureInput(featureId, field.key)}
                            onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                            className="text-sm"
                          />
                        ) : (
                          <Input
                            placeholder={field.placeholder}
                            value={getFeatureInput(featureId, field.key)}
                            onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      onClick={() => runFeatureWithForm(featureId)}
                      disabled={isLoading(featureId)}
                      size="sm"
                      className="w-full gap-2"
                      style={{ backgroundColor: color }}
                    >
                      {isLoading(featureId) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
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
            })}
          </div>
        </TabsContent>

        {/* Media Tab - F80, F81, F90 */}
        <TabsContent value="media" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {(['f80', 'f81', 'f90'] as const).map((featureId) => {
              const feature = getFeature(featureId);
              if (!feature) return null;
              const config = FEATURE_INPUT_CONFIGS[featureId];
              const color = '#06B6D4';

              return (
                <Card key={featureId} className="border-[#E5E7EB]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-[#0B0F19] flex items-center gap-2">
                        <span className="text-[#06B6D4]">{getFeatureIcon(featureId)}</span>
                        {feature.code}: {feature.name}
                      </CardTitle>
                      <Badge className="bg-[#06B6D4]/10 text-[#06B6D4] border-none text-xs">
                        {feature.vqtCost} VQT
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-[#6B7280]">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {config && config.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs text-[#6B7280]">{field.label}</Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            placeholder={field.placeholder}
                            value={getFeatureInput(featureId, field.key)}
                            onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                        ) : field.type === 'select' ? (
                          <div className="flex flex-wrap gap-1">
                            {field.options?.map((opt) => (
                              <Button
                                key={opt.value}
                                size="sm"
                                variant={getFeatureInput(featureId, field.key) === opt.value ? 'default' : 'outline'}
                                onClick={() => setFeatureInput(featureId, field.key, opt.value)}
                                style={getFeatureInput(featureId, field.key) === opt.value ? { backgroundColor: color } : {}}
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
                            value={getFeatureInput(featureId, field.key)}
                            onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                            className="text-sm"
                          />
                        ) : (
                          <Input
                            placeholder={field.placeholder}
                            value={getFeatureInput(featureId, field.key)}
                            onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      onClick={() => runFeatureWithForm(featureId)}
                      disabled={isLoading(featureId)}
                      size="sm"
                      className="w-full gap-2"
                      style={{ backgroundColor: color }}
                    >
                      {isLoading(featureId) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
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
            })}
          </div>
        </TabsContent>

        {/* Liminal Tab - F87, F88, F89 */}
        <TabsContent value="liminal" className="space-y-4">
          <Card className="border-[#F59E0B]/30 bg-gradient-to-br from-[#0B0F19]/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-[#F59E0B]">
                <Lock className="w-4 h-4" />
                <span className="font-medium">Liminal Features</span>
                <span className="text-[#6B7280]">— Advanced features requiring Liminal mode activation</span>
              </div>
            </CardContent>
          </Card>
          <div className="grid lg:grid-cols-3 gap-4">
            {(['f87', 'f88', 'f89'] as const).map((featureId) => {
              const feature = getFeature(featureId);
              if (!feature) return null;
              const config = FEATURE_INPUT_CONFIGS[featureId];
              const color = '#F59E0B';

              return (
                <Card key={featureId} className="border-[#F59E0B]/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-[#0B0F19] flex items-center gap-2">
                        <span className="text-[#F59E0B]">{getFeatureIcon(featureId)}</span>
                        {feature.code}: {feature.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-[#6B7280]">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {config && config.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs text-[#6B7280]">{field.label}</Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            placeholder={field.placeholder}
                            value={getFeatureInput(featureId, field.key)}
                            onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                        ) : field.type === 'select' ? (
                          <div className="flex flex-wrap gap-1">
                            {field.options?.map((opt) => (
                              <Button
                                key={opt.value}
                                size="sm"
                                variant={getFeatureInput(featureId, field.key) === opt.value ? 'default' : 'outline'}
                                onClick={() => setFeatureInput(featureId, field.key, opt.value)}
                                style={getFeatureInput(featureId, field.key) === opt.value ? { backgroundColor: color } : {}}
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
                            value={getFeatureInput(featureId, field.key)}
                            onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                            className="text-sm"
                          />
                        ) : (
                          <Input
                            placeholder={field.placeholder}
                            value={getFeatureInput(featureId, field.key)}
                            onChange={(e) => setFeatureInput(featureId, field.key, e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      onClick={() => runFeatureWithForm(featureId)}
                      disabled={isLoading(featureId)}
                      size="sm"
                      className="w-full gap-2"
                      style={{ backgroundColor: color }}
                    >
                      {isLoading(featureId) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      Run {feature.name} ({feature.vqtCost} VQT)
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
            })}
          </div>
        </TabsContent>

        {/* All Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features
              .filter((f) => !f.isFree)
              .map((feature) => {
                const config = FEATURE_INPUT_CONFIGS[feature.id];
                return (
                  <div
                    key={feature.id}
                    className="p-4 rounded-xl border border-[#E5E7EB] hover:border-[#EC4899]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-[#0B0F19] flex items-center gap-2">
                        {getFeatureIcon(feature.id)}
                        {feature.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        {feature.requiresLiminal && (
                          <Badge variant="outline" className="border-[#F59E0B] text-[#F59E0B] text-xs gap-1">
                            <Lock className="w-3 h-3" />
                          </Badge>
                        )}
                        <Badge className="bg-[#EC4899]/10 text-[#EC4899] border-none text-xs">
                          {feature.vqtCost} VQT
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-[#6B7280] mb-3">{feature.description}</p>

                    {/* Inline form for features that have configs */}
                    {config && (
                      <div className="space-y-2 mb-3">
                        {config.map((field) => (
                          <div key={field.key}>
                            {field.type === 'textarea' ? (
                              <Textarea
                                placeholder={field.placeholder}
                                value={getFeatureInput(feature.id, field.key)}
                                onChange={(e) => setFeatureInput(feature.id, field.key, e.target.value)}
                                className="min-h-[50px] text-xs"
                              />
                            ) : field.type === 'select' ? (
                              <div className="flex flex-wrap gap-1">
                                {field.options?.map((opt) => (
                                  <Button
                                    key={opt.value}
                                    size="sm"
                                    variant={getFeatureInput(feature.id, field.key) === opt.value ? 'default' : 'outline'}
                                    onClick={() => setFeatureInput(feature.id, field.key, opt.value)}
                                    className="text-xs h-6 px-2"
                                  >
                                    {opt.label}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <Input
                                placeholder={field.placeholder}
                                value={getFeatureInput(feature.id, field.key)}
                                onChange={(e) => setFeatureInput(feature.id, field.key, e.target.value)}
                                className="text-xs"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full bg-[#EC4899] hover:bg-[#EC4899]/90 text-white gap-2"
                      onClick={() => {
                        if (config) {
                          runFeatureWithForm(feature.id);
                        } else {
                          handleRunFeature(feature.id, feature.vqtCost, feature.name);
                        }
                      }}
                      disabled={isLoading(feature.id)}
                    >
                      {isLoading(feature.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isLoading(feature.id) ? 'Running...' : `Run (${feature.vqtCost} VQT)`}
                    </Button>
                    {featureResults[feature.id] && (
                      <div className="mt-3">
                        <FeatureResultPanel
                          result={featureResults[feature.id]}
                          featureId={feature.id}
                          featureName={feature.name}
                          source={featureResults[feature.id].source}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
