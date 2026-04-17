import { useState } from 'react';
import { useFeatureStore } from '@/stores';
import { mockBankData } from '@/lib/mockData';
import { formatNaira, cn } from '@/lib/utils';
import { useFeatureRunner } from '@/hooks/useFeatureRunner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  Target,
  Play,
  Loader2,
  Lightbulb,
  Sparkles,
  CheckCircle,
  ShoppingCart,
  Droplets,
  FileBarChart,
  BarChart3,
  AlertTriangle,
  HeartPulse,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Link2,
  Flame,
  Shield,
  Zap,
} from 'lucide-react';

const BANK_ICONS: Record<string, React.ReactNode> = {
  ShoppingCart: <ShoppingCart className="w-4 h-4" />,
  Droplets: <Droplets className="w-4 h-4" />,
  FileBarChart: <FileBarChart className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
  HeartPulse: <HeartPulse className="w-4 h-4" />,
  AlertTriangle: <AlertTriangle className="w-4 h-4" />,
  Link2: <Link2 className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
};

// Inline mock revenue data for the chart and F40 card
const monthlyRevenue = [
  { month: 'Jan', revenue: 85000, color: '#F59E0B' },
  { month: 'Feb', revenue: 92000, color: '#F59E0B' },
  { month: 'Mar', revenue: 110000, color: '#F59E0B' },
  { month: 'Apr', revenue: 98000, color: '#F59E0B' },
  { month: 'May', revenue: 125000, color: '#F59E0B' },
  { month: 'Jun', revenue: 140000, color: '#F59E0B' },
  { month: 'Jul', revenue: 132000, color: '#F59E0B' },
  { month: 'Aug', revenue: 155000, color: '#F59E0B' },
  { month: 'Sep', revenue: 168000, color: '#F59E0B' },
  { month: 'Oct', revenue: 175000, color: '#F59E0B' },
  { month: 'Nov', revenue: 190000, color: '#F59E0B' },
  { month: 'Dec', revenue: 245000, color: '#F59E0B' },
];

const topEarningContent = [
  { title: '10 Tools Every Creator Needs in 2024', views: '89,000 views', revenue: 245000 },
  { title: 'How I Made ₦1M From My Phone', views: '124,000 views', revenue: 198000 },
  { title: 'Best Camera Under ₦200K', views: '67,000 views', revenue: 167000 },
];

const revenueBySource = [
  { source: 'Sponsorship', amount: 240993, percentage: 28 },
  { source: 'Affiliate', amount: 273248, percentage: 32 },
  { source: 'Merch', amount: 329869, percentage: 40 },
];

