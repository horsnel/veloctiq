import { useState, useCallback } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Ghost,
  AlertTriangle,
  Loader2,
  Play,
  Brain,
  HeartCrack,
  Flame,
  MessageSquare,
  Building2,
  Scroll,
  UserCircle,
  AudioLines,
  Waves,
  Skull,
  Atom,
  VideoOff,
  Cpu,
} from 'lucide-react';

// ── Module color ──
const MODULE_COLOR = '#8B5CF6';

// ── Feature input field definition ──
interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number';
}

// ── Input configs for all 12 liminal features ──
const FEATURE_INPUTS: Record<string, FieldDef[]> = {
  // Audience Liminal (listener)
  f29: [
    { key: 'audienceData', label: 'Audience Data / Comments', placeholder: 'Paste audience data, comments, or engagement metrics...\nOne entry per line for best results', type: 'textarea' },
  ],
  f30: [
    { key: 'comments', label: 'Comments to Analyze', placeholder: 'Paste comments to scan for parasocial intimacy patterns...\nOne comment per line', type: 'textarea' },
  ],
  f31: [
    { key: 'contentUrl', label: 'Content URL / Video URL', placeholder: 'e.g. https://youtube.com/watch?v=... or a content identifier', type: 'text' },
  ],
  f32: [
    { key: 'postUrls', label: 'Post URLs (one per line)', placeholder: 'https://youtube.com/watch?v=abc123\nhttps://youtube.com/watch?v=def456\nhttps://instagram.com/p/xyz789', type: 'textarea' },
  ],
  // Revenue & Strategy (bank + arena)
  f43: [
    { key: 'niche', label: 'Niche', placeholder: 'e.g. tech reviews, fitness, cooking, gaming', type: 'text' },
    { key: 'audienceSize', label: 'Audience Size', placeholder: 'e.g. 15000', type: 'number' },
  ],
  f59: [
    { key: 'creatorHandles', label: 'Creator Handles / Names (one per line)', placeholder: '@oldcreator1\n@inactive_channel\nCreator Name Here', type: 'textarea' },
  ],
  f60: [
    { key: 'contentHistory', label: 'Your Content History — titles (one per line)', placeholder: 'How I Made $10K in One Month\nMy Morning Routine 2024\nThe Truth About Side Hustles', type: 'textarea' },
  ],
  f102: [
    { key: 'recentTitles', label: 'Recent Video Titles (one per line)', placeholder: 'Reacting to Viral AI Content\nMy Setup Tour 2024\nWhy I Quit My 9-to-5\nDay in My Life as a Creator', type: 'textarea' },
  ],
  // Content Liminal (studio)
  f87: [
    { key: 'transcriptText', label: 'Transcript / Audio Text', placeholder: 'Paste your video transcript to analyze voice patterns, pauses, and vocal stress...', type: 'textarea' },
    { key: 'duration', label: 'Audio Duration (seconds)', placeholder: '300', type: 'number' },
  ],
  f88: [
    { key: 'totalDuration', label: 'Video Duration (seconds)', placeholder: '600', type: 'number' },
    { key: 'cuts', label: 'Number of Cuts', placeholder: '45', type: 'number' },
    { key: 'transitions', label: 'Number of Transitions', placeholder: '12', type: 'number' },
  ],
  f89: [
    { key: 'title', label: 'Video Title', placeholder: 'Title of the video to autopsy...', type: 'text' },
    { key: 'views', label: 'Total Views', placeholder: '5000', type: 'number' },
    { key: 'impressions', label: 'Total Impressions', placeholder: '50000', type: 'number' },
    { key: 'avgWatchTime', label: 'Average Watch Time (seconds)', placeholder: '120', type: 'number' },
  ],
  f96: [
    { key: 'ideas', label: 'Unuploaded Ideas (one per line)', placeholder: 'A day in my life as a full-time creator\nReacting to my first ever video\nThe tool that changed my entire workflow\nBehind the scenes of a brand deal', type: 'textarea' },
  ],
};

