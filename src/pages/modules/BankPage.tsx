import { useState } from 'react';
import { useFeatureStore } from '@/stores';
import { mockBankData } from '@/lib/mockData';
import { formatNaira, cn } from '@/lib/utils';
import { useFeatureRunner } from '@/hooks/useFeatureRunner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Landmark, 
  TrendingUp, 
  TrendingDown,
  Target,
  Play,
  Loader2,
  Lightbulb,
  Sparkles,
  CheckCircle
} from 'lucide-react';

export function BankPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { isRunning, results, runFeature } = useFeatureRunner();
  const features = getFeaturesByCategory('bank');
  const [activeTab, setActiveTab] = useState('intent');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const handleRunFeature = async (featureId: string, cost: number, name: string) => {
    setExpandedFeature(featureId);
    await runFeature(featureId, name, cost);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
            <Landmark className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Bank</h1>
            <p className="text-sm text-[#6B7280]">Turn attention into revenue</p>
          </div>
        </div>
        <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-none font-mono">
          {features.length} FEATURES
        </Badge>
      </div>

      {/* Revenue Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">30-Day Forecast</p>
            <p className="text-2xl font-bold text-[#00D4AA]">{formatNaira(mockBankData.revenueForecast.next30Days)}</p>
            <p className="text-xs text-[#6B7280]">{mockBankData.revenueForecast.confidence}% confidence</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">Sponsor Inventory</p>
            <p className="text-2xl font-bold text-[#0B0F19]">{mockBankData.sponsorInventory.filledSlots}/{mockBankData.sponsorInventory.totalSlots}</p>
            <p className="text-xs text-[#6B7280]">slots filled</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">Pending Deals</p>
            <p className="text-2xl font-bold text-[#0B0F19]">{mockBankData.sponsorInventory.pendingDeals}</p>
            <p className="text-xs text-[#6B7280]">in negotiation</p>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">Est. Value</p>
            <p className="text-2xl font-bold text-[#F59E0B]">{formatNaira(mockBankData.sponsorInventory.estimatedValue)}</p>
            <p className="text-xs text-[#6B7280]">total pipeline</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9]">
          <TabsTrigger value="intent">Buying Intent</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliate Matches</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="intent" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#F59E0B]" />
                Top Buying Intent Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockBankData.buyingIntent.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-sm font-medium text-[#F59E0B]">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-[#0B0F19]">{item.keyword}</p>
                        <p className="text-xs text-[#6B7280]">{item.volume.toLocaleString()} monthly searches</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none">
                        {item.score}% intent
                      </Badge>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {item.trend === 'up' && <TrendingUp className="w-3 h-3 text-[#00D4AA]" />}
                        {item.trend === 'down' && <TrendingDown className="w-3 h-3 text-[#EF4444]" />}
                        <span className="text-xs text-[#6B7280]">{item.trend}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {mockBankData.affiliateMatches.map((match) => (
              <Card key={match.id} className="border-[#E5E7EB]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-[#0B0F19]">{match.brand}</h4>
                    <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none">
                      {match.fitScore}% fit
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Commission</span>
                      <span className="text-[#0B0F19] font-medium">{match.commission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Category</span>
                      <span className="text-[#0B0F19]">{match.category}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.filter(f => !f.isFree).map((feature) => {
              const result = results[feature.id];
              const isExpanded = expandedFeature === feature.id;
              return (
              <div
                key={feature.id}
                className={cn("p-4 rounded-xl border transition-colors", isExpanded ? 'border-[#F59E0B]/50 bg-[#F59E0B]/5' : 'border-[#E5E7EB] hover:border-[#F59E0B]/50')}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-[#0B0F19]">{feature.name}</h4>
                  <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-none">
                    {feature.vqtCost} VQT
                  </Badge>
                </div>
                <p className="text-sm text-[#6B7280] mb-4">{feature.description}</p>
                <Button
                  size="sm"
                  className="w-full bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white gap-2"
                  onClick={() => handleRunFeature(feature.id, feature.vqtCost, feature.name)}
                  disabled={isRunning}
                >
                  {isRunning && expandedFeature === feature.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunning && expandedFeature === feature.id ? 'Running...' : 'Run'}
                </Button>
                {result && isExpanded && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#0B0F19]"><CheckCircle className="w-4 h-4 text-[#00D4AA]" />{result.summary}</div>
                    {result.insights.length > 0 && <div className="space-y-1">{result.insights.map((insight, i) => <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5"><Lightbulb className="w-3 h-3 text-[#F59E0B] mt-0.5 flex-shrink-0" />{insight}</p>)}</div>}
                    {result.recommendations.length > 0 && <div className="space-y-1">{result.recommendations.map((rec, i) => <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5"><Sparkles className="w-3 h-3 text-[#00D4AA] mt-0.5 flex-shrink-0" />{rec}</p>)}</div>}
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
