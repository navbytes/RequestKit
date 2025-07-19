/**
 * Default variable management
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
 * Default variables that should be available in all installations
 */
const DEFAULT_VARIABLES: Omit<Variable, 'id' | 'metadata'>[] = [
  {
    name: 'user_agent',
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    scope: VariableScope.GLOBAL,
    description: 'Default user agent string for requests',
    enabled: true,
    isSecret: false,
    tags: ['browser', 'headers', 'default'],
  },
  {
    name: 'api_version',
    value: 'v1',
    scope: VariableScope.GLOBAL,
    description: 'Default API version for requests',
    enabled: true,
    isSecret: false,
    tags: ['api', 'version', 'default'],
  },
  {
    name: 'content_type_json',
    value: 'application/json',
    scope: VariableScope.GLOBAL,
    description: 'JSON content type header value',
    enabled: true,
    isSecret: false,
    tags: ['headers', 'content-type', 'json'],
  },
  {
    name: 'content_type_form',
    value: 'application/x-www-form-urlencoded',
    scope: VariableScope.GLOBAL,
    description: 'Form content type header value',
    enabled: true,
    isSecret: false,
    tags: ['headers', 'content-type', 'form'],
  },
  {
    name: 'accept_json',
    value: 'application/json, text/plain, */*',
    scope: VariableScope.GLOBAL,
    description: 'Accept header for JSON responses',
    enabled: true,
    isSecret: false,
    tags: ['headers', 'accept', 'json'],
  },
  {
    name: 'cors_origin',
    value: '*',
    scope: VariableScope.GLOBAL,
    description: 'CORS origin header value',
    enabled: false,
    isSecret: false,
    tags: ['cors', 'headers', 'security'],
  },
  {
    name: 'cache_control_no_cache',
    value: 'no-cache, no-store, must-revalidate',
    scope: VariableScope.GLOBAL,
    description: 'Cache control header to disable caching',
    enabled: false,
    isSecret: false,
    tags: ['headers', 'cache', 'performance'],
  },
  {
    name: 'authorization_bearer',
    value: 'Bearer ${token}',
    scope: VariableScope.GLOBAL,
    description: 'Bearer token authorization header template',
    enabled: false,
    isSecret: true,
    tags: ['auth', 'headers', 'security', 'template'],
  },
];

/**
 * Install default variables if they don't exist
 */
