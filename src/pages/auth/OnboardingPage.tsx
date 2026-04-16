import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useTokenStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Youtube, 
  Instagram, 
  Twitter, 
  Linkedin,
  Coins,
  AlertTriangle
} from 'lucide-react';

const steps = [
  { id: 'hear', title: 'How did you hear about us?', description: 'Help us understand our reach' },
  { id: 'profile', title: 'Complete your profile', description: 'Tell us about yourself' },
  { id: 'platforms', title: 'Connect your platforms', description: 'Link your social accounts' },
  { id: 'tokens', title: 'Get your first tokens', description: 'Purchase VQT to start using features' },
  { id: 'liminal', title: 'Liminal Access', description: 'Opt-in to advanced features' },
];

const hearOptions = [
  { id: 'social', label: 'Social Media' },
  { id: 'friend', label: 'Friend or Colleague' },
  { id: 'search', label: 'Search Engine' },
  { id: 'ad', label: 'Advertisement' },
  { id: 'other', label: 'Other' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();
  const { addTokens } = useTokenStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearAbout, setHearAbout] = useState('');
  const [handle, setHandle] = useState('');
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [liminalConsent, setLiminalConsent] = useState(false);

  const handleNext = () => {
    if (currentStep === 0 && !hearAbout) {
      toast.error('Please select an option');
      return;
    }
    if (currentStep === 1 && !handle) {
      toast.error('Please enter your handle');
      return;
    }
    if (currentStep === 4) {
      // Complete onboarding
      updateUser({ 
        handle,
        isLiminalOptIn: liminalConsent 
      });
      toast.success('Welcome to VELOCTIQ!');
      navigate('/dashboard');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const togglePlatform = (platform: string) => {
    setConnectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleTokenPurchase = () => {
    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }
    const packages: Record<string, number> = {
      starter: 100,
      creator: 550,
      professional: 1200,
    };
    addTokens(packages[selectedPackage], 'First purchase bonus');
    toast.success(`Added ${packages[selectedPackage]} VQT to your balance!`);
    setCurrentStep(prev => prev + 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            {hearOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setHearAbout(option.id)}
                className={`
                  w-full p-4 rounded-xl border text-left transition-all
                  ${hearAbout === option.id
                    ? 'border-[#00D4AA] bg-[#00D4AA]/5'
                    : 'border-[#E5E7EB] hover:border-[#00D4AA]/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#0B0F19]">{option.label}</span>
                  {hearAbout === option.id && (
                    <div className="w-5 h-5 rounded-full bg-[#00D4AA] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handle">Your Creator Handle</Label>
              <Input
                id="handle"
                placeholder="@yourhandle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Bio (optional)</Label>
              <textarea
                placeholder="Tell us a bit about yourself..."
                className="w-full h-24 p-3 rounded-lg border border-[#E5E7EB] resize-none focus:border-[#00D4AA] focus:ring-1 focus:ring-[#00D4AA]/20 outline-none"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <p className="text-sm text-[#6B7280] mb-4">
              Connect your platforms to unlock full features. You can skip this and connect later.
            </p>
            {[
              { id: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
              { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
              { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: '#1DA1F2' },
              { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
            ].map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`
                  w-full p-4 rounded-xl border flex items-center gap-4 transition-all
                  ${connectedPlatforms.includes(platform.id)
                    ? 'border-[#00D4AA] bg-[#00D4AA]/5'
                    : 'border-[#E5E7EB] hover:border-[#00D4AA]/50'
                  }
                `}
              >
                <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                <span className="flex-1 font-medium text-[#0B0F19]">{platform.label}</span>
                {connectedPlatforms.includes(platform.id) && (
                  <div className="w-5 h-5 rounded-full bg-[#00D4AA] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#6B7280]">
              Purchase VQT tokens to use features. 1 VQT = ₦10
            </p>
            <div className="grid gap-3">
              {[
                { id: 'starter', vqt: 100, price: 1000, label: 'Starter' },
                { id: 'creator', vqt: 550, price: 5000, label: 'Creator', popular: true },
                { id: 'professional', vqt: 1200, price: 10000, label: 'Professional' },
              ].map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`
                    relative p-4 rounded-xl border flex items-center justify-between transition-all
                    ${selectedPackage === pkg.id
                      ? 'border-[#00D4AA] bg-[#00D4AA]/5'
                      : 'border-[#E5E7EB] hover:border-[#00D4AA]/50'
                    }
                  `}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 left-4 px-2 py-0.5 bg-[#00D4AA] text-white text-xs rounded-full">
                      Popular
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-[#00D4AA]" />
                    <div className="text-left">
                      <div className="font-medium text-[#0B0F19]">{pkg.label}</div>
                      <div className="text-sm text-[#6B7280]">{pkg.vqt} VQT</div>
                    </div>
                  </div>
                  <div className="font-semibold text-[#0B0F19]">₦{pkg.price.toLocaleString()}</div>
                </button>
              ))}
            </div>
            <Button
              onClick={handleTokenPurchase}
              className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white"
            >
              Purchase VQT
            </Button>
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="w-full text-sm text-[#6B7280] hover:text-[#0B0F19]"
            >
              Skip for now
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Psychological Risk Disclosure</h4>
                <p className="text-sm text-amber-700">
                  Liminal features analyze deep psychological patterns and may reveal uncomfortable truths about your content and audience. This includes burnout prediction, dopamine debt analysis, and parasocial relationship detection.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setLiminalConsent(true)}
                className={`
                  w-full p-4 rounded-xl border text-left transition-all
                  ${liminalConsent
                    ? 'border-[#00D4AA] bg-[#00D4AA]/5'
                    : 'border-[#E5E7EB] hover:border-[#00D4AA]/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#0B0F19]">Enable Liminal Features</div>
                    <div className="text-sm text-[#6B7280]">Access advanced psychological analytics</div>
                  </div>
                  {liminalConsent && (
                    <div className="w-5 h-5 rounded-full bg-[#00D4AA] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
              <button
                onClick={() => setLiminalConsent(false)}
                className={`
                  w-full p-4 rounded-xl border text-left transition-all
                  ${!liminalConsent
                    ? 'border-[#00D4AA] bg-[#00D4AA]/5'
                    : 'border-[#E5E7EB] hover:border-[#00D4AA]/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#0B0F19]">Skip for Now</div>
                    <div className="text-sm text-[#6B7280]">You can enable this later in settings</div>
                  </div>
                  {!liminalConsent && (
                    <div className="w-5 h-5 rounded-full bg-[#00D4AA] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-[#00D4AA]">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00D4AA] rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0B0F19] mb-1">
              {steps[currentStep].title}
            </h1>
            <p className="text-sm text-[#6B7280]">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          {currentStep !== 3 && (
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white gap-2"
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
