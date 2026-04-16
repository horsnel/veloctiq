import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuthStore, useTokenStore } from '@/stores';
import { formatVQT, formatNaira, formatRelativeTime, getScoreColor, getStatusText } from '@/lib/utils';
import { mockLiveSignals, mockChannelHealth, mockGoldenHour, mockRecentActivity } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  Activity,
  Zap,
  Coins,
  ArrowRight,
  Bell,
  Sun,
  Target,
  Gift
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { balance, getFreeAnalysesRemaining } = useTokenStore();
  const cardsRef = useRef<HTMLDivElement>(null);
  const freeAnalysesRemaining = getFreeAnalysesRemaining();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, cardsRef);

    return () => ctx.revert();
  }, []);

  const healthColor = getScoreColor(mockChannelHealth.score);
  const healthStatus = getStatusText(mockChannelHealth.score);

  return (
    <div ref={cardsRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B0F19]">Dashboard</h1>
          <p className="text-sm text-[#6B7280]">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tokens">
            <Button variant="outline" className="gap-2">
              <Coins className="w-4 h-4 text-[#00D4AA]" />
              {formatVQT(balance)}
            </Button>
          </Link>
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Followers', value: '73.2K', change: '+12%', trend: 'up' },
          { label: 'Engagement Rate', value: '4.2%', change: '+0.3%', trend: 'up' },
          { label: 'Monthly Revenue', value: '₦847K', change: '-5%', trend: 'down' },
          { label: 'Content Score', value: '78/100', change: 'Stable', trend: 'neutral' },
        ].map((stat, i) => (
          <Card key={i} className="dashboard-card border-[#E5E7EB]">
            <CardContent className="p-4">
              <p className="text-xs text-[#6B7280] mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-[#0B0F19]">{stat.value}</span>
                <span className={`
                  text-xs flex items-center gap-0.5
                  ${stat.trend === 'up' ? 'text-[#00D4AA]' : stat.trend === 'down' ? 'text-[#EF4444]' : 'text-[#6B7280]'}
                `}>
                  {stat.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {stat.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {stat.trend === 'neutral' && <Minus className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Freemium Card */}
        <Card className="dashboard-card border-[#E5E7EB] bg-gradient-to-br from-[#00D4AA]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-3 h-3 text-[#00D4AA]" />
              <p className="text-xs text-[#6B7280]">Free Analyses</p>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-bold text-[#00D4AA]">{freeAnalysesRemaining}/3</span>
              <span className="text-xs text-[#6B7280]">today</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Channel Health */}
        <Card className="dashboard-card border-[#E5E7EB] lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#0B0F19]">Channel Health</CardTitle>
              <Badge 
                className="text-white border-none"
                style={{ backgroundColor: healthColor }}
              >
                {healthStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8 mb-6">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    fill="none"
                    stroke={healthColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(mockChannelHealth.score / 100) * 301} 301`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#0B0F19]">{mockChannelHealth.score}</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {mockChannelHealth.metrics.slice(0, 3).map((metric) => (
                  <div key={metric.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#6B7280]">{metric.name}</span>
                      <span className="text-[#0B0F19] font-medium">{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-[#F6F7F9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${metric.value}%`,
                          backgroundColor: metric.status === 'good' ? '#00D4AA' : metric.status === 'warning' ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/growth">
              <Button variant="outline" className="w-full gap-2">
                View detailed analytics
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Golden Hour */}
        <Card className="dashboard-card border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
              <Sun className="w-5 h-5 text-[#F59E0B]" />
              Golden Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-[#00D4AA] mb-1">
                {mockGoldenHour.nextBestTime}
              </div>
              <p className="text-sm text-[#6B7280]">{mockGoldenHour.timezone}</p>
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-xs text-[#6B7280] uppercase font-medium">Optimal Times</p>
              {mockGoldenHour.optimalTimes.map((time, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-[#0B0F19]">{time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Signals */}
        <Card className="dashboard-card border-[#E5E7EB] lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#0B0F19] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00D4AA]" />
                Live Signals
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
                <span className="text-xs text-[#6B7280]">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {mockLiveSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#F6F7F9] hover:bg-[#F6F7F9]/80 transition-colors"
                  >
                    <div className={`
                      w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                      ${signal.type === 'alert' ? 'bg-[#EF4444]' : 
                        signal.type === 'success' ? 'bg-[#00D4AA]' : 
                        signal.type === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#6B7280]'}
                    `} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0B0F19]">{signal.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {signal.module}
                        </Badge>
                        <span className="text-xs text-[#6B7280]">
                          {formatRelativeTime(signal.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Token Balance & Quick Actions */}
        <div className="space-y-6">
          <Card className="dashboard-card border-[#E5E7EB]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#0B0F19]">Token Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-[#00D4AA] mb-1">
                  {formatVQT(balance)}
                </div>
                <p className="text-sm text-[#6B7280]">
                  ≈ {formatNaira(balance * 10)}
                </p>
              </div>
              <Link to="/tokens">
                <Button className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white gap-2">
                  <Coins className="w-4 h-4" />
                  Buy VQT
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="dashboard-card border-[#E5E7EB]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-[#0B0F19]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/shield">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Zap className="w-4 h-4 text-[#00D4AA]" />
                  Run Bot Detection
                </Button>
              </Link>
              <Link to="/listener">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Target className="w-4 h-4 text-[#8B5CF6]" />
                  Analyze Audience
                </Button>
              </Link>
              <Link to="/studio">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Activity className="w-4 h-4 text-[#EC4899]" />
                  Audit Latest Video
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="dashboard-card border-[#E5E7EB]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-[#0B0F19]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7F9]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#00D4AA]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#0B0F19]">{activity.description}</p>
                    <span className="text-xs text-[#6B7280]">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
                {activity.vqtCost && (
                  <Badge variant="secondary" className="text-xs">
                    -{activity.vqtCost} VQT
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
