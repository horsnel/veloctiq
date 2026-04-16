import { useState, useCallback } from 'react';
import { featureEngine } from '@/services/FeatureEngine';
import { useTokenStore } from '@/stores';
import { toast } from 'sonner';

export function useFeatureRunner() {
  const { spendTokens, getFreeAnalysesRemaining } = useTokenStore();
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const runFeature = useCallback(async (
    featureId: string,
    featureName: string,
    cost: number,
    input: any = {},
    options?: { skipToken?: boolean }
  ) => {
    const key = featureId.toLowerCase().replace(/\s/g, '');
    if (loading[key]) return null;

    // Handle free analyses or token spend
    if (!options?.skipToken && cost > 0) {
      const freeRemaining = getFreeAnalysesRemaining();
      if (freeRemaining === 0) {
        const success = spendTokens(cost, key, `Used ${featureName}`);
        if (!success) {
          toast.error('Insufficient VQT balance. Purchase more tokens to continue.');
          return null;
        }
      }
    }

    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const result = await featureEngine.executeFeature(key, input);
      setResults(prev => ({ ...prev, [key]: result }));
      if (result.success) {
        toast.success(`${featureName} completed!`);
      } else {
        toast.error(`${featureName}: ${result.data?.error || 'Execution failed'}`);
      }
      return result;
    } catch (error) {
      toast.error(`${featureName} failed unexpectedly`);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [spendTokens, getFreeAnalysesRemaining, loading]);

  const isRunning = (featureId: string) => {
    return loading[featureId.toLowerCase().replace(/\s/g, '')] || false;
  };

  const getResult = (featureId: string) => {
    return results[featureId.toLowerCase().replace(/\s/g, '')] || null;
  };

  // Run multiple features in parallel on mount
  const runOnMount = useCallback(async (runs: Array<{ id: string; name: string; cost: number; input?: any }>) => {
    runs.forEach(run => {
      featureEngine.executeFeature(run.id.toLowerCase().replace(/\s/g, ''), run.input || {}).then(result => {
        setResults(prev => ({ ...prev, [run.id]: result }));
      }).catch(() => {});
    });
  }, []);

  return { runFeature, isRunning, getResult, results, runOnMount };
}
