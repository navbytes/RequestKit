/**
 * Advanced Filter Panel for RequestKit DevTools
 * Main collapsible panel containing all filtering controls
 */

import { useState } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';

import type { FilterCriteria, FilterResult } from '../../types/filtering';

import { FilterCriteriaSelector } from './FilterCriteriaSelector';
import { FilterPresets } from './FilterPresets';
import { QuickFilters } from './QuickFilters';
import { RegexSearchInput } from './RegexSearchInput';
import { TimeRangeSelector } from './TimeRangeSelector';

interface AdvancedFilterPanelProps {
  criteria: FilterCriteria;
  onCriteriaChange: (criteria: Partial<FilterCriteria>) => void;
  onClearFilters: () => void;
  filterResult: FilterResult | null;
  isFiltering: boolean;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  className?: string;
}

export function AdvancedFilterPanel({
  criteria,
  onCriteriaChange,
  onClearFilters,
  filterResult,
  isFiltering,
  isCollapsed = false,
  onToggleCollapsed,
  className = '',
}: Readonly<AdvancedFilterPanelProps>) {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'presets'>(
    'basic'
  );

  const hasActiveFilters = Object.keys(criteria).some(key => {
    const value = criteria[key as keyof FilterCriteria];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'boolean') return value;
    if (value && typeof value === 'object') return true;
    return false;
  });

  const handleTabChange = (tab: 'basic' | 'advanced' | 'presets') => {
    setActiveTab(tab);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleCollapsed}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title={isCollapsed ? 'Expand filters' : 'Collapse filters'}
          >
            <Icon
              name={isCollapsed ? 'chevron-right' : 'chevron-down'}
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
            />
          </button>

          <div className="flex items-center space-x-2">
            <Icon
              name="filter"
              className="w-4 h-4 text-gray-600 dark:text-gray-300"
            />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {filterResult && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {filterResult.filteredCount} of {filterResult.totalCount} requests
              {filterResult.executionTime > 0 && (
                <span className="ml-1">
                  ({filterResult.executionTime.toFixed(1)}ms)
                </span>
              )}
            </div>
          )}

          {isFiltering && (
            <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Filtering...</span>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Clear all filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-3">
          {/* Quick Filters */}
          <div className="mb-4">
            <QuickFilters
              onApplyFilter={quickCriteria => onCriteriaChange(quickCriteria)}
              activeCriteria={criteria}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleTabChange('basic')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'basic'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon name="search" className="w-4 h-4 mr-2 inline" />
              Basic
            </button>
            <button
              onClick={() => handleTabChange('advanced')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'advanced'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon name="settings" className="w-4 h-4 mr-2 inline" />
              Advanced
            </button>
            <button
              onClick={() => handleTabChange('presets')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'presets'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon name="save" className="w-4 h-4 mr-2 inline" />
              Presets
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'basic' && (
              <>
                {/* URL and Header Search */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="devtools-url-pattern"
                      className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      URL Pattern
                    </label>
                    <RegexSearchInput
                      value={criteria.urlPattern || ''}
                      onChange={pattern =>
                        onCriteriaChange({ urlPattern: pattern })
                      }
                      onRegexToggle={useRegex => onCriteriaChange({ useRegex })}
                      useRegex={criteria.useRegex || false}
                      placeholder="Filter by URL pattern..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="devtools-header-pattern"
                      className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Header Pattern
                    </label>
                    <RegexSearchInput
                      value={criteria.headerPattern || ''}
                      onChange={pattern =>
                        onCriteriaChange({ headerPattern: pattern })
                      }
                      onRegexToggle={useRegex => onCriteriaChange({ useRegex })}
                      useRegex={criteria.useRegex || false}
                      placeholder="Filter by header name/value..."
                    />
                  </div>
                </div>

                {/* Basic Criteria */}
                <FilterCriteriaSelector
                  criteria={criteria}
                  onChange={onCriteriaChange}
                  mode="basic"
                />
              </>
            )}

            {activeTab === 'advanced' && (
              <>
                {/* Time Range */}
                <div>
                  <label
                    htmlFor="devtools-time-range"
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Time Range
                  </label>
                  <TimeRangeSelector
                    value={criteria.timeRange}
                    onChange={timeRange => onCriteriaChange({ timeRange })}
                  />
                </div>

                {/* Advanced Criteria */}
                <FilterCriteriaSelector
                  criteria={criteria}
                  onChange={onCriteriaChange}
                  mode="advanced"
                />
              </>
            )}

            {activeTab === 'presets' && (
              <FilterPresets
                currentCriteria={criteria}
                onLoadPreset={presetCriteria =>
                  onCriteriaChange(presetCriteria)
                }
                onClearFilters={onClearFilters}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
