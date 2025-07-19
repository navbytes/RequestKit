import { useState, useCallback } from 'preact/hooks';

import { VariableStorageUtils } from '@/lib/core/variable-storage';
import type { Variable, VariableScope } from '@/shared/types/variables';
import { loggers } from '@/shared/utils/debug';

interface VariablesState {
  variables: {
    global: Record<string, Variable>;
    profiles: Record<string, Record<string, Variable>>;
  };
  loading: boolean;
  error: Error | null;
}

interface VariableStats {
  globalCount: number;
  profileCount: number;
  totalCount: number;
  profilesWithVariables: string[];
}

interface VariablesActions {
  loadVariables: () => Promise<void>;
  createVariable: (variable: Variable) => Promise<void>;
  updateVariable: (variable: Variable) => Promise<void>;
  deleteVariable: (
    variableId: string,
    scope: VariableScope,
    profileId?: string
  ) => Promise<void>;
  getVariablesByScope: (scope: VariableScope) => Variable[];
  searchVariables: (query: string) => Variable[];
  getStats: () => VariableStats;
  exportVariables: () => void;
  importVariables: (variables: Variable[]) => Promise<void>;
}

/**
 * Custom hook for managing variables
 */

// Get logger for this module
const logger = loggers.shared;

export function useVariables(): VariablesState & VariablesActions {
  const [state, setState] = useState<VariablesState>({
    variables: { global: {}, profiles: {} },
    loading: true,
    error: null,
  });

  const loadVariables = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const variables = await VariableStorageUtils.getAllVariables();
      setState(prev => ({ ...prev, variables, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  }, []);

  const createVariable = useCallback(
    async (variable: Variable) => {
      try {
        if (variable.scope === 'global') {
          await VariableStorageUtils.saveGlobalVariable(variable);
        } else {
          // For profile variables, use default profile for now
          await VariableStorageUtils.saveProfileVariable('default', variable);
        }
        await loadVariables();
      } catch (error) {
        logger.error('Failed to create variable:', error);
        throw error;
      }
    },
    [loadVariables]
  );

  const updateVariable = useCallback(
    async (variable: Variable) => {
      try {
        if (variable.scope === 'global') {
          await VariableStorageUtils.saveGlobalVariable(variable);
        } else {
          await VariableStorageUtils.saveProfileVariable('default', variable);
        }
        await loadVariables();
      } catch (error) {
        logger.error('Failed to update variable:', error);
        throw error;
      }
    },
    [loadVariables]
  );

  const deleteVariable = useCallback(
    async (
      variableId: string,
      scope: VariableScope,
      profileId: string = 'default'
    ) => {
      try {
        if (scope === 'global') {
          await VariableStorageUtils.deleteGlobalVariable(variableId);
        } else {
          await VariableStorageUtils.deleteProfileVariable(
            profileId,
            variableId
          );
        }
        await loadVariables();
      } catch (error) {
        logger.error('Failed to delete variable:', error);
        throw error;
      }
    },
    [loadVariables]
  );

  const getVariablesByScope = useCallback(
    (scope: VariableScope): Variable[] => {
      const allVariables = [
        ...Object.values(state.variables.global),
        ...Object.values(state.variables.profiles).flatMap(profileVars =>
          Object.values(profileVars)
        ),
      ];
      return allVariables.filter(variable => variable.scope === scope);
    },
    [state.variables]
  );

  // Removed getVariablesByType since we no longer have variable types

  const searchVariables = useCallback(
    (query: string): Variable[] => {
      const allVariables = [
        ...Object.values(state.variables.global),
        ...Object.values(state.variables.profiles).flatMap(profileVars =>
          Object.values(profileVars)
        ),
      ];

      const lowerQuery = query.toLowerCase();
      return allVariables.filter(
        variable =>
          variable.name.toLowerCase().includes(lowerQuery) ||
          variable.description?.toLowerCase().includes(lowerQuery) ||
          variable.value.toLowerCase().includes(lowerQuery) ||
          variable.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    },
    [state.variables]
  );

  const getStats = useCallback((): VariableStats => {
    const globalCount = Object.keys(state.variables.global).length;
    const profileCount = Object.values(state.variables.profiles).reduce(
      (total, profileVars) => total + Object.keys(profileVars).length,
      0
    );
    const profilesWithVariables = Object.keys(state.variables.profiles).filter(
      profileId => {
        const profile = state.variables.profiles[profileId];
        return profile ? Object.keys(profile).length > 0 : false;
      }
    );

    return {
      globalCount,
      profileCount,
      totalCount: globalCount + profileCount,
      profilesWithVariables,
    };
  }, [state.variables]);

  const exportVariables = useCallback(() => {
    const allVariables = [
      ...Object.values(state.variables.global),
      ...Object.values(state.variables.profiles).flatMap(profileVars =>
        Object.values(profileVars)
      ),
    ];

    const exportData = {
      version: '1.0',
      exportDate: new Date(),
      variables: allVariables.map(variable => ({
        ...variable,
        value: variable.isSecret ? '[REDACTED]' : variable.value,
      })),
      metadata: {
        totalVariables: allVariables.length,
        exportedBy: 'RequestKit Variable Manager',
        includeSecrets: false,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requestkit-variables-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.variables]);

  const importVariables = useCallback(
    async (variables: Variable[]) => {
      try {
        const globalVars = variables.filter(v => v.scope === 'global');
        const profileVars = variables.filter(v => v.scope === 'profile');

        if (globalVars.length > 0) {
          await VariableStorageUtils.saveGlobalVariables(globalVars);
        }

        if (profileVars.length > 0) {
          await VariableStorageUtils.saveProfileVariables(
            'default',
            profileVars
          );
        }

        await loadVariables();
      } catch (error) {
        logger.error('Failed to import variables:', error);
        throw error;
      }
    },
    [loadVariables]
  );

  return {
    ...state,
    loadVariables,
    createVariable,
    updateVariable,
    deleteVariable,
    getVariablesByScope,
    searchVariables,
    getStats,
    exportVariables,
    importVariables,
  };
}
