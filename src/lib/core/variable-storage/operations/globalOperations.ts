/**
 * Global variable storage operations
 */

import { STORAGE_KEYS } from '@/config/constants';
import type { Variable } from '@/shared/types/variables';
import { VariableScope } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers, logError } from '@/shared/utils/debug';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

/**
 * Get all global variables from storage
 */
export async function getGlobalVariables(): Promise<Record<string, Variable>> {
  try {
    const result = await ChromeApiUtils.storage.sync.get([
      STORAGE_KEYS.VARIABLES,
    ]);

    interface VariablesData {
      global: Record<string, Variable>;
      profiles: Record<string, Record<string, Variable>>;
      rules: Record<string, Record<string, Variable>>;
    }

    const variablesData: VariablesData = ((result as Record<string, unknown>)[
      STORAGE_KEYS.VARIABLES
    ] as VariablesData) || {
      global: {},
      profiles: {},
      rules: {},
    };
    return variablesData.global || {};
  } catch (error) {
    logError(logger, 'Failed to get global variables', error);
    return {};
  }
}

/**
 * Save a global variable
 */
export async function saveGlobalVariable(variable: Variable): Promise<void> {
  try {
    const updatedAt = new Date().toISOString();
    // Ensure the variable has global scope
    const globalVariable: Variable = {
      ...variable,
      scope: VariableScope.GLOBAL,
      metadata: {
        ...variable.metadata,
        updatedAt,
        createdAt: variable.metadata?.createdAt || updatedAt,
      },
    };

    const { getAllVariables } = await import('../utils/storageUtils');
    const variablesData = await getAllVariables();
    variablesData.global[variable.id] = globalVariable;

    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.VARIABLES]: variablesData,
    });

    logger.info(`Global variable '${variable.name}' saved successfully`);
  } catch (error) {
    logger.error(`Failed to save global variable '${variable.name}':`, error);
    throw error;
  }
}

/**
 * Save multiple global variables
 */
export async function saveGlobalVariables(
  variables: Variable[]
): Promise<void> {
  try {
    const { getAllVariables } = await import('../utils/storageUtils');
    const variablesData = await getAllVariables();

    variables.forEach(variable => {
      const globalVariable: Variable = {
        ...variable,
        scope: VariableScope.GLOBAL,
        metadata: {
          ...variable.metadata,
          updatedAt: new Date().toISOString(),
          createdAt: variable.metadata?.createdAt || new Date(),
        },
      };
      variablesData.global[variable.id] = globalVariable;
    });

    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.VARIABLES]: variablesData,
    });

    logger.info(`${variables.length} global variables saved successfully`);
  } catch (error) {
    logger.error(`Failed to save ${variables.length} global variables:`, error);
    throw error;
  }
}

/**
 * Delete a global variable
 */
export async function deleteGlobalVariable(variableId: string): Promise<void> {
  try {
    const { getAllVariables } = await import('../utils/storageUtils');
    const variablesData = await getAllVariables();

    if (variablesData.global[variableId]) {
      delete variablesData.global[variableId];

      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: variablesData,
      });

      logger.info(`Global variable '${variableId}' deleted successfully`);
    } else {
      logger.warn(`Global variable '${variableId}' not found`);
    }
  } catch (error) {
    logger.error(`Failed to delete global variable '${variableId}':`, error);
    throw error;
  }
}
