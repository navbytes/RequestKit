/**
 * Advanced search operations for variables
 */

import type { Variable } from '@/shared/types/variables';
import { loggers } from '@/shared/utils/debug';

import { getAllVariables } from '../utils/storageUtils';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

/**
 * Advanced search with multiple criteria
 */
export async function advancedSearch(searchCriteria: {
  query?: string;
  exactMatch?: boolean;
  caseSensitive?: boolean;
  searchFields?: ('name' | 'description' | 'tags' | 'value')[];
  scope?: string;
  enabled?: boolean;
  isSecret?: boolean;
  tags?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
    field?: 'createdAt' | 'updatedAt';
  };
  usageRange?: {
    min?: number;
    max?: number;
  };
}): Promise<Variable[]> {
  try {
    const {
      query,
      exactMatch = false,
      caseSensitive = false,
      searchFields = ['name', 'description', 'tags'],
      scope,
      enabled,
      isSecret,
      tags,
      dateRange,
      usageRange,
    } = searchCriteria;

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
      // Text search
      if (query) {
        const searchQuery = caseSensitive ? query : query.toLowerCase();
        let matchFound = false;

        for (const field of searchFields) {
          let fieldValue = '';

          switch (field) {
            case 'name':
              fieldValue = variable.name;
              break;
            case 'description':
              fieldValue = variable.description || '';
              break;
            case 'tags':
              fieldValue = variable.tags?.join(' ') || '';
              break;
            case 'value':
              fieldValue =
                typeof variable.value === 'string' ? variable.value : '';
              break;
          }

          if (!caseSensitive) {
            fieldValue = fieldValue.toLowerCase();
          }

          if (exactMatch) {
            if (fieldValue === searchQuery) {
              matchFound = true;
              break;
            }
          } else {
            if (fieldValue.includes(searchQuery)) {
              matchFound = true;
              break;
            }
          }
        }

        if (!matchFound) {
          return false;
        }
      }

      // Scope filter
      if (scope && variable.scope !== scope) {
        return false;
      }

      // Enabled filter
      if (enabled !== undefined && variable.enabled !== enabled) {
        return false;
      }

      // Secret filter
      if (isSecret !== undefined && variable.isSecret !== isSecret) {
        return false;
      }

      // Tags filter
      if (tags && tags.length > 0) {
        if (!variable.tags || variable.tags.length === 0) {
          return false;
        }
        const hasAllTags = tags.every(
          tag => variable.tags?.includes(tag) || false
        );
        if (!hasAllTags) {
          return false;
        }
      }

      // Date range filter
      if (dateRange) {
        const { start, end, field = 'createdAt' } = dateRange;
        const dateValue = variable.metadata?.[field];

        if (dateValue) {
          const varDate = new Date(dateValue);

          if (start && varDate < start) {
            return false;
          }

          if (end && varDate > end) {
            return false;
          }
        }
      }

      // Usage range filter
      if (usageRange) {
        const { min, max } = usageRange;
        const usageCount = variable.metadata?.usageCount || 0;

        if (min !== undefined && usageCount < min) {
          return false;
        }

        if (max !== undefined && usageCount > max) {
          return false;
        }
      }

      return true;
    });
  } catch (error) {
    logger.error('Failed to perform advanced search:', error);
    return [];
  }
}

/**
 * Search for duplicate variables across scopes
 */
export async function findDuplicateVariables(): Promise<{
  duplicates: Array<{
    name: string;
    variables: Variable[];
  }>;
  count: number;
}> {
  try {
    const variablesData = await getAllVariables();
    const variablesByName = new Map<string, Variable[]>();

    // Collect all variables by name
    const addVariable = (variable: Variable) => {
      const existing = variablesByName.get(variable.name) || [];
      existing.push(variable);
      variablesByName.set(variable.name, existing);
    };

    Object.values(variablesData.global).forEach(addVariable);

    Object.values(variablesData.profiles).forEach(profileVars => {
      Object.values(profileVars).forEach(addVariable);
    });

    Object.values(variablesData.rules).forEach(ruleVars => {
      Object.values(ruleVars).forEach(addVariable);
    });

    // Find duplicates
    const duplicates: Array<{ name: string; variables: Variable[] }> = [];

    variablesByName.forEach((variables, name) => {
      if (variables.length > 1) {
        duplicates.push({ name, variables });
      }
    });

    return {
      duplicates,
      count: duplicates.length,
    };
  } catch (error) {
    logger.error('Failed to find duplicate variables:', error);
    return { duplicates: [], count: 0 };
  }
}

/**
 * Search for unused variables
 */
export async function findUnusedVariables(
  minUsageThreshold = 0,
  daysSinceLastUsed = 30
): Promise<Variable[]> {
  try {
    const variablesData = await getAllVariables();
    const allVariables: Variable[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastUsed);

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

    // Filter unused variables
    return allVariables.filter(variable => {
      const usageCount = variable.metadata?.usageCount || 0;
      const lastUsed = variable.metadata?.lastUsed;

      // Check usage count
      if (usageCount <= minUsageThreshold) {
        return true;
      }

      // Check last used date
      if (lastUsed) {
        const lastUsedDate = new Date(lastUsed);
        if (lastUsedDate < cutoffDate) {
          return true;
        }
      }

      return false;
    });
  } catch (error) {
    logger.error('Failed to find unused variables:', error);
    return [];
  }
}

/**
 * Search for variables with validation issues
 */
export async function findVariablesWithIssues(): Promise<{
  issues: Array<{
    variable: Variable;
    issues: string[];
  }>;
  count: number;
}> {
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

    const variablesWithIssues: Array<{ variable: Variable; issues: string[] }> =
      [];

    // Check each variable for issues
    allVariables.forEach(variable => {
      const issues: string[] = [];

      // Check for empty name
      if (!variable.name || variable.name.trim() === '') {
        issues.push('Empty or missing name');
      }

      // Check for invalid characters in name
      if (variable.name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.name)) {
        issues.push(
          'Invalid characters in name (must start with letter/underscore, contain only alphanumeric/underscore)'
        );
      }

      // Check for empty value
      if (
        variable.value === undefined ||
        variable.value === null ||
        variable.value === ''
      ) {
        issues.push('Empty or missing value');
      }

      // Check for missing scope
      if (!variable.scope) {
        issues.push('Missing scope');
      }

      // Check for invalid scope
      if (
        variable.scope &&
        !['global', 'profile', 'rule'].includes(variable.scope)
      ) {
        issues.push('Invalid scope (must be global, profile, or rule)');
      }

      // Check for missing metadata
      if (!variable.metadata) {
        issues.push('Missing metadata');
      }

      // Check for invalid dates
      if (variable.metadata?.createdAt) {
        const createdAt = new Date(variable.metadata.createdAt);
        if (isNaN(createdAt.getTime())) {
          issues.push('Invalid createdAt date');
        }
      }

      if (variable.metadata?.updatedAt) {
        const updatedAt = new Date(variable.metadata.updatedAt);
        if (isNaN(updatedAt.getTime())) {
          issues.push('Invalid updatedAt date');
        }
      }

      if (issues.length > 0) {
        variablesWithIssues.push({ variable, issues });
      }
    });

    return {
      issues: variablesWithIssues,
      count: variablesWithIssues.length,
    };
  } catch (error) {
    logger.error('Failed to find variables with issues:', error);
    return { issues: [], count: 0 };
  }
}
