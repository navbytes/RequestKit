/**
 * Bulk variable storage operations
 */

import type { Variable } from '@/shared/types/variables';
import { VariableScope } from '@/shared/types/variables';
import { loggers } from '@/shared/utils/debug';

import { getAllVariables } from '../utils/storageUtils';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

/**
 * Get a specific variable by ID and scope
 */
export async function getVariable(
  variableId: string,
  scope: VariableScope,
  profileId?: string,
  ruleId?: string
): Promise<Variable | null> {
  try {
    const variablesData = await getAllVariables();

    if (scope === VariableScope.GLOBAL) {
      return variablesData.global[variableId] || null;
    } else if (scope === VariableScope.PROFILE && profileId) {
      return variablesData.profiles[profileId]?.[variableId] || null;
    } else if (scope === VariableScope.RULE && ruleId) {
      return variablesData.rules[ruleId]?.[variableId] || null;
    } else {
      // Invalid scope or missing required parameters
      return null;
    }
  } catch (error) {
    logger.error(`Failed to get variable '${variableId}':`, error);
    return null;
  }
}

/**
 * Check if a variable exists
 */
export async function variableExists(
  variableId: string,
  scope: VariableScope,
  profileId?: string,
  ruleId?: string
): Promise<boolean> {
  try {
    const variable = await getVariable(variableId, scope, profileId, ruleId);
    return variable !== null;
  } catch (error) {
    logger.error(`Failed to check if variable '${variableId}' exists:`, error);
    return false;
  }
}

/**
 * Get variables by name (across all scopes)
 */
export async function getVariablesByName(name: string): Promise<Variable[]> {
  try {
    const variablesData = await getAllVariables();
    const matchingVariables: Variable[] = [];

    // Check global variables
    Object.values(variablesData.global).forEach(variable => {
      if (variable.name === name) {
        matchingVariables.push(variable);
      }
    });

    // Check profile variables
    Object.values(variablesData.profiles).forEach(profileVars => {
      Object.values(profileVars).forEach(variable => {
        if (variable.name === name) {
          matchingVariables.push(variable);
        }
      });
    });

    // Check rule variables
    Object.values(variablesData.rules).forEach(ruleVars => {
      Object.values(ruleVars).forEach(variable => {
        if (variable.name === name) {
          matchingVariables.push(variable);
        }
      });
    });

    return matchingVariables;
  } catch (error) {
    logger.error(`Failed to get variables by name '${name}':`, error);
    return [];
  }
}

/**
 * Search variables by tags
 */
export async function getVariablesByTags(tags: string[]): Promise<Variable[]> {
  try {
    const variablesData = await getAllVariables();
    const matchingVariables: Variable[] = [];

    const hasMatchingTag = (variable: Variable): boolean => {
      if (!variable.tags || variable.tags.length === 0) return false;
      return tags.some(tag => variable.tags?.includes(tag) || false);
    };

    // Check global variables
    Object.values(variablesData.global).forEach(variable => {
      if (hasMatchingTag(variable)) {
        matchingVariables.push(variable);
      }
    });

    // Check profile variables
    Object.values(variablesData.profiles).forEach(profileVars => {
      Object.values(profileVars).forEach(variable => {
        if (hasMatchingTag(variable)) {
          matchingVariables.push(variable);
        }
      });
    });

    // Check rule variables
    Object.values(variablesData.rules).forEach(ruleVars => {
      Object.values(ruleVars).forEach(variable => {
        if (hasMatchingTag(variable)) {
          matchingVariables.push(variable);
        }
      });
    });

    return matchingVariables;
  } catch (error) {
    logger.error(`Failed to get variables by tags:`, error);
    return [];
  }
}
