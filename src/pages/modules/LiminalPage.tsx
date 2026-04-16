import { useState } from 'react';
import { useFeatureStore, useTokenStore, useAuthStore } from '@/stores';
import { mockLiminalData } from '@/lib/mockData';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ghost, 
  AlertTriangle,
  Brain,
  History,
  Mic2,
  VideoOff,
  Play,
  Sparkles
} from 'lucide-react';

export function LiminalPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const { user } = useAuthStore();
  const features = getFeaturesByCategory('listener').filter(f => f.requiresLiminal);
  const [activeTab, setActiveTab] = useState('dopamine');

  const handleRunFeature = (featureId: string, cost: number, name: string) => {
    const success = spendTokens(cost, featureId, `Used ${name}`);
    if (success) {
      toast.success(`${name} completed successfully!`);
    } else {
      toast.error('Insufficient VQT balance. Please purchase more tokens.');
    }
  };

  if (!user?.isLiminalOptIn) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
            <Ghost className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Liminal</h1>
            <p className="text-sm text-[#6B7280]">The shadow self of your content</p>
          </div>
        </div>

        <Alert className="border-[#7C3AED]/30 bg-[#7C3AED]/5">
          <AlertTriangle className="w-5 h-5 text-[#7C3AED]" />
          <AlertTitle className="text-[#7C3AED]">Liminal Access Required</AlertTitle>
          <AlertDescription>
            You have not opted in to Liminal features. These features analyze deep psychological 
            patterns and may reveal uncomfortable truths about your content and audience.
          </AlertDescription>
        </Alert>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#0B0F19] mb-4">What are Liminal Features?</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: Brain, title: 'Dopamine Debt Analysis', desc: 'Understand your addiction to metrics' },
                { icon: History, title: 'Comment Archaeology', desc: 'Uncover hidden patterns in old comments' },
                { icon: Mic2, title: 'Voice Crack Detection', desc: 'Analyze vocal stress in your content' },
                { icon: VideoOff, title: 'Last Video Syndrome', desc: 'Predict creator burnout before it hits' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-[#F6F7F9]">
                  <item.icon className="w-5 h-5 text-[#7C3AED] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#0B0F19]">{item.title}</p>
                    <p className="text-sm text-[#6B7280]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white">
              Enable Liminal Features
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
            <Ghost className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Liminal</h1>
            <p className="text-sm text-[#6B7280]">The shadow self of your content</p>
          </div>
        </div>
        <Badge className="bg-[#7C3AED]/10 text-[#7C3AED] border-none font-mono">
          {features.length} FEATURES
        </Badge>
      </div>

      <Alert className="border-amber-300 bg-amber-50">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <AlertTitle className="text-amber-800">Psychological Risk Warning</AlertTitle>
        <AlertDescription className="text-amber-700">
          Liminal features may reveal uncomfortable truths about your content, audience, and mental state. 
          Use with caution and consider professional support if needed.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9]">
          <TabsTrigger value="dopamine">Dopamine Debt</TabsTrigger>
          <TabsTrigger value="archaeology">Archaeology</TabsTrigger>
          <TabsTrigger value="syndrome">Last Video</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="dopamine" className="space-y-4">
          <Card className="border-[#E5E7EB]" style={{ borderColor: mockLiminalData.dopamineDebt.score > 70 ? '#EF4444' : '#E5E7EB' }}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#7C3AED]" />
                Dopamine Debt Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div 
                  className="text-5xl font-bold mb-2"
                  style={{ color: mockLiminalData.dopamineDebt.score > 70 ? '#EF4444' : '#7C3AED' }}
                >
                  {mockLiminalData.dopamineDebt.score}
                </div>
                <p className="text-sm text-[#6B7280]">Higher = More addicted to metrics</p>
              </div>
              
              <div className="space-y-3 mt-4">
                {mockLiminalData.dopamineDebt.metrics.map((metric) => (
                  <div key={metric.name} className="flex justify-between p-3 rounded-lg bg-[#F6F7F9]">
                    <span className="text-[#6B7280]">{metric.name}</span>
                    <span className="font-medium text-[#0B0F19]">{metric.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-[#0B0F19] mb-2">Recommendations</p>
                <ul className="space-y-2">
                  {mockLiminalData.dopamineDebt.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#6B7280]">
                      <Sparkles className="w-4 h-4 text-[#7C3AED] mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archaeology" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <History className="w-5 h-5 text-[#7C3AED]" />
                Comment Section Archaeology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLiminalData.commentArchaeology.map((find) => (
                  <div
                    key={find.id}
                    className="p-4 rounded-xl bg-[#F6F7F9] border-l-4 border-[#7C3AED]"
                  >
                    <p className="text-[#0B0F19] italic mb-2">&quot;{find.content}&quot;</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B7280]">{find.date}</span>
                      <Badge className="bg-[#7C3AED]/10 text-[#7C3AED] border-none">
                        {find.significance}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syndrome" className="space-y-4">
          <Card className="border-[#E5E7EB]" style={{ borderColor: mockLiminalData.lastVideoSyndrome.riskScore > 70 ? '#EF4444' : '#E5E7EB' }}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <VideoOff className="w-5 h-5 text-[#7C3AED]" />
                Last Video Syndrome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div 
                  className="text-5xl font-bold mb-2"
                  style={{ color: mockLiminalData.lastVideoSyndrome.riskScore > 70 ? '#EF4444' : '#7C3AED' }}
                >
                  {mockLiminalData.lastVideoSyndrome.riskScore}%
                </div>
                <p className="text-sm text-[#6B7280]">Risk of creator block</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#F6F7F9]">
                  <p className="text-sm text-[#6B7280] mb-1">Detected Pattern</p>
                  <p className="text-[#0B0F19]">{mockLiminalData.lastVideoSyndrome.pattern}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#F6F7F9]">
                  <p className="text-sm text-[#6B7280] mb-1">Prediction</p>
                  <p className="text-[#0B0F19]">{mockLiminalData.lastVideoSyndrome.prediction}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="p-4 rounded-xl border border-[#E5E7EB] hover:border-[#7C3AED]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-[#0B0F19]">{feature.name}</h4>
                  <Badge className="bg-[#7C3AED]/10 text-[#7C3AED] border-none">
                    {feature.vqtCost} VQT
                  </Badge>
                </div>
                <p className="text-sm text-[#6B7280] mb-4">{feature.description}</p>
                <Button
                  size="sm"
                  className="w-full bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white gap-2"
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
