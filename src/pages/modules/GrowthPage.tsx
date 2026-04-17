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
import { TrendingUp, Heart, Clock, Search, Target, BarChart3, Zap, Loader2, Play, Lock, Brain, Calendar, Compass, AlertCircle } from 'lucide-react';

const PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin'] as const;
const COLOR = '#00D4AA';

interface Field { key: string; label: string; placeholder: string; type: 'text' | 'textarea' | 'number' | 'select'; options?: { label: string; value: string }[]; }

const INPUT_CONFIGS: Record<string, Field[]> = {
  f97: [{ key: 'channel', label: 'Channel Name', placeholder: '@creatorname', type: 'text' }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f98: [{ key: 'handle', label: 'Channel URL or Handle', placeholder: '@creatorname or channel URL', type: 'text' }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f99: [{ key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }, { key: 'timezone', label: 'Timezone', placeholder: 'WAT (GMT+1)', type: 'text' }],
  f100: [{ key: 'keywords', label: 'Seed Keywords (one per line)', placeholder: 'content creation\nvideo editing\nsocial media growth', type: 'textarea' }, { key: 'niche', label: 'Niche', placeholder: 'e.g., tech, fitness, cooking', type: 'text' }],
  f101: [{ key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }, { key: 'weeksBack', label: 'Weeks to Analyze', placeholder: '4', type: 'number' }],
  f102: [{ key: 'videos', label: 'Recent Video Titles (one per line)', placeholder: 'My Top 10 Tools for 2024\nDay in My Life as a Creator\nHow I Hit 100K Subscribers', type: 'textarea' }],
  f103: [{ key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }, { key: 'timezone', label: 'Audience Timezone', placeholder: 'WAT (GMT+1)', type: 'text' }],
  f104: [{ key: 'handle', label: 'Channel Handle', placeholder: '@creatorname', type: 'text' }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f105: [{ key: 'competitors', label: 'Competitor Channels (one per line)', placeholder: '@competitor1\n@competitor2\n@competitor3', type: 'textarea' }, { key: 'niche', label: 'Your Niche', placeholder: 'tech, fitness, cooking', type: 'text' }],
  f106: [{ key: 'videoUrls', label: 'Video URLs or Titles (one per line)', placeholder: 'https://youtube.com/watch?v=abc\nMy viral video title', type: 'textarea' }, { key: 'audienceSize', label: 'Current Audience Size', placeholder: '15000', type: 'number' }],
  f107: [{ key: 'sourcePlatform', label: 'Source Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }, { key: 'targetPlatform', label: 'Target Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f108: [{ key: 'uploadsPerWeek', label: 'Uploads Per Week', placeholder: '3', type: 'number' }, { key: 'hoursPerVideo', label: 'Hours Per Video', placeholder: '8', type: 'number' }],
  f123: [{ key: 'handle', label: 'Channel Handle', placeholder: '@creatorname', type: 'text' }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
};

function getIcon(id: string) {
  const icons: Record<string, React.ReactNode> = {
    f97: <Target className="w-4 h-4" />, f98: <Heart className="w-4 h-4" />, f99: <Clock className="w-4 h-4" />,
    f100: <Search className="w-4 h-4" />, f101: <BarChart3 className="w-4 h-4" />, f102: <Brain className="w-4 h-4" />,
    f103: <Calendar className="w-4 h-4" />, f104: <Target className="w-4 h-4" />, f105: <Compass className="w-4 h-4" />,
    f106: <Zap className="w-4 h-4" />, f107: <TrendingUp className="w-4 h-4" />, f108: <AlertCircle className="w-4 h-4" />,
    f123: <BarChart3 className="w-4 h-4" />,
  };
  return icons[id] || <TrendingUp className="w-4 h-4" />;
}

function buildInput(fid: string, vals: Record<string, string>): Record<string, unknown> {
  const inp: Record<string, unknown> = {};
  const config = INPUT_CONFIGS[fid];
  if (!config) return inp;
  for (const f of config) {
    const v = vals[f.key] || ''; if (!v) continue;
    if (f.type === 'number') inp[f.key] = parseFloat(v) || 0;
    else if (f.type === 'textarea' && ['f100', 'f105', 'f106', 'f102'].includes(fid)) {
      inp[f.key] = v.split('\n').filter(Boolean);
    } else { inp[f.key] = v; }
  }
  return inp;
}

export function GrowthPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('growth');
  const [activeTab, setActiveTab] = useState('intel');
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, FeatureResult>>({});
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});
  const gi = (fid: string, k: string) => inputs[fid]?.[k] || '';
  const si = (fid: string, k: string, v: string) => setInputs(p => ({ ...p, [fid]: { ...p[fid], [k]: v } }));
  const isRun = (fid: string) => running[fid] === true;

  const run = useCallback(async (fid: string, cost: number, name: string, input: Record<string, unknown>) => {
    if (running[fid]) return;
    if (cost > 0) { const ok = spendTokens(cost, fid, `Used ${name}`); if (!ok) { toast.error('Insufficient VQT balance.'); return; } }
    setRunning(p => ({ ...p, [fid]: true }));
    try { const r = await featureEngine.executeFeature(fid, input); setResults(p => ({ ...p, [fid]: r })); toast.success(r.success ? `${name} completed!` : `${name} returned an error.`); }
    catch { toast.error(`${name} failed.`); } finally { setRunning(p => ({ ...p, [fid]: false })); }
  }, [running, spendTokens]);

  const renderCard = (fid: string) => {
    const f = features.find(x => x.id === fid); if (!f) return null;
    const config = INPUT_CONFIGS[fid];
    return (
      <Card key={fid} className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#0B0F19] flex items-center gap-2">
              <span style={{ color: COLOR }}>{getIcon(fid)}</span>{f.code}: {f.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              {f.requiresLiminal && <Badge variant="outline" className="gap-1 border-[#8B5CF6] text-[#8B5CF6] text-xs"><Lock className="w-3 h-3" />LIMINAL</Badge>}
              <Badge className="text-xs" style={{ backgroundColor: COLOR + '20', color: COLOR }}>{f.vqtCost > 0 ? `${f.vqtCost} VQT` : 'Free'}</Badge>
            </div>
          </div>
          <CardDescription className="text-xs text-[#6B7280]">{f.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {config?.map(field => (
            <div key={field.key} className="space-y-1">
              <Label className="text-xs text-[#6B7280]">{field.label}</Label>
              {field.type === 'textarea' ? <Textarea placeholder={field.placeholder} value={gi(fid, field.key)} onChange={e => si(fid, field.key, e.target.value)} className="min-h-[60px] text-sm" />
                : field.type === 'select' ? <div className="flex flex-wrap gap-1">{field.options?.map(o => <Button key={o.value} size="sm" variant={gi(fid, field.key) === o.value ? 'default' : 'outline'} onClick={() => si(fid, field.key, o.value)} style={gi(fid, field.key) === o.value ? { backgroundColor: COLOR } : {}} className="text-xs h-7">{o.label}</Button>)}</div>
                : field.type === 'number' ? <Input type="number" placeholder={field.placeholder} value={gi(fid, field.key)} onChange={e => si(fid, field.key, e.target.value)} className="text-sm" />
                : <Input placeholder={field.placeholder} value={gi(fid, field.key)} onChange={e => si(fid, field.key, e.target.value)} className="text-sm" />}
            </div>
          ))}
          <Button onClick={() => run(fid, f.vqtCost, f.name, buildInput(fid, inputs[fid] || {}))} disabled={isRun(fid)} size="sm" className="w-full gap-2" style={{ backgroundColor: COLOR }}>
            {isRun(fid) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} {isRun(fid) ? 'Running...' : `Run ${f.name}`}
          </Button>
          {results[fid] && <FeatureResultPanel result={results[fid]} featureId={fid} featureName={f.name} source={results[fid].source} />}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-[#00D4AA]" /></div>
          <div><h1 className="text-2xl font-bold text-[#0B0F19]">Growth</h1><p className="text-sm text-[#6B7280]">Grow smarter, not harder</p></div>
        </div>
        <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none font-mono">{features.length} FEATURES</Badge>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9] flex-wrap h-auto gap-1">
          <TabsTrigger value="intel">Growth Intel</TabsTrigger>
          <TabsTrigger value="keywords">Keywords &amp; Content</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="liminal">Liminal</TabsTrigger>
          <TabsTrigger value="features">All Features</TabsTrigger>
        </TabsList>
        <TabsContent value="intel" className="space-y-4"><div className="grid lg:grid-cols-2 gap-4">{['f98', 'f99', 'f103', 'f104', 'f97', 'f123'].map(renderCard)}</div></TabsContent>
        <TabsContent value="keywords" className="space-y-4"><div className="grid lg:grid-cols-2 gap-4">{['f100', 'f105', 'f106'].map(renderCard)}</div></TabsContent>
        <TabsContent value="wellness" className="space-y-4"><div className="grid lg:grid-cols-2 gap-4">{['f107', 'f108', 'f101'].map(renderCard)}</div></TabsContent>
        <TabsContent value="liminal" className="space-y-4">
          <Card className="border-[#8B5CF6]/20 bg-[#8B5CF6]/5"><CardContent className="p-4 flex items-center gap-3"><Lock className="w-5 h-5 text-[#8B5CF6]" /><p className="text-sm text-[#8B5CF6]">Liminal features use advanced intelligence for deep growth analysis.</p></CardContent></Card>
          {renderCard('f102')}
        </TabsContent>
        <TabsContent value="features" className="space-y-4"><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{features.map(f => renderCard(f.id))}</div></TabsContent>
      </Tabs>
    </div>
  );
}
