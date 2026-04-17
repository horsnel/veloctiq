import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@/types';

interface UIStore {
  sidebarOpen: boolean;
  currentModule: string;
  notifications: Notification[];
  theme: 'light'; /* Light mode only */
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentModule: (module: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  setTheme: () => void; /* No-op, light only */
  toggleTheme: () => void; /* No-op, light only */
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      currentModule: 'dashboard',
      notifications: [],
      theme: 'light' as const,

      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setCurrentModule: (module: string) => {
        set({ currentModule: module });
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50),
        }));
      },

      markNotificationAsRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      setTheme: () => {
        /* Light mode only - no-op */
      },

      toggleTheme: () => {
        /* Light mode only - no-op */
      },
    }),
    {
      name: 'veloctiq-ui',
    }
  )
);
