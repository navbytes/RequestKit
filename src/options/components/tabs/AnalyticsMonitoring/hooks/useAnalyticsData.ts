import { useState, useEffect, useCallback } from 'preact/hooks';

import { AnalyticsMonitor } from '@/lib/integrations';
import type {
  UsageAnalytics,
  OptimizationSuggestion,
} from '@/lib/integrations/analytics-monitor';
import { loggers } from '@/shared/utils/debug';

interface AnalyticsState {
  analytics: UsageAnalytics | null;
  suggestions: OptimizationSuggestion[];
  effectivenessReport: Record<string, unknown> | null;
  isLoading: boolean;
}


// Get logger for this module
const logger = loggers.shared;

const REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Custom hook for managing analytics data loading and state
 */
export function useAnalyticsData() {
  const [state, setState] = useState<AnalyticsState>({
    analytics: null,
    suggestions: [],
    effectivenessReport: null,
    isLoading: true,
  });

  const analyticsMonitor = AnalyticsMonitor.getInstance();

  const loadAnalyticsData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await analyticsMonitor.loadStoredAnalytics();

      const data = analyticsMonitor.getAnalytics();
      const optimizations = analyticsMonitor.getOptimizationSuggestions();
      const report = analyticsMonitor.getRuleEffectivenessReport();

      setState({
        analytics: data,
        suggestions: optimizations,
        effectivenessReport: report,
        isLoading: false,
      });
    } catch (error) {
      logger.error('Failed to load analytics data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [analyticsMonitor]);

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadAnalyticsData]);

  return { ...state, loadAnalyticsData };
}
