/**
 * Profile variable storage operations
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
 * Get variables for a specific profile
 */
export async function getProfileVariables(
  profileId: string
): Promise<Record<string, Variable>> {
  try {
    const variablesData = await getAllVariables();
    return variablesData.profiles?.[profileId] || {};
  } catch (error) {
    logger.error(`Failed to get variables for profile ${profileId}:`, error);
    return {};
  }
}

/**
 * Get all variables for all profiles
 */
export async function getAllProfileVariables(): Promise<
  Record<string, Record<string, Variable>>
> {
  try {
    const variablesData = await getAllVariables();
    return variablesData.profiles || {};
  } catch (error) {
    logger.error('Failed to get all profile variables:', error);
    return {};
  }
}

/**
 * Save a profile-specific variable
 */
export async function saveProfileVariable(
  profileId: string,
  variable: Variable
): Promise<void> {
  try {
    // Ensure the variable has profile scope and profileId
    const profileVariable: Variable = {
      ...variable,
      scope: VariableScope.PROFILE,
      profileId,
      metadata: {
        ...variable.metadata,
        updatedAt: new Date().toISOString(),
        createdAt: variable.metadata?.createdAt || new Date(),
      },
    };

    const variablesData = await getAllVariables();

    if (!variablesData.profiles[profileId]) {
      variablesData.profiles[profileId] = {};
    }

    if (!variablesData.profiles[profileId]) {
      variablesData.profiles[profileId] = {};
    }
    const profileVars = variablesData.profiles[profileId];
    if (profileVars) {
      profileVars[variable.id] = profileVariable;
    }

    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.VARIABLES]: variablesData,
    });

    logger.info(
      `Profile variable '${variable.name}' saved for profile '${profileId}'`
    );
  } catch (error) {
    logger.error(
      `Failed to save profile variable '${variable.name}' for profile '${profileId}':`,
      error
    );
    throw error;
  }
}

/**
 * Save multiple profile-specific variables
 */
export async function saveProfileVariables(
  profileId: string,
  variables: Variable[]
): Promise<void> {
  try {
    const variablesData = await getAllVariables();

    if (!variablesData.profiles[profileId]) {
      variablesData.profiles[profileId] = {};
    }

    const profileVariables = variablesData.profiles[profileId];
    if (profileVariables) {
      variables.forEach(variable => {
        const profileVariable: Variable = {
          ...variable,
          scope: VariableScope.PROFILE,
          profileId,
          metadata: {
            ...variable.metadata,
            updatedAt: new Date().toISOString(),
            createdAt: variable.metadata?.createdAt || new Date(),
          },
        };
        profileVariables[variable.id] = profileVariable;
      });
    }

    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.VARIABLES]: variablesData,
    });

    logger.info(
      `${variables.length} profile variables saved for profile '${profileId}'`
    );
  } catch (error) {
    logger.error(
      `Failed to save ${variables.length} profile variables for profile '${profileId}':`,
      error
    );
    throw error;
  }
}

/**
 * Delete a profile-specific variable
 */
export async function deleteProfileVariable(
  profileId: string,
  variableId: string
): Promise<void> {
  try {
    const variablesData = await getAllVariables();

    if (variablesData.profiles[profileId]?.[variableId]) {
      const profileVars = variablesData.profiles[profileId];
      if (profileVars) {
        delete profileVars[variableId];
      }

      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: variablesData,
      });

      logger.info(
        `Profile variable '${variableId}' deleted from profile '${profileId}'`
      );
    } else {
      logger.warn(
        `Profile variable '${variableId}' not found in profile '${profileId}'`
      );
    }
  } catch (error) {
    logger.error(
      `Failed to delete profile variable '${variableId}' from profile '${profileId}':`,
      error
    );
    throw error;
  }
}

/**
 * Delete all variables for a profile
 */
export async function deleteAllProfileVariables(
  profileId: string
): Promise<void> {
  try {
    const variablesData = await getAllVariables();

    if (variablesData.profiles[profileId]) {
      delete variablesData.profiles[profileId];

      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: variablesData,
      });

      logger.info(`All variables deleted for profile '${profileId}'`);
    } else {
      logger.warn(`No variables found for profile '${profileId}'`);
    }
  } catch (error) {
    logger.error(
      `Failed to delete all variables for profile '${profileId}':`,
      error
    );
    throw error;
  }
}
