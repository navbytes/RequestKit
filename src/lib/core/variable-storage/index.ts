/**
 * Variable Storage System - Main Orchestrator
 *
 * This module provides a unified interface for all variable storage operations,
 * organizing functionality into logical groups while maintaining backward compatibility.
 */

// Storage utilities
export {
  getAllVariables,
  initializeVariablesStorage,
  clearAllVariables,
} from './utils/storageUtils';

// Global variable operations
export {
  getGlobalVariables,
  saveGlobalVariable,
  saveGlobalVariables,
  deleteGlobalVariable,
} from './operations/globalOperations';

// Profile variable operations
export {
  getProfileVariables,
  getAllProfileVariables,
  saveProfileVariable,
  saveProfileVariables,
  deleteProfileVariable,
  deleteAllProfileVariables,
} from './operations/profileOperations';

// Rule variable operations
export {
  getRuleVariables,
  saveRuleVariable,
  deleteRuleVariable,
  deleteAllRuleVariables,
} from './operations/ruleOperations';

// Bulk operations
export {
  getVariable,
  variableExists,
  getVariablesByName,
  getVariablesByTags,
} from './operations/bulkOperations';

// Query operations
export * from './queries/variableQueries';
export * from './queries/searchOperations';
export { getStorageStatistics, getStorageSize } from './queries/storageStats';

// Management operations
export * from './management/initialization';
export {
  trackVariableUsage,
  getVariableUsageStats,
  getAllVariableUsageStats,
  getUsageTrends,
  clearUsageHistory,
  exportUsageData,
} from './management/usageTracking';
export {
  installDefaultVariables,
  resetDefaultVariables,
  getDefaultVariableNames,
  isDefaultVariable,
  getDefaultVariableDefinition,
  updateDefaultVariables,
  removeDefaultVariables,
  getDefaultVariablesStatus,
} from './management/defaultVariables';

// Validation utilities
export * from './utils/validationHelpers';

// Re-export types for convenience (avoiding conflicts with wildcard exports)
export type { VariablesData } from './utils/storageUtils';
export type {
  VariableUsageRecord,
  VariableUsageStats,
} from './management/usageTracking';
export type { StorageStatistics } from './queries/storageStats';

/**
 * Main Variable Storage API
 *
 * Provides high-level operations that combine multiple modules
 * for common use cases and complex workflows.
 */
import type { Variable } from '@/shared/types/variables';

import { installDefaultVariables } from './management/defaultVariables';
import {
  initializeStorage,
  validateStorage,
} from './management/initialization';
import type {
  VariableUsageRecord,
  VariableUsageStats,
} from './management/usageTracking';
import { getStorageStatistics } from './queries/storageStats';
import type { StorageStatistics } from './queries/storageStats';
import { getAllVariables } from './utils/storageUtils';
import type { VariablesData } from './utils/storageUtils';

// Use no-op logger to avoid circular dependencies and console warnings
const logger = {
  info: (_message: string, ..._args: unknown[]) => {
    // No-op to avoid circular dependencies and console warnings
  },
  warn: (_message: string, ..._args: unknown[]) => {
    // No-op to avoid circular dependencies and console warnings
  },
  error: (_message: string, ..._args: unknown[]) => {
    // No-op to avoid circular dependencies and console warnings
  },
  debug: (_message: string, ..._args: unknown[]) => {
    // No-op to avoid circular dependencies and console warnings
  },
};

/**
 * Initialize the complete variable storage system
 */
export async function initializeVariableStorage(): Promise<{
  success: boolean;
  initialized: boolean;
  defaultsInstalled: number;
  validationResults: {
    isValid: boolean;
    issues: string[];
    fixedIssues: string[];
  } | null;
  statistics: StorageStatistics | null;
  errors: string[];
}> {
  try {
    logger.info('Initializing variable storage system...');

    const errors: string[] = [];

    // Step 1: Initialize storage structure
    await initializeStorage();

    // Step 2: Install default variables
    const defaultsResult = await installDefaultVariables();
    if (defaultsResult.errors.length > 0) {
      errors.push(...defaultsResult.errors);
    }

    // Step 3: Validate storage
    const validationResults = await validateStorage();
    if (!validationResults.isValid) {
      errors.push(...validationResults.issues);
    }

    // Step 4: Get initial statistics
    const statistics = await getStorageStatistics();

    logger.info(
      `Variable storage initialization complete. Defaults installed: ${defaultsResult.installed}, Validation issues: ${validationResults.issues.length}`
    );

    return {
      success: errors.length === 0,
      initialized: true,
      defaultsInstalled: defaultsResult.installed,
      validationResults,
      statistics,
      errors,
    };
  } catch (error) {
    logger.error('Failed to initialize variable storage system:', error);
    return {
      success: false,
      initialized: false,
      defaultsInstalled: 0,
      validationResults: null,
      statistics: null,
      errors: [`Initialization failed: ${error}`],
    };
  }
}

