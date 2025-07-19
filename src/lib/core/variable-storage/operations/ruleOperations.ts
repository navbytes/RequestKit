/**
 * Rule variable storage operations
 */

import { STORAGE_KEYS } from '@/config/constants';
import type { Variable } from '@/shared/types/variables';
import { VariableScope } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

import { getAllVariables } from '../utils/storageUtils';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

/**
 * Get variables for a specific rule
 */
export async function getRuleVariables(
  ruleId: string
): Promise<Record<string, Variable>> {
  try {
    const variablesData = await getAllVariables();
    return variablesData.rules?.[ruleId] || {};
  } catch (error) {
    logger.error(`Failed to get variables for rule ${ruleId}:`, error);
    return {};
  }
}

/**
 * Save a rule-specific variable
 */
export async function saveRuleVariable(
  ruleId: string,
  variable: Variable
): Promise<void> {
  try {
    // Ensure the variable has rule scope and ruleId
    const ruleVariable: Variable = {
      ...variable,
      scope: VariableScope.RULE,
      ruleId,
      metadata: {
        ...variable.metadata,
        updatedAt: new Date().toISOString(),
        createdAt: variable.metadata?.createdAt || new Date(),
      },
    };

    const variablesData = await getAllVariables();

    if (!variablesData.rules[ruleId]) {
      variablesData.rules[ruleId] = {};
    }

    if (!variablesData.rules[ruleId]) {
      variablesData.rules[ruleId] = {};
    }
    const ruleVars = variablesData.rules[ruleId];
    if (ruleVars) {
      ruleVars[variable.id] = ruleVariable;
    }

    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.VARIABLES]: variablesData,
    });

    logger.info(`Rule variable '${variable.name}' saved for rule '${ruleId}'`);
  } catch (error) {
    logger.error(
      `Failed to save rule variable '${variable.name}' for rule '${ruleId}':`,
      error
    );
    throw error;
  }
}

/**
 * Delete a rule-specific variable
 */
export async function deleteRuleVariable(
  ruleId: string,
  variableId: string
): Promise<void> {
  try {
    const variablesData = await getAllVariables();

    if (variablesData.rules[ruleId]?.[variableId]) {
      const ruleVars = variablesData.rules[ruleId];
      if (ruleVars) {
        delete ruleVars[variableId];
      }

      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: variablesData,
      });

      logger.info(
        `Rule variable '${variableId}' deleted from rule '${ruleId}'`
      );
    } else {
      logger.warn(
        `Rule variable '${variableId}' not found in rule '${ruleId}'`
      );
    }
  } catch (error) {
    logger.error(
      `Failed to delete rule variable '${variableId}' from rule '${ruleId}':`,
      error
    );
    throw error;
  }
}

/**
 * Delete all variables for a rule
 */
export async function deleteAllRuleVariables(ruleId: string): Promise<void> {
  try {
    const variablesData = await getAllVariables();

    if (variablesData.rules[ruleId]) {
      delete variablesData.rules[ruleId];

      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: variablesData,
      });

      logger.info(`All variables deleted for rule '${ruleId}'`);
    } else {
      logger.warn(`No variables found for rule '${ruleId}'`);
    }
  } catch (error) {
    logger.error(`Failed to delete all variables for rule '${ruleId}':`, error);
    throw error;
  }
}
