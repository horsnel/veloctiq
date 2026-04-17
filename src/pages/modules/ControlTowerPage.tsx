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
import { TowerControl, Shield, Bot, Users, FileCheck, Fingerprint, Database, Brain, Cpu, Plug, Download, UserPlus, Smartphone, Moon, Loader2, Play, Lock, Zap } from 'lucide-react';

const PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin'] as const;
const COLOR = '#3B82F6';

interface Field { key: string; label: string; placeholder: string; type: 'text' | 'textarea' | 'number' | 'select'; options?: { label: string; value: string }[]; }

const INPUT_CONFIGS: Record<string, Field[]> = {
  f109: [{ key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }],
  f110: [{ key: 'endpoint', label: 'API Endpoint URL', placeholder: 'https://api.example.com/v1/health', type: 'text' }],
  f111: [{ key: 'profiles', label: 'Profile Names/Handles (one per line)', placeholder: '@main_channel\n@brand_account\n@personal', type: 'textarea' }],
  f112: [{ key: 'content', label: 'Content or URLs to Check (one per line)', placeholder: 'Paste your content or video/page URLs to check FTC compliance...', type: 'textarea' }],
  f113: [{ key: 'content', label: 'Content to Verify', placeholder: 'Paste the content to verify authenticity...', type: 'textarea' }, { key: 'sourceType', label: 'Source Type', placeholder: '', type: 'select', options: [{ label: 'News Article', value: 'news' }, { label: 'Social Post', value: 'social' }, { label: 'Blog Post', value: 'blog' }, { label: 'Video', value: 'video' }] }],
  f114: [{ key: 'status', label: 'Status', placeholder: '', type: 'select', options: [{ label: 'Active', value: 'active' }] }],
  f115: [{ key: 'search', label: 'Partner Search', placeholder: 'Search for partners by name or niche...', type: 'text' }],
  f116: [{ key: 'scenario', label: 'Scenario Description', placeholder: 'Describe the scenario for the parallel creator to execute...', type: 'textarea' }, { key: 'audienceSize', label: 'Audience Size', placeholder: '15000', type: 'number' }],
  f117: [{ key: 'profileUrls', label: 'Social Profile URLs (one per line)', placeholder: 'https://youtube.com/@channel\nhttps://instagram.com/handle', type: 'textarea' }],
  f119: [{ key: 'platform', label: 'Platform', placeholder: '', type: 'select', options: PLATFORMS.map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p })) }, { key: 'apiKey', label: 'API Key', placeholder: 'Paste your API key...', type: 'text' }],
  f121: [{ key: 'tier', label: 'Current Tier', placeholder: '', type: 'select', options: [{ label: 'Free', value: 'free' }, { label: 'Pro', value: 'pro' }, { label: 'Enterprise', value: 'enterprise' }] }],
  f122: [{ key: 'reportType', label: 'Report Type', placeholder: '', type: 'select', options: [{ label: 'Revenue', value: 'revenue' }, { label: 'Analytics', value: 'analytics' }, { label: 'Growth', value: 'growth' }, { label: 'Engagement', value: 'engagement' }] }, { key: 'format', label: 'Export Format', placeholder: '', type: 'select', options: [{ label: 'PDF', value: 'pdf' }, { label: 'CSV', value: 'csv' }, { label: 'JSON', value: 'json' }] }],
  f125: [{ key: 'email', label: 'Team Member Email', placeholder: 'team@example.com', type: 'text' }, { key: 'role', label: 'Role', placeholder: '', type: 'select', options: [{ label: 'Admin', value: 'admin' }, { label: 'Editor', value: 'editor' }, { label: 'Viewer', value: 'viewer' }] }],
  f127: [{ key: 'status', label: 'PWA Status', placeholder: '', type: 'select', options: [{ label: 'Active', value: 'active' }] }],
  f131: [{ key: 'mode', label: 'Theme', placeholder: '', type: 'select', options: [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }] }],
};

