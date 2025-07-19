/**
 * Storage utility functions
 */

import { STORAGE_KEYS } from '@/config/constants';
import type { Variable } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

export interface VariablesData {
  global: Record<string, Variable>;
  profiles: Record<string, Record<string, Variable>>;
  rules: Record<string, Record<string, Variable>>;
}

/**
 * Get all variables (global, profile-specific, and rule-specific)
 */
export async function getAllVariables(): Promise<VariablesData> {
  try {
    const result = await ChromeApiUtils.storage.sync.get([
      STORAGE_KEYS.VARIABLES,
    ]);

    const variablesData: VariablesData = ((result as Record<string, unknown>)[
      STORAGE_KEYS.VARIABLES
    ] as VariablesData) || {
      global: {},
      profiles: {},
      rules: {},
    };
    return {
      global: variablesData.global || {},
      profiles: variablesData.profiles || {},
      rules: variablesData.rules || {},
    };
  } catch (error) {
    logger.error('Failed to get all variables:', error);
    return { global: {}, profiles: {}, rules: {} };
  }
}

/**
 * Initialize variables storage with default structure
 */
export async function initializeVariablesStorage(): Promise<void> {
  try {
    const result = await ChromeApiUtils.storage.sync.get([
      STORAGE_KEYS.VARIABLES,
    ]);

    if (!(result as Record<string, unknown>)[STORAGE_KEYS.VARIABLES]) {
      const defaultVariablesData: VariablesData = {
        global: {},
        profiles: {},
        rules: {},
      };

      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: defaultVariablesData,
      });

      logger.info('Variables storage initialized with default structure');
    }
  } catch (error) {
    logger.error('Failed to initialize variables storage:', error);
    throw error;
  }
}

/**
 * Clear all variables (for testing or reset purposes)
 */
export async function clearAllVariables(): Promise<void> {
  try {
    const defaultVariablesData: VariablesData = {
      global: {},
      profiles: {},
      rules: {},
    };

    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.VARIABLES]: defaultVariablesData,
    });

    logger.info('All variables cleared successfully');
  } catch (error) {
    logger.error('Failed to clear all variables:', error);
    throw error;
  }
}
