/**
 * Filter Criteria Selector for RequestKit DevTools
 * Multi-select components for various filter criteria
 */

import { ReactNode } from 'preact/compat';
import { useState } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';

import type { FilterCriteria } from '../../types/filtering';

interface FilterCriteriaSelectorProps {
  criteria: FilterCriteria;
  onChange: (criteria: Partial<FilterCriteria>) => void;
  mode?: 'basic' | 'advanced';
  className?: string;
}

const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
];

const STATUS_CODE_RANGES = [
  { label: '2xx Success', min: 200, max: 299 },
  { label: '3xx Redirect', min: 300, max: 399 },
  { label: '4xx Client Error', min: 400, max: 499 },
  { label: '5xx Server Error', min: 500, max: 599 },
];

const COMMON_STATUS_CODES = [
  200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 500, 502, 503,
];

export function FilterCriteriaSelector({
  criteria,
  onChange,
  mode = 'basic',
  className = '',
}: FilterCriteriaSelectorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['methods'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleMethodToggle = (method: string) => {
    // Ensure currentMethods is always an array
    const currentMethods = Array.isArray(criteria.methods)
      ? criteria.methods
      : [];

    // Check if method exists in the array
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];

    if (newMethods.length > 0) {
      onChange({ methods: newMethods });
    } else {
      onChange({ methods: undefined as string[] | undefined });
    }
  };

  const handleStatusCodeToggle = (code: number) => {
    // Ensure currentCodes is always an array
    const currentCodes = Array.isArray(criteria.statusCodes)
      ? criteria.statusCodes
      : [];

    // Check if code exists in the array
    const newCodes = currentCodes.includes(code)
      ? currentCodes.filter(c => c !== code)
      : [...currentCodes, code];

    if (newCodes.length > 0) {
      onChange({ statusCodes: newCodes });
    } else {
      onChange({ statusCodes: undefined as number[] | undefined });
    }
  };

  const handleStatusRangeToggle = (range: { min: number; max: number }) => {
    // Ensure currentRanges is always an array
    const currentRanges = Array.isArray(criteria.statusRanges)
      ? criteria.statusRanges
      : [];

    // Find existing range index
    const existingIndex = currentRanges.findIndex(
      r => r.min === range.min && r.max === range.max
    );

    const newRanges =
      existingIndex >= 0
        ? currentRanges.filter((_, i) => i !== existingIndex)
        : [...currentRanges, range];

    if (newRanges.length > 0) {
      onChange({ statusRanges: newRanges });
    } else {
      onChange({
        statusRanges: undefined as
          | Array<{ min: number; max: number }>
          | undefined,
      });
    }
  };

  const handleDomainInput = (value: string) => {
    const domains = value
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    // Always update the domains value, even if empty
    onChange({
      domains:
        domains.length > 0 ? domains : (undefined as string[] | undefined),
    });
  };

  const renderSection = (
    title: string,
    sectionKey: string,
    content: ReactNode
  ) => {
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          onClick={e => {
            // Prevent toggling if the click originated from an input element
            if (!(e.target as HTMLElement).closest('input, select, textarea')) {
              toggleSection(sectionKey);
            }
          }}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg"
        >
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </span>
          <Icon
            name="chevron-down"
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        {isExpanded && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            {content}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* HTTP Methods */}
      {renderSection(
        'HTTP Methods',
        'methods',
        <div className="flex flex-wrap gap-2">
          {HTTP_METHODS.map(method => (
            <button
              key={method}
              onClick={() => handleMethodToggle(method)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                Array.isArray(criteria.methods) &&
                criteria.methods.includes(method)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      )}

      {/* Status Codes */}
      {renderSection(
        'Status Codes',
        'status',
        <div className="space-y-3">
          {/* Status Ranges */}
          <div>
            <label
              htmlFor="devtools-status-ranges"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Status Ranges
            </label>
            <div id="devtools-status-ranges" className="flex flex-wrap gap-2">
              {STATUS_CODE_RANGES.map(range => (
                <button
                  key={`${range.min}-${range.max}`}
                  onClick={() => handleStatusRangeToggle(range)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    Array.isArray(criteria.statusRanges) &&
                    criteria.statusRanges.some(
                      r => r.min === range.min && r.max === range.max
                    )
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Individual Status Codes */}
          <div>
            <label
              htmlFor="devtools-specific-codes"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Specific Codes
            </label>
            <div id="devtools-specific-codes" className="flex flex-wrap gap-2">
              {COMMON_STATUS_CODES.map(code => (
                <button
                  key={code}
                  onClick={() => handleStatusCodeToggle(code)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    Array.isArray(criteria.statusCodes) &&
                    criteria.statusCodes.includes(code)
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Domains */}
      {renderSection(
        'Domains',
        'domains',
        <div>
          <input
            type="text"
            value={
              Array.isArray(criteria.domains) ? criteria.domains.join(', ') : ''
            }
            onChange={e => {
              e.stopPropagation();
              const inputValue = (e.target as HTMLInputElement).value;
              handleDomainInput(inputValue);
            }}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            onFocus={e => e.stopPropagation()}
            onBlur={e => {
              e.stopPropagation();
              // Ensure domains are properly formatted on blur
              handleDomainInput((e.target as HTMLInputElement).value);
            }}
            placeholder="example.com, api.service.com"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Separate multiple domains with commas
          </p>
        </div>
      )}

      {/* Rule Filters */}
      {renderSection(
        'Rule Matching',
        'rules',
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={criteria.hasRuleMatches === true}
                onChange={e =>
                  onChange({
                    hasRuleMatches: (e.target as HTMLInputElement).checked
                      ? true
                      : (undefined as boolean | undefined),
                  })
                }
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Has rule matches
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={criteria.hasModifications === true}
                onChange={e =>
                  onChange({
                    hasModifications: (e.target as HTMLInputElement).checked
                      ? true
                      : (undefined as boolean | undefined),
                  })
                }
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Has modifications
              </span>
            </label>
          </div>

          {mode === 'advanced' && (
            <div>
              <label
                htmlFor="devtools-modification-type"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Modification Type
              </label>
              <select
                id="devtools-modification-type"
                value={criteria.modificationType || ''}
                onChange={e => {
                  e.stopPropagation();
                  const value = (e.target as HTMLSelectElement).value;
                  onChange({
                    modificationType:
                      value === ''
                        ? undefined
                        : (value as 'request' | 'response' | 'both'),
                  });
                }}
                onClick={e => e.stopPropagation()}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any modification</option>
                <option value="request">Request headers only</option>
                <option value="response">Response headers only</option>
                <option value="both">Both request and response</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Error Filters */}
      {mode === 'advanced' &&
        renderSection(
          'Error Filtering',
          'errors',
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={criteria.hasErrors === true}
                onChange={e =>
                  onChange({
                    hasErrors: (e.target as HTMLInputElement).checked
                      ? true
                      : (undefined as boolean | undefined),
                  })
                }
                className="rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show only requests with errors
              </span>
            </label>
          </div>
        )}
    </div>
  );
}