export function BankPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { isRunning, results, runFeature } = useFeatureRunner();
  const features = getFeaturesByCategory('bank');
  const [activeTab, setActiveTab] = useState('intel');

  // Form states for interactive features
  const [f33Text, setF33Text] = useState(
    'How much does this camera cost? I want to buy one. Do you have a discount code? Where can I get the link?\nThis mic is amazing, thinking about getting one. Is it worth the price?\nJust ordered mine! Can\'t wait. Anyone know if there\'s a sale coming?\nComparing this to the Sony option. Which one should I pick?\nNeed this for my studio setup ASAP. Running out of budget this month.'
  );
  const [f36Revenue, setF36Revenue] = useState('120000,135000,148000,162000,155000,178000');
  const [f36Investment, setF36Investment] = useState('75000');

  const regularFeatures = features.filter(f => !f.requiresLiminal);
  const liminalFeatures = features.filter(f => f.requiresLiminal);

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
        <div className="flex items-center gap-3">
          <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-none font-mono">
            {features.length} FEATURES
          </Badge>
          <Badge className="bg-[#E5E7EB] text-[#6B7280] border-none">
            ₦ NGN
          </Badge>
        </div>
      </div>

      {/* Revenue Overview - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* 30-Day Forecast */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">30-Day Forecast</p>
            <p className="text-xl sm:text-2xl font-bold text-[#00D4AA]">
              {formatNaira(mockBankData.revenueForecast.next30Days)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-[#00D4AA]" />
              <span className="text-xs text-[#00D4AA] font-medium">+12% vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Leaks */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">Revenue Leaks</p>
            <p className="text-xl sm:text-2xl font-bold text-[#EF4444]">
              {formatNaira(1412000)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
              <span className="text-xs text-[#EF4444] font-medium">6 potential leaks</span>
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Pipeline */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">Sponsor Pipeline</p>
            <p className="text-xl sm:text-2xl font-bold text-[#0B0F19]">
              {formatNaira(mockBankData.sponsorInventory.estimatedValue)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-[#6B7280]">
                {mockBankData.sponsorInventory.filledSlots} active &middot; {mockBankData.sponsorInventory.pendingDeals} pending
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Link Health */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-xs text-[#6B7280] mb-1">Link Health</p>
            <p className="text-xl sm:text-2xl font-bold text-[#F59E0B]">5/7</p>
            <div className="flex items-center gap-1 mt-1">
              <HeartPulse className="w-3 h-3 text-[#F59E0B]" />
              <span className="text-xs text-[#6B7280]">links active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9] w-full sm:w-auto">
          <TabsTrigger value="intel">Revenue Intel</TabsTrigger>
          <TabsTrigger value="tools">AI Money Tools</TabsTrigger>
          <TabsTrigger value="liminal">Liminal</TabsTrigger>
          <TabsTrigger value="features">All Features</TabsTrigger>
        </TabsList>

        {/* ========== REVENUE INTEL TAB ========== */}
        <TabsContent value="intel" className="space-y-4">
          {/* Buying Intent Keywords */}
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

          {/* Affiliate Matches Grid */}
          <h3 className="text-lg font-semibold text-[#0B0F19]">Affiliate Matches</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* ========== AI MONEY TOOLS TAB ========== */}
        <TabsContent value="tools" className="space-y-4">
          {/* F33 - Buying Intent Scoring */}
          <Card className="border-[#E5E7EB] overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0B0F19]">F33 - Buying Intent Scoring</h4>
                      <p className="text-sm text-[#6B7280]">Score audience buying intent from comments &amp; text</p>
                    </div>
                  </div>
                  <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-none shrink-0">
                    2 VQT
                  </Badge>
                </div>
              </div>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <Label className="text-sm text-[#6B7280] mb-2 block">Paste audience comments or text</Label>
                <Textarea
                  className="min-h-[100px] text-sm border-[#E5E7EB] bg-[#F6F7F9] focus-visible:ring-[#F59E0B]/30 focus-visible:border-[#F59E0B]"
                  placeholder="e.g. How much does this camera cost? I want to buy one..."
                  value={f33Text}
                  onChange={(e) => setF33Text(e.target.value)}
                />
                <Button
                  size="sm"
                  className="w-full mt-3 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white rounded-lg"
                  onClick={() => {
                    const comments = f33Text.split('\n').filter(Boolean).map((text, i) => ({
                      id: String(i + 1),
                      text,
                      timestamp: new Date().toISOString(),
                      likes: Math.floor(Math.random() * 20),
                    }));
                    runFeature('f33', 'Buying Intent Scoring', 2, { comments });
                  }}
                  disabled={isRunning('f33')}
                >
                  {isRunning('f33') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunning('f33') ? 'Analyzing...' : 'Analyze intent'}
                </Button>
              </div>
              {results['f33']?.success && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                  <div className="bg-[#00D4AA]/5 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 font-medium text-sm text-[#0B0F19]">
                      <CheckCircle className="w-4 h-4 text-[#00D4AA]" />
                      Avg Buying Score: {results['f33']?.data?.averageBuyingScore || 0}%
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Hot leads: {results['f33']?.data?.hotLeadCount || 0} ({results['f33']?.data?.hotLeadPercentage || 0}%)
                    </p>
                    {results['f33']?.data?.recommendations?.map((r: string, i: number) => (
                      <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5">
                        <Lightbulb className="w-3 h-3 text-[#F59E0B] mt-0.5 shrink-0" />{r}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* F36 - ROI Forecaster */}
          <Card className="border-[#E5E7EB] overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0B0F19]">F36 - ROI Forecaster</h4>
                      <p className="text-sm text-[#6B7280]">Forecast revenue using historical data &amp; projections</p>
                    </div>
                  </div>
                  <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-none shrink-0">
                    10 VQT
                  </Badge>
                </div>
              </div>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
                <div>
                  <Label className="text-sm text-[#6B7280] mb-1.5 block">Historical Revenue (comma-separated, monthly)</Label>
                  <Input
                    className="border-[#E5E7EB] bg-[#F6F7F9] focus-visible:ring-[#F59E0B]/30 focus-visible:border-[#F59E0B]"
                    placeholder="120000,135000,148000,162000"
                    value={f36Revenue}
                    onChange={(e) => setF36Revenue(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm text-[#6B7280] mb-1.5 block">Monthly Investment (₦)</Label>
                  <Input
                    className="border-[#E5E7EB] bg-[#F6F7F9] focus-visible:ring-[#F59E0B]/30 focus-visible:border-[#F59E0B]"
                    placeholder="75000"
                    value={f36Investment}
                    onChange={(e) => setF36Investment(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white rounded-lg"
                  onClick={() => {
                    const revenues = f36Revenue.split(',').map(Number);
                    const input = {
                      historicalRevenue: revenues.map((r, i) => ({
                        month: `Month ${i + 1}`,
                        revenue: r || 0,
                        spend: parseInt(f36Investment) || 0,
                      })),
                      currentGrowthRate: revenues.length >= 2
                        ? ((revenues[revenues.length - 1] - revenues[revenues.length - 2]) / Math.max(1, revenues[revenues.length - 2])) * 100
                        : 10,
                      avgEngagementRate: 4.5,
                      followerCount: 50000,
                      investmentAmount: parseInt(f36Investment) || 75000,
                      investmentType: 'content' as const,
                    };
                    runFeature('f36', 'ROI Forecaster', 10, input);
                  }}
                  disabled={isRunning('f36')}
                >
                  {isRunning('f36') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunning('f36') ? 'Forecasting...' : 'Forecast ROI'}
                </Button>
              </div>
              {results['f36']?.success && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                  <div className="bg-[#00D4AA]/5 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 font-medium text-sm text-[#0B0F19]">
                      <CheckCircle className="w-4 h-4 text-[#00D4AA]" />
                      Projected ROI: {results['f36']?.data?.projectedROI || 0}%
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Projected return: {formatNaira(results['f36']?.data?.projectedReturn || 0)}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      Risk: {(results['f36']?.data?.riskAssessment || 'medium')} &middot;
                      Trend: {results['f36']?.data?.historicalTrend || 'stable'}
                    </p>
                    {results['f36']?.data?.recommendations?.map((r: string, i: number) => (
                      <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#00D4AA] mt-0.5 shrink-0" />{r}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* F40 - Automated Revenue Reporting */}
          <Card className="border-[#E5E7EB] overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                      <FileBarChart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0B0F19]">F40 - Automated Revenue Reporting</h4>
                      <p className="text-sm text-[#6B7280]">Revenue breakdown, trends &amp; top earning content</p>
                    </div>
                  </div>
                  <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-none shrink-0">
                    3 VQT
                  </Badge>
                </div>
              </div>

              {/* Revenue Summary */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-[#F6F7F9] rounded-xl p-3">
                    <p className="text-xs text-[#6B7280]">This Month</p>
                    <p className="text-lg font-bold text-[#00D4AA]">{formatNaira(1561059)}</p>
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-[#00D4AA]" />
                      <span className="text-xs text-[#00D4AA] font-medium">+52% vs last month</span>
                    </div>
                  </div>
                  <div className="bg-[#F6F7F9] rounded-xl p-3">
                    <p className="text-xs text-[#6B7280]">Total Annual</p>
                    <p className="text-lg font-bold text-[#0B0F19]">{formatNaira(1615000)}</p>
                    <p className="text-xs text-[#6B7280]">12 months tracked</p>
                  </div>
                </div>

                {/* Revenue by Source */}
                <h5 className="text-sm font-medium text-[#0B0F19] mb-2">Revenue by Source</h5>
                <div className="space-y-2 mb-5">
                  {revenueBySource.map((src) => (
                    <div key={src.source} className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">{src.source}</span>
                      <span className="text-sm font-medium text-[#0B0F19]">{formatNaira(src.amount)}</span>
                    </div>
                  ))}
                </div>

                {/* Revenue Chart */}
                <h5 className="text-sm font-medium text-[#0B0F19] mb-2">Monthly Revenue</h5>
                <div className="bg-[#F6F7F9] rounded-xl p-3">
                  <div className="flex items-end gap-1 h-24">
                    {monthlyRevenue.map((item, i) => {
                      const maxRev = Math.max(...monthlyRevenue.map(m => m.revenue));
                      const height = Math.max(8, (item.revenue / maxRev) * 100);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t-sm bg-[#F59E0B] transition-all"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-[9px] text-[#6B7280]">{item.month.charAt(0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Earning Content */}
                <h5 className="text-sm font-medium text-[#0B0F19] mt-4 mb-2">Top Earning Content</h5>
                <div className="space-y-2">
                  {topEarningContent.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-[#F6F7F9]">
                      <span className="w-5 h-5 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-xs font-medium text-[#F59E0B] shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0B0F19] truncate">{item.title}</p>
                        <p className="text-xs text-[#6B7280]">{item.views}</p>
                      </div>
                      <span className="text-sm font-bold text-[#00D4AA] shrink-0">{formatNaira(item.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Money Tools (compact cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {regularFeatures
              .filter(f => !['f33', 'f36', 'f40'].includes(f.id))
              .map((feature) => {
                const result = results[feature.id];
                return (
                  <div
                    key={feature.id}
                    className={cn(
                      "p-4 rounded-xl border transition-colors",
                      result?.success ? 'border-[#00D4AA]/30 bg-[#00D4AA]/5' : 'border-[#E5E7EB] hover:border-[#F59E0B]/50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                          {BANK_ICONS[feature.icon] || <Zap className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#0B0F19]">{feature.code} - {feature.name}</h4>
                        </div>
                      </div>
                      <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-none text-xs">
                        {feature.vqtCost} VQT
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6B7280] mb-3">{feature.description}</p>
                    <Button
                      size="sm"
                      className="w-full bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white gap-2 rounded-lg text-sm"
                      onClick={() => runFeature(feature.id, feature.name, feature.vqtCost)}
                      disabled={isRunning(feature.id)}
                    >
                      {isRunning(feature.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      {isRunning(feature.id) ? 'Running...' : 'Run'}
                    </Button>
                    {result?.success && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#0B0F19]">
                          <CheckCircle className="w-3 h-3 text-[#00D4AA]" />
                          {result.summary || 'Completed successfully'}
                        </div>
                        {result.insights?.length > 0 && (
                          <div className="space-y-0.5">
                            {result.insights.map((insight: string, i: number) => (
                              <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1">
                                <Lightbulb className="w-2.5 h-2.5 text-[#F59E0B] mt-0.5 shrink-0" />{insight}
                              </p>
                            ))}
                          </div>
                        )}
                        {result.data?.recommendations?.map((rec: string, i: number) => (
                          <p key={i} className="text-xs text-[#6B7280] flex items-start gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-[#00D4AA] mt-0.5 shrink-0" />{rec}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </TabsContent>

        {/* ========== LIMINAL TAB ========== */}
        <TabsContent value="liminal" className="space-y-4">
          {liminalFeatures.length === 0 ? (
            <Card className="border-[#E5E7EB]">
              <CardContent className="p-8 text-center">
                <Shield className="w-10 h-10 text-[#6B7280] mx-auto mb-3" />
                <h4 className="font-medium text-[#0B0F19] mb-1">Liminal Features</h4>
                <p className="text-sm text-[#6B7280]">Advanced features powered by Liminal intelligence</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {liminalFeatures.map((feature) => {
                const result = results[feature.id];
                return (
                  <div
                    key={feature.id}
                    className={cn(
                      "p-4 rounded-xl border transition-colors",
                      result?.success ? 'border-[#00D4AA]/30 bg-[#00D4AA]/5' : 'border-[#E5E7EB] hover:border-[#8B5CF6]/50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
                          {BANK_ICONS[feature.icon] || <Shield className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#0B0F19]">{feature.code} - {feature.name}</h4>
                        </div>
                      </div>
                      <Badge className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-none text-xs">
                        {feature.vqtCost} VQT
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6B7280] mb-3">{feature.description}</p>
                    <Badge className="bg-[#8B5CF6]/5 text-[#8B5CF6] border border-[#8B5CF6]/20 text-xs mb-3">
                      Requires Liminal
                    </Badge>
                    <Button
                      size="sm"
                      className="w-full bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white gap-2 rounded-lg text-sm"
                      onClick={() => runFeature(feature.id, feature.name, feature.vqtCost)}
                      disabled={isRunning(feature.id)}
                    >
                      {isRunning(feature.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      {isRunning(feature.id) ? 'Running...' : 'Run'}
                    </Button>
                    {result?.success && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-[#0B0F19]">
                          <CheckCircle className="w-3 h-3 text-[#00D4AA]" />
                          {result.summary || 'Completed successfully'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ========== ALL FEATURES TAB ========== */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const result = results[feature.id];
              return (
                <div
                  key={feature.id}
                  className={cn(
                    "p-4 rounded-xl border transition-colors",
                    result?.success ? 'border-[#00D4AA]/30 bg-[#00D4AA]/5' :
                    feature.requiresLiminal ? 'border-[#8B5CF6]/20 hover:border-[#8B5CF6]/50' :
                    'border-[#E5E7EB] hover:border-[#F59E0B]/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        feature.requiresLiminal ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                      )}>
                        {BANK_ICONS[feature.icon] || <Zap className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">{feature.code}</p>
                        <h4 className="text-sm font-semibold text-[#0B0F19]">{feature.name}</h4>
                      </div>
                    </div>
                    {feature.vqtCost > 0 ? (
                      <Badge className={cn(
                        "border-none text-xs",
                        feature.requiresLiminal ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                      )}>
                        {feature.vqtCost} VQT
                      </Badge>
                    ) : (
                      <Badge className="bg-[#E5E7EB] text-[#6B7280] border-none text-xs">Free</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] mb-3">{feature.description}</p>
                  {feature.requiresLiminal && (
                    <Badge className="bg-[#8B5CF6]/5 text-[#8B5CF6] border border-[#8B5CF6]/20 text-[10px] mb-3">
                      Liminal
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    className={cn(
                      "w-full gap-2 rounded-lg text-sm text-white",
                      feature.requiresLiminal ? 'bg-[#8B5CF6] hover:bg-[#8B5CF6]/90' : 'bg-[#F59E0B] hover:bg-[#F59E0B]/90'
                    )}
                    onClick={() => runFeature(feature.id, feature.name, feature.vqtCost)}
                    disabled={isRunning(feature.id)}
                  >
                    {isRunning(feature.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    {isRunning(feature.id) ? 'Running...' : 'Run'}
                  </Button>
                  {result?.success && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-[#0B0F19]">
                        <CheckCircle className="w-3 h-3 text-[#00D4AA]" />
                        {result.summary || 'Completed successfully'}
                      </div>
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
