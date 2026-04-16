import { useState, useEffect, useCallback } from 'react';
import { useFeatureStore, useTokenStore, useAuthStore } from '@/stores';
import { aiService } from '@/services/AIService';
import { featureEngine, type FeatureResult } from '@/services/FeatureEngine';
import { FeatureResultPanel } from '@/components/FeatureResultPanel';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Shield,
  Bot,
  AlertTriangle,
  CheckCircle,
  Link as LinkIcon,
  Play,
  Search,
  MessageSquare,
  Cpu,
  Loader2,
  ShieldCheck,
  XCircle,
  Eye,
  Lock,
  Ghost,
  Terminal,
  ScanFace,
  FileWarning,
  BookOpen,
  Palette,
  Zap,
} from 'lucide-react';

// Map feature IDs to their icons
const featureIcons: Record<string, React.ReactNode> = {
  f1: <Bot className="w-4 h-4" />,
  f2: <LinkIcon className="w-4 h-4" />,
  f3: <MessageSquare className="w-4 h-4" />,
  f4: <Eye className="w-4 h-4" />,
  f5: <AlertTriangle className="w-4 h-4" />,
  f6: <Ghost className="w-4 h-4" />,
  f7: <Lock className="w-4 h-4" />,
  f8: <Shield className="w-4 h-4" />,
  f9: <Terminal className="w-4 h-4" />,
  f10: <ScanFace className="w-4 h-4" />,
  f11: <FileWarning className="w-4 h-4" />,
  f12: <BookOpen className="w-4 h-4" />,
  f13: <Ghost className="w-4 h-4" />,
  f14: <Palette className="w-4 h-4" />,
  f15: <Zap className="w-4 h-4" />,
};

