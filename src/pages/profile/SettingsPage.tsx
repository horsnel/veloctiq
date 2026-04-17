import { useState } from 'react';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Shield,
  Ghost,
  Download,
  Trash2,
  AlertTriangle,
  Eye,
  Brain,
  HeartPulse,
  Info,
  CheckCircle2,
} from 'lucide-react';

export function SettingsPage() {
  const { user, toggleLiminalConsent, logout } = useAuthStore();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    alerts: true,
  });

  // Liminal consent modal state
  const [showLiminalModal, setShowLiminalModal] = useState(false);
  const [liminalConsentChecked, setLiminalConsentChecked] = useState(false);
  const [liminalStep, setLiminalStep] = useState<'disclosure' | 'confirm'>('disclosure');

  const handleExportData = () => {
    toast.success('Data export requested. You will receive an email shortly.');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires contacting support.');
  };

  // When user tries to toggle Liminal ON — always show the modal first
  const handleLiminalToggleRequest = (checked: boolean) => {
    if (checked) {
      // Always show risk disclosure before enabling
      setLiminalStep('disclosure');
      setLiminalConsentChecked(false);
      setShowLiminalModal(true);
    } else {
      // Turning OFF — no confirmation needed, just disable
      toggleLiminalConsent();
      toast.success('Liminal Module has been disabled.');
    }
  };

  // User confirms they want to proceed from the disclosure
  const handleProceedToConsent = () => {
    setLiminalStep('confirm');
  };

  // User acknowledges consent and enables Liminal
  const handleEnableLiminal = () => {
    toggleLiminalConsent();
    setShowLiminalModal(false);
    setLiminalConsentChecked(false);
    setLiminalStep('disclosure');
    toast.success('Liminal Module is now active. Use with care.');
  };

  const handleCloseLiminalModal = (open: boolean) => {
    if (!open) {
      setShowLiminalModal(false);
      setLiminalConsentChecked(false);
      setLiminalStep('disclosure');
    }
  };

  const isLiminalEnabled = user?.isLiminalOptIn || false;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B0F19]">Settings</h1>
        <p className="text-sm text-[#6B7280]">Manage your preferences and account</p>
      </div>

      {/* Notifications */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0B0F19]">Notifications</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
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
                  setNotifications((prev) => ({ ...prev, [item.id]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ─── Liminal Module (Instructions #29, #30, #31) ─── */}
      <Card className={`border ${isLiminalEnabled ? 'border-[#7C3AED]/30' : 'border-[#E5E7EB]'}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isLiminalEnabled ? 'bg-[#7C3AED]/10' : 'bg-[#F6F7F9]'}`}>
              <Ghost className={`w-5 h-5 ${isLiminalEnabled ? 'text-[#7C3AED]' : 'text-[#6B7280]'}`} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-[#0B0F19]">
                Liminal Module
                <span className="text-sm font-normal text-[#6B7280] ml-2">(Shadow Self)</span>
              </CardTitle>
              <CardDescription>
                {isLiminalEnabled
                  ? 'Psychological analytics are active across your modules'
                  : 'Enable advanced psychological audience analytics'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#0B0F19]">Enable Liminal Access</p>
              <p className="text-sm text-[#6B7280]">
                Access dopamine debt, burnout risk, parasocial detection, and more
              </p>
            </div>
            <Switch
              checked={isLiminalEnabled}
              onCheckedChange={handleLiminalToggleRequest}
            />
          </div>

          {/* Active warning banner */}
          {isLiminalEnabled && (
            <div className="mt-4 p-4 rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/20">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-[#7C3AED] mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#7C3AED]">
                    Liminal Module Active
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    Psychological analytics are now visible across Shield, Listener, Bank, Arena, 
                    Studio, and Growth modules. These features analyze behavioral patterns that may 
                    be uncomfortable to confront. You can disable this at any time.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#6B7280] pt-1">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>12 features unlocked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5" />
                      <span>Psychological risk zone</span>
                    </div>
                  </div>
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
          <CardDescription>Manage your account security and data</CardDescription>
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
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F6F7F9] flex items-center justify-center">
                <Download className="w-5 h-5 text-[#6B7280]" />
              </div>
              <div>
                <p className="font-medium text-[#0B0F19]">Export Your Data</p>
                <p className="text-sm text-[#6B7280]">Download a copy of your data (GDPR)</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-[#EF4444]/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#EF4444]">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <p className="font-medium text-[#0B0F19]">Delete Account</p>
                <p className="text-sm text-[#6B7280]">
                  Permanently delete your account and all associated data
                </p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="outline" className="w-full" onClick={logout}>
        Sign Out
      </Button>

      {/* ─── Liminal Risk Disclosure Modal (#30, #31) ─── */}
      <Dialog open={showLiminalModal} onOpenChange={handleCloseLiminalModal}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
          {/* Purple accent bar */}
          <div className="h-1.5 w-full bg-[#7C3AED]" />

          {liminalStep === 'disclosure' ? (
            <>
              <div className="p-6 pb-0">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    <DialogTitle className="text-xl text-[#0B0F19]">
                      Psychological Risk Disclosure
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-[#6B7280] ml-[52px]">
                    Please read this carefully before enabling the Liminal Module.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-5">
                {/* Risk items */}
                <div className="space-y-3">
                  {[
                    {
                      icon: Brain,
                      title: 'Behavioral Pattern Analysis',
                      description:
                        'Liminal features analyze audience and creator behavioral patterns including engagement addiction signals, emotional manipulation markers, and parasocial relationship indicators.',
                    },
                    {
                      icon: HeartPulse,
                      title: 'Mental Health Indicators',
                      description:
                        'Features like Dopamine Debt scoring and Burnout Risk prediction use AI to assess psychological wellness patterns from content and engagement data.',
                    },
                    {
                      icon: Eye,
                      title: 'Shadow Self Insights',
                      description:
                        'The "Shadow Self" analysis may reveal uncomfortable truths about audience motives, authentic engagement vs. performative behavior, and subconscious content patterns.',
                    },
                  ].map((risk) => (
                    <div
                      key={risk.title}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#F6F7F9]"
                    >
                      <risk.icon className="w-4 h-4 text-[#7C3AED] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[#0B0F19]">
                          {risk.title}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {risk.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Advisory notice */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/20">
                  <Info className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#92400E]">
                    <span className="font-semibold">Advisory:</span> These features are designed for
                    self-awareness and creative strategy. They are not a substitute for professional
                    mental health support. If you experience distress, please consult a mental health
                    professional.
                  </p>
                </div>

                <Button
                  onClick={handleProceedToConsent}
                  className="w-full h-11 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white gap-2 font-medium"
                >
                  I understand the risks
                  <span className="text-[#7C3AED]/60">&rarr;</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-[#6B7280] hover:text-[#0B0F19]"
                  onClick={() => handleCloseLiminalModal(false)}
                >
                  Cancel — don't enable
                </Button>
              </div>
            </>
          ) : (
            /* ─── Consent Confirmation Step (#31) ─── */
            <>
              <div className="p-6 pb-0">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                      <Ghost className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    <DialogTitle className="text-xl text-[#0B0F19]">
                      Final Confirmation
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-[#6B7280] ml-[52px]">
                    One last step before activating the Liminal Module.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-5">
                {/* What you're enabling */}
                <div className="p-4 rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/15">
                  <p className="text-sm font-medium text-[#0B0F19] mb-3">
                    You're about to unlock:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Dopamine Debt Scoring',
                      'Burnout Risk Prediction',
                      'Parasocial Detection',
                      'Comment Archaeology',
                      'Voice Cracks Analysis',
                      'Last Video Syndrome',
                      'Shadow Self Insights',
                      'Emotional Manipulation Alerts',
                      'Audience Authenticity Scoring',
                      'Content Trauma Mapping',
                      'Engagement Addiction Signals',
                      'Psychological Wellness Tracking',
                    ].map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-xs text-[#6B7280]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required consent checkbox (#31) */}
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-[#F6F7F9] transition-colors">
                  <Checkbox
                    checked={liminalConsentChecked}
                    onCheckedChange={(checked) => setLiminalConsentChecked(!!checked)}
                    className="mt-0.5 data-[state=checked]:bg-[#7C3AED] data-[state=checked]:border-[#7C3AED]"
                  />
                  <p className="text-sm text-[#0B0F19] leading-relaxed">
                    <span className="font-semibold">
                      I understand this shows potentially distressing insights.
                    </span>{' '}
                    The Liminal Module may reveal uncomfortable psychological patterns in my audience
                    data and content analytics. I accept these risks and choose to enable these
                    features voluntarily.
                  </p>
                </label>

                <Button
                  onClick={handleEnableLiminal}
                  disabled={!liminalConsentChecked}
                  className="w-full h-11 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white gap-2 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {liminalConsentChecked ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Enable Liminal Module
                    </>
                  ) : (
                    'Check the box above to continue'
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-[#6B7280] hover:text-[#0B0F19]"
                  onClick={() => handleCloseLiminalModal(false)}
                >
                  Go back — don't enable
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
