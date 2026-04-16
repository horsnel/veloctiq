import { useAuthStore, useTokenStore } from '@/stores';
import { formatVQT, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Calendar, 
  Coins,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  CheckCircle
} from 'lucide-react';

const platformIcons: Record<string, React.ElementType> = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: User,
  facebook: User,
};

const platformColors: Record<string, string> = {
  youtube: '#FF0000',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  facebook: '#1877F2',
};

export function ProfilePage() {
  const { user } = useAuthStore();
  const { balance, transactions } = useTokenStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B0F19]">Profile</h1>
        <p className="text-sm text-[#6B7280]">Manage your account and connected platforms</p>
      </div>

      {/* Profile Card */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl bg-[#00D4AA]/10 text-[#00D4AA]">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold text-[#0B0F19]">{user?.name}</h2>
              <p className="text-[#6B7280]">{user?.handle || '@' + user?.name?.toLowerCase().replace(/\s/g, '')}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <Badge className="bg-[#00D4AA]/10 text-[#00D4AA] border-none capitalize">
                  {user?.plan} Plan
                </Badge>
                {user?.isLiminalOptIn && (
                  <Badge className="bg-[#7C3AED]/10 text-[#7C3AED] border-none">
                    Liminal Access
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-3xl font-bold text-[#00D4AA]">{formatVQT(balance)}</div>
              <p className="text-sm text-[#6B7280]">Available Balance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Account Details */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0B0F19]">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F6F7F9]">
              <Mail className="w-5 h-5 text-[#6B7280]" />
              <div>
                <p className="text-sm text-[#6B7280]">Email</p>
                <p className="text-[#0B0F19]">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F6F7F9]">
              <Calendar className="w-5 h-5 text-[#6B7280]" />
              <div>
                <p className="text-sm text-[#6B7280]">Member Since</p>
                <p className="text-[#0B0F19]">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F6F7F9]">
              <CheckCircle className="w-5 h-5 text-[#00D4AA]" />
              <div>
                <p className="text-sm text-[#6B7280]">Account Status</p>
                <p className="text-[#00D4AA]">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Platforms */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0B0F19]">Connected Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user?.connectedPlatforms?.map((platform) => {
                const Icon = platformIcons[platform.platform] || User;
                const color = platformColors[platform.platform] || '#6B7280';
                return (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#F6F7F9]"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-medium text-[#0B0F19] capitalize">{platform.platform}</p>
                        <p className="text-sm text-[#6B7280]">{platform.handle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#0B0F19]">
                        {platform.followerCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#6B7280]">followers</p>
                    </div>
                  </div>
                );
              })}
              {(!user?.connectedPlatforms || user.connectedPlatforms.length === 0) && (
                <p className="text-center text-[#6B7280] py-4">No platforms connected</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0B0F19]">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#F6F7F9]"
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${tx.type === 'purchase' ? 'bg-[#00D4AA]/10' : 'bg-[#EF4444]/10'}
                  `}>
                    <Coins className={`w-5 h-5 ${tx.type === 'purchase' ? 'text-[#00D4AA]' : 'text-[#EF4444]'}`} />
                  </div>
                  <div>
                    <p className="text-[#0B0F19]">{tx.description}</p>
                    <p className="text-xs text-[#6B7280]">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>
                <span className={`font-medium ${tx.amount > 0 ? 'text-[#00D4AA]' : 'text-[#EF4444]'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} VQT
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-[#6B7280] py-4">No transactions yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
