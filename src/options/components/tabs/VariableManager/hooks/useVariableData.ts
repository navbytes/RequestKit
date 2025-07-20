import { useState, useEffect } from 'preact/hooks';

import { getStorageStatistics } from '@/lib/core/variable-storage/queries/storageStats';
import { getAllVariables } from '@/lib/core/variable-storage/utils/storageUtils';
import type { Variable } from '@/shared/types/variables';
import { loggers } from '@/shared/utils/debug';

interface VariableStats {
  globalCount: number;
  profileCount: number;
  ruleCount: number;
  totalCount: number;
  profilesWithVariables: string[];
}

interface VariableData {
  global: Record<string, Variable>;
  profiles: Record<string, Record<string, Variable>>;
}

/**
 * Custom hook for managing variable data loading and state
 */

// Get logger for this module
const logger = loggers.shared;

export function useVariableData() {
  const [variables, setVariables] = useState<VariableData>({
    global: {},
    profiles: {},
  });

  const [stats, setStats] = useState<VariableStats>({
    globalCount: 0,
    profileCount: 0,
    ruleCount: 0,
    totalCount: 0,
    profilesWithVariables: [],
  });

  const [loading, setLoading] = useState(true);

  const loadVariables = async () => {
    try {
      setLoading(true);
      const [variablesData, storageStats] = await Promise.all([
        getAllVariables(),
        getStorageStatistics(),
      ]);

      // Map storage statistics to our VariableStats format
      const statsData: VariableStats = {
        globalCount: storageStats.byScope.global,
        profileCount: storageStats.byScope.profile,
        ruleCount: storageStats.byScope.rule,
        totalCount: storageStats.total.count,
        profilesWithVariables: Object.keys(variablesData.profiles).filter(
          profileId =>
            Object.keys(variablesData.profiles[profileId] || {}).length > 0
        ),
      };

      setVariables(variablesData);
      setStats(statsData);
    } catch (error) {
      logger.error('Failed to load variables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVariables();
  }, []);

  return {
    variables,
    stats,
    loading,
    loadVariables,
  };
}
