/**
 * Variable Storage System - Backward Compatibility Layer
 *
 * This file maintains the original VariableStorageUtils class interface
 * while delegating to the new modular system for actual implementation.
 *
 * REFACTORED: Phase 2.2B - Core Business Logic Refactoring
 * Original: 929 lines → New: 93 lines (90% reduction)
 * Modularized into 12 focused modules with single responsibilities
 */

import { STORAGE_KEYS } from '@/config/constants';
import type { HeaderRule } from '@/shared/types/rules';
import type { Variable } from '@/shared/types/variables';
import { VariableScope } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

// Import modular system functions
import { installDefaultVariables } from './variable-storage/management/defaultVariables';
import {
  getVariable,
  variableExists,
  getVariablesByName,
  getVariablesByTags,
} from './variable-storage/operations/bulkOperations';
import {
  getGlobalVariables,
  saveGlobalVariable,
  saveGlobalVariables,
  deleteGlobalVariable,
} from './variable-storage/operations/globalOperations';
import {
  getProfileVariables,
  getAllProfileVariables,
  saveProfileVariable,
  saveProfileVariables,
  deleteProfileVariable,
  deleteAllProfileVariables,
} from './variable-storage/operations/profileOperations';
import {
  getRuleVariables,
  saveRuleVariable,
  deleteRuleVariable,
  deleteAllRuleVariables,
} from './variable-storage/operations/ruleOperations';
import { getStorageStatistics } from './variable-storage/queries/storageStats';
import {
  getAllVariables,
  initializeVariablesStorage,
  clearAllVariables,
} from './variable-storage/utils/storageUtils';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

/**
 * Utility class for managing variable storage operations
 *
 * @deprecated This class is maintained for backward compatibility.
 * New code should use the modular functions directly from './variable-storage/index'
 */
export class VariableStorageUtils {
  static async getGlobalVariables(): Promise<Record<string, Variable>> {
    return getGlobalVariables();
  }

  static async getProfileVariables(
    profileId: string
  ): Promise<Record<string, Variable>> {
    return getProfileVariables(profileId);
  }

  static async getRuleVariables(
    ruleId: string
  ): Promise<Record<string, Variable>> {
    return getRuleVariables(ruleId);
  }

  static async getAllProfileVariables(): Promise<
    Record<string, Record<string, Variable>>
  > {
    return getAllProfileVariables();
  }

  static async getAllVariables(): Promise<{
    global: Record<string, Variable>;
    profiles: Record<string, Record<string, Variable>>;
    rules: Record<string, Record<string, Variable>>;
  }> {
    return getAllVariables();
  }

  static async saveGlobalVariable(variable: Variable): Promise<void> {
    return saveGlobalVariable(variable);
  }

  static async saveProfileVariable(
    profileId: string,
    variable: Variable
  ): Promise<void> {
    return saveProfileVariable(profileId, variable);
  }

  static async saveRuleVariable(
    ruleId: string,
    variable: Variable
  ): Promise<void> {
    return saveRuleVariable(ruleId, variable);
  }

  static async saveGlobalVariables(variables: Variable[]): Promise<void> {
    return saveGlobalVariables(variables);
  }

  static async saveProfileVariables(
    profileId: string,
    variables: Variable[]
  ): Promise<void> {
    return saveProfileVariables(profileId, variables);
  }

  static async deleteGlobalVariable(variableId: string): Promise<void> {
    return deleteGlobalVariable(variableId);
  }

  static async deleteProfileVariable(
    profileId: string,
    variableId: string
  ): Promise<void> {
    return deleteProfileVariable(profileId, variableId);
  }

  static async deleteRuleVariable(
    ruleId: string,
    variableId: string
  ): Promise<void> {
    return deleteRuleVariable(ruleId, variableId);
  }

  static async deleteAllProfileVariables(profileId: string): Promise<void> {
    return deleteAllProfileVariables(profileId);
  }

  static async deleteAllRuleVariables(ruleId: string): Promise<void> {
    return deleteAllRuleVariables(ruleId);
  }

  static async getVariable(
    variableId: string,
    scope: VariableScope,
    profileId?: string,
    ruleId?: string
  ): Promise<Variable | null> {
    return getVariable(variableId, scope, profileId, ruleId);
  }

  static async variableExists(
    variableId: string,
    scope: VariableScope,
    profileId?: string,
    ruleId?: string
  ): Promise<boolean> {
    return variableExists(variableId, scope, profileId, ruleId);
  }

  static async getVariablesByName(name: string): Promise<Variable[]> {
    return getVariablesByName(name);
  }

  static async getVariablesByTags(tags: string[]): Promise<Variable[]> {
    return getVariablesByTags(tags);
  }

