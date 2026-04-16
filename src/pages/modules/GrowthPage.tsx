import { useState } from 'react';
import { useFeatureStore } from '@/stores';
import { mockGrowthData } from '@/lib/mockData';
import { formatNumber, cn } from '@/lib/utils';
import { useFeatureRunner } from '@/hooks/useFeatureRunner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target,
  SearchX,
  AlertOctagon,
  Play,
  CheckCircle,
  Flame,
  Clock,
  Loader2,
  Lightbulb,
  Sparkles
} from 'lucide-react';

export function GrowthPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { isRunning, results, runFeature } = useFeatureRunner();
  const features = getFeaturesByCategory('growth');
  const [activeTab, setActiveTab] = useState('monetization');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const handleRunFeature = async (featureId: string, cost: number, name: string) => {
    setExpandedFeature(featureId);
    await runFeature(featureId, name, cost);
  };

  const burnoutLevel = mockGrowthData.burnoutRisk.level;
  const burnoutColor = burnoutLevel === 'critical' ? '#EF4444' : 
                       burnoutLevel === 'high' ? '#F59E0B' : 
                       burnoutLevel === 'medium' ? '#F59E0B' : '#00D4AA';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Growth</h1>
            <p className="text-sm text-[#6B7280]">Grow smarter. Avoid burnout</p>
          </div>
        </div>
        <Badge className="bg-[#10B981]/10 text-[#10B981] border-none font-mono">
          {features.length} FEATURES
        </Badge>
      </div>

      {/* Burnout Warning */}
      <Card className="border-[#E5E7EB]" style={{ borderColor: burnoutColor, backgroundColor: `${burnoutColor}08` }}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${burnoutColor}15` }}>
              <AlertOctagon className="w-7 h-7" style={{ color: burnoutColor }} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#0B0F19]">Burnout Risk: {mockGrowthData.burnoutRisk.level.toUpperCase()}</h3>
              <p className="text-sm text-[#6B7280]">
                Score: {mockGrowthData.burnoutRisk.score}/100 • {mockGrowthData.burnoutRisk.warningSigns.length} warning signs detected
              </p>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9]">
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
          <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
          <TabsTrigger value="viral">Viral Coefficient</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="monetization" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#10B981]" />
                Road to Monetization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#6B7280]">Progress</span>
                  <span className="text-sm font-medium text-[#0B0F19]">
                    {formatNumber(mockGrowthData.monetizationProgress.current)} / {formatNumber(mockGrowthData.monetizationProgress.target)}
                  </span>
                </div>
                <Progress 
                  value={(mockGrowthData.monetizationProgress.current / mockGrowthData.monetizationProgress.target) * 100} 
                  className="h-3"
                />
              </div>
              
              <div className="space-y-3">
                {mockGrowthData.monetizationProgress.requirements.map((req) => (
                  <div
                    key={req.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${req.isMet ? 'bg-[#00D4AA]/10' : 'bg-[#F59E0B]/10'}
                      `}>
                        {req.isMet ? (
                          <CheckCircle className="w-4 h-4 text-[#00D4AA]" />
                        ) : (
                          <Clock className="w-4 h-4 text-[#F59E0B]" />
                        )}
                      </div>
                      <span className="text-[#0B0F19]">{req.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-[#0B0F19]">
                        {formatNumber(req.current)} / {formatNumber(req.target)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <SearchX className="w-5 h-5 text-[#10B981]" />
                Content Opportunity Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGrowthData.contentGaps.map((gap) => (
                  <div key={gap.topic} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#0B0F19]">{gap.topic}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`
                            ${gap.competition === 'low' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 
                              gap.competition === 'medium' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 
                              'bg-[#EF4444]/10 text-[#EF4444]'}
                            border-none
                          `}
                        >
                          {gap.competition} competition
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                      <span>{gap.searchVolume.toLocaleString()} searches/mo</span>
                      <span>Your coverage: {gap.yourCoverage}%</span>
                    </div>
                    <Progress value={gap.yourCoverage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viral" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#10B981]" />
                Viral Coefficient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-5xl font-bold text-[#10B981] mb-2">
                  {mockGrowthData.viralCoefficient.current}
                </div>
                <p className="text-sm text-[#6B7280]">
                  Trend: {mockGrowthData.viralCoefficient.trend}
                </p>
              </div>
              
              <div className="space-y-3 mt-4">
                {mockGrowthData.viralCoefficient.factors.map((factor) => (
                  <div key={factor.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">{factor.name}</span>
                      <span className="text-[#0B0F19] font-medium">{factor.impact}</span>
                    </div>
                    <Progress value={factor.impact * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.filter(f => !f.isFree).map((feature) => {
              const result = results[feature.id];
              const isExpanded = expandedFeature === feature.id;
              return (
              <div
                key={feature.id}
                className={cn("p-4 rounded-xl border transition-colors", isExpanded ? 'border-[#10B981]/50 bg-[#10B981]/5' : 'border-[#E5E7EB] hover:border-[#10B981]/50')}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-[#0B0F19]">{feature.name}</h4>
                  <Badge className="bg-[#10B981]/10 text-[#10B981] border-none">
                    {feature.vqtCost} VQT
                  </Badge>
                </div>
                <p className="text-sm text-[#6B7280] mb-4">{feature.description}</p>
                <Button
                  size="sm"
                  className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white gap-2"
                  onClick={() => handleRunFeature(feature.id, feature.vqtCost, feature.name)}
                  disabled={isRunning(feature.id)}
                >
                  {isRunning(feature.id) && expandedFeature === feature.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunning(feature.id) && expandedFeature === feature.id ? 'Running...' : 'Run'}
                </Button>
                {result && isExpanded && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#0B0F19]"><CheckCircle className="w-4 h-4 text-[#00D4AA]" />{result.summary}</div>
                    {result.insights.length > 0 && <div className="space-y-1">{result.insights.map((insight: string, i: number) => <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5"><Lightbulb className="w-3 h-3 text-[#F59E0B] mt-0.5 flex-shrink-0" />{insight}</p>)}</div>}
                    {result.recommendations.length > 0 && <div className="space-y-1">{result.recommendations.map((rec: string, i: number) => <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5"><Sparkles className="w-3 h-3 text-[#00D4AA] mt-0.5 flex-shrink-0" />{rec}</p>)}</div>}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
