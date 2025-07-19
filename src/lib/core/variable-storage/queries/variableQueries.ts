/**
 * Variable query operations
 */

import type { Variable } from '@/shared/types/variables';
import { loggers } from '@/shared/utils/debug';

import { getAllVariables } from '../utils/storageUtils';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

/**
 * Search variables by query string across all scopes
 */
export async function searchVariables(
  query: string,
  options: {
    includeGlobal?: boolean;
    includeProfiles?: boolean;
    includeRules?: boolean;
    profileIds?: string[];
    ruleIds?: string[];
  } = {}
): Promise<Variable[]> {
  try {
    const {
      includeGlobal = true,
      includeProfiles = true,
      includeRules = true,
      profileIds,
      ruleIds,
    } = options;

    const variablesData = await getAllVariables();
    const matchingVariables: Variable[] = [];
    const lowercaseQuery = query.toLowerCase();

    const matchesQuery = (variable: Variable): boolean => {
      return (
        variable.name.toLowerCase().includes(lowercaseQuery) ||
        (variable.description?.toLowerCase().includes(lowercaseQuery) ??
          false) ||
        (variable.tags?.some(tag =>
          tag.toLowerCase().includes(lowercaseQuery)
        ) ??
          false)
      );
    };

    // Search global variables
    if (includeGlobal) {
      Object.values(variablesData.global).forEach(variable => {
        if (matchesQuery(variable)) {
          matchingVariables.push(variable);
        }
      });
    }

    // Search profile variables
    if (includeProfiles) {
      const profilesToSearch =
        profileIds || Object.keys(variablesData.profiles);
      profilesToSearch.forEach(profileId => {
        const profileVars = variablesData.profiles[profileId];
        if (profileVars) {
          Object.values(profileVars).forEach(variable => {
            if (matchesQuery(variable)) {
              matchingVariables.push(variable);
            }
          });
        }
      });
    }

    // Search rule variables
    if (includeRules) {
      const rulesToSearch = ruleIds || Object.keys(variablesData.rules);
      rulesToSearch.forEach(ruleId => {
        const ruleVars = variablesData.rules[ruleId];
        if (ruleVars) {
          Object.values(ruleVars).forEach(variable => {
            if (matchesQuery(variable)) {
              matchingVariables.push(variable);
            }
          });
        }
      });
    }

    return matchingVariables;
  } catch (error) {
    logger.error(`Failed to search variables with query '${query}':`, error);
    return [];
  }
}

/**
 * Filter variables by criteria
 */
export async function filterVariables(criteria: {
  enabled?: boolean;
  isSecret?: boolean;
  tags?: string[];
  scope?: string;
  hasDescription?: boolean;
}): Promise<Variable[]> {
  try {
    const variablesData = await getAllVariables();
    const allVariables: Variable[] = [];

    // Collect all variables
    Object.values(variablesData.global).forEach(variable => {
      allVariables.push(variable);
    });

    Object.values(variablesData.profiles).forEach(profileVars => {
      Object.values(profileVars).forEach(variable => {
        allVariables.push(variable);
      });
    });

    Object.values(variablesData.rules).forEach(ruleVars => {
      Object.values(ruleVars).forEach(variable => {
        allVariables.push(variable);
      });
    });

    // Apply filters
    return allVariables.filter(variable => {
      if (
        criteria.enabled !== undefined &&
        variable.enabled !== criteria.enabled
      ) {
        return false;
      }

      if (
        criteria.isSecret !== undefined &&
        variable.isSecret !== criteria.isSecret
      ) {
        return false;
      }

      if (criteria.scope && variable.scope !== criteria.scope) {
        return false;
      }

      if (criteria.hasDescription !== undefined) {
        const hasDesc = Boolean(
          variable.description && variable.description.trim()
        );
        if (hasDesc !== criteria.hasDescription) {
          return false;
        }
      }

      if (criteria.tags && criteria.tags.length > 0) {
        if (!variable.tags || variable.tags.length === 0) {
          return false;
        }
        const hasMatchingTag = criteria.tags.some(
          tag => variable.tags?.includes(tag) || false
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  } catch (error) {
    logger.error('Failed to filter variables:', error);
    return [];
  }
}

/**
 * Get variables sorted by criteria
 */
export async function getSortedVariables(
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'usageCount' = 'name',
  order: 'asc' | 'desc' = 'asc'
): Promise<Variable[]> {
  try {
    const variablesData = await getAllVariables();
    const allVariables: Variable[] = [];

    // Collect all variables
    Object.values(variablesData.global).forEach(variable => {
      allVariables.push(variable);
    });

    Object.values(variablesData.profiles).forEach(profileVars => {
      Object.values(profileVars).forEach(variable => {
        allVariables.push(variable);
      });
    });

    Object.values(variablesData.rules).forEach(ruleVars => {
      Object.values(ruleVars).forEach(variable => {
        allVariables.push(variable);
      });
    });

    // Sort variables
    return allVariables.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison =
            new Date(a.metadata?.createdAt || 0).getTime() -
            new Date(b.metadata?.createdAt || 0).getTime();
          break;
        case 'updatedAt':
          comparison =
            new Date(a.metadata?.updatedAt || 0).getTime() -
            new Date(b.metadata?.updatedAt || 0).getTime();
          break;
        case 'usageCount':
          comparison =
            (a.metadata?.usageCount || 0) - (b.metadata?.usageCount || 0);
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });
  } catch (error) {
    logger.error('Failed to get sorted variables:', error);
    return [];
  }
}
