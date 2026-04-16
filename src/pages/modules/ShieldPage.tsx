import { useState } from 'react';
import { useFeatureStore, useAuthStore } from '@/stores';
import { aiService } from '@/services/AIService';
import { mockShieldData } from '@/lib/mockData';
import { formatRelativeTime, cn } from '@/lib/utils';
import { useFeatureRunner } from '@/hooks/useFeatureRunner';
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
  Lightbulb,
  Sparkles
} from 'lucide-react';

export function ShieldPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  useAuthStore();
  const features = getFeaturesByCategory('shield');
  const [activeTab, setActiveTab] = useState('overview');
  const { isRunning, results, runFeature } = useFeatureRunner();
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [toxicityThreshold, setToxicityThreshold] = useState(mockShieldData.toxicitySettings.threshold * 100);
  const [autoFilter, setAutoFilter] = useState(mockShieldData.toxicitySettings.autoFilter);
  
  // AI feature states
  const [usernameInput, setUsernameInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [botResult, setBotResult] = useState<any>(null);
  const [toxicityResult, setToxicityResult] = useState<any>(null);
  const [aiSource, setAiSource] = useState<'groq' | 'browser' | 'webllm'>('browser');

  const handleRunFeature = async (featureId: string, cost: number, name: string) => {
    setExpandedFeature(featureId);
    await runFeature(featureId, name, cost);
  };

  // AI-powered bot detection
  const runBotDetection = async () => {
    if (!usernameInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const usernames = usernameInput.split(',').map(u => u.trim().replace('@', ''));
      const result = await aiService.detectBots(usernames);
      setBotResult(result.data);
      setAiSource(result.source as 'groq' | 'browser' | 'webllm');
    } catch { /* handled by ui */ }
    setIsAnalyzing(false);
  };

  // AI-powered toxicity detection
  const runToxicityCheck = async () => {
    if (!commentInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await aiService.detectToxicity(commentInput);
      setToxicityResult(result.data);
      setAiSource(result.source as 'groq' | 'browser' | 'webllm');
    } catch { /* handled by ui */ }
    setIsAnalyzing(false);
  };

  const freeFeatures = features.filter(f => f.isFree);
  const paidFeatures = features.filter(f => !f.isFree);

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
            <p className="text-sm text-[#6B7280]">Protection that runs quietly in the background</p>
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
                    <p className="text-2xl font-bold text-[#0B0F19]">{mockShieldData.botQuarantine.length}</p>
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
                    <p className="text-2xl font-bold text-[#0B0F19]">{mockShieldData.shadowBanStatus.riskLevel}</p>
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
                    <p className="text-2xl font-bold text-[#0B0F19]">{mockShieldData.linkLockStatus.activeLocks}</p>
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
                    <p className="text-2xl font-bold text-[#00D4AA]">Protected</p>
                    <p className="text-xs text-[#6B7280]">System Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Bot Quarantine */}
            <Card className="border-[#E5E7EB] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#EF4444]" />
                  Bot Quarantine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockShieldData.botQuarantine.map((bot) => (
                    <div
                      key={bot.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-[#EF4444]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#0B0F19]">@{bot.username}</p>
                          <p className="text-xs text-[#6B7280]">{bot.platform} • {bot.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-none">
                          {bot.confidence}% confidence
                        </Badge>
                        <p className="text-xs text-[#6B7280] mt-1">
                          {formatRelativeTime(bot.detectedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Free Features */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19]">Always Active</CardTitle>
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
                    <Badge variant="secondary" className="text-xs">Free</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bot Detection Tool */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#EF4444]" />
                  AI Bot Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">Enter usernames to check (comma-separated)</Label>
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
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
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
                          "p-3 rounded-lg flex items-center justify-between",
                          bot.isBot ? "bg-[#EF4444]/10" : "bg-[#00D4AA]/10"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {bot.isBot ? <XCircle className="w-4 h-4 text-[#EF4444]" /> : <ShieldCheck className="w-4 h-4 text-[#00D4AA]" />}
                          <span className="text-sm font-medium">@{bot.username}</span>
                        </div>
                        <div className="text-right">
                          <Badge className={bot.isBot ? "bg-[#EF4444]" : "bg-[#00D4AA]"}>
                            {Math.round(bot.botProbability * 100)}% bot
                          </Badge>
                          {bot.flags?.length > 0 && (
                            <p className="text-xs text-[#6B7280] mt-1">{bot.flags.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Toxicity Detection Tool */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#F59E0B]" />
                  Toxicity Analyzer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">Enter comment to analyze</Label>
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
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Check Toxicity (2 VQT)
                </Button>

                {toxicityResult && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-[#0B0F19]">Analysis Result</h4>
                      <Badge variant="secondary">via {aiSource}</Badge>
                    </div>
                    <div className={cn(
                      "p-4 rounded-lg",
                      toxicityResult.isToxic ? "bg-[#EF4444]/10" : "bg-[#00D4AA]/10"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {toxicityResult.isToxic ? (
                          <XCircle className="w-5 h-5 text-[#EF4444]" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-[#00D4AA]" />
                        )}
                        <span className={cn(
                          "font-semibold",
                          toxicityResult.isToxic ? "text-[#EF4444]" : "text-[#00D4AA]"
                        )}>
                          {toxicityResult.isToxic ? 'Toxic Content Detected' : 'Clean Content'}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280]">
                        Toxicity Score: {Math.round(toxicityResult.toxicityScore * 100)}%
                      </p>
                      {toxicityResult.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {toxicityResult.categories.map((cat: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19]">Toxicity Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm text-[#6B7280]">Threshold</Label>
                    <span className="text-sm font-medium text-[#0B0F19]">{toxicityThreshold}%</span>
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
                    <p className="text-xs text-[#6B7280]">Automatically hide toxic content</p>
                  </div>
                  <Switch checked={autoFilter} onCheckedChange={setAutoFilter} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19]">AI Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F6F7F9]">
                  <div>
                    <p className="font-medium text-[#0B0F19]">Primary AI Engine</p>
                    <p className="text-xs text-[#6B7280]">Currently using: {aiSource}</p>
                  </div>
                  <Badge className="bg-[#00D4AA]/10 text-[#00D4AA]">Auto</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F6F7F9]">
                  <div>
                    <p className="font-medium text-[#0B0F19]">Fallback Mode</p>
                    <p className="text-xs text-[#6B7280]">Browser AI when offline</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F6F7F9]">
                  <div>
                    <p className="font-medium text-[#0B0F19]">Cache Results</p>
                    <p className="text-xs text-[#6B7280]">Store AI results for 5 minutes</p>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19]">Protection Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paidFeatures.map((feature) => {
                  const result = results[feature.id];
                  const isExpanded = expandedFeature === feature.id;
                  return (
                  <div
                    key={feature.id}
                    className={cn(
                      "p-4 rounded-xl border transition-colors",
                      isExpanded ? 'border-[#00D4AA]/50 bg-[#00D4AA]/5' : 'border-[#E5E7EB] hover:border-[#00D4AA]/50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-[#0B0F19]">{feature.name}</h4>
                      <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none">
                        {feature.vqtCost} VQT
                      </Badge>
                    </div>
                    <p className="text-sm text-[#6B7280] mb-4">{feature.description}</p>
                    <Button
                      size="sm"
                      className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white gap-2"
                      onClick={() => handleRunFeature(feature.id, feature.vqtCost, feature.name)}
                      disabled={isRunning}
                    >
                      {isRunning && expandedFeature === feature.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      {isRunning && expandedFeature === feature.id ? 'Running...' : 'Run'}
                    </Button>
                    {result && isExpanded && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#0B0F19]">
                          <CheckCircle className="w-4 h-4 text-[#00D4AA]" />
                          {result.summary}
                        </div>
                        {result.insights.length > 0 && (
                          <div className="space-y-1">
                            {result.insights.map((insight, i) => (
                              <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5">
                                <Lightbulb className="w-3 h-3 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                                {insight}
                              </p>
                            ))}
                          </div>
                        )}
                        {result.recommendations.length > 0 && (
                          <div className="space-y-1">
                            {result.recommendations.map((rec, i) => (
                              <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5">
                                <Sparkles className="w-3 h-3 text-[#00D4AA] mt-0.5 flex-shrink-0" />
                                {rec}
                              </p>
                            ))}
                          </div>
                        )}
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