function getIcon(id: string) {
  const icons: Record<string, React.ReactNode> = {
    f109: <Bot className="w-4 h-4" />, f110: <Cpu className="w-4 h-4" />, f111: <Users className="w-4 h-4" />,
    f112: <Shield className="w-4 h-4" />, f113: <Fingerprint className="w-4 h-4" />, f114: <Database className="w-4 h-4" />,
    f115: <Brain className="w-4 h-4" />, f116: <Zap className="w-4 h-4" />, f117: <Plug className="w-4 h-4" />,
    f119: <Cpu className="w-4 h-4" />, f121: <FileCheck className="w-4 h-4" />, f122: <Download className="w-4 h-4" />,
    f125: <UserPlus className="w-4 h-4" />, f127: <Smartphone className="w-4 h-4" />, f131: <Moon className="w-4 h-4" />,
  };
  return icons[id] || <TowerControl className="w-4 h-4" />;
}

const INFO_ONLY = new Set(['f114', 'f121', 'f127', 'f131']);

function buildInput(fid: string, vals: Record<string, string>): Record<string, unknown> {
  const inp: Record<string, unknown> = {};
  const config = INPUT_CONFIGS[fid]; if (!config) return inp;
  for (const f of config) { const v = vals[f.key] || ''; if (!v) continue; if (f.type === 'number') inp[f.key] = parseFloat(v) || 0; else inp[f.key] = v; }
  return inp;
}

export function ControlTowerPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('controlTower');
  const [activeTab, setActiveTab] = useState('security');
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
    const isInfo = INFO_ONLY.has(fid);
    return (
      <Card key={fid} className="border-[#E5E7EB]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#0B0F19] flex items-center gap-2">
              <span style={{ color: COLOR }}>{getIcon(fid)}</span>{f.code}: {f.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              {f.requiresLiminal && <Badge variant="outline" className="gap-1 border-[#8B5CF6] text-[#8B5CF6] text-xs"><Lock className="w-3 h-3" />LIMINAL</Badge>}
              <Badge className="text-xs" style={{ backgroundColor: COLOR + '20', color: COLOR }}>{isInfo ? 'Active' : f.vqtCost > 0 ? `${f.vqtCost} VQT` : 'Free'}</Badge>
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
          {!isInfo && (
            <Button onClick={() => run(fid, f.vqtCost, f.name, buildInput(fid, inputs[fid] || {}))} disabled={isRun(fid)} size="sm" className="w-full gap-2" style={{ backgroundColor: COLOR }}>
              {isRun(fid) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} {isRun(fid) ? 'Running...' : `Run ${f.name}`}
            </Button>
          )}
          {results[fid] && <FeatureResultPanel result={results[fid]} featureId={fid} featureName={f.name} source={results[fid].source} />}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center"><TowerControl className="w-6 h-6 text-[#3B82F6]" /></div>
          <div><h1 className="text-2xl font-bold text-[#0B0F19]">Control Tower</h1><p className="text-sm text-[#6B7280]">Command your creator operations</p></div>
        </div>
        <Badge className="bg-[#3B82F6]/10 text-[#3B82F6] border-none font-mono">{features.length} FEATURES</Badge>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9] flex-wrap h-auto gap-1">
          <TabsTrigger value="security">Compliance &amp; Security</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="infra">Infrastructure</TabsTrigger>
          <TabsTrigger value="features">All Features</TabsTrigger>
        </TabsList>
        <TabsContent value="security" className="space-y-4"><div className="grid lg:grid-cols-2 gap-4">{['f112', 'f113', 'f119'].map(renderCard)}</div></TabsContent>
        <TabsContent value="intelligence" className="space-y-4"><div className="grid lg:grid-cols-2 gap-4">{['f115', 'f116', 'f122'].map(renderCard)}</div></TabsContent>
        <TabsContent value="team" className="space-y-4">{renderCard('f125')}</TabsContent>
        <TabsContent value="infra" className="space-y-4"><div className="grid lg:grid-cols-2 gap-4">{['f109', 'f110', 'f111', 'f114', 'f117', 'f121', 'f127', 'f131'].map(renderCard)}</div></TabsContent>
        <TabsContent value="features" className="space-y-4"><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{features.map(f => renderCard(f.id))}</div></TabsContent>
      </Tabs>
    </div>
  );
}