// ── Icon mapping ──
function getFeatureIcon(featureId: string) {
  const icons: Record<string, React.ReactNode> = {
    f29: <Ghost className="w-4 h-4" />,
    f30: <HeartCrack className="w-4 h-4" />,
    f31: <Flame className="w-4 h-4" />,
    f32: <MessageSquare className="w-4 h-4" />,
    f43: <Building2 className="w-4 h-4" />,
    f59: <Scroll className="w-4 h-4" />,
    f60: <UserCircle className="w-4 h-4" />,
    f87: <AudioLines className="w-4 h-4" />,
    f88: <Waves className="w-4 h-4" />,
    f89: <Skull className="w-4 h-4" />,
    f96: <Atom className="w-4 h-4" />,
    f102: <VideoOff className="w-4 h-4" />,
  };
  return icons[featureId] || <Brain className="w-4 h-4" />;
}

// ── Tab groupings ──
const AUDIENCE_LIMINAL = ['f29', 'f30', 'f31', 'f32'];
const CONTENT_LIMINAL = ['f87', 'f88', 'f89', 'f96'];
const REVENUE_STRATEGY = ['f43', 'f59', 'f60', 'f102'];
const ALL_LIMINAL = ['f29', 'f30', 'f31', 'f32', 'f43', 'f59', 'f60', 'f87', 'f88', 'f89', 'f96', 'f102'];

// ── Build input payload for each feature ──
function buildFeatureInput(featureId: string, formValues: Record<string, string>): Record<string, unknown> {
  switch (featureId) {
    case 'f29': {
      const lines = (formValues.audienceData || '').split('\n').filter(Boolean);
      return { metrics: { comments: lines.map((t, i) => ({ id: String(i + 1), text: t, likes: 0 })), rawData: formValues.audienceData } };
    }
    case 'f30': {
      const lines = (formValues.comments || '').split('\n').filter(Boolean);
      return { comments: lines.map((t, i) => ({ id: String(i + 1), text: t, likes: 0 })) };
    }
    case 'f31': {
      const url = (formValues.contentUrl || '').trim();
      return { contentHistory: [{ url, title: url, date: new Date().toISOString() }] };
    }
    case 'f32': {
      const urls = (formValues.postUrls || '').split('\n').filter(Boolean);
      return { threadData: urls.map((u, i) => ({ id: String(i + 1), url: u.trim(), title: u.trim() })) };
    }
    case 'f43': {
      return { content: [{ niche: formValues.niche || 'general', audienceSize: parseFloat(formValues.audienceSize) || 0 }] };
    }
    case 'f59': {
      const handles = (formValues.creatorHandles || '').split('\n').filter(Boolean);
      return { creators: handles.map((h, i) => ({ id: String(i + 1), handle: h.trim(), name: h.trim(), status: 'inactive' })) };
    }
    case 'f60': {
      const titles = (formValues.contentHistory || '').split('\n').filter(Boolean);
      return { contentHistory: titles.map((t, i) => ({ id: String(i + 1), title: t.trim(), date: new Date().toISOString(), views: 0 })) };
    }
    case 'f87': {
      return { audioData: { transcriptText: formValues.transcriptText || '', duration: parseFloat(formValues.duration) || 0 } };
    }
    case 'f88': {
      return { editingData: { totalDuration: parseFloat(formValues.totalDuration) || 0, cuts: parseFloat(formValues.cuts) || 0, transitions: parseFloat(formValues.transitions) || 0 } };
    }
    case 'f89': {
      return { videoData: { title: formValues.title || '', views: parseFloat(formValues.views) || 0, impressions: parseFloat(formValues.impressions) || 0, avgWatchTime: parseFloat(formValues.avgWatchTime) || 0 } };
    }
    case 'f96': {
      const ideas = (formValues.ideas || '').split('\n').filter(Boolean);
      return { ideas: ideas.map((idea, i) => ({ id: `idea_${i + 1}`, title: idea.trim(), description: idea.trim(), potentialScore: 50 })) };
    }
    case 'f102': {
      const titles = (formValues.recentTitles || '').split('\n').filter(Boolean);
      return { uploadHistory: titles.map((t, i) => ({ id: String(i + 1), title: t.trim(), date: new Date().toISOString(), engagement: 50 })) };
    }
    default:
      return {};
  }
}

