import { useState } from 'react';
import { useFeatureStore, useTokenStore } from '@/stores';
import { mockActionHubData } from '@/lib/mockData';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  PenTool, 
  ListOrdered,
  Plane,
  CheckCircle,
  Clock,
  Play,
  Siren
} from 'lucide-react';

export function ActionHubPage() {
  const { getFeaturesByCategory } = useFeatureStore();
  const { spendTokens } = useTokenStore();
  const features = getFeaturesByCategory('actionHub');
  const [activeTab, setActiveTab] = useState('ghostwriter');
  const [autoPilot, setAutoPilot] = useState(mockActionHubData.autoPilotStatus.isActive);

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
          <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#06B6D4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0F19]">Action Hub</h1>
            <p className="text-sm text-[#6B7280]">Automate the repetitive. Focus on the creative</p>
          </div>
        </div>
        <Badge className="bg-[#06B6D4]/10 text-[#06B6D4] border-none font-mono">
          {features.length} FEATURES
        </Badge>
      </div>

      {/* Auto-Pilot Status */}
      <Card className="border-[#E5E7EB] bg-gradient-to-r from-[#06B6D4]/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
                <Plane className="w-7 h-7 text-[#06B6D4]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0B0F19]">Auto-Pilot</h3>
                <p className="text-sm text-[#6B7280]">
                  {autoPilot 
                    ? `Active: ${mockActionHubData.autoPilotStatus.activeModules.join(', ')}` 
                    : 'Disabled - Enable to automate tasks'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {autoPilot && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-[#6B7280]">Last Action</p>
                  <p className="text-sm text-[#0B0F19]">{mockActionHubData.autoPilotStatus.lastAction}</p>
                </div>
              )}
              <Switch 
                checked={autoPilot} 
                onCheckedChange={setAutoPilot}
                className="data-[state=checked]:bg-[#06B6D4]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F6F7F9]">
          <TabsTrigger value="ghostwriter">Ghostwriter</TabsTrigger>
          <TabsTrigger value="queue">Priority Queue</TabsTrigger>
          <TabsTrigger value="crisis">Crisis Protocols</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="ghostwriter" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <PenTool className="w-5 h-5 text-[#06B6D4]" />
                AI Ghostwriter Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActionHubData.ghostwriterQueue.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${task.status === 'completed' ? 'bg-[#00D4AA]/10' : 
                          task.status === 'in_progress' ? 'bg-[#06B6D4]/10' : 'bg-[#F6F7F9]'}
                      `}>
                        {task.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-[#00D4AA]" />
                        ) : task.status === 'in_progress' ? (
                          <PenTool className="w-5 h-5 text-[#06B6D4]" />
                        ) : (
                          <Clock className="w-5 h-5 text-[#6B7280]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#0B0F19]">{task.type}</p>
                        <p className="text-xs text-[#6B7280]">
                          {task.status === 'completed' ? 'Completed' : 
                           task.status === 'in_progress' ? 'Generating...' : 'Queued'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={`
                        ${task.status === 'completed' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 
                          task.status === 'in_progress' ? 'bg-[#06B6D4]/10 text-[#06B6D4]' : 
                          'bg-[#6B7280]/10 text-[#6B7280]'}
                        border-none
                      `}
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-[#06B6D4]" />
                Engagement Priority Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActionHubData.engagementQueue.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium
                        ${task.priority === 1 ? 'bg-[#EF4444]/10 text-[#EF4444]' : 
                          task.priority === 2 ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 
                          'bg-[#6B7280]/10 text-[#6B7280]'}
                      `}>
                        {task.priority}
                      </span>
                      <div>
                        <p className="font-medium text-[#0B0F19]">{task.action}</p>
                        <p className="text-xs text-[#6B7280]">{task.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Clock className="w-4 h-4 text-[#6B7280] inline mr-1" />
                      <span className="text-sm text-[#6B7280]">
                        {formatRelativeTime(task.dueTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crisis" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockActionHubData.crisisProtocols.map((protocol) => (
              <Card key={protocol.id} className="border-[#E5E7EB]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                      <Siren className="w-5 h-5 text-[#EF4444]" />
                    </div>
                    <Switch checked={protocol.isActive} className="data-[state=checked]:bg-[#00D4AA]" />
                  </div>
                  <h4 className="font-medium text-[#0B0F19] mb-1">{protocol.name}</h4>
                  <p className="text-sm text-[#6B7280]">Trigger: {protocol.trigger}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.filter(f => !f.isFree).map((feature) => (
              <div
                key={feature.id}
                className="p-4 rounded-xl border border-[#E5E7EB] hover:border-[#06B6D4]/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-[#0B0F19]">{feature.name}</h4>
                  <Badge className="bg-[#06B6D4]/10 text-[#06B6D4] border-none">
                    {feature.vqtCost} VQT
                  </Badge>
                </div>
                <p className="text-sm text-[#6B7280] mb-4">{feature.description}</p>
                <Button
                  size="sm"
                  className="w-full bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-white gap-2"
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
