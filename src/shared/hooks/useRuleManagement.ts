import { useState, useCallback } from 'preact/hooks';

import { STORAGE_KEYS } from '@/config/constants';
import type { HeaderRule } from '@/shared/types/rules';
import { ChromeApiUtils } from '@/shared/utils';

interface RuleManagementState {
  rules: HeaderRule[];
  loading: boolean;
  error: Error | null;
}

interface RuleManagementActions {
  createRule: (
    rule: Omit<HeaderRule, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<HeaderRule>;
  updateRule: (id: string, updates: Partial<HeaderRule>) => Promise<HeaderRule>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string) => Promise<void>;
  loadRules: () => Promise<void>;
  saveRules: (rules: HeaderRule[]) => Promise<void>;
}

/**
 * Custom hook for managing header rules
 */
export function useRuleManagement(
  initialRules: HeaderRule[] = []
): RuleManagementState & RuleManagementActions {
  const [state, setState] = useState<RuleManagementState>({
    rules: initialRules,
    loading: false,
    error: null,
  });

  const saveRules = useCallback(async (rules: HeaderRule[]) => {
    const rulesObject = rules.reduce(
      (acc, rule) => {
        acc[rule.id] = rule;
        return acc;
      },
      {} as Record<string, HeaderRule>
    );

    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.RULES]: rulesObject,
    });
  }, []);

  const loadRules = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.RULES,
      ]);
      const rulesObject =
        (result as Record<string, unknown>)[STORAGE_KEYS.RULES] || {};
      const rules = Object.values(rulesObject) as HeaderRule[];

      setState(prev => ({ ...prev, rules, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  }, []);

  const createRule = useCallback(
    async (
      ruleData: Omit<HeaderRule, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<HeaderRule> => {
      const newRule: HeaderRule = {
        ...ruleData,
        id: `rule_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedRules = [...state.rules, newRule];
      await saveRules(updatedRules);
      setState(prev => ({ ...prev, rules: updatedRules }));

      return newRule;
    },
    [state.rules, saveRules]
  );

  const updateRule = useCallback(
    async (id: string, updates: Partial<HeaderRule>): Promise<HeaderRule> => {
      const updatedRules = state.rules.map(rule =>
        rule.id === id ? { ...rule, ...updates, updatedAt: new Date() } : rule
      );

      const updatedRule = updatedRules.find(rule => rule.id === id);
      if (!updatedRule) {
        throw new Error(`Rule with id ${id} not found`);
      }

      await saveRules(updatedRules);
      setState(prev => ({ ...prev, rules: updatedRules }));

      return updatedRule;
    },
    [state.rules, saveRules]
  );

  const deleteRule = useCallback(
    async (id: string): Promise<void> => {
      const updatedRules = state.rules.filter(rule => rule.id !== id);
      await saveRules(updatedRules);
      setState(prev => ({ ...prev, rules: updatedRules }));
    },
    [state.rules, saveRules]
  );

  const toggleRule = useCallback(
    async (id: string): Promise<void> => {
      await updateRule(id, {
        enabled: !state.rules.find(rule => rule.id === id)?.enabled,
      });
    },
    [state.rules, updateRule]
  );

  return {
    ...state,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    loadRules,
    saveRules,
  };
}
