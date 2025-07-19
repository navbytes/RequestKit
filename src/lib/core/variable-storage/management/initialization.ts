/**
 * Storage initialization and setup
 */

import { STORAGE_KEYS } from '@/config/constants';
import type { Variable } from '@/shared/types/variables';
import { VariableScope } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

import {
  getAllVariables,
  initializeVariablesStorage,
  clearAllVariables,
} from '../utils/storageUtils';
import type { VariablesData } from '../utils/storageUtils';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

/**
 * Initialize storage with default structure
 */
export async function initializeStorage(): Promise<void> {
  try {
    await initializeVariablesStorage();
    logger.info('Storage initialized with default structure');
  } catch (error) {
    logger.error('Failed to initialize storage:', error);
    throw error;
  }
}

/**
 * Reset storage to empty state
 */
export async function resetStorage(): Promise<void> {
  try {
    await clearAllVariables();
    logger.info('Storage reset to empty state');
  } catch (error) {
    logger.error('Failed to reset storage:', error);
    throw error;
  }
}

/**
 * Save variables data to storage
 */
async function saveVariables(data: VariablesData): Promise<void> {
  try {
    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.VARIABLES]: data,
    });
  } catch (error) {
    logger.error('Failed to save variables:', error);
    throw error;
  }
}

/**
 * Migrate storage from old format to new format
 */
export async function migrateStorage(oldData: unknown): Promise<void> {
  try {
    logger.info('Starting storage migration');

    // Check if data is already in new format
    if (
      oldData &&
      typeof oldData === 'object' &&
      'global' in oldData &&
      'profiles' in oldData &&
      'rules' in oldData
    ) {
      logger.debug('Data already in new format, no migration needed');
      return;
    }

    const migratedData: VariablesData = {
      global: {},
      profiles: {},
      rules: {},
    };

    // Handle different old formats
    if (Array.isArray(oldData)) {
      // Old format: array of variables
      oldData.forEach((variable: unknown, index: number) => {
        const migratedVariable = migrateVariable(variable, index);
        if (migratedVariable) {
          migratedData.global[migratedVariable.name] = migratedVariable;
        }
      });
    } else if (oldData && typeof oldData === 'object') {
      // Old format: object with variables
      Object.entries(oldData).forEach(([key, value]: [string, unknown]) => {
        const migratedVariable = migrateVariable(value, 0, key);
        if (migratedVariable) {
          migratedData.global[migratedVariable.name] = migratedVariable;
        }
      });
    }

    await saveVariables(migratedData);
    logger.info(
      `Storage migration completed. Migrated ${Object.keys(migratedData.global).length} variables`
    );
  } catch (error) {
    logger.error('Failed to migrate storage:', error);
    throw error;
  }
}

/**
 * Migrate a single variable to new format
 */
function migrateVariable(
  oldVariable: unknown,
  index: number,
  fallbackName?: string
): Variable | null {
  try {
    if (!oldVariable || typeof oldVariable !== 'object') {
      return null;
    }

    const now = new Date().toISOString();

    // Extract name
    const oldVar = oldVariable as Record<string, unknown>;
    let name = (oldVar.name as string) || fallbackName || `variable_${index}`;

    // Ensure name is valid
    if (typeof name !== 'string' || name.trim() === '') {
      name = `variable_${index}`;
    }

    // Clean name to ensure it's valid
    name = name.replace(/[^a-zA-Z0-9_]/g, '_');
    if (!/^[a-zA-Z_]/.test(name)) {
      name = `var_${name}`;
    }

    const metadata: Variable['metadata'] = {
      createdAt: (oldVar.createdAt as string) || now,
      updatedAt: (oldVar.updatedAt as string) || now,
      usageCount: (oldVar.usageCount as number) || 0,
    };

    if (oldVar.lastUsed) {
      metadata.lastUsed = oldVar.lastUsed as string;
    }

    const migratedVariable: Variable = {
      id: `migrated_${index}_${Date.now()}`,
      name,
      value: (oldVar.value as string) ?? '',
      enabled: (oldVar.enabled as boolean) ?? true,
      isSecret: (oldVar.isSecret as boolean) ?? false,
      scope: VariableScope.GLOBAL, // Default to global for migrated variables
      description: (oldVar.description as string) || '',
      tags: Array.isArray(oldVar.tags) ? (oldVar.tags as string[]) : [],
      metadata,
    };

    return migratedVariable;
  } catch (error) {
    logger.error(`Failed to migrate variable at index ${index}:`, error);
    return null;
  }
}

/**
 * Validate storage structure
 */
