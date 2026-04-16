import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Download, Chrome, Puzzle, Shield, ChevronRight, ChevronLeft } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Download Extension',
    description: 'Download the VELOCTIQ Chrome Extension package',
    icon: Download,
  },
  {
    id: 2,
    title: 'Open Chrome Extensions',
    description: 'Navigate to chrome://extensions in your browser',
    icon: Chrome,
  },
  {
    id: 3,
    title: 'Enable Developer Mode',
    description: 'Toggle Developer Mode in the top right corner',
    icon: Puzzle,
  },
  {
    id: 4,
    title: 'Load Extension',
    description: 'Click "Load unpacked" and select the extension folder',
    icon: Shield,
  },
];

const features = [
  {
    title: 'Auto Data Collection',
    description: 'Automatically collect engagement metrics while you browse',
    icon: '📊',
  },
  {
    title: 'Bot Detection',
    description: 'Identify suspicious accounts and bot activity',
    icon: '🤖',
  },
  {
    title: 'Viral Score',
    description: 'Get instant viral potential analysis',
    icon: '📈',
  },
  {
    title: 'Hashtag Analysis',
    description: 'Extract and analyze hashtags from any post',
    icon: '#️⃣',
  },
];

export function ExtensionGuidePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isInstalled, setIsInstalled] = useState(false);

  const handleDownload = () => {
    toast.success('Extension download started!');
    setTimeout(() => {
      setCurrentStep(1);
    }, 1000);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-dvh bg-[#0B0F19]">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316] to-[#F59E0B] flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wide">VELOCTIQ</span>
          </Link>
          <Button variant="ghost" className="text-white/70" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="bg-[#F97316]/20 text-[#F97316] border-none mb-4">
            Chrome Extension
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Install VELOCTIQ Extension
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Collect social media data directly from your browser. Analyze engagement, 
            detect bots, and optimize your content strategy.
          </p>
        </div>

        {/* Installation Status */}
        {isInstalled && (
          <Card className="bg-[#00D4AA]/10 border-[#00D4AA]/30 mb-8">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#00D4AA] flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">Extension Installed!</h3>
                <p className="text-white/60">You&apos;re all set. Start collecting data from your favorite platforms.</p>
              </div>
              <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90" onClick={handleGoToDashboard}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Installation Steps */}
        {!isInstalled && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardContent className="p-8">
              {/* Progress */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        index <= currentStep
                          ? 'bg-gradient-to-br from-[#F97316] to-[#F59E0B]'
                          : 'bg-white/10'
                      }`}
                    >
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 md:w-24 h-1 mx-2 transition-colors ${
                          index < currentStep ? 'bg-[#F97316]' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Current Step Content */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F97316]/20 to-[#F59E0B]/20 flex items-center justify-center mx-auto mb-4">
                  {(() => {
                    const Icon = steps[currentStep].icon;
                    return <Icon className="w-10 h-10 text-[#F97316]" />;
                  })()}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Step {currentStep + 1}: {steps[currentStep].title}
                </h2>
                <p className="text-white/60">{steps[currentStep].description}</p>
              </div>

              {/* Step-specific Actions */}
              <div className="flex justify-center gap-4">
                {currentStep === 0 ? (
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#F97316] to-[#F59E0B] hover:opacity-90 gap-2"
                    onClick={handleDownload}
                  >
                    <Download className="w-5 h-5" />
                    Download Extension
                  </Button>
                ) : currentStep === 1 ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white gap-2"
                    onClick={() => window.open('chrome://extensions', '_blank')}
                  >
                    <Chrome className="w-5 h-5" />
                    Open chrome://extensions
                  </Button>
                ) : currentStep === 2 ? (
                  <div className="text-center">
                    <p className="text-white/60 mb-4">
                      Look for the &quot;Developer mode&quot; toggle in the top right corner of the Extensions page
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#F97316] to-[#F59E0B] hover:opacity-90"
                      onClick={handleNext}
                    >
                      I&apos;ve Enabled Developer Mode
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white/60 mb-4">
                      Click &quot;Load unpacked&quot; and select the extracted VELOCTIQ extension folder
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#F97316] to-[#F59E0B] hover:opacity-90"
                      onClick={() => {
                        setIsInstalled(true);
                        toast.success('Extension installed successfully!');
                      }}
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Installation Complete
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              {currentStep > 0 && currentStep < 3 && (
                <div className="flex justify-between mt-8">
                  <Button
                    variant="ghost"
                    className="text-white/60"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-white/60"
                    onClick={handleNext}
                  >
                    Skip
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-white/5 border-white/10">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Supported Platforms */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4 text-center">Supported Platforms</h3>
            <div className="flex justify-center gap-6 flex-wrap">
              {['📸 Instagram', '📺 YouTube', '🎵 TikTok', '🐦 Twitter/X', '💼 LinkedIn'].map((platform) => (
                <div
                  key={platform}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full"
                >
                  <span>{platform.split(' ')[0]}</span>
                  <span className="text-white/80 text-sm">{platform.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <div className="text-center">
          <p className="text-white/40 text-sm">
            <Shield className="w-4 h-4 inline mr-2" />
            Your data stays private. All collection happens locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