export async function installDefaultVariables(): Promise<{
  installed: number;
  skipped: number;
  errors: string[];
}> {
  try {
    const variablesData = await getAllVariables();
    const results = {
      installed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    const now = new Date().toISOString();

    for (const defaultVar of DEFAULT_VARIABLES) {
      try {
        // Check if variable already exists
        if (variablesData.global[defaultVar.name]) {
          results.skipped++;
          logger.debug(`Skipped existing default variable: ${defaultVar.name}`);
          continue;
        }

        // Create the variable with metadata
        const variable: Variable = {
          ...defaultVar,
          id: `default_${defaultVar.name}_${Date.now()}`,
          metadata: {
            createdAt: now,
            updatedAt: now,
            usageCount: 0,
          },
        };

        // Add to global variables
        variablesData.global[defaultVar.name] = variable;
        results.installed++;

        logger.debug(`Installed default variable: ${defaultVar.name}`);
      } catch (error) {
        const errorMsg = `Failed to install default variable ${defaultVar.name}: ${error}`;
        results.errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    // Save updated data if any variables were installed
    if (results.installed > 0) {
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: variablesData,
      });
    }

    logger.info(
      `Default variables installation complete: ${results.installed} installed, ${results.skipped} skipped, ${results.errors.length} errors`
    );
    return results;
  } catch (error) {
    logger.error('Failed to install default variables:', error);
    return {
      installed: 0,
      skipped: 0,
      errors: [`Installation failed: ${error}`],
    };
  }
}

/**
 * Reset default variables to their original values
 */
export async function resetDefaultVariables(): Promise<{
  reset: number;
  errors: string[];
}> {
  try {
    const variablesData = await getAllVariables();
    const results = {
      reset: 0,
      errors: [] as string[],
    };

    const now = new Date().toISOString();

    for (const defaultVar of DEFAULT_VARIABLES) {
      try {
        const existingVar = variablesData.global[defaultVar.name];
        if (!existingVar) {
          continue;
        }

        // Reset to default values while preserving metadata
        const resetVariable: Variable = {
          ...defaultVar,
          id: existingVar.id,
          metadata: {
            createdAt: existingVar.metadata?.createdAt || now,
            updatedAt: now,
            usageCount: existingVar.metadata?.usageCount || 0,
            ...(existingVar.metadata?.lastUsed && {
              lastUsed: existingVar.metadata.lastUsed,
            }),
            ...(existingVar.metadata?.createdBy && {
              createdBy: existingVar.metadata.createdBy,
            }),
            ...(existingVar.metadata?.custom && {
              custom: existingVar.metadata.custom,
            }),
          },
        };

        variablesData.global[defaultVar.name] = resetVariable;
        results.reset++;

        logger.debug(`Reset default variable: ${defaultVar.name}`);
      } catch (error) {
        const errorMsg = `Failed to reset default variable ${defaultVar.name}: ${error}`;
        results.errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    // Save updated data if any variables were reset
    if (results.reset > 0) {
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: variablesData,
      });
    }

    logger.info(
      `Default variables reset complete: ${results.reset} reset, ${results.errors.length} errors`
    );
    return results;
  } catch (error) {
    logger.error('Failed to reset default variables:', error);
    return {
      reset: 0,
      errors: [`Reset failed: ${error}`],
    };
  }
}

/**
 * Get list of default variable names
 */
export function getDefaultVariableNames(): string[] {
  return DEFAULT_VARIABLES.map(v => v.name);
}

/**
 * Check if a variable is a default variable
 */
export function isDefaultVariable(variableName: string): boolean {
  return DEFAULT_VARIABLES.some(v => v.name === variableName);
}

/**
 * Get default variable definition
 */
export function getDefaultVariableDefinition(
  variableName: string
): Omit<Variable, 'id' | 'metadata'> | null {
  return DEFAULT_VARIABLES.find(v => v.name === variableName) || null;
}

/**
 * Update default variables to latest definitions
 */
export async function updateDefaultVariables(): Promise<{
  updated: number;
  added: number;
  errors: string[];
}> {
  try {
    const variablesData = await getAllVariables();
    const results = {
      updated: 0,
      added: 0,
      errors: [] as string[],
    };

    const now = new Date().toISOString();

    for (const defaultVar of DEFAULT_VARIABLES) {
      try {
        const existingVar = variablesData.global[defaultVar.name];

        if (existingVar) {
          // Update existing variable with new default values
          // Preserve user customizations for enabled state and description if they've been modified
          const shouldPreserveEnabled =
            existingVar.enabled !== defaultVar.enabled;
          const shouldPreserveDescription =
            existingVar.description !== defaultVar.description;

          const updatedVariable: Variable = {
            ...defaultVar,
            id: existingVar.id,
            ...(shouldPreserveEnabled && existingVar.enabled !== undefined
              ? { enabled: existingVar.enabled }
              : defaultVar.enabled !== undefined
                ? { enabled: defaultVar.enabled }
                : {}),
            ...(shouldPreserveDescription &&
            existingVar.description !== undefined
              ? { description: existingVar.description }
              : defaultVar.description !== undefined
                ? { description: defaultVar.description }
                : {}),
            metadata: {
              createdAt: existingVar.metadata?.createdAt || now,
              updatedAt: now,
              usageCount: existingVar.metadata?.usageCount || 0,
              ...(existingVar.metadata?.lastUsed && {
                lastUsed: existingVar.metadata.lastUsed,
              }),
              ...(existingVar.metadata?.createdBy && {
                createdBy: existingVar.metadata.createdBy,
              }),
              ...(existingVar.metadata?.custom && {
                custom: existingVar.metadata.custom,
              }),
            },
          };

          variablesData.global[defaultVar.name] = updatedVariable;
          results.updated++;

          logger.debug(`Updated default variable: ${defaultVar.name}`);
        } else {
          // Add new default variable
          const variable: Variable = {
            ...defaultVar,
            id: `default_${defaultVar.name}_${Date.now()}`,
            metadata: {
              createdAt: now,
              updatedAt: now,
              usageCount: 0,
            },
          };

          variablesData.global[defaultVar.name] = variable;
          results.added++;

          logger.debug(`Added new default variable: ${defaultVar.name}`);
        }
      } catch (error) {
        const errorMsg = `Failed to update default variable ${defaultVar.name}: ${error}`;
        results.errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    // Save updated data if any changes were made
    if (results.updated > 0 || results.added > 0) {
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: variablesData,
      });
    }

    logger.info(
      `Default variables update complete: ${results.updated} updated, ${results.added} added, ${results.errors.length} errors`
    );
    return results;
  } catch (error) {
    logger.error('Failed to update default variables:', error);
    return {
      updated: 0,
      added: 0,
      errors: [`Update failed: ${error}`],
    };
  }
}

/**
 * Remove all default variables
 */
export async function removeDefaultVariables(): Promise<{
  removed: number;
  errors: string[];
}> {
  try {
    const variablesData = await getAllVariables();
    const results = {
      removed: 0,
      errors: [] as string[],
    };

    for (const defaultVar of DEFAULT_VARIABLES) {
      try {
        if (variablesData.global[defaultVar.name]) {
          delete variablesData.global[defaultVar.name];
          results.removed++;
          logger.debug(`Removed default variable: ${defaultVar.name}`);
        }
      } catch (error) {
        const errorMsg = `Failed to remove default variable ${defaultVar.name}: ${error}`;
        results.errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    // Save updated data if any variables were removed
    if (results.removed > 0) {
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.VARIABLES]: variablesData,
      });
    }

    logger.info(
      `Default variables removal complete: ${results.removed} removed, ${results.errors.length} errors`
    );
    return results;
  } catch (error) {
    logger.error('Failed to remove default variables:', error);
    return {
      removed: 0,
      errors: [`Removal failed: ${error}`],
    };
  }
}

