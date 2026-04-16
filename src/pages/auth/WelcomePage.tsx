import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  LineChart
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

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
                <Button variant="ghost" className="text-sm">Sign in</Button>
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
                  <span className="text-[#00D4AA]">One command center.</span>
                </h1>
                <p className="text-lg text-[#6B7280] mb-8 max-w-md">
                  Real-time protection • Audience intel • Revenue optimization
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup">
                    <Button size="lg" className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white gap-2">
                      Enter the terminal
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="#pricing">
                    <Button size="lg" variant="outline" className="border-[#E5E7EB]">
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
                    <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
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
              117 FEATURES
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
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0B0F19] mb-4">
              Connect Your Social Media Platforms
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Link your channels to unlock real-time analytics, audience intelligence, and content protection across every platform.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {/* X */}
            <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:border-[#0B0F19]/20 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <svg className="w-8 h-8 text-[#0B0F19] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-sm font-medium text-[#0B0F19]">X</span>
            </div>

            {/* Instagram */}
            <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:border-[#E1306C]/20 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <svg className="w-8 h-8 text-[#0B0F19] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span className="text-sm font-medium text-[#0B0F19]">Instagram</span>
            </div>

            {/* TikTok */}
            <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:border-[#00F2EA]/20 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <svg className="w-8 h-8 text-[#0B0F19] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 005.58 2.18V2.51a4.84 4.84 0 01-3.58-.82v.01l.58-.01z"/>
              </svg>
              <span className="text-sm font-medium text-[#0B0F19]">TikTok</span>
            </div>

            {/* YouTube */}
            <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:border-[#FF0000]/20 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <svg className="w-8 h-8 text-[#0B0F19] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-sm font-medium text-[#0B0F19]">YouTube</span>
            </div>

            {/* Facebook / Meta */}
            <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:border-[#1877F2]/20 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <svg className="w-8 h-8 text-[#0B0F19] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium text-[#0B0F19]">Facebook</span>
            </div>

            {/* LinkedIn */}
            <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:border-[#0A66C2]/20 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <svg className="w-8 h-8 text-[#0B0F19] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-medium text-[#0B0F19]">LinkedIn</span>
            </div>

            {/* Threads */}
            <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:border-[#0B0F19]/20 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <svg className="w-8 h-8 text-[#0B0F19] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.617c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.056 7.117 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.7-2.023 1.187-1.237 1.89-2.904 2.131-5.028h-7.563v-2.1h9.928l.015.636c-.074 3.79-1.317 6.596-3.695 8.353C17.256 23.142 14.996 23.98 12.186 24z"/>
              </svg>
              <span className="text-sm font-medium text-[#0B0F19]">Threads</span>
            </div>

            {/* Discord */}
            <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:border-[#5865F2]/20 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <svg className="w-8 h-8 text-[#0B0F19] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="text-sm font-medium text-[#0B0F19]">Discord</span>
            </div>
          </div>
        </div>
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