/**
 * Get comprehensive system health check
 */
export async function getSystemHealth(): Promise<{
  healthy: boolean;
  storage: {
    accessible: boolean;
    validated: boolean;
    issues: string[];
  };
  statistics: StorageStatistics | null;
  performance: {
    responseTime: number;
    variableCount: number;
  };
  errors: string[];
}> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // Test storage accessibility
    let storageAccessible = false;
    let variableCount = 0;

    try {
      const data = await getAllVariables();
      storageAccessible = true;
      variableCount =
        Object.keys(data.global).length +
        Object.values(data.profiles).reduce(
          (sum, profile) => sum + Object.keys(profile).length,
          0
        ) +
        Object.values(data.rules).reduce(
          (sum, rule) => sum + Object.keys(rule).length,
          0
        );
    } catch (error) {
      errors.push(`Storage access failed: ${error}`);
    }

    // Validate storage
    let validationResults: {
      isValid: boolean;
      issues: string[];
      fixedIssues: string[];
    } | null = null;
    try {
      validationResults = await validateStorage();
      if (!validationResults.isValid) {
        errors.push(...validationResults.issues);
      }
    } catch (error) {
      errors.push(`Storage validation failed: ${error}`);
    }

    // Get statistics
    let statistics: StorageStatistics | null = null;
    try {
      statistics = await getStorageStatistics();
    } catch (error) {
      errors.push(`Statistics collection failed: ${error}`);
    }

    const responseTime = Date.now() - startTime;

    return {
      healthy: errors.length === 0 && storageAccessible,
      storage: {
        accessible: storageAccessible,
        validated: validationResults?.isValid || false,
        issues: validationResults?.issues || [],
      },
      statistics,
      performance: {
        responseTime,
        variableCount,
      },
      errors,
    };
  } catch (error) {
    logger.error('System health check failed:', error);
    return {
      healthy: false,
      storage: {
        accessible: false,
        validated: false,
        issues: [],
      },
      statistics: null,
      performance: {
        responseTime: Date.now() - startTime,
        variableCount: 0,
      },
      errors: [`Health check failed: ${error}`],
    };
  }
}

/**
 * Perform system maintenance operations
 */
