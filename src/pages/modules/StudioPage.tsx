import { useState, useEffect, useCallback } from 'react';
import { useFeatureStore, useTokenStore } from '@/stores';
import { featureEngine, type FeatureResult } from '@/services/FeatureEngine';
import { FeatureResultPanel } from '@/components/FeatureResultPanel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';

export function StudioPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('studio');
  const [activeTab, setActiveTab] = useState('overview');

  // Input fields
  const [architectTopic, setArchitectTopic] = useState('content creation for creators');
  const [architectPlatform, setArchitectPlatform] = useState('youtube');
  const [seoContent, setSeoContent] = useState('How to grow on YouTube as a beginner creator in 2024');
  const [seoPlatform, setSeoPlatform] = useState('youtube');
  const [titleInput, setTitleInput] = useState('My Content Creation Process');
  const [titlePlatform, setTitlePlatform] = useState('youtube');
  const [hashtagContent, setHashtagContent] = useState('');
  const [hashtagPlatform, setHashtagPlatform] = useState('instagram');

  // Running states
  const [runningFeatures, setRunningFeatures] = useState<Record<string, boolean>>({});

  // Result states
  const [overviewResults, setOverviewResults] = useState<Record<string, FeatureResult>>({});
  const [featureResults, setFeatureResults] = useState<Record<string, FeatureResult>>({});
  const [aiSource, setAiSource] = useState<string>('browser');

  const isLoading = useCallback(
    (featureId: string) => runningFeatures[featureId] === true,
    [runningFeatures]
  );

  // Run overview features on load
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
    const success = spendTokens(cost, featureId, `Used ${name}`);
    if (!success) {
      toast.error('Insufficient VQT balance. Please purchase more tokens.');
      return;
    }
    await executeFeature(featureId, input);
  };

  const runContentArchitect = () => {
    if (!architectTopic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    handleRunFeature('f79', 0, 'Content Architect', { topic: architectTopic, platform: architectPlatform });
  };

  const runSeoGenerator = () => {
    if (!seoContent.trim()) {
      toast.error('Please enter content for SEO generation');
      return;
    }
    handleRunFeature('f84', 0, 'SEO Meta Generator', { content: seoContent, platform: seoPlatform });
  };

  const runTitleOptimizer = () => {
    if (!titleInput.trim()) {
      toast.error('Please enter a title to optimize');
      return;
    }
    handleRunFeature('f92', 0, 'Title Optimizer', { title: titleInput, platform: titlePlatform });
  };

  const runHashtagExtractor = () => {
    if (!hashtagContent.trim()) {
      toast.error('Please enter content for hashtag extraction');
      return;
    }
    handleRunFeature('f93', 0, 'Hashtag & Keyword Extractor', { content: hashtagContent, platform: hashtagPlatform });
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          <TabsTrigger value="thumbnails">Thumbnails</TabsTrigger>
          <TabsTrigger value="titles">Title Optimizer</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* Overview Tab - runs features on load */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center">
                    <Clapperboard className="w-5 h-5 text-[#EC4899]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Content Architect</p>
                    <p className="text-sm font-bold text-[#EC4899]">f79</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#00D4AA]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">SEO Meta Generator</p>
                    <p className="text-sm font-bold text-[#00D4AA]">f84</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                    <Type className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">Title Optimizer</p>
                    <p className="text-sm font-bold text-[#F59E0B]">f92</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overview Results */}
          <div className="space-y-4">
            {isLoading('f79') && (
              <Card className="border-[#E5E7EB]">
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#EC4899] mr-2" />
                  <span className="text-sm text-[#6B7280]">Running Content Architect...</span>
                </CardContent>
              </Card>
            )}
            {overviewResults.f79 && !isLoading('f79') && (
              <FeatureResultPanel
                result={overviewResults.f79}
                featureId="f79"
                featureName="Content Architect"
                source={overviewResults.f79.source}
              />
            )}

            {isLoading('f84') && (
              <Card className="border-[#E5E7EB]">
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#00D4AA] mr-2" />
                  <span className="text-sm text-[#6B7280]">Running SEO Meta Generator...</span>
                </CardContent>
              </Card>
            )}
            {overviewResults.f84 && !isLoading('f84') && (
              <FeatureResultPanel
                result={overviewResults.f84}
                featureId="f84"
                featureName="SEO Meta Generator"
                source={overviewResults.f84.source}
              />
            )}

            {isLoading('f92') && (
              <Card className="border-[#E5E7EB]">
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#F59E0B] mr-2" />
                  <span className="text-sm text-[#6B7280]">Running Title Optimizer...</span>
                </CardContent>
              </Card>
            )}
            {overviewResults.f92 && !isLoading('f92') && (
              <FeatureResultPanel
                result={overviewResults.f92}
                featureId="f92"
                featureName="Title Optimizer"
                source={overviewResults.f92.source}
              />
            )}
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <ContentCalendar />
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="ai-tools" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#EC4899]" />
                AI Content Studio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Architect */}
              <div className="space-y-3">
                <h4 className="font-medium text-[#0B0F19] flex items-center gap-2">
                  <Clapperboard className="w-4 h-4 text-[#EC4899]" />
                  Content Architect (f79)
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-[#6B7280]">Topic</Label>
                    <Input
                      placeholder="Enter your content topic..."
                      value={architectTopic}
                      onChange={(e) => setArchitectTopic(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-[#6B7280]">Platform</Label>
                    <div className="flex flex-wrap gap-2">
                      {['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin'].map((p) => (
                        <Button
                          key={p}
                          size="sm"
                          variant={architectPlatform === p ? 'default' : 'outline'}
                          onClick={() => setArchitectPlatform(p)}
                          className={architectPlatform === p ? 'bg-[#EC4899]' : ''}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={runContentArchitect}
                  disabled={isLoading('f79') || !architectTopic.trim()}
                  className="bg-[#EC4899] hover:bg-[#EC4899]/90 gap-2"
                >
                  {isLoading('f79') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  Run Content Architect
                </Button>
                {featureResults.f79 && (
                  <FeatureResultPanel
                    result={featureResults.f79}
                    featureId="f79"
                    featureName="Content Architect"
                    source={featureResults.f79.source}
                  />
                )}
              </div>

              {/* SEO Meta Generator */}
              <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
                <h4 className="font-medium text-[#0B0F19] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00D4AA]" />
                  SEO Meta Generator (f84)
                </h4>
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">Content Description</Label>
                  <Textarea
                    placeholder="Describe your content for SEO metadata generation..."
                    value={seoContent}
                    onChange={(e) => setSeoContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">Platform</Label>
                  <div className="flex flex-wrap gap-2">
                    {['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin'].map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={seoPlatform === p ? 'default' : 'outline'}
                        onClick={() => setSeoPlatform(p)}
                        className={seoPlatform === p ? 'bg-[#00D4AA]' : ''}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={runSeoGenerator}
                  disabled={isLoading('f84') || !seoContent.trim()}
                  variant="outline"
                  className="gap-2 border-[#00D4AA] text-[#00D4AA] hover:bg-[#00D4AA]/10"
                >
                  {isLoading('f84') ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  Generate SEO Meta
                </Button>
                {featureResults.f84 && (
                  <FeatureResultPanel
                    result={featureResults.f84}
                    featureId="f84"
                    featureName="SEO Meta Generator"
                    source={featureResults.f84.source}
                  />
                )}
              </div>

              {/* Hashtag & Keyword Extractor */}
              <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
                <h4 className="font-medium text-[#0B0F19] flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#6366F1]" />
                  Hashtag & Keyword Extractor (f93)
                </h4>
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">Content</Label>
                  <Textarea
                    placeholder="Paste your content to extract hashtags and keywords..."
                    value={hashtagContent}
                    onChange={(e) => setHashtagContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-[#6B7280]">Platform</Label>
                  <div className="flex flex-wrap gap-2">
                    {['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin'].map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={hashtagPlatform === p ? 'default' : 'outline'}
                        onClick={() => setHashtagPlatform(p)}
                        className={hashtagPlatform === p ? 'bg-[#6366F1]' : ''}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={runHashtagExtractor}
                  disabled={isLoading('f93') || !hashtagContent.trim()}
                  variant="outline"
                  className="gap-2 border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1]/10"
                >
                  {isLoading('f93') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
                  Extract Hashtags & Keywords
                </Button>
                {featureResults.f93 && (
                  <FeatureResultPanel
                    result={featureResults.f93}
                    featureId="f93"
                    featureName="Hashtag & Keyword Extractor"
                    source={featureResults.f93.source}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thumbnails Tab */}
        <TabsContent value="thumbnails" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#EC4899]" />
                Thumbnail A/B Test Predictor (f91)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#6B7280]">
                Upload thumbnail variants to predict which will perform better. The AI analyzes visual elements, composition, and engagement patterns.
              </p>
              <Button
                onClick={() => handleRunFeature('f91', 0, 'Thumbnail A/B Test', { variants: { a: 'variant_a', b: 'variant_b' } })}
                disabled={isLoading('f91')}
                className="bg-[#EC4899] hover:bg-[#EC4899]/90 gap-2"
              >
                {isLoading('f91') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Thumbnail Predictor
              </Button>
              {featureResults.f91 && (
                <FeatureResultPanel
                  result={featureResults.f91}
                  featureId="f91"
                  featureName="Thumbnail A/B Test Predictor"
                  source={featureResults.f91.source}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Title Optimizer Tab */}
        <TabsContent value="titles" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Type className="w-5 h-5 text-[#EC4899]" />
                Title Optimizer (f92)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-[#6B7280]">Original Title</Label>
                <Input
                  placeholder="Enter your video or post title..."
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#6B7280]">Platform</Label>
                <div className="flex flex-wrap gap-2">
                  {['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin'].map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={titlePlatform === p ? 'default' : 'outline'}
                      onClick={() => setTitlePlatform(p)}
                      className={titlePlatform === p ? 'bg-[#EC4899]' : ''}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                onClick={runTitleOptimizer}
                disabled={isLoading('f92') || !titleInput.trim()}
                className="bg-[#EC4899] hover:bg-[#EC4899]/90 gap-2"
              >
                {isLoading('f92') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Optimize Title
              </Button>
              {featureResults.f92 && (
                <FeatureResultPanel
                  result={featureResults.f92}
                  featureId="f92"
                  featureName="Title Optimizer"
                  source={featureResults.f92.source}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features
              .filter((f) => !f.isFree)
              .map((feature) => (
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
                    disabled={isLoading(feature.id)}
                  >
                    {isLoading(feature.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isLoading(feature.id) ? 'Running...' : 'Run'}
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
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
