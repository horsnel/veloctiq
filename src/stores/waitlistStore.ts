import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WaitlistPlatform {
  id: string;
  name: string;
  status: 'live' | 'waitlist' | 'planned';
  waitlistCount: number;
  requiredCount: number;
  launchTimeline: string;
  color: string;
}

interface WaitlistStore {
  platforms: WaitlistPlatform[];
  registeredEmails: Record<string, string[]>;
  isOpen: boolean;
  selectedPlatform: WaitlistPlatform | null;
  registeredPlatforms: string[];
  openWaitlist: (platform: WaitlistPlatform) => void;
  closeWaitlist: () => void;
  joinWaitlist: (platformId: string, email: string) => boolean;
  isRegistered: (platformId: string) => boolean;
  getPlatformById: (id: string) => WaitlistPlatform | undefined;
}

const defaultPlatforms: WaitlistPlatform[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    status: 'live',
    waitlistCount: 0,
    requiredCount: 0,
    launchTimeline: 'Live Now',
    color: '#FF0000',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    status: 'waitlist',
    waitlistCount: 234,
    requiredCount: 200,
    launchTimeline: 'Week 5-8',
    color: '#00F2EA',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    status: 'waitlist',
    waitlistCount: 189,
    requiredCount: 150,
    launchTimeline: 'Week 9-12',
    color: '#E1306C',
  },
  {
    id: 'twitter',
    name: 'X',
    status: 'waitlist',
    waitlistCount: 87,
    requiredCount: 100,
    launchTimeline: 'Month 4',
    color: '#0B0F19',
  },
];

export const useWaitlistStore = create<WaitlistStore>()(
  persist(
    (set, get) => ({
      platforms: defaultPlatforms,
      registeredEmails: {},
      isOpen: false,
      selectedPlatform: null,
      registeredPlatforms: [],

      openWaitlist: (platform: WaitlistPlatform) => {
        set({ isOpen: true, selectedPlatform: platform });
      },

      closeWaitlist: () => {
        set({ isOpen: false, selectedPlatform: null });
      },

      joinWaitlist: (platformId: string, email: string) => {
        const { platforms, registeredPlatforms } = get();

        if (registeredPlatforms.includes(platformId)) return false;

        const platform = platforms.find((p) => p.id === platformId);
        if (!platform) return false;
        if (platform.status === 'live') return false;

        set((state) => ({
          platforms: state.platforms.map((p) =>
            p.id === platformId
              ? { ...p, waitlistCount: p.waitlistCount + 1 }
              : p
          ),
          registeredEmails: {
            ...state.registeredEmails,
            [platformId]: [...(state.registeredEmails[platformId] || []), email],
          },
          registeredPlatforms: [...state.registeredPlatforms, platformId],
        }));

        return true;
      },

      isRegistered: (platformId: string) => {
        return get().registeredPlatforms.includes(platformId);
      },

      getPlatformById: (id: string) => {
        return get().platforms.find((p) => p.id === id);
      },
    }),
    {
      name: 'veloctiq-waitlist',
      partialize: (state) => ({
        registeredPlatforms: state.registeredPlatforms,
        registeredEmails: state.registeredEmails,
      }),
    }
  )
);