export function ShieldPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens, getFreeAnalysesRemaining } = useTokenStore();
  useAuthStore();
  const features = getFeaturesByCategory('shield');
  const [activeTab, setActiveTab] = useState('overview');
  const [toxicityThreshold, setToxicityThreshold] = useState(70);
  const [autoFilter, setAutoFilter] = useState(true);

  // AI feature states
  const [usernameInput, setUsernameInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [botResult, setBotResult] = useState<any>(null);
  const [toxicityResult, setToxicityResult] = useState<any>(null);
  const [aiSource, setAiSource] = useState<'groq' | 'browser' | 'webllm'>('browser');

  // Feature results tracking
  const [results, setResults] = useState<Record<string, FeatureResult>>({});
  const [loadingFeatures, setLoadingFeatures] = useState<Record<string, boolean>>({});

  // Overview data computed from feature engine
  const [overviewData, setOverviewData] = useState<{
    shadowBan: FeatureResult | null;
    ipLeak: FeatureResult | null;
    botQuarantine: FeatureResult | null;
  }>({
    shadowBan: null,
    ipLeak: null,
    botQuarantine: null,
  });

  // ── Run overview features on mount ──
  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [shadowBanResult, ipLeakResult] = await Promise.all([
          featureEngine.executeFeature('f4', {
            metrics: {
              followerCount: 15000,
              recentPostImpressions: [1200, 1100, 950, 800],
              recentPostLikes: [80, 65, 50, 40],
              recentPostComments: [12, 8, 6, 4],
              recentPostShares: [5, 3, 2, 1],
              postsPerWeek: 5,
              accountAgeDays: 365,
              platform: 'instagram',
            },
          }),
          featureEngine.executeFeature('f7', {}),
        ]);

        setOverviewData({
          shadowBan: shadowBanResult,
          ipLeak: ipLeakResult,
          botQuarantine: null,
        });
      } catch (error) {
        console.error('Overview load failed:', error);
      }
    };

    loadOverview();
  }, []);

  // ── Generic feature runner with token spend + result store ──
  const handleRunFeature = useCallback(
    async (featureId: string, cost: number, name: string, input: any = {}) => {
      const id = featureId.toLowerCase().replace(/\s/g, '');
      setLoadingFeatures((prev) => ({ ...prev, [id]: true }));

      try {
        const result = await featureEngine.executeFeature(id, input);

        if (result.success) {
          const tokenSuccess = spendTokens(cost, id, `Used ${name}`);
          if (!tokenSuccess) {
            toast.error('Insufficient VQT balance. Please purchase more tokens.');
            setLoadingFeatures((prev) => ({ ...prev, [id]: false }));
            return;
          }
          setResults((prev) => ({ ...prev, [id]: result }));
          toast.success(`${name} completed successfully!`);
        } else {
          setResults((prev) => ({
            ...prev,
            [id]: {
              ...result,
              data: {
                error: result.data?.error || 'Feature execution failed',
              },
            },
          }));
          toast.error(`${name} failed: ${result.data?.error || 'Unknown error'}`);
        }
      } catch (error) {
        toast.error(
          `${name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setLoadingFeatures((prev) => ({ ...prev, [id]: false }));
      }
    },
    [spendTokens]
  );

  // ── AI-powered bot detection (kept – uses aiService) ──
  const runBotDetection = async () => {
    if (!usernameInput.trim()) {
      toast.error('Please enter usernames to check (comma-separated)');
      return;
    }

    const freeRemaining = getFreeAnalysesRemaining();
    if (freeRemaining === 0) {
      const success = spendTokens(3, 'f1', 'Bot Detection');
      if (!success) {
        toast.error('Insufficient VQT balance');
        return;
      }
    }

    setIsAnalyzing(true);
    try {
      const usernames = usernameInput
        .split(',')
        .map((u) => u.trim().replace('@', ''));
      const result = await aiService.detectBots(usernames);
      setBotResult(result.data);
      setAiSource(result.source as 'groq' | 'browser' | 'webllm');
      const botsFound = result.data?.filter((b: any) => b.isBot).length || 0;
      toast.success(
        `Analysis complete! ${botsFound} potential bot(s) found. ${freeRemaining > 0 ? `(${freeRemaining - 1} free analyses left)` : ''}`
      );
    } catch (error) {
      toast.error('Bot detection failed');
    }
    setIsAnalyzing(false);
  };

  // ── AI-powered toxicity detection (kept – uses aiService) ──
  const runToxicityCheck = async () => {
    if (!commentInput.trim()) {
      toast.error('Please enter a comment to analyze');
      return;
    }

    const freeRemaining = getFreeAnalysesRemaining();
    if (freeRemaining === 0) {
      const success = spendTokens(2, 'f2', 'Toxicity Detection');
      if (!success) {
        toast.error('Insufficient VQT balance');
        return;
      }
    }

    setIsAnalyzing(true);
    try {
      const result = await aiService.detectToxicity(commentInput);
      setToxicityResult(result.data);
      setAiSource(result.source as 'groq' | 'browser' | 'webllm');
      toast.success(
        `Toxicity analysis complete! ${freeRemaining > 0 ? `(${freeRemaining - 1} free analyses left)` : ''}`
      );
    } catch (error) {
      toast.error('Toxicity check failed');
    }
    setIsAnalyzing(false);
  };

  const freeFeatures = features.filter((f) => f.isFree);

  // ── Derived overview values ──
  const shadowBanRisk = overviewData.shadowBan?.data?.riskLevel || 'low';
  const botsQuarantined = overviewData.botQuarantine?.data?.botsDetected ?? 0;
  const activeLocks = 0; // Link Lock can be run separately
  const ipProtected = overviewData.ipLeak?.success ?? false;

  // ── Feature input states ──
  const [featureInputs, setFeatureInputs] = useState<Record<string, any>>({});

  const updateFeatureInput = (featureId: string, key: string, value: any) => {
    setFeatureInputs((prev) => ({
      ...prev,
      [featureId]: { ...prev[featureId], [key]: value },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#00D4AA]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Shield</h1>
            <p className="text-sm text-[#6B7280]">
              Protection that runs quietly in the background
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Cpu className="w-3 h-3" />
            AI: {aiSource}
          </Badge>
          <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none font-mono">
            {features.length} FEATURES
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Security Tools</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="features">All Features</TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════
            OVERVIEW TAB
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6">
          {/* Status Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#EF4444]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0B0F19]">
                      {botsQuarantined}
                    </p>
                    <p className="text-xs text-[#6B7280]">Bots Quarantined</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0B0F19] capitalize">
                      {shadowBanRisk}
                    </p>
                    <p className="text-xs text-[#6B7280]">Shadow Ban Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-[#00D4AA]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0B0F19]">
                      {activeLocks}
                    </p>
                    <p className="text-xs text-[#6B7280]">Active Link Locks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#00D4AA]">
                      {ipProtected ? 'Protected' : 'Active'}
                    </p>
                    <p className="text-xs text-[#6B7280]">System Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Shadow Ban Early Warning (from featureEngine) */}
            <Card className="border-[#E5E7EB] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#F59E0B]" />
                  Shadow Ban Early Warning
                </CardTitle>
              </CardHeader>
              <CardContent>
                {overviewData.shadowBan ? (
                  <FeatureResultPanel
                    result={overviewData.shadowBan}
                    featureId="f4"
                    featureName="Shadow Ban Early Warning"
                    source={overviewData.shadowBan.source}
                  />
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#6B7280]" />
                    <span className="ml-2 text-sm text-[#6B7280]">
                      Loading shadow ban analysis...
                    </span>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      handleRunFeature('f4', 5, 'Shadow Ban Early Warning', {
                        metrics: {
                          followerCount: 15000,
                          recentPostImpressions: [1200, 1100, 950, 800],
                          recentPostLikes: [80, 65, 50, 40],
                          recentPostComments: [12, 8, 6, 4],
                          recentPostShares: [5, 3, 2, 1],
                          postsPerWeek: 5,
                          accountAgeDays: 365,
                          platform: 'instagram',
                        },
                      })
                    }
                    disabled={loadingFeatures.f4}
                  >
                    {loadingFeatures.f4 ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Re-run Analysis
                  </Button>
                  {results.f4 && (
                    <FeatureResultPanel
                      result={results.f4}
                      featureId="f4"
                      featureName="Shadow Ban Early Warning"
                      source={results.f4.source}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* IP Leak Protection (from featureEngine) */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#00D4AA]" />
                  IP Leak Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {overviewData.ipLeak ? (
                  <FeatureResultPanel
                    result={overviewData.ipLeak}
                    featureId="f7"
                    featureName="IP Leak Protection"
                    source={overviewData.ipLeak.source}
                  />
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#6B7280]" />
                    <span className="ml-2 text-sm text-[#6B7280]">
                      Checking IP protection...
                    </span>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-4 gap-2"
                  onClick={() => handleRunFeature('f7', 3, 'IP Leak Protection')}
                  disabled={loadingFeatures.f7}
                >
                  {loadingFeatures.f7 ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Re-scan
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Free Features */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="border-[#E5E7EB] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#EF4444]" />
                  Quick Bot Scan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">
                    Enter usernames to check (comma-separated)
                  </Label>
                  <Textarea
                    placeholder="@suspicious_bot_1, @spam_account_42, @fake_follower_99"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!usernameInput.trim()) {
                      toast.error('Please enter usernames');
                      return;
                    }
                    const usernames = usernameInput
                      .split(',')
                      .map((u) => u.trim().replace('@', ''));
                    setLoadingFeatures((prev) => ({ ...prev, f1: true }));
                    try {
                      const res = await featureEngine.executeFeature('f1', {
                        usernames,
                      });
                      setResults((prev) => ({ ...prev, f1: res }));
                      setOverviewData((prev) => ({
                        ...prev,
                        botQuarantine: res,
                      }));
                      if (res.success) {
                        spendTokens(3, 'f1', 'Behavioral Bot Identification');
                        toast.success(
                          `Bot scan complete! ${res.data?.summary?.botsDetected ?? 0} bot(s) detected.`
                        );
                      }
                    } finally {
                      setLoadingFeatures((prev) => ({ ...prev, f1: false }));
                    }
                  }}
                  disabled={loadingFeatures.f1 || !usernameInput.trim()}
                  className="w-full bg-[#EF4444] hover:bg-[#EF4444]/90 gap-2"
                >
                  {loadingFeatures.f1 ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  Scan for Bots (3 VQT)
                </Button>

                {results.f1 && (
                  <div className="mt-4">
                    <FeatureResultPanel
                      result={results.f1}
                      featureId="f1"
                      featureName="Behavioral Bot Identification"
                      source={results.f1.source}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19]">
                  Always Active
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {freeFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#F6F7F9]"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00D4AA]" />
                      <span className="text-sm text-[#0B0F19]">{feature.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Free
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════
            AI TOOLS TAB
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="ai-tools" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bot Detection Tool (aiService – kept) */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#EF4444]" />
                  AI Bot Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">
                    Enter usernames to check (comma-separated)
                  </Label>
                  <Textarea
                    placeholder="@user1, @user2, @suspicious_account..."
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <Button
                  onClick={runBotDetection}
                  disabled={isAnalyzing || !usernameInput.trim()}
                  className="w-full bg-[#EF4444] hover:bg-[#EF4444]/90 gap-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  Detect Bots (3 VQT)
                </Button>

                {botResult && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#0B0F19]">Results</h4>
                      <Badge variant="secondary">via {aiSource}</Badge>
                    </div>
                    {botResult.map((bot: any, i: number) => (
                      <div
                        key={i}
                        className={cn(
                          'p-3 rounded-lg flex items-center justify-between',
                          bot.isBot ? 'bg-[#EF4444]/10' : 'bg-[#00D4AA]/10'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {bot.isBot ? (
                            <XCircle className="w-4 h-4 text-[#EF4444]" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-[#00D4AA]" />
                          )}
                          <span className="text-sm font-medium">
                            @{bot.username}
                          </span>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={
                              bot.isBot ? 'bg-[#EF4444]' : 'bg-[#00D4AA]'
                            }
                          >
                            {Math.round(bot.botProbability * 100)}% bot
                          </Badge>
                          {bot.flags?.length > 0 && (
                            <p className="text-xs text-[#6B7280] mt-1">
                              {bot.flags.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Toxicity Detection Tool (aiService – kept) */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#F59E0B]" />
                  Toxicity Analyzer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">
                    Enter comment to analyze
                  </Label>
                  <Textarea
                    placeholder="Paste a comment here to check for toxicity..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <Button
                  onClick={runToxicityCheck}
                  disabled={isAnalyzing || !commentInput.trim()}
                  className="w-full bg-[#F59E0B] hover:bg-[#F59E0B]/90 gap-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  Check Toxicity (2 VQT)
                </Button>

                {toxicityResult && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-[#0B0F19]">
                        Analysis Result
                      </h4>
                      <Badge variant="secondary">via {aiSource}</Badge>
                    </div>
                    <div
                      className={cn(
                        'p-4 rounded-lg',
                        toxicityResult.isToxic
                          ? 'bg-[#EF4444]/10'
                          : 'bg-[#00D4AA]/10'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {toxicityResult.isToxic ? (
                          <XCircle className="w-5 h-5 text-[#EF4444]" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-[#00D4AA]" />
                        )}
                        <span
                          className={cn(
                            'font-semibold',
                            toxicityResult.isToxic
                              ? 'text-[#EF4444]'
                              : 'text-[#00D4AA]'
                          )}
                        >
                          {toxicityResult.isToxic
                            ? 'Toxic Content Detected'
                            : 'Clean Content'}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280]">
                        Toxicity Score:{' '}
                        {Math.round(toxicityResult.toxicityScore * 100)}%
                      </p>
                      {toxicityResult.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {toxicityResult.categories.map(
                            (cat: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Link Lock Protocol (F2) */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-[#00D4AA]" />
                  Link Lock Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">
                    Enter URLs to scan (one per line)
                  </Label>
                  <Textarea
                    placeholder={"https://example.com\nhttps://suspicious.tk/login"}
                    value={featureInputs.f2?.urls?.join('\n') || ''}
                    onChange={(e) =>
                      updateFeatureInput(
                        'f2',
                        'urls',
                        e.target.value.split('\n').filter(Boolean)
                      )
                    }
                    className="min-h-[80px]"
                  />
                </div>
                <Button
                  onClick={() =>
                    handleRunFeature('f2', 4, 'Link Lock Protocol', {
                      urls: featureInputs.f2?.urls || [],
                    })
                  }
                  disabled={
                    loadingFeatures.f2 ||
                    !featureInputs.f2?.urls?.length
                  }
                  className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white gap-2"
                >
                  {loadingFeatures.f2 ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  Scan Links (4 VQT)
                </Button>
                {results.f2 && (
                  <FeatureResultPanel
                    result={results.f2}
                    featureId="f2"
                    featureName="Link Lock Protocol"
                    source={results.f2.source}
                  />
                )}
              </CardContent>
            </Card>

            {/* Narrative Hijack Alert (F5) */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                  Narrative Hijack Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">
                    Enter comments (one per line, min 3)
                  </Label>
                  <Textarea
                    placeholder={"Great video!\nThis is propaganda\nActually the facts show...\nAgree with this\nLove the content!\nFake news, everyone knows it"}
                    value={featureInputs.f5?.comments?.join('\n') || ''}
                    onChange={(e) =>
                      updateFeatureInput(
                        'f5',
                        'comments',
                        e.target.value
                          .split('\n')
                          .filter(Boolean)
                          .map((text) => ({ text }))
                      )
                    }
                    className="min-h-[80px]"
                  />
                </div>
                <Button
                  onClick={() =>
                    handleRunFeature('f5', 5, 'Narrative Hijack Alert', {
                      comments: featureInputs.f5?.comments || [],
                    })
                  }
                  disabled={
                    loadingFeatures.f5 ||
                    (featureInputs.f5?.comments?.length ?? 0) < 3
                  }
                  className="w-full bg-[#F59E0B] hover:bg-[#F59E0B]/90 gap-2"
                >
                  {loadingFeatures.f5 ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  Analyze Thread (5 VQT)
                </Button>
                {results.f5 && (
                  <FeatureResultPanel
                    result={results.f5}
                    featureId="f5"
                    featureName="Narrative Hijack Alert"
                    source={results.f5.source}
                  />
                )}
              </CardContent>
            </Card>

            {/* Prompt Injection Filter (F8) */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#8B5CF6]" />
                  Prompt Injection Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">
                    Enter text to check for prompt injection
                  </Label>
                  <Textarea
                    placeholder="Ignore previous instructions and..."
                    value={featureInputs.f8?.text || ''}
                    onChange={(e) =>
                      updateFeatureInput('f8', 'text', e.target.value)
                    }
                    className="min-h-[80px]"
                  />
                </div>
                <Button
                  onClick={() =>
                    handleRunFeature('f8', 3, 'Prompt Injection Filter', {
                      text: featureInputs.f8?.text || '',
                    })
                  }
                  disabled={loadingFeatures.f8 || !featureInputs.f8?.text}
                  className="w-full bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white gap-2"
                >
                  {loadingFeatures.f8 ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  Scan (3 VQT)
                </Button>
                {results.f8 && (
                  <FeatureResultPanel
                    result={results.f8}
                    featureId="f8"
                    featureName="Prompt Injection Filter"
                    source={results.f8.source}
                  />
                )}
              </CardContent>
            </Card>

            {/* Community Note Early Warning (F11) */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <FileWarning className="w-5 h-5 text-[#EF4444]" />
                  Community Note Early Warning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">
                    Enter content to check for community note triggers
                  </Label>
                  <Textarea
                    placeholder="Paste content to analyze for misinformation signals..."
                    value={featureInputs.f11?.content || ''}
                    onChange={(e) =>
                      updateFeatureInput('f11', 'content', e.target.value)
                    }
                    className="min-h-[80px]"
                  />
                </div>
                <Button
                  onClick={() =>
                    handleRunFeature('f11', 4, 'Community Note Early Warning', {
                      content: featureInputs.f11?.content || '',
                    })
                  }
                  disabled={loadingFeatures.f11 || !featureInputs.f11?.content}
                  className="w-full bg-[#EF4444] hover:bg-[#EF4444]/90 text-white gap-2"
                >
                  {loadingFeatures.f11 ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileWarning className="w-4 h-4" />
                  )}
                  Analyze Content (4 VQT)
                </Button>
                {results.f11 && (
                  <FeatureResultPanel
                    result={results.f11}
                    featureId="f11"
                    featureName="Community Note Early Warning"
                    source={results.f11.source}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════
            SETTINGS TAB
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19]">
                  Toxicity Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm text-[#6B7280]">Threshold</Label>
                    <span className="text-sm font-medium text-[#0B0F19]">
                      {toxicityThreshold}%
                    </span>
                  </div>
                  <Slider
                    value={[toxicityThreshold]}
                    onValueChange={(value) => setToxicityThreshold(value[0])}
                    max={100}
                    step={5}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#0B0F19]">Auto Filter</p>
                    <p className="text-xs text-[#6B7280]">
                      Automatically hide toxic content
                    </p>
                  </div>
                  <Switch checked={autoFilter} onCheckedChange={setAutoFilter} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19]">
                  AI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F6F7F9]">
                  <div>
                    <p className="font-medium text-[#0B0F19]">
                      Primary AI Engine
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      Currently using: {aiSource}
                    </p>
                  </div>
                  <Badge className="bg-[#00D4AA]/10 text-[#00D4AA]">Auto</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F6F7F9]">
                  <div>
                    <p className="font-medium text-[#0B0F19]">
                      Fallback Mode
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      Browser AI when offline
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F6F7F9]">
                  <div>
                    <p className="font-medium text-[#0B0F19]">
                      Cache Results
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      Store AI results for 5 minutes
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════
            ALL FEATURES TAB
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="features" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19]">
                Protection Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature) => {
                  const fid = feature.id.toLowerCase();
                  const isLoading = loadingFeatures[fid] || false;
                  const hasResult = !!results[fid];

                  // Determine what input the feature needs
                  const needsUsernames = fid === 'f1';
                  const needsUrls = fid === 'f2';
                  const needsText =
                    ['f3', 'f8', 'f11', 'f12', 'f15'].includes(fid);
                  const needsComments = fid === 'f5';

                  return (
                    <div
                      key={feature.id}
                      className="p-4 rounded-xl border border-[#E5E7EB] hover:border-[#00D4AA]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-[#0B0F19]">
                          {feature.name}
                        </h4>
                        <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none">
                          {feature.vqtCost} VQT
                        </Badge>
                      </div>
                      <p className="text-sm text-[#6B7280] mb-4">
                        {feature.description}
                      </p>

                      {/* Conditional input fields */}
                      {needsUsernames && (
                        <Textarea
                          placeholder="usernames: @user1, @user2..."
                          className="mb-3 min-h-[50px] text-xs"
                          value={featureInputs[fid]?.usernames?.join(', ') || ''}
                          onChange={(e) => {
                            const usernames = e.target.value
                              .split(',')
                              .map((u) => u.trim().replace('@', ''))
                              .filter(Boolean);
                            updateFeatureInput(fid, 'usernames', usernames);
                          }}
                        />
                      )}

                      {needsUrls && (
                        <Textarea
                          placeholder="https://url1.com, https://url2.com..."
                          className="mb-3 min-h-[50px] text-xs"
                          value={featureInputs[fid]?.urls?.join('\n') || ''}
                          onChange={(e) => {
                            const urls = e.target.value
                              .split('\n')
                              .filter(Boolean);
                            updateFeatureInput(fid, 'urls', urls);
                          }}
                        />
                      )}

                      {needsText && (
                        <Textarea
                          placeholder="Enter text to analyze..."
                          className="mb-3 min-h-[50px] text-xs"
                          value={featureInputs[fid]?.text || ''}
                          onChange={(e) =>
                            updateFeatureInput(fid, 'text', e.target.value)
                          }
                        />
                      )}

                      {needsComments && (
                        <Textarea
                          placeholder="One comment per line..."
                          className="mb-3 min-h-[50px] text-xs"
                          value={
                            featureInputs[fid]?.comments
                              ?.map((c: any) =>
                                typeof c === 'string' ? c : c.text
                              )
                              .join('\n') || ''
                          }
                          onChange={(e) => {
                            const comments = e.target.value
                              .split('\n')
                              .filter(Boolean)
                              .map((text) => ({ text }));
                            updateFeatureInput(fid, 'comments', comments);
                          }}
                        />
                      )}

                      <Button
                        size="sm"
                        className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white gap-2"
                        onClick={() => {
                          // Build the appropriate input payload
                          let input: any = {};
                          if (needsUsernames) {
                            input = {
                              usernames: featureInputs[fid]?.usernames || [],
                            };
                          } else if (needsUrls) {
                            input = {
                              urls: featureInputs[fid]?.urls || [],
                            };
                          } else if (needsText) {
                            if (fid === 'f3') {
                              input = {
                                text: featureInputs[fid]?.text || '',
                                threshold: toxicityThreshold / 100,
                              };
                            } else {
                              input = {
                                text: featureInputs[fid]?.text || '',
                              };
                            }
                          } else if (needsComments) {
                            input = {
                              comments: featureInputs[fid]?.comments || [],
                            };
                          } else if (fid === 'f4') {
                            input = {
                              metrics: {
                                followerCount: 15000,
                                recentPostImpressions: [1200, 1100, 950, 800],
                                recentPostLikes: [80, 65, 50, 40],
                                recentPostComments: [12, 8, 6, 4],
                                recentPostShares: [5, 3, 2, 1],
                                postsPerWeek: 5,
                                accountAgeDays: 365,
                                platform: 'instagram',
                              },
                            };
                          } else if (fid === 'f9') {
                            input = { action: 'generate' };
                          } else {
                            input = {};
                          }

                          handleRunFeature(
                            fid,
                            feature.vqtCost,
                            feature.name,
                            input
                          );
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          featureIcons[fid] || <Play className="w-4 h-4" />
                        )}
                        Run
                      </Button>

                      {/* Show result panel below the card */}
                      {hasResult && (
                        <div className="mt-3">
                          <FeatureResultPanel
                            result={results[fid]}
                            featureId={fid}
                            featureName={feature.name}
                            source={results[fid].source}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
