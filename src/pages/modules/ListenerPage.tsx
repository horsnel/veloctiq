import { useState } from 'react';
import { useFeatureStore, useTokenStore } from '@/stores';
import { mockListenerData } from '@/lib/mockData';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ear, 
  Users, 
  Trophy, 
  Heart,
  Play,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

export function ListenerPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('listener');
  const [activeTab, setActiveTab] = useState('segments');

  const handleRunFeature = (featureId: string, cost: number, name: string) => {
    const success = spendTokens(cost, featureId, `Used ${name}`);
    if (success) {
      toast.success(`${name} completed successfully!`);
    } else {
      toast.error('Insufficient VQT balance. Please purchase more tokens.');
    }
  };

  const sentimentTrend = mockListenerData.sentimentAnalysis.trends;
  const latestSentiment = sentimentTrend[sentimentTrend.length - 1].score;
  const previousSentiment = sentimentTrend[sentimentTrend.length - 2].score;
  const sentimentChange = latestSentiment - previousSentiment;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
            <Ear className="w-6 h-6 text-[#8B5CF6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Listener</h1>
            <p className="text-sm text-[#6B7280]">Understand your audience without guessing</p>
          </div>
        </div>
        <Badge className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-none font-mono">
          {features.length} FEATURES
        </Badge>
      </div>

      {/* Sentiment Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Overall Sentiment</p>
                <p className="text-2xl font-bold text-[#0B0F19]">{mockListenerData.sentimentAnalysis.overall}%</p>
              </div>
              <div className={`
                flex items-center gap-1 text-sm
                ${sentimentChange > 0 ? 'text-[#00D4AA]' : sentimentChange < 0 ? 'text-[#EF4444]' : 'text-[#6B7280]'}
              `}>
                {sentimentChange > 0 ? <TrendingUp className="w-4 h-4" /> : 
                 sentimentChange < 0 ? <TrendingDown className="w-4 h-4" /> : 
                 <Minus className="w-4 h-4" />}
                {Math.abs(sentimentChange).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">Ghost Audience</p>
            <p className="text-2xl font-bold text-[#0B0F19]">{mockListenerData.ghostAudience.percentage}%</p>
            <p className="text-xs text-[#6B7280]">{mockListenerData.ghostAudience.total.toLocaleString()} accounts</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">Super Fans</p>
            <p className="text-2xl font-bold text-[#0B0F19]">{mockListenerData.superFans.length}</p>
            <p className="text-xs text-[#6B7280]">Top 1% engagers</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">Wishlist Items</p>
            <p className="text-2xl font-bold text-[#0B0F19]">{mockListenerData.wishlist.length}</p>
            <p className="text-xs text-[#6B7280]">From comments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9]">
          <TabsTrigger value="segments">Audience Segments</TabsTrigger>
          <TabsTrigger value="superfans">Super Fans</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {mockListenerData.audienceSegments.map((segment) => (
              <Card key={segment.id} className="border-[#E5E7EB]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-[#0B0F19]">{segment.name}</h4>
                    <Badge className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-none">
                      {segment.percentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-sm text-[#6B7280]">Soul Age: {segment.soulAge}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {segment.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-1 text-xs bg-[#F6F7F9] rounded-full text-[#6B7280]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sentiment Breakdown */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19]">Sentiment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-[#00D4AA]"
                      style={{ width: `${mockListenerData.sentimentAnalysis.breakdown.positive}%` }}
                    />
                    <div 
                      className="bg-[#6B7280]"
                      style={{ width: `${mockListenerData.sentimentAnalysis.breakdown.neutral}%` }}
                    />
                    <div 
                      className="bg-[#EF4444]"
                      style={{ width: `${mockListenerData.sentimentAnalysis.breakdown.negative}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-[#00D4AA]">Positive {mockListenerData.sentimentAnalysis.breakdown.positive}%</span>
                    <span className="text-[#6B7280]">Neutral {mockListenerData.sentimentAnalysis.breakdown.neutral}%</span>
                    <span className="text-[#EF4444]">Negative {mockListenerData.sentimentAnalysis.breakdown.negative}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="superfans" className="space-y-4">
          {mockListenerData.superFans.map((fan, index) => (
            <Card key={fan.id} className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0B0F19]">@{fan.username}</p>
                      <p className="text-xs text-[#6B7280]">{fan.platform}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-none">
                      #{index + 1}
                    </Badge>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Score: {fan.engagementScore}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-4">
          {mockListenerData.wishlist.map((item) => (
            <Card key={item.id} className="border-[#E5E7EB]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-[#EF4444]" />
                    <p className="text-[#0B0F19]">{item.content}</p>
                  </div>
                  <Badge variant="secondary">
                    {item.mentions} mentions
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.filter(f => !f.isFree).map((feature) => (
              <div
                key={feature.id}
                className="p-4 rounded-xl border border-[#E5E7EB] hover:border-[#8B5CF6]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-[#0B0F19]">{feature.name}</h4>
                  <Badge className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-none">
                    {feature.vqtCost} VQT
                  </Badge>
                </div>
                <p className="text-sm text-[#6B7280] mb-4">{feature.description}</p>
                <Button
                  size="sm"
                  className="w-full bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white gap-2"
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
