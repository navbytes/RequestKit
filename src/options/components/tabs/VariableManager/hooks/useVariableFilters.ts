import { useState } from 'preact/hooks';

import type { Variable, VariableScope } from '@/shared/types/variables';

import {
  filterVariables,
  getAllTags,
  getAllVariablesForDisplay,
} from '../utils/variableFiltering';

/**
 * Custom hook for managing variable filters and search
 */
export function useVariableFilters(variables: {
  global: Record<string, Variable>;
  profiles: Record<string, Record<string, Variable>>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScope, setFilterScope] = useState<VariableScope | 'all'>('all');
  const [filterFunctions, setFilterFunctions] = useState<
    'all' | 'functions' | 'static'
  >('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all variables for filtering
  const allVariables = getAllVariablesForDisplay(variables);

  // Apply filters
  const filteredVariables = filterVariables(
    allVariables,
    searchQuery,
    filterScope,
    filterFunctions,
    selectedTags
  );

  // Get available tags
  const availableTags = getAllTags(allVariables);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterScope('all');
    setFilterFunctions('all');
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    filterScope !== 'all' ||
    filterFunctions !== 'all' ||
    selectedTags.length > 0;

  return {
    searchQuery,
    setSearchQuery,
    filterScope,
    setFilterScope,
    filterFunctions,
    setFilterFunctions,
    selectedTags,
    setSelectedTags,
    filteredVariables,
    availableTags,
    clearFilters,
    toggleTag,
    hasActiveFilters,
  };
}