export async function validateStorage(): Promise<{
  isValid: boolean;
  issues: string[];
  fixedIssues: string[];
}> {
  try {
    const data = await getAllVariables();
    const issues: string[] = [];
    const fixedIssues: string[] = [];
    let needsSave = false;

    // Check if data exists
    if (!data) {
      issues.push('Storage data is null or undefined');
      return { isValid: false, issues, fixedIssues };
    }

    // Check if data has required structure
    if (typeof data !== 'object') {
      issues.push('Storage data is not an object');
      return { isValid: false, issues, fixedIssues };
    }

    // Ensure required top-level properties exist
    if (!data.global) {
      data.global = {};
      fixedIssues.push('Added missing global variables object');
      needsSave = true;
    }

    if (!data.profiles) {
      data.profiles = {};
      fixedIssues.push('Added missing profiles object');
      needsSave = true;
    }

    if (!data.rules) {
      data.rules = {};
      fixedIssues.push('Added missing rules object');
      needsSave = true;
    }

    // Validate each scope
    const validateScope = (scopeData: unknown, scopeName: string) => {
      if (typeof scopeData !== 'object' || scopeData === null) {
        issues.push(`${scopeName} scope is not an object`);
        return;
      }

      Object.entries(scopeData as Record<string, unknown>).forEach(
        ([key, value]: [string, unknown]) => {
          if (scopeName === 'global') {
            // Global variables are stored directly
            validateVariable(value, `${scopeName}.${key}`);
          } else {
            // Profile and rule variables are nested
            if (typeof value !== 'object' || value === null) {
              issues.push(`${scopeName}.${key} is not an object`);
              return;
            }

            Object.entries(value as Record<string, unknown>).forEach(
              ([varKey, varValue]: [string, unknown]) => {
                validateVariable(varValue, `${scopeName}.${key}.${varKey}`);
              }
            );
          }
        }
      );
    };

    const validateVariable = (variable: unknown, path: string) => {
      if (!variable || typeof variable !== 'object') {
        issues.push(`Variable at ${path} is not a valid object`);
        return;
      }

      const varObj = variable as Record<string, unknown>;

      // Check required properties
      if (!varObj.name || typeof varObj.name !== 'string') {
        issues.push(`Variable at ${path} has invalid name`);
      }

      if (varObj.value === undefined || varObj.value === null) {
        issues.push(`Variable at ${path} has undefined/null value`);
      }

      if (typeof varObj.enabled !== 'boolean') {
        issues.push(`Variable at ${path} has invalid enabled property`);
      }

      if (typeof varObj.isSecret !== 'boolean') {
        issues.push(`Variable at ${path} has invalid isSecret property`);
      }

      if (!varObj.scope || typeof varObj.scope !== 'string') {
        issues.push(`Variable at ${path} has invalid scope`);
      }

      // Check metadata
      if (!varObj.metadata || typeof varObj.metadata !== 'object') {
        issues.push(`Variable at ${path} has invalid metadata`);
      } else {
        const metadata = varObj.metadata as Record<string, unknown>;
        if (!metadata.createdAt) {
          issues.push(`Variable at ${path} missing createdAt`);
        }

        if (!metadata.updatedAt) {
          issues.push(`Variable at ${path} missing updatedAt`);
        }

        if (typeof metadata.usageCount !== 'number') {
          issues.push(`Variable at ${path} has invalid usageCount`);
        }
      }
    };

    validateScope(data.global, 'global');
    validateScope(data.profiles, 'profiles');
    validateScope(data.rules, 'rules');

    // Save fixes if needed
    if (needsSave) {
      await saveVariables(data);
    }

    return {
      isValid: issues.length === 0,
      issues,
      fixedIssues,
    };
  } catch (error) {
    logger.error('Failed to validate storage:', error);
    return {
      isValid: false,
      issues: [`Validation failed: ${error}`],
      fixedIssues: [],
    };
  }
}

/**
 * Create backup of current storage
 */
export async function createStorageBackup(): Promise<{
  backup: VariablesData;
  timestamp: string;
  size: number;
}> {
  try {
    const data = await getAllVariables();
    const timestamp = new Date().toISOString();
    const size = new Blob([JSON.stringify(data)]).size;

    logger.info(`Created storage backup at ${timestamp}, size: ${size} bytes`);

    return {
      backup: data,
      timestamp,
      size,
    };
  } catch (error) {
    logger.error('Failed to create storage backup:', error);
    throw error;
  }
}

/**
 * Restore storage from backup
 */
export async function restoreStorageFromBackup(
  backup: VariablesData
): Promise<void> {
  try {
    // Validate backup before restoring
    if (!backup || typeof backup !== 'object') {
      throw new Error('Invalid backup data');
    }

    if (!backup.global || !backup.profiles || !backup.rules) {
      throw new Error('Backup missing required structure');
    }

    await saveVariables(backup);
    logger.info('Storage restored from backup successfully');
  } catch (error) {
    logger.error('Failed to restore storage from backup:', error);
    throw error;
  }
}