/**
 * Get status of default variables
 */
export async function getDefaultVariablesStatus(): Promise<{
  total: number;
  installed: number;
  missing: number;
  modified: number;
  variables: Array<{
    name: string;
    status: 'installed' | 'missing' | 'modified';
    current?: Variable;
    default: Omit<Variable, 'id' | 'metadata'>;
  }>;
}> {
  try {
    const variablesData = await getAllVariables();
    const variables: Array<{
      name: string;
      status: 'installed' | 'missing' | 'modified';
      current?: Variable;
      default: Omit<Variable, 'id' | 'metadata'>;
    }> = [];

    let installed = 0;
    let missing = 0;
    let modified = 0;

    for (const defaultVar of DEFAULT_VARIABLES) {
      const current = variablesData.global[defaultVar.name];

      if (!current) {
        missing++;
        variables.push({
          name: defaultVar.name,
          status: 'missing',
          default: defaultVar,
        });
      } else {
        // Check if modified from default
        const isModified =
          current.value !== defaultVar.value ||
          current.enabled !== defaultVar.enabled ||
          current.isSecret !== defaultVar.isSecret ||
          JSON.stringify(current.tags) !== JSON.stringify(defaultVar.tags);

        if (isModified) {
          modified++;
          variables.push({
            name: defaultVar.name,
            status: 'modified',
            current,
            default: defaultVar,
          });
        } else {
          installed++;
          variables.push({
            name: defaultVar.name,
            status: 'installed',
            current,
            default: defaultVar,
          });
        }
      }
    }

    return {
      total: DEFAULT_VARIABLES.length,
      installed,
      missing,
      modified,
      variables,
    };
  } catch (error) {
    logger.error('Failed to get default variables status:', error);
    return {
      total: DEFAULT_VARIABLES.length,
      installed: 0,
      missing: DEFAULT_VARIABLES.length,
      modified: 0,
      variables: DEFAULT_VARIABLES.map(defaultVar => ({
        name: defaultVar.name,
        status: 'missing' as const,
        default: defaultVar,
      })),
    };
  }
}