export async function performMaintenance(): Promise<{
  success: boolean;
  operations: {
    validation: boolean;
    cleanup: boolean;
    optimization: boolean;
  };
  results: {
    issuesFixed: number;
    storageOptimized: boolean;
    performanceImproved: boolean;
  };
  errors: string[];
}> {
  try {
    logger.info('Starting system maintenance...');

    const errors: string[] = [];
    const operations = {
      validation: false,
      cleanup: false,
      optimization: false,
    };

    let issuesFixed = 0;

    // Step 1: Validate and fix storage issues
    try {
      const validationResults = await validateStorage();
      operations.validation = true;
      issuesFixed += validationResults.fixedIssues.length;

      if (validationResults.issues.length > 0) {
        logger.warn(
          `Storage validation found ${validationResults.issues.length} issues`
        );
      }
    } catch (error) {
      errors.push(`Validation failed: ${error}`);
    }

    // Step 2: Cleanup operations
    try {
      let cleanupCount = 0;

      // Remove orphaned variables (variables that reference non-existent profiles/rules)
      const data = await getAllVariables();
      const { ChromeApiUtils } = await import('@/shared/utils/chrome-api');

      // Get current profiles and rules to check for orphaned references
      const profilesData = await ChromeApiUtils.storage.sync.get(['profiles']);
      const rulesData = await ChromeApiUtils.storage.sync.get(['rules']);
      const existingProfiles = Object.keys(
        (profilesData as Record<string, unknown>).profiles || {}
      );
      const existingRules = Object.keys(
        (rulesData as Record<string, unknown>).rules || {}
      );

      // Clean up profile variables for non-existent profiles
      const updatedProfileVariables: Record<
        string,
        Record<string, unknown>
      > = {};
      for (const [profileId, variables] of Object.entries(data.profiles)) {
        if (existingProfiles.includes(profileId)) {
          updatedProfileVariables[profileId] = variables;
        } else {
          cleanupCount += Object.keys(variables).length;
          logger.info(
            `Removed ${Object.keys(variables).length} orphaned variables for deleted profile: ${profileId}`
          );
        }
      }

      // Clean up rule variables for non-existent rules
      const updatedRuleVariables: Record<string, Record<string, unknown>> = {};
      for (const [ruleId, variables] of Object.entries(data.rules)) {
        if (existingRules.includes(ruleId)) {
          updatedRuleVariables[ruleId] = variables;
        } else {
          cleanupCount += Object.keys(variables).length;
          logger.info(
            `Removed ${Object.keys(variables).length} orphaned variables for deleted rule: ${ruleId}`
          );
        }
      }

      // Clean up old usage history (older than 90 days)
      try {
        const { clearUsageHistory } = await import(
          './management/usageTracking'
        );
        await clearUsageHistory();
        logger.info('Cleaned up old usage history');
      } catch (usageError) {
        logger.warn('Failed to clean up usage history:', usageError);
      }

      // Remove duplicate entries (variables with same name and scope)
      const deduplicatedGlobal: Record<string, Variable> = {};
      const globalDuplicates: string[] = [];

      for (const [id, variable] of Object.entries(data.global)) {
        const key = `${variable.name}_${variable.scope}`;
        const duplicateGlobalVariable = deduplicatedGlobal[key];
        if (duplicateGlobalVariable) {
          // Keep the newer variable
          const currentDate = new Date(
            (variable as Variable).metadata?.updatedAt ||
              (variable as Variable).metadata?.createdAt ||
              new Date()
          );
          const existingDate = new Date(
            duplicateGlobalVariable.metadata?.updatedAt ||
              duplicateGlobalVariable.metadata?.createdAt ||
              new Date()
          );

          if (currentDate > existingDate) {
            globalDuplicates.push(duplicateGlobalVariable.id);
            deduplicatedGlobal[key] = variable;
          } else {
            globalDuplicates.push(id);
          }
          cleanupCount++;
        } else {
          deduplicatedGlobal[key] = variable;
        }
      }

      // Save cleaned up data if any changes were made
      if (cleanupCount > 0) {
        const { saveGlobalVariables } = await import(
          './operations/globalOperations'
        );

        // Save deduplicated global variables
        const cleanGlobalVariables = Object.values(deduplicatedGlobal);
        await saveGlobalVariables(cleanGlobalVariables);

        // Save cleaned profile and rule variables
        await ChromeApiUtils.storage.sync.set({
          variables: {
            global: Object.fromEntries(
              cleanGlobalVariables.map(v => [v.id, v])
            ),
            profiles: updatedProfileVariables,
            rules: updatedRuleVariables,
          },
        });

        logger.info(
          `Cleanup completed: removed ${cleanupCount} orphaned/duplicate variables`
        );
      }

      operations.cleanup = true;
    } catch (error) {
      errors.push(`Cleanup failed: ${error}`);
    }

    // Step 3: Optimization operations
    try {
      let optimizationCount = 0;

      // Compress storage data by removing unused fields and optimizing structure
      const data = await getAllVariables();
      let optimizedData = false;

      // Optimize global variables
      let optimizedGlobal: Record<string, Variable> = {};
      for (const [id, variable] of Object.entries(data.global)) {
        const optimized = {
          id: variable.id,
          name: variable.name,
          value: variable.value,
          scope: variable.scope,
          enabled: variable.enabled !== false, // normalize boolean
          ...(variable.description && { description: variable.description }),
          ...(variable.tags &&
            variable.tags.length > 0 && { tags: variable.tags }),
          ...(variable.isSecret && { isSecret: variable.isSecret }),
          createdAt: variable.metadata?.createdAt || new Date(),
          updatedAt: new Date(),
        };

        // Only include if different from original
        if (JSON.stringify(optimized) !== JSON.stringify(variable)) {
          optimizationCount++;
          optimizedData = true;
        }
        optimizedGlobal[id] = optimized;
      }

      // Optimize variable access patterns by creating usage-based indexes
      try {
        const { getAllVariableUsageStats } = await import(
          './management/usageTracking'
        );
        const usageStats = await getAllVariableUsageStats();

        // Sort variables by usage frequency for faster access
        const sortedByUsage = Object.entries(optimizedGlobal).sort(
          ([, a], [, b]) => {
            const usageA =
              usageStats.find(s => s.variableId === a.id)?.totalUsage || 0;
            const usageB =
              usageStats.find(s => s.variableId === b.id)?.totalUsage || 0;
            return usageB - usageA; // Sort by usage descending
          }
        );

        // Update indexes based on usage patterns
        optimizedGlobal = Object.fromEntries(sortedByUsage);

        logger.info(
          `Optimized variable access patterns based on usage statistics`
        );
        optimizationCount++;
      } catch (usageError) {
        logger.warn('Failed to optimize variable access patterns:', usageError);
      }

      // Update storage with optimized data if changes were made
      if (optimizedData) {
        const { ChromeApiUtils } = await import('@/shared/utils/chrome-api');
        await ChromeApiUtils.storage.sync.set({
          variables: {
            global: optimizedGlobal,
            profiles: data.profiles,
            rules: data.rules,
          },
        });

        logger.info(
          `Storage optimization completed: ${optimizationCount} optimizations applied`
        );
      }

      operations.optimization = true;
    } catch (error) {
      errors.push(`Optimization failed: ${error}`);
    }

    logger.info(
      `System maintenance completed. Issues fixed: ${issuesFixed}, Errors: ${errors.length}`
    );

    return {
      success: errors.length === 0,
      operations,
      results: {
        issuesFixed,
        storageOptimized: operations.optimization,
        performanceImproved: issuesFixed > 0,
      },
      errors,
    };
  } catch (error) {
    logger.error('System maintenance failed:', error);
    return {
      success: false,
      operations: {
        validation: false,
        cleanup: false,
        optimization: false,
      },
      results: {
        issuesFixed: 0,
        storageOptimized: false,
        performanceImproved: false,
      },
      errors: [`Maintenance failed: ${error}`],
    };
  }
}