// ── Reusable Feature Card ──
function FeatureCard({
  featureId,
  featureName,
  featureCode,
  description,
  vqtCost,
  fields,
  formValues,
  setFormValue,
  isLoading,
  result,
  onRun,
}: {
  featureId: string;
  featureName: string;
  featureCode: string;
  description: string;
  vqtCost: number;
  fields: FieldDef[];
  formValues: Record<string, string>;
  setFormValue: (key: string, value: string) => void;
  isLoading: boolean;
  result: FeatureResult | null;
  onRun: () => void;
}) {
  return (
    <Card className="border-[#E5E7EB]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#0B0F19] flex items-center gap-2">
            <span style={{ color: MODULE_COLOR }}>{getFeatureIcon(featureId)}</span>
            {featureCode}: {featureName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-[#8B5CF6] text-[#8B5CF6] text-xs">
              LIMINAL
            </Badge>
            <Badge className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-none text-xs">
              {vqtCost} VQT
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs text-[#6B7280]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <Label className="text-xs text-[#6B7280]">{field.label}</Label>
            {field.type === 'textarea' ? (
              <Textarea
                placeholder={field.placeholder}
                value={formValues[field.key] || ''}
                onChange={(e) => setFormValue(field.key, e.target.value)}
                className="min-h-[60px] text-sm"
              />
            ) : field.type === 'number' ? (
              <Input
                type="number"
                placeholder={field.placeholder}
                value={formValues[field.key] || ''}
                onChange={(e) => setFormValue(field.key, e.target.value)}
                className="text-sm"
              />
            ) : (
              <Input
                placeholder={field.placeholder}
                value={formValues[field.key] || ''}
                onChange={(e) => setFormValue(field.key, e.target.value)}
                className="text-sm"
              />
            )}
          </div>
        ))}
        <Button
          onClick={onRun}
          disabled={isLoading}
          size="sm"
          className="w-full gap-2"
          style={{ backgroundColor: MODULE_COLOR }}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run {featureName}
        </Button>
        {result && (
          <FeatureResultPanel
            result={result}
            featureId={featureId}
            featureName={featureName}
            source={result.source}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ── Feature List Renderer for a tab ──
function FeatureList({
  featureIds,
  allFeatures,
  formValues,
  setFormValues,
  runningFeatures,
  featureResults,
  onRunFeature,
  gridCols = 'grid md:grid-cols-2 gap-4',
}: {
  featureIds: string[];
  allFeatures: Record<string, { id: string; code: string; name: string; description: string; vqtCost: number }>;
  formValues: Record<string, Record<string, string>>;
  setFormValues: (featureId: string, key: string, value: string) => void;
  runningFeatures: Record<string, boolean>;
  featureResults: Record<string, FeatureResult>;
  onRunFeature: (featureId: string) => void;
  gridCols?: string;
}) {
  return (
    <div className={gridCols}>
      {featureIds.map((fid) => {
        const f = allFeatures[fid];
        if (!f) return null;
        const fields = FEATURE_INPUTS[fid] || [];
        const fv = formValues[fid] || {};
        return (
          <FeatureCard
            key={fid}
            featureId={fid}
            featureName={f.name}
            featureCode={f.code}
            description={f.description}
            vqtCost={f.vqtCost}
            fields={fields}
            formValues={fv}
            setFormValue={(key, value) => setFormValues(fid, key, value)}
            isLoading={!!runningFeatures[fid]}
            result={featureResults[fid] || null}
            onRun={() => onRunFeature(fid)}
          />
        );
      })}
    </div>
  );
}

// ── Main Liminal Page ──
export function LiminalPage() {
  const { allFeatures } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const liminalFeatures = allFeatures.filter((f) => f.requiresLiminal);

  // Build lookup map for features
  const featureMap: Record<string, { id: string; code: string; name: string; description: string; vqtCost: number }> = {};
  liminalFeatures.forEach((f) => {
    featureMap[f.id] = { id: f.id, code: f.code, name: f.name, description: f.description, vqtCost: f.vqtCost };
  });

  const [activeTab, setActiveTab] = useState('audience');
  const [runningFeatures, setRunningFeatures] = useState<Record<string, boolean>>({});
  const [featureResults, setFeatureResults] = useState<Record<string, FeatureResult>>({});
  const [aiSource, setAiSource] = useState<string>('browser');

  // Per-feature form values
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});

  const setFormValue = useCallback((featureId: string, key: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [featureId]: { ...prev[featureId], [key]: value },
    }));
  }, []);

  const executeFeature = async (featureId: string) => {
    const feature = liminalFeatures.find((f) => f.id === featureId);
    if (!feature) return;

    // Check token balance
    if (feature.vqtCost > 0) {
      const success = spendTokens(feature.vqtCost, featureId, `Used ${feature.name}`);
      if (!success) {
        toast.error('Insufficient VQT balance. Please purchase more tokens.');
        return;
      }
    }

    setRunningFeatures((prev) => ({ ...prev, [featureId]: true }));
    try {
      const fv = formValues[featureId] || {};
      const input = buildFeatureInput(featureId, fv);
      const result = await featureEngine.executeFeature(featureId, input);
      setFeatureResults((prev) => ({ ...prev, [featureId]: result }));
      setAiSource(result.source);
      if (result.success) {
        toast.success(`${feature.name} completed!`);
      } else {
        toast.error(`${feature.name} returned an error.`);
      }
    } catch {
      toast.error(`${feature.name} failed.`);
    } finally {
      setRunningFeatures((prev) => ({ ...prev, [featureId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${MODULE_COLOR}15` }}>
            <Ghost className="w-6 h-6" style={{ color: MODULE_COLOR }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Liminal</h1>
            <p className="text-sm text-[#6B7280]">The shadow self of your content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Cpu className="w-3 h-3" />
            AI: {aiSource}
          </Badge>
          <Badge className="border-none font-mono" style={{ backgroundColor: `${MODULE_COLOR}15`, color: MODULE_COLOR }}>
            {liminalFeatures.length} FEATURES
          </Badge>
        </div>
      </div>

      {/* Warning banner */}
      <Alert className="border-amber-300 bg-amber-50">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <AlertTitle className="text-amber-800">Psychological Risk Warning</AlertTitle>
        <AlertDescription className="text-amber-700">
          Liminal features analyze deep psychological patterns and may reveal uncomfortable truths about
          your content, audience, and mental state. Use with caution and consider professional support if needed.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9] flex-wrap h-auto gap-1">
          <TabsTrigger value="audience">Audience Liminal</TabsTrigger>
          <TabsTrigger value="content">Content Liminal</TabsTrigger>
          <TabsTrigger value="revenue">Revenue &amp; Strategy</TabsTrigger>
          <TabsTrigger value="all">All Liminal Features</TabsTrigger>
        </TabsList>

        {/* Audience Liminal Tab: f29, f30, f31, f32 */}
        <TabsContent value="audience" className="space-y-4">
          <p className="text-sm text-[#6B7280]">
            Features that peer into the hidden corners of your audience — their ghost signals, parasocial bonds, and deleted traces.
          </p>
          <FeatureList
            featureIds={AUDIENCE_LIMINAL}
            allFeatures={featureMap}
            formValues={formValues}
            setFormValues={setFormValue}
            runningFeatures={runningFeatures}
            featureResults={featureResults}
            onRunFeature={executeFeature}
          />
        </TabsContent>

        {/* Content Liminal Tab: f87, f88, f89, f96 */}
        <TabsContent value="content" className="space-y-4">
          <p className="text-sm text-[#6B7280]">
            Analyze the invisible patterns in your creative process — vocal fractures, editing rhythms, dead content, and the ideas you never shipped.
          </p>
          <FeatureList
            featureIds={CONTENT_LIMINAL}
            allFeatures={featureMap}
            formValues={formValues}
            setFormValues={setFormValue}
            runningFeatures={runningFeatures}
            featureResults={featureResults}
            onRunFeature={executeFeature}
          />
        </TabsContent>

        {/* Revenue & Strategy Tab: f43, f59, f60, f102 */}
        <TabsContent value="revenue" className="space-y-4">
          <p className="text-sm text-[#6B7280]">
            Strategic liminal analysis — hidden sponsorship opportunities, abandoned creator audiences, your digital doppelgänger, and burnout prediction.
          </p>
          <FeatureList
            featureIds={REVENUE_STRATEGY}
            allFeatures={featureMap}
            formValues={formValues}
            setFormValues={setFormValue}
            runningFeatures={runningFeatures}
            featureResults={featureResults}
            onRunFeature={executeFeature}
          />
        </TabsContent>

        {/* All Liminal Features Tab */}
        <TabsContent value="all" className="space-y-4">
          <p className="text-sm text-[#6B7280]">
            All {liminalFeatures.length} liminal features across every module — Listener, Bank, Arena, Studio, and Growth.
          </p>
          <FeatureList
            featureIds={ALL_LIMINAL}
            allFeatures={featureMap}
            formValues={formValues}
            setFormValues={setFormValue}
            runningFeatures={runningFeatures}
            featureResults={featureResults}
            onRunFeature={executeFeature}
            gridCols="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
