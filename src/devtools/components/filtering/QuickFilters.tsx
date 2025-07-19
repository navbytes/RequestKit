/**
 * Quick Filters for RequestKit DevTools
 * One-click common filter combinations
 */

import { Icon, IconName } from '@/shared/components/Icon';

import { filterService } from '../../services/FilterService';
import type { FilterCriteria, QuickFilter } from '../../types/filtering';

interface QuickFiltersProps {
  onApplyFilter: (criteria: FilterCriteria) => void;
  activeCriteria: FilterCriteria;
  className?: string;
}

export function QuickFilters({
  onApplyFilter,
  activeCriteria,
  className = '',
}: Readonly<QuickFiltersProps>) {
  const quickFilters = filterService.getQuickFilters();

  const isFilterActive = (filter: QuickFilter): boolean => {
    // Check if the current criteria matches this quick filter
    const filterCriteria = filter.criteria;

    // Simple comparison - could be made more sophisticated
    if (filterCriteria.methods && activeCriteria.methods) {
      return (
        JSON.stringify(filterCriteria.methods.sort()) ===
        JSON.stringify(activeCriteria.methods.sort())
      );
    }

    if (filterCriteria.statusRanges && activeCriteria.statusRanges) {
      return (
        JSON.stringify(filterCriteria.statusRanges) ===
        JSON.stringify(activeCriteria.statusRanges)
      );
    }

    if (
      filterCriteria.hasModifications !== undefined &&
      activeCriteria.hasModifications !== undefined
    ) {
      return (
        filterCriteria.hasModifications === activeCriteria.hasModifications
      );
    }

    if (filterCriteria.urlPattern && activeCriteria.urlPattern) {
      return filterCriteria.urlPattern === activeCriteria.urlPattern;
    }

    return false;
  };

  const handleFilterClick = (filter: QuickFilter) => {
    if (isFilterActive(filter)) {
      // If filter is already active, clear it
      onApplyFilter({});
    } else {
      // Apply the filter
      onApplyFilter(filter.criteria);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="quick-filters-section"
          className="text-xs font-medium text-gray-700 dark:text-gray-300"
        >
          Quick Filters
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Click to toggle
        </span>
      </div>

      <div id="quick-filters-section" className="flex flex-wrap gap-2">
        {quickFilters.map(filter => {
          const isActive = isFilterActive(filter);

          return (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter)}
              className={`flex items-center space-x-2 px-3 py-2 text-xs rounded-lg border transition-all duration-200 ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700 shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              title={filter.description}
            >
              <Icon
                name={filter.icon as IconName}
                className={`w-3 h-3 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              />
              <span className="font-medium">{filter.name}</span>
              {isActive && (
                <Icon
                  name="check-circle"
                  className="w-3 h-3 text-blue-600 dark:text-blue-300"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Additional Quick Actions */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onApplyFilter({ hasModifications: true })}
            className={`flex items-center space-x-1 px-2 py-1 text-xs rounded border transition-colors ${
              activeCriteria.hasModifications
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="Show only requests with header modifications"
          >
            <Icon name="edit" className="w-3 h-3" />
            <span>Modified</span>
          </button>

          <button
            onClick={() => onApplyFilter({ hasRuleMatches: true })}
            className={`flex items-center space-x-1 px-2 py-1 text-xs rounded border transition-colors ${
              activeCriteria.hasRuleMatches
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="Show only requests that matched rules"
          >
            <Icon name="target" className="w-3 h-3" />
            <span>Matched</span>
          </button>

          <button
            onClick={() => onApplyFilter({ hasErrors: true })}
            className={`flex items-center space-x-1 px-2 py-1 text-xs rounded border transition-colors ${
              activeCriteria.hasErrors
                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="Show only requests with errors"
          >
            <Icon name="alert-circle" className="w-3 h-3" />
            <span>Errors</span>
          </button>
        </div>
      </div>
    </div>
  );
}
