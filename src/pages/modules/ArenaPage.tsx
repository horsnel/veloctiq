import { useState } from 'react';
import { useFeatureStore, useTokenStore } from '@/stores';
import { mockArenaData } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Swords, 
  BookOpen,
  Search,
  Play,
  Target
} from 'lucide-react';

export function ArenaPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('arena');
  const [activeTab, setActiveTab] = useState('competitors');

  const handleRunFeature = (featureId: string, cost: number, name: string) => {
    const success = spendTokens(cost, featureId, `Used ${name}`);
    if (success) {
      toast.success(`${name} completed successfully!`);
    } else {
      toast.error('Insufficient VQT balance. Please purchase more tokens.');
    }
  };

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

      {/* Share of Voice */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#EF4444]" />
            Share of Voice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90">
                {mockArenaData.shareOfVoice.competitors.reduce(
                  (acc, comp, i) => {
                    const prevOffset = acc.offset;
                    const dashArray = `${(comp.percentage / 100) * 251} 251`;
                    const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#6B7280'];
                    acc.circles.push(
                      <circle
                        key={i}
                        cx="64"
                        cy="64"
                        r="40"
                        fill="none"
                        stroke={colors[i]}
                        strokeWidth="12"
                        strokeDasharray={dashArray}
                        strokeDashoffset={-prevOffset}
                      />
                    );
                    acc.offset += (comp.percentage / 100) * 251;
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
                  strokeDasharray={`${(mockArenaData.shareOfVoice.yourPercentage / 100) * 251} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-bold text-[#00D4AA]">{mockArenaData.shareOfVoice.yourPercentage}%</span>
                  <p className="text-xs text-[#6B7280]">You</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00D4AA]" />
                <span className="text-sm text-[#0B0F19]">You</span>
                <span className="text-sm font-medium text-[#00D4AA] ml-auto">{mockArenaData.shareOfVoice.yourPercentage}%</span>
              </div>
              {mockArenaData.shareOfVoice.competitors.map((comp, i) => {
                const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#6B7280'];
                return (
                  <div key={comp.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }} />
                    <span className="text-sm text-[#0B0F19]">{comp.name}</span>
                    <span className="text-sm font-medium text-[#6B7280] ml-auto">{comp.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
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
          <div className="grid sm:grid-cols-2 gap-4">
            {mockArenaData.competitors.map((competitor) => (
              <Card key={competitor.id} className="border-[#E5E7EB]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-[#0B0F19]">@{competitor.handle}</h4>
                    <Badge variant="secondary">{competitor.platform}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-[#0B0F19]">{formatNumber(competitor.followerCount)}</p>
                      <p className="text-xs text-[#6B7280]">Followers</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#0B0F19]">{competitor.engagementRate}%</p>
                      <p className="text-xs text-[#6B7280]">Engagement</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#00D4AA]">+{competitor.growthVelocity}%</p>
                      <p className="text-xs text-[#6B7280]">Growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#EF4444]" />
                Proven Hook Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockArenaData.hookLibrary.map((hook, index) => (
                  <div
                    key={hook.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-sm font-medium text-[#EF4444]">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-[#0B0F19]">&quot;{hook.content}&quot;</p>
                        <Badge variant="secondary" className="mt-1">{hook.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none">
                        {hook.performance}% performance
                      </Badge>
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
                <Search className="w-5 h-5 text-[#EF4444]" />
                Keyword Opportunity Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockArenaData.keywordGaps.map((gap) => (
                  <div key={gap.keyword} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#0B0F19]">{gap.keyword}</span>
                      <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none">
                        {gap.opportunity}% opportunity
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                          <span>Your Rank: #{gap.yourRank}</span>
                          <span>Competitor: #{gap.competitorRank}</span>
                        </div>
                        <Progress value={(gap.opportunity / 100) * 100} className="h-2" />
                      </div>
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
