import { useState, useEffect, useCallback } from 'react';
import { useFeatureStore, useTokenStore } from '@/stores';
import { featureEngine } from '@/services/FeatureEngine';
import { FeatureResultPanel } from '@/components/FeatureResultPanel';
import type { FeatureResult } from '@/services/FeatureEngine';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Swords,
  BookOpen,
  Search,
  Play,
  Target,
  Loader2,
  Plus,
  X,
  Users
} from 'lucide-react';

export function ArenaPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('arena');
  const [activeTab, setActiveTab] = useState('competitors');

  // Feature results storage
  const [featureResults, setFeatureResults] = useState<Record<string, FeatureResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Input state
  const [competitorHandle, setCompetitorHandle] = useState('');
  const [competitorPlatform, setCompetitorPlatform] = useState('YouTube');
  const [trackedCompetitors, setTrackedCompetitors] = useState<{ handle: string; platform: string }[]>([]);
  const [nicheInput, setNicheInput] = useState('general');
  const [engagementDataInput, setEngagementDataInput] = useState('');

  // Cached overview data
  const [overviewShareOfVoice, setOverviewShareOfVoice] = useState<any>(null);
  const [overviewHooks, setOverviewHooks] = useState<any[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Run a feature via the engine and store the result
  const runFeature = useCallback(async (featureId: string, featureName: string, input: any, cost?: number) => {
    if (cost && cost > 0) {
      const success = spendTokens(cost, featureId, `Used ${featureName}`);
      if (!success) {
        toast.error('Insufficient VQT balance. Please purchase more tokens.');
        return null;
      }
    }

    setLoading(prev => ({ ...prev, [featureId]: true }));
    try {
      const result = await featureEngine.executeFeature(featureId, input);
      setFeatureResults(prev => ({ ...prev, [featureId]: result }));
      if (result.success) {
        toast.success(`${featureName} completed successfully!`);
      } else {
        toast.error(`${featureName} failed.`);
      }
      return result;
    } catch {
      toast.error(`${featureName} encountered an error.`);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [featureId]: false }));
    }
  }, [spendTokens]);

  // On load: run f49 and f51 for overview
  useEffect(() => {
    const loadOverview = async () => {
      setOverviewLoading(true);
      const [sovResult, hookResult] = await Promise.all([
        featureEngine.executeFeature('f49', { metrics: {} }),
        featureEngine.executeFeature('f51', { niche: 'general' }),
      ]);
      setFeatureResults(prev => ({
        ...prev,
        f49: sovResult,
        f51: hookResult,
      }));
      if (sovResult.success && sovResult.data) setOverviewShareOfVoice(sovResult.data);
      if (hookResult.success && hookResult.data) {
        setOverviewHooks(Array.isArray(hookResult.data) ? hookResult.data : hookResult.data.hooks || hookResult.data.templates || []);
      }
      setOverviewLoading(false);
    };
    loadOverview();
  }, []);

  // Add competitor to tracked list
  const addCompetitor = () => {
    if (!competitorHandle.trim()) return;
    const handle = competitorHandle.trim().replace('@', '');
    if (trackedCompetitors.some(c => c.handle.toLowerCase() === handle.toLowerCase())) {
      toast.error('Competitor already tracked');
      return;
    }
    setTrackedCompetitors(prev => [...prev, { handle, platform: competitorPlatform }]);
    setCompetitorHandle('');
  };

  const removeCompetitor = (handle: string) => {
    setTrackedCompetitors(prev => prev.filter(c => c.handle !== handle));
  };

  // Map of feature IDs to their required input builders
  const getFeatureInput = useCallback((featureId: string, _featureName: string): any => {
    switch (featureId) {
      case 'f49':
        return { metrics: { competitors: trackedCompetitors } };
      case 'f50':
        return { engagementData: trackedCompetitors };
      case 'f51':
        return { niche: nicheInput };
      case 'f52':
        return { competitors: trackedCompetitors.map(c => c.handle) };
      case 'f53':
        return { content: '', competitors: trackedCompetitors };
      case 'f54':
        return { competitors: trackedCompetitors };
      case 'f55':
        return { followers: trackedCompetitors };
      case 'f56':
        return { niches: [nicheInput] };
      case 'f57':
        return { growthData: trackedCompetitors };
      case 'f58':
        return { content: { competitors: trackedCompetitors } };
      case 'f59':
        return { creators: trackedCompetitors.map(c => c.handle) };
      case 'f60':
        return { contentHistory: [] };
      case 'f61':
        return { thumbnails: [] };
      case 'f62':
        return { profile: { niche: nicheInput, competitors: trackedCompetitors } };
      case 'f63':
        return { content: '', competitors: trackedCompetitors };
      case 'f64':
        return { keywords: [nicheInput] };
      default:
        return {};
    }
  }, [trackedCompetitors, nicheInput]);

  const handleRunFeature = async (featureId: string, cost: number, name: string) => {
    const input = getFeatureInput(featureId, name);
    const result = await runFeature(featureId, name, input, cost);

    // Special: if f51 returns hook data, refresh hooks tab
    if (featureId === 'f51' && result?.success && result.data) {
      setOverviewHooks(Array.isArray(result.data) ? result.data : result.data.hooks || result.data.templates || []);
    }
    // If f49 returns SOV data, refresh overview
    if (featureId === 'f49' && result?.success && result.data) {
      setOverviewShareOfVoice(result.data);
    }
  };

  // Compute display data for the donut chart
  const sovCompetitors = overviewShareOfVoice?.competitors || [];
  const sovYourPercentage = overviewShareOfVoice?.yourPercentage ?? overviewShareOfVoice?.userPercentage ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center">
            <Swords className="w-6 h-6 text-[#EF4444]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Arena</h1>
            <p className="text-sm text-[#6B7280]">See what your competitors can&apos;t</p>
          </div>
        </div>
        <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-none font-mono">
          {features.length} FEATURES
        </Badge>
      </div>

      {/* Competitor Input */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#EF4444]" />
            Track Competitors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-sm text-[#6B7280]">Competitor Handle</Label>
              <Input
                placeholder="@competitor"
                value={competitorHandle}
                onChange={(e) => setCompetitorHandle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
              />
            </div>
            <div className="w-full sm:w-40">
              <Label className="text-sm text-[#6B7280]">Platform</Label>
              <select
                className="w-full h-10 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm"
                value={competitorPlatform}
                onChange={(e) => setCompetitorPlatform(e.target.value)}
              >
                <option>YouTube</option>
                <option>Instagram</option>
                <option>TikTok</option>
                <option>Twitter</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={addCompetitor} className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>
          {trackedCompetitors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trackedCompetitors.map((comp) => (
                <Badge key={comp.handle} variant="secondary" className="gap-1 py-1.5 px-3">
                  @{comp.handle} <span className="text-[#6B7280]">({comp.platform})</span>
                  <button onClick={() => removeCompetitor(comp.handle)} className="ml-1 hover:text-[#EF4444]">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {/* Overview results from auto-loaded f49 + f51 */}
          {featureResults.f49 && (
            <div className="mt-4">
              <FeatureResultPanel
                result={featureResults.f49}
                featureId="f49"
                featureName="Share of Voice Benchmarking"
                source={featureResults.f49.source}
              />
            </div>
          )}
          {featureResults.f51 && (
            <div className="mt-4">
              <FeatureResultPanel
                result={featureResults.f51}
                featureId="f51"
                featureName="Hook Library"
                source={featureResults.f51.source}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share of Voice Overview */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#EF4444]" />
            Share of Voice
            <Button
              size="sm"
              variant="outline"
              className="ml-auto gap-1 text-xs"
              onClick={() => runFeature('f49', 'Share of Voice Benchmarking', { metrics: { competitors: trackedCompetitors } })}
              disabled={loading.f49}
            >
              {loading.f49 ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overviewLoading ? (
            <div className="flex items-center gap-8">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ) : sovCompetitors.length > 0 || sovYourPercentage > 0 ? (
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                  {sovCompetitors.reduce(
                    (acc: { circles: React.ReactNode[]; offset: number }, comp: any, i: number) => {
                      const prevOffset = acc.offset;
                      const percentage = comp.percentage ?? comp.share ?? 0;
                      const dashArray = `${(percentage / 100) * 251} 251`;
                      const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#6B7280'];
                      acc.circles.push(
                        <circle
                          key={i}
                          cx="64"
                          cy="64"
                          r="40"
                          fill="none"
                          stroke={colors[i % colors.length]}
                          strokeWidth="12"
                          strokeDasharray={dashArray}
                          strokeDashoffset={-prevOffset}
                        />
                      );
                      acc.offset += (percentage / 100) * 251;
                      return acc;
                    },
                    { circles: [] as React.ReactNode[], offset: 0 }
                  ).circles}
                  <circle
                    cx="64"
                    cy="64"
                    r="40"
                    fill="none"
                    stroke="#00D4AA"
                    strokeWidth="12"
                    strokeDasharray={`${(sovYourPercentage / 100) * 251} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#00D4AA]">{sovYourPercentage}%</span>
                    <p className="text-xs text-[#6B7280]">You</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#00D4AA]" />
                  <span className="text-sm text-[#0B0F19]">You</span>
                  <span className="text-sm font-medium text-[#00D4AA] ml-auto">{sovYourPercentage}%</span>
                </div>
                {sovCompetitors.map((comp: any, i: number) => {
                  const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#6B7280'];
                  const name = comp.name || comp.handle || `Competitor ${i + 1}`;
                  const percentage = comp.percentage ?? comp.share ?? 0;
                  return (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                      <span className="text-sm text-[#0B0F19]">{name}</span>
                      <span className="text-sm font-medium text-[#6B7280] ml-auto">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#6B7280]">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Add competitors and run Share of Voice to see your benchmark</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9]">
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="hooks">Hook Library</TabsTrigger>
          <TabsTrigger value="gaps">Keyword Gaps</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="competitors" className="space-y-4">
          {/* Niche input for competitor analysis */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-sm text-[#6B7280]">Niche / Engagement Data (JSON, optional)</Label>
              <Textarea
                placeholder='e.g. {"engagementRate": 4.5, "followerCount": 10000}'
                value={engagementDataInput}
                onChange={(e) => setEngagementDataInput(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white gap-2"
                onClick={async () => {
                  let parsed = {};
                  try { parsed = JSON.parse(engagementDataInput); } catch { parsed = { niche: nicheInput }; }
                  await runFeature('f50', 'Engagement Velocity Alerts', { engagementData: [...trackedCompetitors, parsed] }, 3);
                }}
                disabled={loading.f50}
              >
                {loading.f50 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Velocity
              </Button>
            </div>
          </div>

          {/* Competitor cards from tracked list */}
          {trackedCompetitors.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {trackedCompetitors.map((comp) => (
                <Card key={comp.handle} className="border-[#E5E7EB]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-[#0B0F19]">@{comp.handle}</h4>
                      <Badge variant="secondary">{comp.platform}</Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 text-xs"
                        onClick={() => runFeature('f52', 'Ad-Spend Transparency', { competitors: [comp.handle] }, 12)}
                        disabled={loading.f52}
                      >
                        {loading.f52 ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Ad Spend
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 text-xs"
                        onClick={() => runFeature('f54', 'Content Counter-Strike', { competitors: [comp.handle] }, 15)}
                        disabled={loading.f54}
                      >
                        {loading.f54 ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Counter-Strike
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#6B7280]">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Add competitors above to start analyzing</p>
            </div>
          )}

          {/* Competitor feature results */}
          {['f50', 'f52', 'f54', 'f55', 'f57', 'f58', 'f59', 'f61', 'f63'].map(fid => (
            featureResults[fid] ? (
              <FeatureResultPanel
                key={fid}
                result={featureResults[fid]}
                featureId={fid}
                featureName={features.find(f => f.id === fid)?.name || fid}
                source={featureResults[fid].source}
              />
            ) : null
          ))}
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          {/* Niche selector for hook library */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-sm text-[#6B7280]">Niche</Label>
              <Input
                placeholder="e.g. tech, fitness, finance..."
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
              />
            </div>
            <Button
              className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white gap-2"
              onClick={() => handleRunFeature('f51', 8, 'The Hook Library')}
              disabled={loading.f51}
            >
              {loading.f51 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Generate Hooks
            </Button>
          </div>

          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#EF4444]" />
                Proven Hook Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overviewHooks.length > 0 ? (
                <div className="space-y-3">
                  {overviewHooks.map((hook: any, index: number) => (
                    <div
                      key={hook.id || index}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-6 h-6 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-sm font-medium text-[#EF4444]">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-[#0B0F19]">&quot;{hook.content || hook.text || hook.hook || JSON.stringify(hook)}&quot;</p>
                          <Badge variant="secondary" className="mt-1">{hook.category || hook.type || 'General'}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none">
                          {hook.performance ?? hook.score ?? 0}% performance
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6B7280]">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Enter a niche and generate hooks to see templates</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hook library result panel */}
          {featureResults.f51 && (
            <FeatureResultPanel
              result={featureResults.f51}
              featureId="f51"
              featureName="The Hook Library"
              source={featureResults.f51.source}
            />
          )}
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-sm text-[#6B7280]">Keywords (comma-separated)</Label>
              <Input
                placeholder="e.g. content strategy, creator tips, social growth"
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
              />
            </div>
            <Button
              className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white gap-2"
              onClick={() => runFeature('f64', 'Competitive Keyword Gap Analysis', { keywords: nicheInput.split(',').map(k => k.trim()).filter(Boolean) }, 5)}
              disabled={loading.f64}
            >
              {loading.f64 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Analyze Gaps
            </Button>
          </div>

          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Search className="w-5 h-5 text-[#EF4444]" />
                Keyword Opportunity Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              {featureResults.f64 && featureResults.f64.success && featureResults.f64.data ? (
                (() => {
                  const gaps = Array.isArray(featureResults.f64.data) ? featureResults.f64.data : featureResults.f64.data.gaps || featureResults.f64.data.keywords || [];
                  if (gaps.length === 0) return <div className="text-center py-8 text-[#6B7280]"><p className="text-sm">Enter keywords and analyze to see gap data</p></div>;
                  return (
                    <div className="space-y-4">
                      {gaps.map((gap: any, idx: number) => (
                        <div key={gap.keyword || gap.term || idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#0B0F19]">{gap.keyword || gap.term}</span>
                            <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none">
                              {gap.opportunity ?? gap.score ?? 0}% opportunity
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                                <span>Your Rank: #{gap.yourRank ?? gap.userRank ?? '-'}</span>
                                <span>Competitor: #{gap.competitorRank ?? '-'}</span>
                              </div>
                              <Progress value={gap.opportunity ?? gap.score ?? 0} className="h-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 text-[#6B7280]">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Enter keywords and run analysis to discover opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>

          {featureResults.f64 && (
            <FeatureResultPanel
              result={featureResults.f64}
              featureId="f64"
              featureName="Competitive Keyword Gap Analysis"
              source={featureResults.f64.source}
            />
          )}
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.filter(f => !f.isFree).map((feature) => (
              <div
                key={feature.id}
                className="p-4 rounded-xl border border-[#E5E7EB] hover:border-[#EF4444]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-[#0B0F19]">{feature.name}</h4>
                  <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-none">
                    {feature.vqtCost} VQT
                  </Badge>
                </div>
                <p className="text-sm text-[#6B7280] mb-4">{feature.description}</p>
                <Button
                  size="sm"
                  className="w-full bg-[#EF4444] hover:bg-[#EF4444]/90 text-white gap-2"
                  disabled={loading[feature.id]}
                  onClick={() => handleRunFeature(feature.id, feature.vqtCost, feature.name)}
                >
                  {loading[feature.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run
                </Button>
              </div>
            ))}
          </div>

          {/* Feature results for any run features */}
          {Object.entries(featureResults)
            .filter(([fid]) => !['f49', 'f51', 'f64'].includes(fid))
            .map(([fid, result]) => (
              <FeatureResultPanel
                key={fid}
                result={result}
                featureId={fid}
                featureName={features.find(f => f.id === fid)?.name || fid}
                source={result.source}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
