import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useWaitlistStore } from '@/stores';
import type { WaitlistPlatform } from '@/stores';
import { isValidEmail } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  Users,
  Mail,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: WaitlistPlatform | null;
}

export function WaitlistModal({ open, onOpenChange, platform }: WaitlistModalProps) {
  const { joinWaitlist, isRegistered } = useWaitlistStore();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!platform) return null;

  const registered = isRegistered(platform.id);
  const progressPercent = platform.requiredCount > 0
    ? Math.min(100, Math.round((platform.waitlistCount / platform.requiredCount) * 100))
    : 0;
  const isAlmostThere = progressPercent >= 80;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = joinWaitlist(platform.id, email);
    setIsSubmitting(false);

    if (success) {
      setShowSuccess(true);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setEmail('');
      setError('');
      setShowSuccess(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        {/* Header with platform color accent */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: platform.color }}
        />

        {showSuccess ? (
          /* ─── Success State ─── */
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00D4AA]/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-[#00D4AA]" />
            </div>
            <h3 className="text-xl font-bold text-[#0B0F19] mb-2">
              You're on the list!
            </h3>
            <p className="text-[#6B7280] mb-6">
              We'll notify you at <span className="font-medium text-[#0B0F19]">{email}</span> when{' '}
              {platform.name} goes live on VELOCTIQ.
            </p>

            <div className="bg-[#F6F7F9] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#6B7280]">{platform.name} launch progress</span>
                <span className="font-semibold text-[#0B0F19]">{progressPercent}%</span>
              </div>
              <div className="h-2.5 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: isAlmostThere ? '#00D4AA' : platform.color,
                  }}
                />
              </div>
              <p className="text-xs text-[#6B7280] mt-2">
                {progressPercent >= 100
                  ? `${platform.name} is launching soon!`
                  : `${platform.waitlistCount} of ${platform.requiredCount} needed`}
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white"
            >
              Done
            </Button>
          </div>
        ) : (
          /* ─── Registration State ─── */
          <>
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${platform.color}15` }}
                >
                  <Clock
                    className="w-5 h-5"
                    style={{ color: platform.color }}
                  />
                </div>
                <div>
                  <DialogTitle className="text-xl text-[#0B0F19]">
                    Join {platform.name} Waitlist
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-[#6B7280] ml-[52px]">
                {platform.name} is coming to VELOCTIQ. Be among the first to unlock
                intelligence for this platform.
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-5">
              {/* FOMO demand counter */}
              <div className="bg-[#F6F7F9] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm font-medium text-[#0B0F19]">
                    {platform.waitlistCount.toLocaleString()} creators waiting
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                  <span className="text-xs text-[#EF4444] font-medium">Popular</span>
                </div>

                {/* Progress bar toward launch threshold */}
                {platform.requiredCount > 0 && (
                  <>
                    <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1.5">
                      <span>Progress to launch</span>
                      <span>
                        {platform.waitlistCount}/{platform.requiredCount} needed
                      </span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: isAlmostThere
                            ? '#00D4AA'
                            : platform.color,
                        }}
                      />
                    </div>
                    {isAlmostThere && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span className="text-xs font-medium text-[#F59E0B]">
                          Almost there! Launching soon
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Launch timeline badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-[#E5E7EB] text-[#6B7280] text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {platform.launchTimeline}
                </Badge>
                {platform.status === 'waitlist' && (
                  <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-none text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Opening soon
                  </Badge>
                )}
              </div>

              {/* Email form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="waitlist-email" className="text-sm font-medium text-[#0B0F19]">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <Input
                      id="waitlist-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="pl-10 h-11 border-[#E5E7EB] focus-visible:ring-[#00D4AA] focus-visible:border-[#00D4AA]"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-[#EF4444]">{error}</p>
                )}

                {registered && (
                  <div className="flex items-center gap-2 bg-[#00D4AA]/5 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00D4AA]" />
                    <span className="text-sm text-[#00D4AA]">
                      You're already on this waitlist
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || registered}
                  className="w-full h-11 bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white gap-2 font-medium"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : registered ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Registered
                    </>
                  ) : (
                    <>
                      Join the waitlist
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-center text-[#6B7280]">
                No spam. Only one notification when {platform.name} launches on VELOCTIQ.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
