import type { HeaderRule } from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';

import { saveRules } from '../utils/ruleStorage';
import type { RuleFormData, NewHeaderEntry } from '../utils/ruleValidation';
import {
  validateRuleForm,
  createRuleFromFormData,
} from '../utils/ruleValidation';

/**
 * Custom hook for managing rule CRUD operations
 */

// Get logger for this module
const logger = loggers.shared;

export function useRuleOperations(
  rules: HeaderRule[],
  onRulesUpdate: (rules: HeaderRule[]) => void
) {
  const handleCreateRule = async (
    formData: RuleFormData,
    headers: NewHeaderEntry[]
  ): Promise<{ success: boolean; error?: string }> => {
    const validationError = validateRuleForm(formData);
    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      const rule = createRuleFromFormData(formData, headers);
      const updatedRules = [...rules, rule];
      await saveRules(updatedRules);
      onRulesUpdate(updatedRules);
      return { success: true };
    } catch (error) {
      logger.error('Failed to create rule:', error);
      return {
        success: false,
        error: 'Failed to create rule. Please try again.',
      };
    }
  };

  const handleUpdateRule = async (
    editingRule: HeaderRule,
    formData: RuleFormData,
    headers: NewHeaderEntry[]
  ): Promise<{ success: boolean; error?: string }> => {
    const validationError = validateRuleForm(formData);
    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      const updatedRule = createRuleFromFormData(
        formData,
        headers,
        editingRule
      );
      const updatedRules = rules.map(rule =>
        rule.id === editingRule.id ? updatedRule : rule
      );
      await saveRules(updatedRules);
      onRulesUpdate(updatedRules);
      return { success: true };
    } catch (error) {
      logger.error('Failed to update rule:', error);
      return {
        success: false,
        error: 'Failed to update rule. Please try again.',
      };
    }
  };

  const handleDeleteRule = async (ruleId: string): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this rule?')) {
      return false;
    }

    try {
      const updatedRules = rules.filter(rule => rule.id !== ruleId);
      await saveRules(updatedRules);
      onRulesUpdate(updatedRules);
      return true;
    } catch (error) {
      logger.error('Failed to delete rule:', error);
      alert('Failed to delete rule. Please try again.');
      return false;
    }
  };

  const handleToggleRule = async (ruleId: string): Promise<boolean> => {
    try {
      const updatedRules = rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      );
      await saveRules(updatedRules);
      onRulesUpdate(updatedRules);
      return true;
    } catch (error) {
      logger.error('Failed to toggle rule:', error);
      alert('Failed to toggle rule. Please try again.');
      return false;
    }
  };

  const handleDuplicateRule = async (
    sourceRule: HeaderRule
  ): Promise<boolean> => {
    try {
      // Generate unique name with copy suffix
      const generateUniqueName = (baseName: string): string => {
        const copyPattern = /^(.+?)(?: \(Copy(?: (\d+))?\))?$/;
        const match = baseName.match(copyPattern);
        const originalName = match ? match[1] : baseName;

        let copyNumber = 1;
        let newName = `${originalName} (Copy)`;

        // Check for existing names and increment copy number if needed
        while (rules.some(rule => rule.name === newName)) {
          copyNumber++;
          newName = `${originalName} (Copy ${copyNumber})`;
        }

        return newName;
      };

      const now = new Date();
      const duplicatedRule: HeaderRule = {
        ...sourceRule,
        id: `rule_${Date.now()}`,
        name: generateUniqueName(sourceRule.name),
        createdAt: now,
        updatedAt: now,
      };

      const updatedRules = [...rules, duplicatedRule];
      await saveRules(updatedRules);
      onRulesUpdate(updatedRules);
      return true;
    } catch (error) {
      logger.error('Failed to duplicate rule:', error);
      alert('Failed to duplicate rule. Please try again.');
      return false;
    }
  };

  return {
    handleCreateRule,
    handleUpdateRule,
    handleDeleteRule,
    handleToggleRule,
    handleDuplicateRule,
  };
}
