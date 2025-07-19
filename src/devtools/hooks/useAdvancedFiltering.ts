/**
 * Advanced filtering hook for RequestKit DevTools
 * Manages filter state and provides filtering functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'preact/hooks';

import { loggers } from '@/shared/utils/debug';

import { filterService } from '../services/FilterService';
import type {
  FilterCriteria,
  FilterableRequest,
  FilterResult,
  FilterState,
  FilterPreset,
  QuickFilter,
} from '../types/filtering';

interface UseAdvancedFilteringOptions {
  requests: FilterableRequest[];
  initialCriteria?: FilterCriteria;
  autoFilter?: boolean;
  debounceMs?: number;
}

interface UseAdvancedFilteringReturn {
  // Filter state
  filterState: FilterState;
  filteredRequests: FilterableRequest[];
  filterResult: FilterResult | null;

  // Filter actions
  updateCriteria: (criteria: Partial<FilterCriteria>) => void;
  clearFilters: () => void;
  resetFilters: () => void;

  // Preset management
  presets: FilterPreset[];
  loadPreset: (presetId: string) => void;
  saveCurrentAsPreset: (name: string, description?: string) => void;
  deletePreset: (presetId: string) => void;

  // Quick filters
  quickFilters: QuickFilter[];
  applyQuickFilter: (filterId: string) => void;

  // UI state
  toggleAdvancedMode: () => void;
  toggleCollapsed: () => void;

  // Performance
  isFiltering: boolean;
  filterPerformance: {
    executionTime: number;
    resultCount: number;
  };
}

// Get logger for this module
const logger = loggers.shared;

export function useAdvancedFiltering({
  requests,
  initialCriteria = {},
  autoFilter = true,
  debounceMs = 300,
}: UseAdvancedFilteringOptions): UseAdvancedFilteringReturn {
  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    activeCriteria: initialCriteria,
    activePreset: undefined,
    searchHistory: [],
    isAdvancedMode: false,
    isCollapsed: false,
  });

  const [filterResult, setFilterResult] = useState<FilterResult | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Load presets on mount
  useEffect(() => {
    setPresets(filterService.getPresets());
  }, []);

  // Debounced filtering
  const performFiltering = useCallback(
    async (criteria: FilterCriteria) => {
      if (!autoFilter) return;

      setIsFiltering(true);
      try {
        const result = await filterService.filterRequests(requests, criteria);
        setFilterResult(result);
      } catch (error) {
        logger.error('Filtering failed:', error);
        setFilterResult(null);
      } finally {
        setIsFiltering(false);
      }
    },
    [requests, autoFilter]
  );

  // Debounced filter execution
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      performFiltering(filterState.activeCriteria);
    }, debounceMs);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [filterState.activeCriteria, performFiltering, debounceMs, debounceTimer]);

  // Update filter criteria
  const updateCriteria = useCallback((newCriteria: Partial<FilterCriteria>) => {
    setFilterState(prev => {
      // Check if the new criteria actually changes anything
      const hasChanges = Object.entries(newCriteria).some(([key, value]) => {
        const currentValue = prev.activeCriteria[key as keyof FilterCriteria];

        // Special handling for undefined values
        if (value === undefined && currentValue !== undefined) return true;
        if (value !== undefined && currentValue === undefined) return true;

        // Handle arrays - with additional safety checks
        if (Array.isArray(value)) {
          // If current value is not an array but new value is, that's a change
          if (!Array.isArray(currentValue)) return true;

          // First check length
          if (value.length !== currentValue.length) return true;

          // Skip empty arrays
          if (value.length === 0) return false;

          // For domains specifically, we need to check content regardless of order
          if (key === 'domains') {
            // Create sorted copies to compare
            const sortedValue = [...value].sort();
            const sortedCurrent = [...currentValue].sort();
            return sortedValue.some((v, i) => v !== sortedCurrent[i]);
          }

          // For other arrays, check in order
          return value.some((v, i) => v !== currentValue[i]);
        }

        // If current value is an array but new value is not, that's a change
        if (Array.isArray(currentValue)) return true;

        return value !== currentValue;
      });

      // Only update state if there are actual changes
      if (hasChanges) {
        return {
          ...prev,
          activeCriteria: { ...prev.activeCriteria, ...newCriteria },
          activePreset: undefined, // Clear active preset when manually changing criteria
        };
      }

      return prev;
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      activeCriteria: {},
      activePreset: undefined,
    }));
    setFilterResult(null);
  }, []);

  // Reset to initial criteria
  const resetFilters = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      activeCriteria: initialCriteria,
      activePreset: undefined,
    }));
  }, [initialCriteria]);

  // Load preset
  const loadPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find(p => p.id === presetId);
      if (preset) {
        setFilterState(prev => ({
          ...prev,
          activeCriteria: preset.criteria,
          activePreset: presetId,
        }));

        // Update last used timestamp
        filterService.updatePreset(presetId, { lastUsed: new Date() });
        setPresets(filterService.getPresets());
      }
    },
    [presets]
  );

  // Save current criteria as preset
  const saveCurrentAsPreset = useCallback(
    (name: string, description?: string) => {
      const newPreset = filterService.savePreset({
        name,
        description,
        criteria: filterState.activeCriteria,
      });
      setPresets(filterService.getPresets());

      setFilterState(prev => ({
        ...prev,
        activePreset: newPreset.id,
      }));
    },
    [filterState.activeCriteria]
  );

  // Delete preset
  const deletePreset = useCallback((presetId: string) => {
    const success = filterService.deletePreset(presetId);
    if (success) {
      setPresets(filterService.getPresets());

      // Clear active preset if it was deleted
      setFilterState(prev => ({
        ...prev,
        activePreset:
          prev.activePreset === presetId ? undefined : prev.activePreset,
      }));
    }
  }, []);

  // Get quick filters
  const quickFilters = useMemo(() => filterService.getQuickFilters(), []);

  // Apply quick filter
  const applyQuickFilter = useCallback(
    (filterId: string) => {
      const quickFilter = quickFilters.find(f => f.id === filterId);
      if (quickFilter) {
        setFilterState(prev => ({
          ...prev,
          activeCriteria: quickFilter.criteria,
          activePreset: undefined,
        }));
      }
    },
    [quickFilters]
  );

  // Toggle advanced mode
  const toggleAdvancedMode = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      isAdvancedMode: !prev.isAdvancedMode,
    }));
  }, []);

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      isCollapsed: !prev.isCollapsed,
    }));
  }, []);

  // Get filtered requests
  const filteredRequests = useMemo(() => {
    // Return all requests if no filter result or if matchedRequests is undefined
    if (!filterResult || !Array.isArray(filterResult.matchedRequests)) {
      return requests;
    }

    // Filter requests based on matched IDs
    return requests.filter(request =>
      filterResult.matchedRequests.includes(request.id)
    );
  }, [requests, filterResult]);

  // Performance metrics
  const filterPerformance = useMemo(
    () => ({
      executionTime: filterResult?.executionTime || 0,
      resultCount: filterResult?.filteredCount || requests.length,
    }),
    [filterResult, requests.length]
  );

  return {
    // Filter state
    filterState,
    filteredRequests,
    filterResult,

    // Filter actions
    updateCriteria,
    clearFilters,
    resetFilters,

    // Preset management
    presets,
    loadPreset,
    saveCurrentAsPreset,
    deletePreset,

    // Quick filters
    quickFilters,
    applyQuickFilter,

    // UI state
    toggleAdvancedMode,
    toggleCollapsed,

    // Performance
    isFiltering,
    filterPerformance,
  };
}
