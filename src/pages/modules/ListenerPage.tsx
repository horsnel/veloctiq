import { useState, useCallback, useEffect } from 'react';
import { useFeatureStore, useTokenStore } from '@/stores';
import { featureEngine, type FeatureResult } from '@/services/FeatureEngine';
import { FeatureResultPanel } from '@/components/FeatureResultPanel';
import { mockListenerData } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Ear, Users, Trophy, Heart, Play, Loader2, Lock, Zap, MessageSquare,
  TrendingUp, TrendingDown, Minus, BarChart3, Brain, Ghost, Eye,
  Activity, Sparkles, Target, Radio, FileText, Search,
} from 'lucide-react';

const PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin'] as const;
const COLOR = '#10B981';

interface Field { key: string; label: string; placeholder: string; type: 'text' | 'textarea' | 'number' | 'select'; options?: { label: string; value: string }[]; }

const INPUT_CONFIGS: Record<string, Field[]> = {
  f16: [{ key: 'comments', label: 'Audience Comments (one per line)', placeholder: 'I wish they made a case for this phone\nWhere can I buy this mic?\nHow much is the editing software?', type: 'textarea' }],
  f17: [{ key: 'content', label: 'Content to Analyze', placeholder: 'Paste your content text or description...', type: 'textarea' }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f18: [{ key: 'userData', label: 'User Engagement Data (username, comments, likes per line)', placeholder: 'john_doe, "Love this content!", 45\njane_smith, "Great tutorial", 32', type: 'textarea' }],
  f19: [{ key: 'questions', label: 'Questions to Deduplicate (one per line)', placeholder: 'How do I start a YouTube channel?\nHow to start YouTube?\nWhat camera should I buy for YouTube?', type: 'textarea' }],
  f20: [{ key: 'comments', label: 'Comments for Tone Analysis (one per line)', placeholder: 'This used to be so good, now it is just okay\nAmazing content as always!\nI am disappointed with this one\nKeep up the great work!', type: 'textarea' }, { key: 'timeRange', label: 'Time Range (days)', placeholder: '30', type: 'number' }],
  f21: [{ key: 'content', label: 'Content Description', placeholder: 'Describe the content you want to predict virality for...', type: 'textarea' }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f22: [{ key: 'handle', label: 'Account Handle or URL', placeholder: '@creatorname or channel URL', type: 'text' }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f23: [{ key: 'postData', label: 'Post Data (date,views,likes per line)', placeholder: '2024-01-01,5000,200\n2024-01-08,4500,180\n2024-01-15,6000,300', type: 'textarea' }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f24: [{ key: 'comments', label: 'Multilingual Comments (one per line)', placeholder: 'Great video! / Excellent vidéo! / Excelente! / いいね', type: 'textarea' }],
  f25: [{ key: 'url', label: 'URL or Channel to Analyze', placeholder: 'https://youtube.com/@channel or channel name', type: 'text' }],
  f26: [{ key: 'comments', label: 'Comment Samples (one per line)', placeholder: 'This reminds me of when I was younger...\nI have been watching for 5 years straight\nMy kids love your content', type: 'textarea' }],
  f27: [{ key: 'handle', label: 'Account Handle', placeholder: '@creatorname', type: 'text' }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f28: [{ key: 'topic', label: 'Topic or Niche Context', placeholder: 'Enter your content topic or niche...', type: 'textarea' }, { key: 'audienceSize', label: 'Current Audience Size', placeholder: '15000', type: 'number' }],
  f29: [{ key: 'audienceData', label: 'Audience Data or Comments', placeholder: 'Paste audience comments or behavioral data to analyze haunting patterns...', type: 'textarea' }],
  f30: [{ key: 'comments', label: 'Comments for Intimacy Analysis', placeholder: 'Paste comments to detect parasocial intimacy leaks...', type: 'textarea' }],
  f31: [{ key: 'contentUrl', label: 'Content URL or Video URL', placeholder: 'https://youtube.com/watch?v=... or any content URL', type: 'text' }],
  f32: [{ key: 'postUrls', label: 'Post URLs (one per line)', placeholder: 'https://youtube.com/watch?v=abc123\nhttps://instagram.com/p/xyz789', type: 'textarea' }],
};

function getIcon(id: string) {
  const icons: Record<string, React.ReactNode> = {
    f16: <Heart className="w-4 h-4" />, f17: <Activity className="w-4 h-4" />, f18: <Trophy className="w-4 h-4" />,
    f19: <FileText className="w-4 h-4" />, f20: <TrendingUp className="w-4 h-4" />, f21: <Zap className="w-4 h-4" />,
    f22: <Users className="w-4 h-4" />, f23: <BarChart3 className="w-4 h-4" />, f24: <MessageSquare className="w-4 h-4" />,
    f25: <Search className="w-4 h-4" />, f26: <Brain className="w-4 h-4" />, f27: <Ghost className="w-4 h-4" />,
    f28: <Sparkles className="w-4 h-4" />, f29: <Radio className="w-4 h-4" />, f30: <Eye className="w-4 h-4" />,
    f31: <FileText className="w-4 h-4" />, f32: <MessageSquare className="w-4 h-4" />,
  };
  return icons[id] || <Ear className="w-4 h-4" />;
}

function buildInput(fid: string, vals: Record<string, string>): Record<string, unknown> {
  const inp: Record<string, unknown> = {};
  const config = INPUT_CONFIGS[fid];
  if (!config) return inp;
  for (const f of config) {
    const v = vals[f.key] || '';
    if (!v) continue;
    if (f.type === 'number') inp[f.key] = parseFloat(v) || 0;
    else if (f.type === 'textarea' && f.key === 'comments' && ['f20'].includes(fid)) {
      inp[f.key] = v.split('\n').filter(Boolean).map((t, i) => ({ id: String(i + 1), text: t, timestamp: new Date().toISOString(), likes: Math.floor(Math.random() * 30) }));
    } else if (f.type === 'textarea' && f.key === 'comments' && ['f16'].includes(fid)) {
      inp[f.key] = v.split('\n').filter(Boolean).map((t, i) => ({ id: String(i + 1), text: t, timestamp: new Date().toISOString(), likes: Math.floor(Math.random() * 30) }));
    } else if (f.type === 'textarea' && f.key === 'comments' && ['f26'].includes(fid)) {
      inp['comments'] = v.split('\n').filter(Boolean).map((t, i) => ({ id: String(i + 1), text: t, timestamp: new Date().toISOString(), likes: Math.floor(Math.random() * 30) }));
    } else if (f.type === 'textarea' && f.key === 'userData') {
      inp[f.key] = v.split('\n').filter(Boolean).map((line, i) => {
        const parts = line.split(',').map(p => p.trim());
        return { id: String(i + 1), username: parts[0] || '', text: parts[1] || '', likes: parseInt(parts[2]) || 0, timestamp: new Date().toISOString() };
      });
    } else if (f.type === 'textarea' && f.key === 'postData') {
      inp[f.key] = v.split('\n').filter(Boolean).map((line, i) => {
        const parts = line.split(',').map(p => p.trim());
        return { id: String(i + 1), date: parts[0] || '', views: parseInt(parts[1]) || 0, likes: parseInt(parts[2]) || 0 };
      });
    } else if (f.type === 'textarea' && f.key === 'questions') {
      inp[f.key] = v.split('\n').filter(Boolean);
    } else if (f.type === 'textarea' && f.key === 'postUrls') {
      inp[f.key] = v.split('\n').filter(Boolean).map((url, i) => ({ id: String(i + 1), url }));
    } else if (f.type === 'textarea' && f.key === 'audienceData') {
      inp[f.key] = v.split('\n').filter(Boolean).map((t, i) => ({ id: String(i + 1), text: t, timestamp: new Date().toISOString(), likes: Math.floor(Math.random() * 20) }));
    } else {
      inp[f.key] = v;
    }
  }
  return inp;
}

export function ListenerPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('listener');
  const [activeTab, setActiveTab] = useState('overview');
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, FeatureResult>>({});
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});

  const gi = (fid: string, k: string) => inputs[fid]?.[k] || '';
  const si = (fid: string, k: string, v: string) => setInputs(p => ({ ...p, [fid]: { ...p[fid], [k]: v } }));
  const isRun = (fid: string) => running[fid] === true;

  const run = useCallback(async (fid: string, cost: number, name: string, input: Record<string, unknown>) => {
    if (running[fid]) return;
    if (cost > 0) {
      const ok = spendTokens(cost, fid, `Used ${name}`);
      if (!ok) { toast.error('Insufficient VQT balance.'); return; }
    }
    setRunning(p => ({ ...p, [fid]: true }));
    try {
      const r = await featureEngine.executeFeature(fid, input);
      setResults(p => ({ ...p, [fid]: r }));
      toast.success(r.success ? `${name} completed!` : `${name} returned an error.`);
    } catch { toast.error(`${name} failed.`); }
    finally { setRunning(p => ({ ...p, [fid]: false })); }
  }, [running, spendTokens]);

  const sentimentTrend = mockListenerData.sentimentAnalysis.trends;
  const latestSentiment = sentimentTrend[sentimentTrend.length - 1].score;
  const previousSentiment = sentimentTrend[sentimentTrend.length - 2].score;

  const renderFeatureCard = (fid: string) => {
    const f = features.find(x => x.id === fid);
    if (!f) return null;
    const config = INPUT_CONFIGS[fid];
    return (
      <Card key={fid} className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#0B0F19] flex items-center gap-2">
              <span style={{ color: COLOR }}>{getIcon(fid)}</span>
              {f.code}: {f.name}
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
              {field.type === 'textarea' ? (
                <Textarea placeholder={field.placeholder} value={gi(fid, field.key)} onChange={e => si(fid, field.key, e.target.value)} className="min-h-[60px] text-sm" />
              ) : field.type === 'select' ? (
                <div className="flex flex-wrap gap-1">
                  {field.options?.map(o => (
                    <Button key={o.value} size="sm" variant={gi(fid, field.key) === o.value ? 'default' : 'outline'} onClick={() => si(fid, field.key, o.value)} style={gi(fid, field.key) === o.value ? { backgroundColor: COLOR } : {}} className="text-xs h-7">{o.label}</Button>
                  ))}
                </div>
              ) : field.type === 'number' ? (
                <Input type="number" placeholder={field.placeholder} value={gi(fid, field.key)} onChange={e => si(fid, field.key, e.target.value)} className="text-sm" />
              ) : (
                <Input placeholder={field.placeholder} value={gi(fid, field.key)} onChange={e => si(fid, field.key, e.target.value)} className="text-sm" />
              )}
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
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center"><Ear className="w-6 h-6 text-[#10B981]" /></div>
          <div><h1 className="text-2xl font-bold text-[#0B0F19]">Listener</h1><p className="text-sm text-[#6B7280]">Understand your audience without guessing</p></div>
        </div>
        <Badge className="bg-[#10B981]/10 text-[#10B981] border-none font-mono">{features.length} FEATURES</Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]"><CardContent className="p-4"><p className="text-xs text-[#6B7280] mb-1">Overall Sentiment</p><p className="text-2xl font-bold text-[#0B0F19]">{mockListenerData.sentimentAnalysis.overall}%</p><div className={cn("flex items-center gap-1 text-sm", latestSentiment - previousSentiment > 0 ? 'text-[#00D4AA]' : 'text-[#EF4444]')}>{latestSentiment - previousSentiment > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{Math.abs(latestSentiment - previousSentiment).toFixed(1)}%</div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="p-4"><p className="text-xs text-[#6B7280] mb-1">Ghost Audience</p><p className="text-2xl font-bold text-[#0B0F19]">{mockListenerData.ghostAudience.percentage}%</p><p className="text-xs text-[#6B7280]">{mockListenerData.ghostAudience.total.toLocaleString()} accounts</p></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="p-4"><p className="text-xs text-[#6B7280] mb-1">Super Fans</p><p className="text-2xl font-bold text-[#0B0F19]">{mockListenerData.superFans.length}</p><p className="text-xs text-[#6B7280]">Top 1% engagers</p></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="p-4"><p className="text-xs text-[#6B7280] mb-1">Wishlist Items</p><p className="text-2xl font-bold text-[#0B0F19]">{mockListenerData.wishlist.length}</p><p className="text-xs text-[#6B7280]">From comments</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9] flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience Intel</TabsTrigger>
          <TabsTrigger value="signals">Signals &amp; Demographics</TabsTrigger>
          <TabsTrigger value="deep">Deep Analysis</TabsTrigger>
          <TabsTrigger value="liminal">Liminal</TabsTrigger>
          <TabsTrigger value="features">All Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">{mockListenerData.audienceSegments.map(s => (
            <Card key={s.id} className="border-[#E5E7EB]"><CardContent className="p-4">
              <div className="flex items-center justify-between mb-3"><h4 className="font-medium text-[#0B0F19]">{s.name}</h4><Badge className="bg-[#10B981]/10 text-[#10B981] border-none">{s.percentage}%</Badge></div>
              <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-[#6B7280]" /><span className="text-sm text-[#6B7280]">Soul Age: {s.soulAge}</span></div>
              <div className="flex flex-wrap gap-2">{s.interests.map(i => <span key={i} className="px-2 py-1 text-xs bg-[#F6F7F9] rounded-full text-[#6B7280]">{i}</span>)}</div>
            </CardContent></Card>
          ))}</div>
          <Card className="border-[#E5E7EB]"><CardHeader><CardTitle className="text-lg font-semibold text-[#0B0F19]">Sentiment Breakdown</CardTitle></CardHeader><CardContent>
            <div className="h-4 rounded-full overflow-hidden flex">
              <div className="bg-[#00D4AA]" style={{ width: `${mockListenerData.sentimentAnalysis.breakdown.positive}%` }} />
              <div className="bg-[#6B7280]" style={{ width: `${mockListenerData.sentimentAnalysis.breakdown.neutral}%` }} />
              <div className="bg-[#EF4444]" style={{ width: `${mockListenerData.sentimentAnalysis.breakdown.negative}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-[#00D4AA]">Positive {mockListenerData.sentimentAnalysis.breakdown.positive}%</span>
              <span className="text-[#6B7280]">Neutral {mockListenerData.sentimentAnalysis.breakdown.neutral}%</span>
              <span className="text-[#EF4444]">Negative {mockListenerData.sentimentAnalysis.breakdown.negative}%</span>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {['f16', 'f17', 'f18', 'f19', 'f20'].map(id => renderFeatureCard(id))}
          </div>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {['f21', 'f22', 'f23', 'f24', 'f25'].map(id => renderFeatureCard(id))}
          </div>
        </TabsContent>

        <TabsContent value="deep" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {['f26', 'f27', 'f28'].map(id => renderFeatureCard(id))}
          </div>
        </TabsContent>

        <TabsContent value="liminal" className="space-y-4">
          <Card className="border-[#8B5CF6]/20 bg-[#8B5CF6]/5"><CardContent className="p-4 flex items-center gap-3"><Lock className="w-5 h-5 text-[#8B5CF6]" /><p className="text-sm text-[#8B5CF6]">Liminal features use advanced intelligence for deep audience analysis.</p></CardContent></Card>
          <div className="grid lg:grid-cols-2 gap-4">
            {['f29', 'f30', 'f31', 'f32'].map(id => renderFeatureCard(id))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => renderFeatureCard(f.id))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
