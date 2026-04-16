import { useState } from 'react';
import { useFeatureStore } from '@/stores';
import { mockControlTowerData } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { useFeatureRunner } from '@/hooks/useFeatureRunner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TowerControl, 
  Satellite,
  Activity,
  Play,
  Scale,
  HardDrive,
  Loader2,
  Lightbulb,
  Sparkles,
  CheckCircle
} from 'lucide-react';

export function ControlTowerPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { isRunning, results, runFeature } = useFeatureRunner();
  const features = getFeaturesByCategory('controlTower');
  const [activeTab, setActiveTab] = useState('scouts');
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
          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
            <TowerControl className="w-6 h-6 text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Control Tower</h1>
            <p className="text-sm text-[#6B7280]">One dashboard. Total control</p>
          </div>
        </div>
        <Badge className="bg-[#6366F1]/10 text-[#6366F1] border-none font-mono">
          {features.length} FEATURES
        </Badge>
      </div>

      {/* API Health */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#00D4AA]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">API Health</p>
                <p className="text-xl font-bold text-[#00D4AA]">{mockControlTowerData.apiHealth.overall}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                <Satellite className="w-5 h-5 text-[#6366F1]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Active Scouts</p>
                <p className="text-xl font-bold text-[#0B0F19]">{mockControlTowerData.scoutStatus.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#00D4AA]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Compliance</p>
                <p className="text-xl font-bold text-[#00D4AA]">Clean</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Data Vault</p>
                <p className="text-xl font-bold text-[#0B0F19]">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9]">
          <TabsTrigger value="scouts">Scout Status</TabsTrigger>
          <TabsTrigger value="api">API Health</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="scouts" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Satellite className="w-5 h-5 text-[#6366F1]" />
                Scout Orchestrator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl bg-[#00D4AA]/5">
                  <p className="text-2xl font-bold text-[#00D4AA]">{mockControlTowerData.scoutStatus.active}</p>
                  <p className="text-xs text-[#6B7280]">Active</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#F59E0B]/5">
                  <p className="text-2xl font-bold text-[#F59E0B]">{mockControlTowerData.scoutStatus.queued}</p>
                  <p className="text-xs text-[#6B7280]">Queued</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#6366F1]/5">
                  <p className="text-2xl font-bold text-[#6366F1]">{mockControlTowerData.scoutStatus.completed}</p>
                  <p className="text-xs text-[#6B7280]">Completed</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#EF4444]/5">
                  <p className="text-2xl font-bold text-[#EF4444]">{mockControlTowerData.scoutStatus.failed}</p>
                  <p className="text-xs text-[#6B7280]">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            {mockControlTowerData.parallelCreators.map((creator) => (
              <Card key={creator.id} className="border-[#E5E7EB]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-[#0B0F19]">{creator.name}</h4>
                    <Badge variant="secondary">{creator.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Progress</span>
                      <span className="text-[#0B0F19] font-medium">{creator.progress}%</span>
                    </div>
                    <div className="h-2 bg-[#F6F7F9] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#6366F1] rounded-full transition-all"
                        style={{ width: `${creator.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#6366F1]" />
                API Service Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockControlTowerData.apiHealth.services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-3 h-3 rounded-full
                        ${service.status === 'healthy' ? 'bg-[#00D4AA]' : 
                          service.status === 'degraded' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}
                      `} />
                      <span className="text-[#0B0F19]">{service.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-[#6B7280]">{service.latency}ms</span>
                    </div>
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
                className={cn("p-4 rounded-xl border transition-colors", isExpanded ? 'border-[#6366F1]/50 bg-[#6366F1]/5' : 'border-[#E5E7EB] hover:border-[#6366F1]/50')}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-[#0B0F19]">{feature.name}</h4>
                  <Badge className="bg-[#6366F1]/10 text-[#6366F1] border-none">
                    {feature.vqtCost} VQT
                  </Badge>
                </div>
                <p className="text-sm text-[#6B7280] mb-4">{feature.description}</p>
                <Button
                  size="sm"
                  className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white gap-2"
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
