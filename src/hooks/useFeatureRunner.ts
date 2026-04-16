import { useState, useCallback } from 'react';
import { FeatureEngine } from '@/services/features';
import { useTokenStore } from '@/stores';
import type { FeatureResult } from '@/services/features';
import { toast } from 'sonner';

interface UseFeatureRunnerReturn {
  isRunning: boolean;
  currentResult: FeatureResult | null;
  results: Record<string, FeatureResult>;
  runFeature: (featureId: string, featureName: string, cost: number, params?: Record<string, unknown>) => Promise<boolean>;
  clearResult: (featureId: string) => void;
  clearAllResults: () => void;
  error: string | null;
}

export function useFeatureRunner(): UseFeatureRunnerReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<FeatureResult | null>(null);
  const [results, setResults] = useState<Record<string, FeatureResult>>({});
  const [error, setError] = useState<string | null>(null);

  const runFeature = useCallback(
    async (
      featureId: string,
      featureName: string,
      cost: number,
      params?: Record<string, unknown>
    ): Promise<boolean> => {
      // If feature has a cost, check free analyses first, then spend tokens
      if (cost > 0) {
        const { getFreeAnalysesRemaining, spendTokens, useFreeAnalysis } = useTokenStore.getState();

        const freeRemaining = getFreeAnalysesRemaining();
        if (freeRemaining > 0) {
          // Use a free analysis
          const usedFree = useFreeAnalysis();
          if (!usedFree) {
            toast.error('Failed to use free analysis. Please try again.');
            return false;
          }
        } else {
          // Spend tokens
          const success = spendTokens(cost, featureId, `Ran feature: ${featureName}`);
          if (!success) {
            toast.error('Insufficient VQT tokens to run this feature.');
            return false;
          }
        }
      }

      setIsRunning(true);
      setError(null);

      try {
        const result = await FeatureEngine.run(featureId, params);

        setCurrentResult(result);
        setResults(prev => ({ ...prev, [featureId]: result }));

        toast.success(`${featureName} completed successfully`);
        setIsRunning(false);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
        toast.error(message);
        setIsRunning(false);
        return false;
      }
    },
    []
  );

  const clearResult = useCallback((featureId: string) => {
    setResults(prev => {
      const next = { ...prev };
      delete next[featureId];
      return next;
    });
    setCurrentResult((prev: FeatureResult | null) => (prev && prev.featureId === featureId ? null : prev));
  }, []);

  const clearAllResults = useCallback(() => {
    setResults({});
    setCurrentResult(null);
  }, []);

  return {
    isRunning,
    currentResult,
    results,
    runFeature,
    clearResult,
    clearAllResults,
    error,
  };
}
