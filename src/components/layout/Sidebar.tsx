import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore, useTokenStore } from '@/stores';
import { cn, formatVQT } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Shield,
  Ear,
  Landmark,
  Swords,
  Zap,
  Clapperboard,
  TrendingUp,
  TowerControl,
  Ghost,
  User,
  Settings,
  Coins,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bot,
} from 'lucide-react';

const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'shield', label: 'Shield', icon: Shield, path: '/shield' },
  { id: 'listener', label: 'Listener', icon: Ear, path: '/listener' },
  { id: 'bank', label: 'Bank', icon: Landmark, path: '/bank' },
  { id: 'arena', label: 'Arena', icon: Swords, path: '/arena' },
  { id: 'action-hub', label: 'Action Hub', icon: Zap, path: '/action-hub' },
  { id: 'studio', label: 'Studio', icon: Clapperboard, path: '/studio' },
  { id: 'growth', label: 'Growth', icon: TrendingUp, path: '/growth' },
  { id: 'control-tower', label: 'Control Tower', icon: TowerControl, path: '/control-tower' },
  { id: 'vex', label: 'VEX AI', icon: Bot, path: '/vex' },
];

const secondaryNavItems = [
  { id: 'liminal', label: 'Liminal', icon: Ghost, path: '/liminal', requiresLiminal: true },
];

const bottomNavItems = [
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'tokens', label: 'Token Store', icon: Coins, path: '/tokens' },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const { balance } = useTokenStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ item, isBottom = false }: { item: typeof mainNavItems[0]; isBottom?: boolean }) => {
    const active = isActive(item.path);
    const requiresLiminal = 'requiresLiminal' in item && item.requiresLiminal;
    const hasLiminalAccess = user?.isLiminalOptIn;

    if (requiresLiminal && !hasLiminalAccess) {
      return null;
    }

    const content = (
      <Link
        to={item.path}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
          active
            ? 'bg-[#00D4AA]/10 text-[#00D4AA]'
            : 'text-[#6B7280] hover:bg-[#F6F7F9] hover:text-[#0B0F19]',
          !sidebarOpen && !isBottom && 'justify-center px-2'
        )}
        onClick={() => setMobileOpen(false)}
      >
        <item.icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-[#00D4AA]')} />
        {(sidebarOpen || isBottom) && (
          <span className="text-sm font-medium truncate">{item.label}</span>
        )}
        {active && sidebarOpen && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
        )}
      </Link>
    );

    if (!sidebarOpen && !isBottom) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-[#0B0F19] text-white border-none">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('p-4 flex items-center', sidebarOpen ? 'justify-between' : 'justify-center')}>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center">
            <span className="font-bold text-sm text-[#0B0F19]">V</span>
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-[#0B0F19] text-lg tracking-tight">VELOCTIQ</span>
          )}
        </Link>
        {sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex h-8 w-8 text-[#6B7280]"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Token Balance */}
      {sidebarOpen && (
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-r from-[#00D4AA]/10 to-[#00D4AA]/5 rounded-xl p-3 border border-[#00D4AA]/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6B7280] font-medium">VQT Balance</span>
              <Coins className="w-3.5 h-3.5 text-[#00D4AA]" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-semibold text-[#0B0F19]">{formatVQT(balance)}</span>
            </div>
            <Link to="/tokens">
              <Button size="sm" variant="ghost" className="w-full mt-2 h-7 text-xs text-[#00D4AA] hover:text-[#00D4AA] hover:bg-[#00D4AA]/10">
                Buy VQT
              </Button>
            </Link>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-3">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>

        {/* Liminal Section */}
        {user?.isLiminalOptIn && (
          <>
            <Separator className="my-4 bg-[#E5E7EB]" />
            <div className="space-y-1">
              <div className={cn('px-3 py-2 text-xs font-medium text-[#6B7280]', !sidebarOpen && 'text-center')}>
                {sidebarOpen ? 'LIMINAL' : '...'}
              </div>
              {secondaryNavItems.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          </>
        )}

        {/* Bottom Navigation */}
        <Separator className="my-4 bg-[#E5E7EB]" />
        <div className="space-y-1 pb-4">
          {bottomNavItems.map((item) => (
            <NavItem key={item.id} item={item} isBottom />
          ))}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-[#E5E7EB]">
        <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
          <div className="w-9 h-9 rounded-full bg-[#F6F7F9] flex items-center justify-center border border-[#E5E7EB]">
            <span className="text-sm font-medium text-[#0B0F19]">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0B0F19] truncate">{user?.name}</p>
              <p className="text-xs text-[#6B7280] truncate">{user?.plan} Plan</p>
            </div>
          )}
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#6B7280]"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] z-50 flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center">
            <span className="font-bold text-sm text-[#0B0F19]">V</span>
          </div>
          <span className="font-semibold text-[#0B0F19] text-lg">VELOCTIQ</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-16 bottom-0 w-72 bg-white shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <TooltipProvider delayDuration={0}>
        <aside
          className={cn(
            'hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-[#E5E7EB] transition-all duration-300 z-50',
            sidebarOpen ? 'w-64' : 'w-16'
          )}
        >
          <SidebarContent />
        </aside>
      </TooltipProvider>

      {/* Collapsed Sidebar Toggle */}
      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex fixed left-16 top-4 z-50 h-8 w-8 bg-white border border-[#E5E7EB] shadow-sm"
          onClick={() => setSidebarOpen(true)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </>
  );
}