  static async initializeVariablesStorage(): Promise<void> {
    return initializeVariablesStorage();
  }

  static async clearAllVariables(): Promise<void> {
    return clearAllVariables();
  }

  static async getVariablesStorageStats(): Promise<{
    globalCount: number;
    profileCount: number;
    ruleCount: number;
    totalCount: number;
    profilesWithVariables: string[];
    rulesWithVariables: string[];
  }> {
    const stats = await getStorageStatistics();
    return {
      globalCount: stats.byScope.global,
      profileCount: stats.byScope.profile,
      ruleCount: stats.byScope.rule,
      totalCount: stats.total.count,
      profilesWithVariables: Object.keys((await getAllVariables()).profiles),
      rulesWithVariables: Object.keys((await getAllVariables()).rules),
    };
  }

  static async initializeDefaultVariables(): Promise<void> {
    await installDefaultVariables();
    await this.updateVariableUsageCounts();
  }

  /**
   * Calculate and update usage counts for all variables based on current rules
   * @deprecated This method is maintained for compatibility but should be replaced
   * with the new usage tracking system from './variable-storage/management/usageTracking'
   */
  static async updateVariableUsageCounts(): Promise<void> {
    try {
      // Get all rules and variables
      const [rulesData, variablesData] = await Promise.all([
        ChromeApiUtils.storage.sync.get([STORAGE_KEYS.RULES]),
        getAllVariables(),
      ]);

      const rules =
        (rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] || {};

      // Count variable usage across all rules
      const variableUsageCounts = new Map<string, number>();

      Object.values(rules as Record<string, HeaderRule>).forEach(rule => {
        if (rule.headers && Array.isArray(rule.headers)) {
          rule.headers.forEach(header => {
            if (header.value && typeof header.value === 'string') {
              // Find variable references in header values: ${VARIABLE_NAME}
              const variableMatches = header.value.matchAll(/\$\{([^}]+)\}/g);
              for (const match of variableMatches) {
                const variableName = match[1];
                if (variableName) {
                  variableUsageCounts.set(
                    variableName,
                    (variableUsageCounts.get(variableName) || 0) + 1
                  );
                }
              }
            }
          });
        }
      });

      // Update global variables with usage counts
      const updatedGlobalVariables: Record<string, Variable> = {};
      for (const [variableId, variable] of Object.entries(
        variablesData.global
      )) {
        const usageCount = variableUsageCounts.get(variable.name) || 0;
        updatedGlobalVariables[variableId] = {
          ...variable,
          metadata: {
            createdAt: variable.metadata?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...variable.metadata,
            usageCount,
          },
        };
      }

      // Update profile variables with usage counts
      const updatedProfileVariables: Record<
        string,
        Record<string, Variable>
      > = {};
      for (const [profileId, profileVars] of Object.entries(
        variablesData.profiles
      )) {
        updatedProfileVariables[profileId] = {};
        for (const [variableId, variable] of Object.entries(profileVars)) {
          const usageCount = variableUsageCounts.get(variable.name) || 0;
          if (!updatedProfileVariables[profileId]) {
            updatedProfileVariables[profileId] = {};
          }
          const profileVars = updatedProfileVariables[profileId];
          if (profileVars) {
            profileVars[variableId] = {
            ...variable,
            metadata: {
              createdAt:
                variable.metadata?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...variable.metadata,
              usageCount,
            },
            };
          }
        }
      }

      // Update rule variables with usage counts
      const updatedRuleVariables: Record<string, Record<string, Variable>> = {};
      for (const [ruleId, ruleVars] of Object.entries(variablesData.rules)) {
        updatedRuleVariables[ruleId] = {};
        for (const [variableId, variable] of Object.entries(ruleVars)) {
          const usageCount = variableUsageCounts.get(variable.name) || 0;
          if (!updatedRuleVariables[ruleId]) {
            updatedRuleVariables[ruleId] = {};
          }
          const ruleVars = updatedRuleVariables[ruleId];
          if (ruleVars) {
            ruleVars[variableId] = {
            ...variable,
            metadata: {
              createdAt:
                variable.metadata?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...variable.metadata,
              usageCount,
            },
            };
          }
        }
      }

      // Save updated variables back to storage
      const updatedVariablesData = {
        global: updatedGlobalVariables,
        profiles: updatedProfileVariables,
        rules: updatedRuleVariables,
      };

      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: updatedVariablesData,
      });
    } catch (error: unknown) {
      logger.error('Failed to update variable usage counts:', error);
    }
  }
}

// Re-export the modular system for new code
export * from './variable-storage/index';