/**
 * Export/Import operations for backup and migration
 */
export async function exportAllData(): Promise<{
  success: boolean;
  data: {
    variables: VariablesData;
    usage: {
      history: VariableUsageRecord[];
      stats: VariableUsageStats[];
      exportDate: string;
    } | null;
    metadata: {
      exportDate: string;
      version: string;
      totalVariables: number;
    };
  } | null;
  errors: string[];
}> {
  try {
    const variables = await getAllVariables();

    // Get usage data (if available)
    let usage: {
      history: VariableUsageRecord[];
      stats: VariableUsageStats[];
      exportDate: string;
    } | null = null;
    try {
      const { exportUsageData } = await import('./management/usageTracking');
      usage = await exportUsageData();
    } catch (error) {
      logger.warn('Could not export usage data:', error);
    }

    const totalVariables =
      Object.keys(variables.global).length +
      Object.values(variables.profiles).reduce(
        (sum, profile) => sum + Object.keys(profile).length,
        0
      ) +
      Object.values(variables.rules).reduce(
        (sum, rule) => sum + Object.keys(rule).length,
        0
      );

    return {
      success: true,
      data: {
        variables,
        usage,
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          totalVariables,
        },
      },
      errors: [],
    };
  } catch (error) {
    logger.error('Export failed:', error);
    return {
      success: false,
      data: null,
      errors: [`Export failed: ${error}`],
    };
  }
}

/**
 * System information and diagnostics
 */
export async function getSystemInfo(): Promise<{
  version: string;
  modules: string[];
  capabilities: string[];
  statistics: StorageStatistics;
  health: {
    healthy: boolean;
    storage: {
      accessible: boolean;
      validated: boolean;
      issues: string[];
    };
    statistics: StorageStatistics | null;
    performance: {
      responseTime: number;
      variableCount: number;
    };
    errors: string[];
  };
}> {
  try {
    const [statistics, health] = await Promise.all([
      getStorageStatistics(),
      getSystemHealth(),
    ]);

    return {
      version: '1.0.0',
      modules: [
        'storageUtils',
        'globalOperations',
        'profileOperations',
        'ruleOperations',
        'bulkOperations',
        'variableQueries',
        'searchOperations',
        'storageStats',
        'initialization',
        'usageTracking',
        'defaultVariables',
        'validationHelpers',
      ],
      capabilities: [
        'Variable CRUD operations',
        'Multi-scope support (global, profile, rule)',
        'Advanced search and filtering',
        'Usage tracking and analytics',
        'Storage validation and maintenance',
        'Default variable management',
        'Bulk operations',
        'Export/Import functionality',
        'Performance monitoring',
        'Health diagnostics',
      ],
      statistics,
      health,
    };
  } catch (error) {
    logger.error('Failed to get system info:', error);
    throw error;
  }
}
