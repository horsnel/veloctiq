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
import { Rocket, PenTool, Bot, MessageSquare, FileText, Wand2, Image, ToggleLeft, Zap, Send, Loader2, Play, Lock, Link2, Shield, Palette, AlertTriangle } from 'lucide-react';

const PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin'] as const;
const COLOR = '#6366F1';

interface Field { key: string; label: string; placeholder: string; type: 'text' | 'textarea' | 'number' | 'select'; options?: { label: string; value: string }[]; }

const INPUT_CONFIGS: Record<string, Field[]> = {
  f65: [{ key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f66: [{ key: 'topic', label: 'Content Topic', placeholder: 'What should the AI write about?', type: 'textarea' }, { key: 'tone', label: 'Tone', placeholder: '', type: 'select', options: [{ label: 'Professional', value: 'professional' }, { label: 'Casual', value: 'casual' }, { label: 'Humorous', value: 'humorous' }, { label: 'Authoritative', value: 'authoritative' }] }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f67: [{ key: 'actionType', label: 'Action Type', placeholder: '', type: 'select', options: [{ label: 'Like', value: 'like' }, { label: 'Reply', value: 'reply' }, { label: 'Share', value: 'share' }, { label: 'Save', value: 'save' }, { label: 'Subscribe', value: 'subscribe' }] }],
  f68: [{ key: 'items', label: 'Engagement Items (priority, action per line)', placeholder: 'high, Reply to @user comment\nmedium, Like viral post\nlow, Share story', type: 'textarea' }],
  f69: [{ key: 'thread', label: 'Thread / Comment Text', placeholder: 'Paste the thread or comments to summarize...', type: 'textarea' }],
  f70: [{ key: 'content', label: 'Brand Voice Samples (paste existing content)', placeholder: 'Paste your existing content to train brand voice recognition...', type: 'textarea' }],
  f71: [{ key: 'sourceDimensions', label: 'Source Dimensions (e.g. 1920x1080)', placeholder: '1920x1080', type: 'text' }, { key: 'targetPlatform', label: 'Target Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f72: [{ key: 'mode', label: 'Auto-Pilot Mode', placeholder: '', type: 'select', options: [{ label: 'Enabled', value: 'on' }, { label: 'Disabled', value: 'off' }] }],
  f73: [{ key: 'comments', label: 'Comments to Transform', placeholder: 'Paste audience comments to turn into content ideas...', type: 'textarea' }, { key: 'format', label: 'Output Format', placeholder: '', type: 'select', options: [{ label: 'Blog Post', value: 'blog' }, { label: 'Video Script', value: 'video' }, { label: 'Social Post', value: 'social' }, { label: 'Thread', value: 'thread' }] }],
  f74: [{ key: 'message', label: 'Message to Route', placeholder: 'Paste the message to analyze sentiment and route...', type: 'textarea' }],
  f75: [{ key: 'references', label: 'Content URLs or References (one per line)', placeholder: 'https://youtube.com/watch?v=abc\nhttps://blog.example.com/post', type: 'textarea' }],
  f76: [{ key: 'mention', label: 'Influencer Mention / Tag', placeholder: 'Paste the mention text...', type: 'textarea' }, { key: 'replyTemplate', label: 'Reply Template (optional)', placeholder: 'Thanks for the shoutout! Check out...', type: 'text' }],
  f77: [{ key: 'context', label: 'Crisis Context', placeholder: 'Describe the crisis situation...', type: 'textarea' }, { key: 'severity', label: 'Severity Level', placeholder: '', type: 'select', options: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }, { label: 'Critical', value: 'critical' }] }],
  f78: [{ key: 'metrics', label: 'Engagement Metrics (date, rate% per line)', placeholder: '2024-01-01, 4.5\n2024-01-08, 3.8\n2024-01-15, 4.1', type: 'textarea' }],
  f128: [{ key: 'items', label: 'Items to Bulk-Act On (one per line)', placeholder: 'Approve @user1 comment\nDelete spam comment\nPin top post', type: 'textarea' }, { key: 'actionType', label: 'Action Type', placeholder: '', type: 'select', options: [{ label: 'Approve', value: 'approve' }, { label: 'Delete', value: 'delete' }, { label: 'Pin', value: 'pin' }, { label: 'Archive', value: 'archive' }] }],
  f132: [{ key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://hooks.zapier.com/hooks/catch/...', type: 'text' }, { key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
};

function getIcon(id: string) {
  const icons: Record<string, React.ReactNode> = {
    f65: <Shield className="w-4 h-4" />, f66: <PenTool className="w-4 h-4" />, f67: <ToggleLeft className="w-4 h-4" />,
    f68: <MessageSquare className="w-4 h-4" />, f69: <FileText className="w-4 h-4" />, f70: <Palette className="w-4 h-4" />,
    f71: <Image className="w-4 h-4" />, f72: <Bot className="w-4 h-4" />, f73: <Wand2 className="w-4 h-4" />,
    f74: <Send className="w-4 h-4" />, f75: <Link2 className="w-4 h-4" />, f76: <Zap className="w-4 h-4" />,
    f77: <AlertTriangle className="w-4 h-4" />, f78: <Rocket className="w-4 h-4" />, f128: <Bot className="w-4 h-4" />,
    f132: <Link2 className="w-4 h-4" />,
  };
  return icons[id] || <Zap className="w-4 h-4" />;
}

function buildInput(fid: string, vals: Record<string, string>): Record<string, unknown> {
  const inp: Record<string, unknown> = {};
  const config = INPUT_CONFIGS[fid];
  if (!config) return inp;
  for (const f of config) {
    const v = vals[f.key] || '';
    if (!v) continue;
    if (f.type === 'number') inp[f.key] = parseFloat(v) || 0;
    else if (f.type === 'textarea' && ['f68', 'f78'].includes(fid)) {
      inp[f.key] = v.split('\n').filter(Boolean).map((line, i) => {
        const parts = line.split(',').map(p => p.trim());
        return { id: String(i + 1), priority: parts[0] || 'medium', action: parts.slice(1).join(', ') };
      });
    } else if (f.type === 'textarea' && f.key === 'items' && fid === 'f128') {
      inp[f.key] = v.split('\n').filter(Boolean).map((t, i) => ({ id: String(i + 1), text: t, status: 'pending' }));
    } else if (f.type === 'textarea' && f.key === 'references') {
      inp[f.key] = v.split('\n').filter(Boolean).map((url, i) => ({ id: String(i + 1), url, title: url }));
    } else { inp[f.key] = v; }
  }
  return inp;
}

export function ActionHubPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('actionHub');
  const [activeTab, setActiveTab] = useState('tools');
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
          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center"><Rocket className="w-6 h-6 text-[#6366F1]" /></div>
          <div><h1 className="text-2xl font-bold text-[#0B0F19]">Action Hub</h1><p className="text-sm text-[#6B7280]">Automate your engagement</p></div>
        </div>
        <Badge className="bg-[#6366F1]/10 text-[#6366F1] border-none font-mono">{features.length} FEATURES</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9] flex-wrap h-auto gap-1">
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
          <TabsTrigger value="response">Response &amp; Routing</TabsTrigger>
          <TabsTrigger value="infra">Infrastructure</TabsTrigger>
          <TabsTrigger value="features">All Features</TabsTrigger>
        </TabsList>
        <TabsContent value="tools" className="space-y-4"><div className="grid lg:grid-cols-2 gap-4">{['f66', 'f68', 'f69', 'f73', 'f74'].map(renderCard)}</div></TabsContent>
        <TabsContent value="response" className="space-y-4"><div className="grid lg:grid-cols-2 gap-4">{['f75', 'f76', 'f77', 'f78'].map(renderCard)}</div></TabsContent>
        <TabsContent value="infra" className="space-y-4"><div className="grid lg:grid-cols-2 gap-4">{['f65', 'f67', 'f70', 'f71', 'f72', 'f128', 'f132'].map(renderCard)}</div></TabsContent>
        <TabsContent value="features" className="space-y-4"><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{features.map(f => renderCard(f.id))}</div></TabsContent>
      </Tabs>
    </div>
  );
}
