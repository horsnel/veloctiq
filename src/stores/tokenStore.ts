import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TokenPackage, TokenTransaction, PaymentData } from '@/types';

interface TokenStore {
  balance: number;
  transactions: TokenTransaction[];
  payments: PaymentData[];
  packages: TokenPackage[];
  freeAnalysesUsed: number;
  lastFreeAnalysisDate: string;
  addTokens: (amount: number, description: string) => void;
  spendTokens: (amount: number, featureId: string, description: string) => boolean;
  recordPayment: (payment: PaymentData) => void;
  getTransactionHistory: () => TokenTransaction[];
  claimSignupBonus: () => void;
  useFreeAnalysis: () => boolean;
  getFreeAnalysesRemaining: () => number;
  resetDailyFreeAnalyses: () => void;
}

export const tokenPackages: TokenPackage[] = [
  { id: 'starter', name: 'Starter', vqtAmount: 100, nairaPrice: 1000, bonus: 0 },
  { id: 'creator', name: 'Creator', vqtAmount: 550, nairaPrice: 5000, bonus: 10, popular: true },
  { id: 'professional', name: 'Professional', vqtAmount: 1200, nairaPrice: 10000, bonus: 20 },
  { id: 'sovereign', name: 'Sovereign', vqtAmount: 6500, nairaPrice: 50000, bonus: 30 },
  { id: 'whale', name: 'Whale', vqtAmount: 15000, nairaPrice: 100000, bonus: 50 },
];

export const useTokenStore = create<TokenStore>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],
      payments: [],
      packages: tokenPackages,
      freeAnalysesUsed: 0,
      lastFreeAnalysisDate: new Date().toISOString().split('T')[0],

      addTokens: (amount: number, description: string) => {
        const transaction: TokenTransaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'purchase',
          amount,
          description,
          timestamp: new Date().toISOString(),
        };
        
        set(state => ({
          balance: state.balance + amount,
          transactions: [transaction, ...state.transactions],
        }));
      },

      spendTokens: (amount: number, featureId: string, description: string) => {
        const currentBalance = get().balance;
        if (currentBalance < amount) {
          return false;
        }

        const transaction: TokenTransaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'spend',
          amount: -amount,
          description,
          timestamp: new Date().toISOString(),
          featureId,
        };

        set(state => ({
          balance: state.balance - amount,
          transactions: [transaction, ...state.transactions],
        }));

        return true;
      },

      recordPayment: (payment: PaymentData) => {
        set(state => ({
          payments: [payment, ...state.payments],
        }));
      },

      getTransactionHistory: () => {
        return get().transactions;
      },

      claimSignupBonus: () => {
        const transaction: TokenTransaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'bonus',
          amount: 50,
          description: 'Welcome bonus - 50 free VQT',
          timestamp: new Date().toISOString(),
        };
        
        set(state => ({
          balance: state.balance + 50,
          transactions: [transaction, ...state.transactions],
        }));
      },

      useFreeAnalysis: () => {
        const { lastFreeAnalysisDate } = get();
        const today = new Date().toISOString().split('T')[0];
        
        // Reset if it's a new day
        if (lastFreeAnalysisDate !== today) {
          set({ freeAnalysesUsed: 0, lastFreeAnalysisDate: today });
        }
        
        const currentFreeAnalysesUsed = get().freeAnalysesUsed;
        if (currentFreeAnalysesUsed < 3) {
          set(state => ({ freeAnalysesUsed: state.freeAnalysesUsed + 1 }));
          return true;
        }
        return false;
      },

      getFreeAnalysesRemaining: () => {
        const { freeAnalysesUsed, lastFreeAnalysisDate } = get();
        const today = new Date().toISOString().split('T')[0];
        
        // Reset if it's a new day
        if (lastFreeAnalysisDate !== today) {
          set({ freeAnalysesUsed: 0, lastFreeAnalysisDate: today });
          return 3;
        }
        
        return Math.max(0, 3 - freeAnalysesUsed);
      },

      resetDailyFreeAnalyses: () => {
        set({ freeAnalysesUsed: 0, lastFreeAnalysisDate: new Date().toISOString().split('T')[0] });
      },
    }),
    {
      name: 'veloctiq-tokens',
    }
  )
);
