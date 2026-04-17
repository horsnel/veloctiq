import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWaitlistStore } from '@/stores';
import { WaitlistModal } from '@/components/WaitlistModal';
import { 
  ArrowRight, 
  Shield, 
  Ear, 
  Landmark, 
  Swords, 
  Zap, 
  Clapperboard, 
  TrendingUp, 
  TowerControl,
  BarChart3,
  Users,
  LineChart,
  CheckCircle2,
  Clock,
  UsersRound,
  MessageCircle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Platform Icons (inline SVGs) ─── */
const platformIcons: Record<string, ReactNode> = {
  youtube: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  tiktok: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 005.58 2.18V2.51a4.84 4.84 0 01-3.58-.82v.01l.58-.01z"/>
    </svg>
  ),
  instagram: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
};

/* ─── Platform Status Bar Component ─── */
function PlatformStatusBar() {
  const { platforms } = useWaitlistStore();

  const statusPlatforms = platforms.filter(
    (p) => p.status === 'live' || (p.status === 'waitlist' && p.waitlistCount > 0)
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 max-w-3xl mx-auto">
      {statusPlatforms.map((platform, i) => (
        <div key={platform.id} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-[#D1D5DB] hidden sm:inline">|</span>
          )}
          {platform.status === 'live' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00D4AA]/8 border border-[#00D4AA]/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4AA]" />
              <span className="text-sm font-medium text-[#0B0F19]">{platform.name}</span>
              <span className="text-xs text-[#00D4AA] font-medium">Live</span>
            </div>
          ) : (
            <button
              onClick={() => useWaitlistStore.getState().openWaitlist(platform)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F7F9] border border-[#E5E7EB] hover:border-[#F59E0B]/40 hover:bg-[#FFF7ED] transition-all duration-200 cursor-pointer group"
            >
              <span className="text-sm font-medium text-[#6B7280] group-hover:text-[#0B0F19] transition-colors">{platform.name}</span>
              <span className="text-xs text-[#F59E0B] font-medium whitespace-nowrap">
                {platform.waitlistCount} waiting
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Platform Grid Component ─── */
function PlatformGrid() {
  const { platforms, openWaitlist, isRegistered } = useWaitlistStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {platforms.map((platform) => {
        const isLive = platform.status === 'live';
        const onWaitlist = isRegistered(platform.id);
        const isWaitlist = platform.status === 'waitlist';
        const isPlanned = platform.status === 'planned';

        return (
          <div
            key={platform.id}
            onClick={() => {
              if (isLive) return;
              if (isPlanned) return;
              openWaitlist(platform);
            }}
            className={`
              group relative bg-white rounded-2xl border p-5 flex flex-col items-center gap-3
              transition-all duration-300
              ${isLive
                ? 'border-[#00D4AA]/30 hover:shadow-lg hover:shadow-[#00D4AA]/5 cursor-default'
                : isPlanned
                  ? 'border-[#E5E7EB] opacity-60 cursor-default'
                  : isWaitlist
                    ? 'border-[#E5E7EB] hover:shadow-lg hover:border-[#F59E0B]/30 cursor-pointer hover:-translate-y-1'
                    : 'border-[#E5E7EB] hover:shadow-lg hover:border-[#E5E7EB] cursor-pointer hover:-translate-y-1'
              }
            `}
          >
            {/* Status badge */}
            {isLive && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00D4AA]/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
                <span className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-wide">Live</span>
              </div>
            )}
            {isWaitlist && !onWaitlist && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F59E0B]/10">
                <Clock className="w-3 h-3 text-[#F59E0B]" />
                <span className="text-[10px] font-semibold text-[#F59E0B] uppercase tracking-wide">Waitlist</span>
              </div>
            )}
            {onWaitlist && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00D4AA]/10">
                <CheckCircle2 className="w-3 h-3 text-[#00D4AA]" />
                <span className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-wide">Joined</span>
              </div>
            )}
            {isPlanned && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F6F7F9]">
                <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{platform.launchTimeline}</span>
              </div>
            )}

            {/* Platform icon */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                isLive ? 'bg-[#00D4AA]/10' : 'bg-[#F6F7F9]'
              }`}
              style={{ color: isLive ? '#00D4AA' : '#0B0F19' }}
            >
              {platformIcons[platform.id]}
            </div>

            {/* Platform name */}
            <span className="text-sm font-medium text-[#0B0F19]">{platform.name}</span>

            {/* Status-specific footer */}
            {isLive && (
              <Link to="/signup" className="w-full">
                <Button
                  size="sm"
                  className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white text-xs h-8 gap-1"
                >
                  Connect now
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            )}

            {isWaitlist && onWaitlist && (
              <div className="flex items-center gap-1.5 text-xs text-[#00D4AA] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>You're on the list</span>
              </div>
            )}

            {isWaitlist && !onWaitlist && (
              <div className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#FFF7ED] text-xs h-8 gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  Join {platform.waitlistCount} waiting
                </Button>
              </div>
            )}

            {isPlanned && platform.waitlistCount === 0 && (
              <div className="text-xs text-[#9CA3AF]">
                Coming {platform.launchTimeline}
              </div>
            )}
            {isPlanned && platform.waitlistCount > 0 && (
              <div className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#E5E7EB] text-[#6B7280] hover:bg-[#F6F7F9] text-xs h-8 gap-1"
                >
                  <Clock className="w-3 h-3" />
                  {platform.waitlistCount} interested
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Waitlist Modal Wrapper ─── */
function WaitlistModalWrapper() {
  const { isOpen, selectedPlatform, closeWaitlist } = useWaitlistStore();

  return (
    <WaitlistModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeWaitlist();
      }}
      platform={selectedPlatform}
    />
  );
}

const modules = [
  { name: 'Shield', icon: Shield, description: 'Protection', color: '#00D4AA' },
  { name: 'Listener', icon: Ear, description: 'Audience Intel', color: '#8B5CF6' },
  { name: 'Bank', icon: Landmark, description: 'Revenue', color: '#F59E0B' },
  { name: 'Arena', icon: Swords, description: 'Competition', color: '#EF4444' },
  { name: 'Action Hub', icon: Zap, description: 'Automation', color: '#06B6D4' },
  { name: 'Studio', icon: Clapperboard, description: 'Production', color: '#EC4899' },
  { name: 'Growth', icon: TrendingUp, description: 'Development', color: '#10B981' },
  { name: 'Control Tower', icon: TowerControl, description: 'Operations', color: '#6366F1' },
];

const features = [
  { icon: BarChart3, title: 'Real-time Analytics', description: 'Live signals and insights across all platforms' },
  { icon: Users, title: 'Audience Intelligence', description: 'Understand your audience without guessing' },
  { icon: LineChart, title: 'Revenue Optimization', description: 'Turn attention into measurable revenue' },
  { icon: Shield, title: 'Content Protection', description: 'Detect bots, spam, and narrative hijacks' },
];

export function WelcomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation
      gsap.fromTo(
        heroCardRef.current,
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }
      );

      // Thumbnails entrance
      gsap.fromTo(
        '.thumbnail-card',
        { opacity: 0, y: 60, scale: 0.85 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: 'back.out(1.2)',
          delay: 0.3 
        }
      );

      // Modules scroll animation
      gsap.fromTo(
        '.module-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: modulesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Features scroll animation
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-dvh bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00D4AA] flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold text-[#0B0F19] text-lg tracking-tight">VELOCTIQ</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="#features" className="text-sm text-[#6B7280] hover:text-[#0B0F19] transition-colors">Features</Link>
              <Link to="#modules" className="text-sm text-[#6B7280] hover:text-[#0B0F19] transition-colors">Modules</Link>
              <Link to="#pricing" className="text-sm text-[#6B7280] hover:text-[#0B0F19] transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-sm text-[#334155]">Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white text-sm">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            ref={heroCardRef}
            className="relative bg-white rounded-[28px] border border-[#E5E7EB] shadow-[0_18px_50px_rgba(11,15,25,0.08)] p-8 lg:p-12 overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00D4AA]/5 to-transparent pointer-events-none" />
            
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-[#00D4AA]/10 text-[#00D4AA] border-none font-mono text-xs">
                  SOCIAL MEDIA INTELLIGENCE
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-[#0B0F19] leading-[0.95] tracking-tight mb-6">
                  Your content.<br />
                  Their attention.<br />
                  <span className="text-[#00D4AA]">One terminal.</span>
                </h1>
                <p className="text-lg text-[#6B7280] mb-8 max-w-md">
                  Built for Nigerian creators. Pay in Naira, protect your audience, predict your growth.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup">
                    <Button size="lg" className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white gap-2 shadow-[0_4px_20px_rgba(0,212,170,0.35)] hover:shadow-[0_4px_24px_rgba(0,212,170,0.5)] transition-all">
                      Enter the terminal
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="#pricing">
                    <Button size="lg" variant="outline" className="border-[#CBD5E1] text-[#0B0F19]">
                      View pricing
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Live Feed Preview */}
              <div className="bg-[#F6F7F9] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[#0B0F19]">Live Signals</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                    <span className="text-xs text-[#6B7280]">Live</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { type: 'alert', message: 'Viral signal detected: +340% engagement', time: '2m ago' },
                    { type: 'success', message: 'New sponsor opportunity: ₦250,000', time: '15m ago' },
                    { type: 'warning', message: 'Bot activity detected on Instagram', time: '32m ago' },
                  ].map((signal, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3">
                      <div className={`
                        w-2 h-2 rounded-full flex-shrink-0
                        ${signal.type === 'alert' ? 'bg-[#EF4444]' : signal.type === 'success' ? 'bg-[#00D4AA]' : 'bg-[#F59E0B]'}
                      `} />
                      <p className="text-sm text-[#0B0F19] flex-1">{signal.message}</p>
                      <span className="text-xs text-[#6B7280]">{signal.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Thumbnails */}
          <div ref={thumbnailsRef} className="hidden lg:block relative h-32 -mt-8 mx-8">
            <div className="thumbnail-card absolute left-0 top-0 w-56 bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-[#00D4AA]" />
                <span className="text-xs font-medium text-[#6B7280]">Analytics</span>
              </div>
              <div className="h-16 flex items-end gap-1">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#00D4AA]/20 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            
            <div className="thumbnail-card absolute left-1/2 -translate-x-1/2 -top-4 w-60 bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-xs font-medium text-[#6B7280]">Audience</span>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#00D4AA] border-2 border-white" />
                ))}
                <div className="w-8 h-8 rounded-full bg-[#F6F7F9] border-2 border-white flex items-center justify-center text-xs text-[#6B7280]">
                  +2k
                </div>
              </div>
            </div>
            
            <div className="thumbnail-card absolute right-0 top-0 w-56 bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <LineChart className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs font-medium text-[#6B7280]">Revenue</span>
              </div>
              <div className="text-2xl font-bold text-[#0B0F19]">₦847K</div>
              <div className="text-xs text-[#00D4AA]">+23% this month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" ref={modulesRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F7F9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#0B0F19] text-white border-none font-mono text-xs">
              136 FEATURES
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0B0F19] mb-4">
              Eight modules. Infinite intelligence.
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Every tool you need to protect, understand, and grow your social presence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <div
                key={module.name}
                className="module-card group bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:shadow-lg hover:border-[#00D4AA]/30 transition-all duration-300 cursor-pointer"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${module.color}15` }}
                >
                  <module.icon className="w-6 h-6" style={{ color: module.color }} />
                </div>
                <h3 className="text-lg font-semibold text-[#0B0F19] mb-1">{module.name}</h3>
                <p className="text-sm text-[#6B7280]">{module.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium" style={{ color: module.color }}>
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Platforms Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#00D4AA]/10 text-[#00D4AA] border-none font-mono text-xs">
              PLATFORM ROLLOUT
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0B0F19] mb-4">
              Connect Your Platforms
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              YouTube is live now. Other platforms are launching soon — join the waitlist to get early access.
            </p>
          </div>

          {/* Platform Status Bar */}
          <PlatformStatusBar />

          {/* Platform Grid */}
          <PlatformGrid />
        </div>

        {/* Waitlist Modal */}
        <WaitlistModalWrapper />
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-[#00D4AA]/10 text-[#00D4AA] border-none font-mono text-xs">
                WHY VELOCTIQ
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-[#0B0F19] mb-6">
                Built for creators who take it seriously.
              </h2>
              <p className="text-lg text-[#6B7280] mb-8">
                Agencies, solo creators, and brand teams use VELOCTIQ daily to make data-driven decisions.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature) => (
                  <div key={feature.title} className="feature-card flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-[#00D4AA]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0B0F19] mb-1">{feature.title}</h4>
                      <p className="text-sm text-[#6B7280]">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00D4AA]/10 to-[#8B5CF6]/10 rounded-3xl transform rotate-3" />
              <div className="relative bg-white rounded-3xl border border-[#E5E7EB] shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm text-[#6B7280] mb-1">Channel Health</div>
                    <div className="text-3xl font-bold text-[#0B0F19]">78/100</div>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-[#00D4AA] flex items-center justify-center">
                    <span className="text-lg font-bold text-[#00D4AA]">Good</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Engagement Rate', value: 84 },
                    { label: 'Subscriber Growth', value: 72 },
                    { label: 'Watch Time', value: 91 },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#6B7280]">{metric.label}</span>
                        <span className="text-[#0B0F19] font-medium">{metric.value}%</span>
                      </div>
                      <div className="h-2 bg-[#F6F7F9] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#00D4AA] rounded-full transition-all duration-1000"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F7F9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#00D4AA]/10 text-[#00D4AA] border-none font-mono text-xs">
              TOKEN ECONOMY
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0B0F19] mb-4">
              Pay as you grow.
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              1 VQT = ₦10. No subscriptions. Buy tokens and use them for any feature.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { name: 'Starter', vqt: 100, price: 1000, bonus: 0 },
              { name: 'Creator', vqt: 550, price: 5000, bonus: 10, popular: true },
              { name: 'Professional', vqt: 1200, price: 10000, bonus: 20 },
              { name: 'Sovereign', vqt: 6500, price: 50000, bonus: 30 },
              { name: 'Whale', vqt: 15000, price: 100000, bonus: 50 },
            ].map((pkg) => (
              <div
                key={pkg.name}
                className={`
                  relative bg-white rounded-2xl border p-6 text-center
                  ${pkg.popular ? 'border-[#00D4AA] shadow-lg' : 'border-[#E5E7EB]'}
                `}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#00D4AA] text-white border-none text-xs">Most Popular</Badge>
                  </div>
                )}
                <h3 className="font-semibold text-[#0B0F19] mb-2">{pkg.name}</h3>
                <div className="text-3xl font-bold text-[#0B0F19] mb-1">{pkg.vqt.toLocaleString()}</div>
                <div className="text-sm text-[#6B7280] mb-4">VQT</div>
                {pkg.bonus > 0 && (
                  <div className="text-xs text-[#00D4AA] mb-3">+{pkg.bonus}% bonus</div>
                )}
                <div className="text-lg font-semibold text-[#0B0F19] mb-4">
                  ₦{pkg.price.toLocaleString()}
                </div>
                <Link to="/signup">
                  <Button 
                    variant={pkg.popular ? 'default' : 'outline'} 
                    className={`w-full ${pkg.popular ? 'bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white' : ''}`}
                  >
                    Buy
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0B0F19] rounded-[28px] p-12 lg:p-16 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Ready to own your platform?
            </h2>
            <p className="text-lg text-[#6B7280] mb-8 max-w-xl mx-auto">
              Join thousands of creators using VELOCTIQ to protect, understand, and grow their audience.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white gap-2">
                Enter the terminal
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00D4AA] flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold text-[#0B0F19]">VELOCTIQ</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#6B7280]">
              <Link to="/terms" className="hover:text-[#0B0F19]">Terms</Link>
              <Link to="/privacy" className="hover:text-[#0B0F19]">Privacy</Link>
              <Link to="/cookies" className="hover:text-[#0B0F19]">Cookies</Link>
            </div>
            <div className="text-sm text-[#6B7280]">
              © 2024 VELOCTIQ. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
