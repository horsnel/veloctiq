import { useState } from 'react';
import { useAuthStore, useUIStore } from '@/stores';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import { Separator } from '@/components/ui/separator';
import { 
  Moon, 
  Shield, 
  Ghost,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export function SettingsPage() {
  const { user, toggleLiminalConsent, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    alerts: true,
  });

  const handleExportData = () => {
    toast.success('Data export requested. You will receive an email shortly.');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires contacting support.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B0F19]">Settings</h1>
        <p className="text-sm text-[#6B7280]">Manage your preferences and account</p>
      </div>

      {/* Appearance */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0B0F19]">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F6F7F9] flex items-center justify-center">
                <Moon className="w-5 h-5 text-[#6B7280]" />
              </div>
              <div>
                <p className="font-medium text-[#0B0F19]">Dark Mode</p>
                <p className="text-sm text-[#6B7280]">Toggle between light and dark theme</p>
              </div>
            </div>
            <Switch 
              checked={theme === 'dark'} 
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0B0F19]">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
            { id: 'push', label: 'Push Notifications', description: 'Receive push notifications in browser' },
            { id: 'alerts', label: 'Security Alerts', description: 'Get notified of suspicious activity' },
            { id: 'marketing', label: 'Marketing Emails', description: 'Receive tips and feature updates' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#0B0F19]">{item.label}</p>
                <p className="text-sm text-[#6B7280]">{item.description}</p>
              </div>
              <Switch 
                checked={notifications[item.id as keyof typeof notifications]} 
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, [item.id]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Liminal */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0B0F19]">Liminal Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
                <Ghost className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <p className="font-medium text-[#0B0F19]">Enable Liminal Access</p>
                <p className="text-sm text-[#6B7280]">Access advanced psychological analytics</p>
              </div>
            </div>
            <Switch 
              checked={user?.isLiminalOptIn || false} 
              onCheckedChange={toggleLiminalConsent}
            />
          </div>
          {user?.isLiminalOptIn && (
            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Psychological Risk Warning</p>
                  <p className="text-sm text-amber-700">
                    Liminal features may reveal uncomfortable truths. Use with caution.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0B0F19]">Security & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F6F7F9] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#6B7280]" />
              </div>
              <div>
                <p className="font-medium text-[#0B0F19]">Two-Factor Authentication</p>
                <p className="text-sm text-[#6B7280]">Add an extra layer of security</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F6F7F9] flex items-center justify-center">
                <Download className="w-5 h-5 text-[#6B7280]" />
              </div>
              <div>
                <p className="font-medium text-[#0B0F19]">Export Your Data</p>
                <p className="text-sm text-[#6B7280]">Download a copy of your data</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData}>Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-[#EF4444]/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#EF4444]">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <p className="font-medium text-[#0B0F19]">Delete Account</p>
                <p className="text-sm text-[#6B7280]">Permanently delete your account and data</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={logout}
      >
        Sign Out
      </Button>
    </div>
  );
}
