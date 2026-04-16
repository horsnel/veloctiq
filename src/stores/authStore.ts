import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, ConnectedPlatform } from '@/types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  verify2FA: (code: string) => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  connectPlatform: (platform: ConnectedPlatform) => void;
  disconnectPlatform: (platformId: string) => void;
  toggleLiminalConsent: () => void;
}

const mockUser: User = {
  id: '1',
  email: 'creator@veloctiq.com',
  name: 'Demo Creator',
  handle: '@democreator',
  plan: 'professional',
  tokenBalance: 1200,
  isLiminalOptIn: false,
  createdAt: '2024-01-01T00:00:00Z',
  lastLogin: new Date().toISOString(),
  connectedPlatforms: [
    {
      id: '1',
      platform: 'youtube',
      handle: '@democreator',
      followerCount: 45000,
      isActive: true,
      connectedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      platform: 'instagram',
      handle: '@democreator',
      followerCount: 28000,
      isActive: true,
      connectedAt: '2024-01-01T00:00:00Z',
    },
  ],
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      requires2FA: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock login - in production, this would validate against Supabase
        if (email && password) {
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false,
            requires2FA: false 
          });
          return true;
        }
        set({ isLoading: false });
        return false;
      },

      signup: async (email: string, _password: string, name: string) => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name,
          plan: 'free',
          tokenBalance: 50, // Freemium: 50 free VQT on signup
          isLiminalOptIn: false,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          connectedPlatforms: [],
        };
        
        set({ 
          user: newUser, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return true;
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          requires2FA: false 
        });
      },

      verify2FA: async (code: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (code.length === 6) {
          set({ requires2FA: false });
          return true;
        }
        return false;
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...userData } 
          });
        }
      },

      connectPlatform: (platform: ConnectedPlatform) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedPlatforms = [...currentUser.connectedPlatforms, platform];
          set({ 
            user: { ...currentUser, connectedPlatforms: updatedPlatforms } 
          });
        }
      },

      disconnectPlatform: (platformId: string) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedPlatforms = currentUser.connectedPlatforms.filter(
            p => p.id !== platformId
          );
          set({ 
            user: { ...currentUser, connectedPlatforms: updatedPlatforms } 
          });
        }
      },

      toggleLiminalConsent: () => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, isLiminalOptIn: !currentUser.isLiminalOptIn } 
          });
        }
      },
    }),
    {
      name: 'veloctiq-auth',
    }
  )
);
