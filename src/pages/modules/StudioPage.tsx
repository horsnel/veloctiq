import { useState } from 'react';
import { useFeatureStore, useTokenStore } from '@/stores';
import { aiService } from '@/services/AIService';
import { webLLMService } from '@/services/WebLLMService';
import { mockStudioData } from '@/lib/mockData';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Textarea } from '@/components/ui/textarea';
import { ContentCalendar } from '@/components/calendar/ContentCalendar';
import { cn } from '@/lib/utils';

import { 
  Clapperboard, 
  Video, 
  Image as ImageIcon,
  Type,
  Play,
  CheckCircle,
  Wand2,
  Sparkles,
  TrendingUp,
  Hash,
  Cpu,
  Loader2
} from 'lucide-react';

export function StudioPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens, getFreeAnalysesRemaining } = useTokenStore();
  const features = getFeaturesByCategory('studio');
  const [activeTab, setActiveTab] = useState('queue');
  
  // AI Feature states
  const [contentInput, setContentInput] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viralResult, setViralResult] = useState<any>(null);
  const [hashtagResult, setHashtagResult] = useState<any>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [aiSource, setAiSource] = useState<'groq' | 'browser' | 'webllm'>('browser');

  const handleRunFeature = (featureId: string, cost: number, name: string) => {
    const success = spendTokens(cost, featureId, `Used ${name}`);
    if (success) {
      toast.success(`${name} completed successfully!`);
    } else {
      toast.error('Insufficient VQT balance. Please purchase more tokens.');
    }
  };

  // AI-powered viral prediction
  const runViralCheck = async () => {
    if (!contentInput.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    const freeRemaining = getFreeAnalysesRemaining();
    if (freeRemaining === 0) {
      const success = spendTokens(3, 'f21', 'Viral Prediction');
      if (!success) {
        toast.error('Insufficient VQT balance');
        return;
      }
    }

    setIsAnalyzing(true);
    try {
      const result = await aiService.predictViralPotential(contentInput, platform);
      setViralResult(result.data);
      setAiSource(result.source as 'groq' | 'browser' | 'webllm');
      toast.success(`Viral analysis complete! ${freeRemaining > 0 ? `(${freeRemaining - 1} free analyses left)` : ''}`);
    } catch (error) {
      toast.error('Analysis failed. Using fallback...');
      const fallback = await webLLMService.generateResponse(`viral prediction for: ${contentInput}`);
      setViralResult({ response: fallback.text });
      setAiSource('webllm');
    }
    setIsAnalyzing(false);
  };

  // AI-powered hashtag generation
  const runHashtagGen = async () => {
    if (!contentInput.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    const freeRemaining = getFreeAnalysesRemaining();
    if (freeRemaining === 0) {
      const success = spendTokens(2, 'f22', 'Hashtag Recommendations');
      if (!success) {
        toast.error('Insufficient VQT balance');
        return;
      }
    }

    setIsAnalyzing(true);
    try {
      const result = await aiService.recommendHashtags(contentInput, 15);
      setHashtagResult(result.data);
      setAiSource(result.source as 'groq' | 'browser' | 'webllm');
      toast.success(`Hashtags generated! ${freeRemaining > 0 ? `(${freeRemaining - 1} free analyses left)` : ''}`);
    } catch (error) {
      const fallback = webLLMService.generateHashtagSet(platform);
      setHashtagResult({ hashtags: fallback });
      setAiSource('webllm');
    }
    setIsAnalyzing(false);
  };

  // AI-powered content optimization
  const runOptimization = async () => {
    if (!contentInput.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    const freeRemaining = getFreeAnalysesRemaining();
    if (freeRemaining === 0) {
      const success = spendTokens(3, 'f44', 'Content Optimization');
      if (!success) {
        toast.error('Insufficient VQT balance');
        return;
      }
    }

    setIsAnalyzing(true);
    try {
      const result = await aiService.optimizeContent(contentInput, platform);
      setOptimizationResult(result.data);
      setAiSource(result.source as 'groq' | 'browser' | 'webllm');
      toast.success(`Optimization complete! ${freeRemaining > 0 ? `(${freeRemaining - 1} free analyses left)` : ''}`);
    } catch (error) {
      toast.error('Optimization failed');
    }
    setIsAnalyzing(false);
  };

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
        <TabsList className="bg-[#F6F7F9]">
          <TabsTrigger value="queue">Content Queue</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="thumbnails">Thumbnails</TabsTrigger>
          <TabsTrigger value="titles">Title Optimizer</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Video className="w-5 h-5 text-[#EC4899]" />
                Content Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStudioData.contentQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center">
                        <Video className="w-5 h-5 text-[#EC4899]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#0B0F19]">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{item.platform}</Badge>
                          {item.scheduledTime && (
                            <span className="text-xs text-[#6B7280]">
                              Scheduled: {new Date(item.scheduledTime).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className={`
                        ${item.status === 'Ready to Publish' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 
                          item.status === 'Editing' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 
                          'bg-[#6B7280]/10 text-[#6B7280]'}
                        border-none
                      `}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <ContentCalendar />
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#EC4899]" />
                AI Content Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B0F19]">Your Content</label>
                <Textarea
                  placeholder="Paste your caption, post content, or video description here..."
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B0F19]">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin'].map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={platform === p ? 'default' : 'outline'}
                      onClick={() => setPlatform(p)}
                      className={platform === p ? 'bg-[#EC4899]' : ''}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* AI Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={runViralCheck}
                  disabled={isAnalyzing || !contentInput.trim()}
                  className="bg-[#EC4899] hover:bg-[#EC4899]/90 gap-2"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  Viral Check (3 VQT)
                </Button>
                <Button
                  onClick={runHashtagGen}
                  disabled={isAnalyzing || !contentInput.trim()}
                  variant="outline"
                  className="gap-2"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
                  Generate Hashtags (2 VQT)
                </Button>
                <Button
                  onClick={runOptimization}
                  disabled={isAnalyzing || !contentInput.trim()}
                  variant="outline"
                  className="gap-2"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  Optimize Content (3 VQT)
                </Button>
              </div>

              {/* Results Display */}
              {viralResult && (
                <Card className="bg-gradient-to-r from-[#EC4899]/5 to-transparent border-[#EC4899]/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-[#EC4899]" />
                      <h4 className="font-semibold text-[#0B0F19]">Viral Prediction Results</h4>
                      <Badge variant="secondary" className="ml-auto">
                        via {aiSource}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg bg-white">
                        <p className="text-2xl font-bold text-[#EC4899]">{viralResult.viralProbability}%</p>
                        <p className="text-xs text-[#6B7280]">Viral Probability</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white">
                        <p className={cn(
                          "text-2xl font-bold",
                          viralResult.prediction === 'high' ? 'text-[#00D4AA]' :
                          viralResult.prediction === 'medium' ? 'text-[#F59E0B]' : 'text-[#6B7280]'
                        )}>
                          {viralResult.prediction?.toUpperCase()}
                        </p>
                        <p className="text-xs text-[#6B7280]">Prediction</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white">
                        <p className="text-2xl font-bold text-[#0B0F19]">{viralResult.estimatedReach?.toLocaleString()}</p>
                        <p className="text-xs text-[#6B7280]">Est. Reach</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white">
                        <p className="text-2xl font-bold text-[#0B0F19]">{Math.round(viralResult.factors?.hookStrength * 100)}%</p>
                        <p className="text-xs text-[#6B7280]">Hook Strength</p>
                      </div>
                    </div>
                    {viralResult.recommendations && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#0B0F19]">Recommendations:</p>
                        <ul className="space-y-1">
                          {viralResult.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm text-[#6B7280] flex items-start gap-2">
                              <span className="text-[#EC4899]">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {hashtagResult && (
                <Card className="bg-gradient-to-r from-[#00D4AA]/5 to-transparent border-[#00D4AA]/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Hash className="w-5 h-5 text-[#00D4AA]" />
                      <h4 className="font-semibold text-[#0B0F19]">Recommended Hashtags</h4>
                      <Badge variant="secondary" className="ml-auto">
                        via {aiSource}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hashtagResult.hashtags?.map((tag: string, i: number) => (
                        <Badge
                          key={i}
                          className="bg-[#00D4AA]/10 text-[#00D4AA] hover:bg-[#00D4AA]/20 cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText('#' + tag);
                            toast.success(`Copied #${tag}`);
                          }}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-[#6B7280] mt-2">
                      Relevance: {Math.round((hashtagResult.relevance || 0) * 100)}% • Click to copy
                    </p>
                  </CardContent>
                </Card>
              )}

              {optimizationResult && (
                <Card className="bg-gradient-to-r from-[#F59E0B]/5 to-transparent border-[#F59E0B]/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Wand2 className="w-5 h-5 text-[#F59E0B]" />
                      <h4 className="font-semibold text-[#0B0F19]">Optimization Suggestions</h4>
                      <Badge variant="secondary" className="ml-auto">
                        via {aiSource}
                      </Badge>
                    </div>
                    {optimizationResult.optimizations?.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-sm font-medium text-[#0B0F19]">Improvements:</p>
                        <ul className="space-y-1">
                          {optimizationResult.optimizations.map((opt: string, i: number) => (
                            <li key={i} className="text-sm text-[#6B7280] flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-[#00D4AA] flex-shrink-0 mt-0.5" />
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {optimizationResult.issues?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#0B0F19]">Issues to Fix:</p>
                        <ul className="space-y-1">
                          {optimizationResult.issues.map((issue: string, i: number) => (
                            <li key={i} className="text-sm text-[#EF4444] flex items-start gap-2">
                              <span>⚠️</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-4 p-3 rounded-lg bg-white">
                      <p className="text-sm text-[#6B7280]">
                        Estimated Engagement: <span className="font-semibold text-[#0B0F19]">{optimizationResult.estimatedEngagement}%</span>
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        Best Posting Time: <span className="font-semibold text-[#0B0F19]">{optimizationResult.bestPostingTime}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thumbnails" className="space-y-4">
          {mockStudioData.thumbnailTests.map((test) => (
            <Card key={test.id} className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#EC4899]" />
                  Thumbnail A/B Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {test.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`
                        p-4 rounded-xl border-2 transition-colors
                        ${test.predictedWinner === variant.id 
                          ? 'border-[#00D4AA] bg-[#00D4AA]/5' 
                          : 'border-[#E5E7EB]'}
                      `}
                    >
                      <div className="aspect-video bg-[#F6F7F9] rounded-lg mb-3 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[#6B7280]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#0B0F19]">Variant {variant.id.toUpperCase()}</span>
                        <Badge className="bg-[#EC4899]/10 text-[#EC4899] border-none">
                          {variant.predictedCTR}% CTR
                        </Badge>
                      </div>
                      {test.predictedWinner === variant.id && (
                        <div className="flex items-center gap-2 mt-2 text-[#00D4AA]">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Predicted Winner ({test.confidence}% confidence)</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="titles" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Type className="w-5 h-5 text-[#EC4899]" />
                Title Optimizer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-sm text-[#6B7280] mb-2">Original Title</p>
                <div className="p-4 rounded-xl bg-[#F6F7F9] text-[#0B0F19]">
                  {mockStudioData.titleOptimizations.original}
                </div>
              </div>
              
              <p className="text-sm text-[#6B7280] mb-3">AI Suggestions</p>
              <div className="space-y-3">
                {mockStudioData.titleOptimizations.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                  >
                    <p className="text-[#0B0F19]">{suggestion}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-[#EC4899]" />
                        <span className="text-sm font-medium text-[#00D4AA]">
                          {mockStudioData.titleOptimizations.viralScores[index]}% viral
                        </span>
                      </div>
                      <Button size="sm" variant="outline">Use</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.filter(f => !f.isFree).map((feature) => (
              <div
                key={feature.id}
                className="p-4 rounded-xl border border-[#E5E7EB] hover:border-[#EC4899]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-[#0B0F19]">{feature.name}</h4>
                  <Badge className="bg-[#EC4899]/10 text-[#EC4899] border-none">
                    {feature.vqtCost} VQT
                  </Badge>
                </div>
                <p className="text-sm text-[#6B7280] mb-4">{feature.description}</p>
                <Button
                  size="sm"
                  className="w-full bg-[#EC4899] hover:bg-[#EC4899]/90 text-white gap-2"
                  onClick={() => handleRunFeature(feature.id, feature.vqtCost, feature.name)}
                >
                  <Play className="w-4 h-4" />
                  Run
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
