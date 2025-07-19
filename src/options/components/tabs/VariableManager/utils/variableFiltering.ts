import { VariableResolver } from '@/lib/core/variable-resolver';
import type { Variable, VariableScope } from '@/shared/types/variables';

/**
 * Filter variables based on search query, scope, functions, and tags
 */
export const filterVariables = (
  variables: Variable[],
  searchQuery: string,
  filterScope: VariableScope | 'all',
  filterFunctions: 'all' | 'functions' | 'static',
  selectedTags: string[]
): Variable[] => {
  return variables.filter(variable => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        variable.name.toLowerCase().includes(query) ||
        variable.description?.toLowerCase().includes(query) ||
        variable.value.toLowerCase().includes(query) ||
        variable.tags?.some(tag => tag.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

    // Scope filter
    if (filterScope !== 'all' && variable.scope !== filterScope) {
      return false;
    }

    // Functions filter - check for both ${function()} and ${function_name} patterns
    const hasFunction =
      /\$\{[a-zA-Z_][a-zA-Z0-9_]*(\(\))?\}/.test(variable.value) &&
      (/\$\{[a-zA-Z_][a-zA-Z0-9_]*\(\)\}/.test(variable.value) ||
        VariableResolver.getAvailableFunctions().some(func =>
          variable.value.includes(`\${${func.name}}`)
        ));
    if (filterFunctions === 'functions' && !hasFunction) {
      return false;
    }
    if (filterFunctions === 'static' && hasFunction) {
      return false;
    }

    // Tags filter
    if (selectedTags.length > 0) {
      const hasSelectedTag = selectedTags.some(tag =>
        variable.tags?.includes(tag)
      );
      if (!hasSelectedTag) return false;
    }

    return true;
  });
};

/**
 * Get all unique tags from variables
 */
export const getAllTags = (variables: Variable[]): string[] => {
  const tags = new Set<string>();
  variables.forEach(variable => {
    variable.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
};

/**
 * Get all variables for display from the variables structure
 */
export const getAllVariablesForDisplay = (variables: {
  global: Record<string, Variable>;
  profiles: Record<string, Record<string, Variable>>;
}): Variable[] => {
  return [
    ...Object.values(variables.global),
    ...Object.values(variables.profiles).flatMap(profileVars =>
      Object.values(profileVars)
    ),
  ];
};
