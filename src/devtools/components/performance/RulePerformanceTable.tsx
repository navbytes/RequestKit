// Rule performance table component
import { useState, useMemo } from 'preact/hooks';

import { Icon, IconName } from '@/shared/components/Icon';

import type { RulePerformanceStats } from '../../types/performance';

interface RulePerformanceTableProps {
  data: RulePerformanceStats[];
  className?: string;
}

type SortField =
  | 'ruleName'
  | 'totalExecutions'
  | 'averageExecutionTime'
  | 'successRate'
  | 'errorCount'
  | 'lastExecuted';
type SortDirection = 'asc' | 'desc';

export function RulePerformanceTable({
  data,
  className = '',
}: Readonly<RulePerformanceTableProps>) {
  const [sortField, setSortField] = useState<SortField>('averageExecutionTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort and filter data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(
        rule =>
          rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.ruleId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] ?? '';
      let bValue: string | number = b[sortField] ?? '';

      // Handle special cases
      if (sortField === 'lastExecuted') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [data, sortField, sortDirection, searchTerm]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField): IconName => {
    if (sortField !== field) {
      return 'chevron-up-down';
    }
    return sortDirection === 'asc' ? 'chevron-up' : 'chevron-down';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPerformanceColor = (executionTime: number) => {
    if (executionTime < 5) return 'text-green-600 dark:text-green-400';
    if (executionTime < 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.95) return 'text-green-600 dark:text-green-400';
    if (rate >= 0.8) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">
          <Icon
            name="bar-chart"
            className="w-12 h-12 mx-auto mb-3 opacity-50"
          />
          <div className="text-lg font-medium">No Rule Performance Data</div>
          <div className="text-sm mt-1">
            Performance data will appear here once rules start executing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Search and Controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="relative">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search rules..."
            value={searchTerm}
            onChange={e => setSearchTerm((e.target as HTMLInputElement).value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {processedData.length} of {data.length} rules
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="text-left p-3 border-b border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleSort('ruleName')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <span>Rule Name</span>
                  <Icon name={getSortIcon('ruleName')} className="w-4 h-4" />
                </button>
              </th>

              <th className="text-right p-3 border-b border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleSort('totalExecutions')}
                  className="flex items-center justify-end space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full"
                >
                  <span>Executions</span>
                  <Icon
                    name={getSortIcon('totalExecutions')}
                    className="w-4 h-4"
                  />
                </button>
              </th>

              <th className="text-right p-3 border-b border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleSort('averageExecutionTime')}
                  className="flex items-center justify-end space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full"
                >
                  <span>Avg Time</span>
                  <Icon
                    name={getSortIcon('averageExecutionTime')}
                    className="w-4 h-4"
                  />
                </button>
              </th>

              <th className="text-right p-3 border-b border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Min/Max
                </span>
              </th>

              <th className="text-right p-3 border-b border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleSort('successRate')}
                  className="flex items-center justify-end space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full"
                >
                  <span>Success Rate</span>
                  <Icon name={getSortIcon('successRate')} className="w-4 h-4" />
                </button>
              </th>

              <th className="text-right p-3 border-b border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleSort('errorCount')}
                  className="flex items-center justify-end space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full"
                >
                  <span>Errors</span>
                  <Icon name={getSortIcon('errorCount')} className="w-4 h-4" />
                </button>
              </th>

              <th className="text-right p-3 border-b border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleSort('lastExecuted')}
                  className="flex items-center justify-end space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full"
                >
                  <span>Last Executed</span>
                  <Icon
                    name={getSortIcon('lastExecuted')}
                    className="w-4 h-4"
                  />
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {processedData.map((rule, index) => (
              <tr
                key={rule.ruleId}
                className={`border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  index % 2 === 0
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-gray-50 dark:bg-gray-750'
                }`}
              >
                <td className="p-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {rule.ruleName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {rule.ruleId}
                    </div>
                  </div>
                </td>

                <td className="p-3 text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {rule.totalExecutions.toLocaleString()}
                  </span>
                </td>

                <td className="p-3 text-right">
                  <span
                    className={`text-sm font-medium ${getPerformanceColor(rule.averageExecutionTime)}`}
                  >
                    {formatDuration(rule.averageExecutionTime)}
                  </span>
                </td>

                <td className="p-3 text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <div>{formatDuration(rule.minExecutionTime)}</div>
                    <div>{formatDuration(rule.maxExecutionTime)}</div>
                  </div>
                </td>

                <td className="p-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <span
                      className={`text-sm font-medium ${getSuccessRateColor(rule.successRate)}`}
                    >
                      {(rule.successRate * 100).toFixed(1)}%
                    </span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          rule.successRate >= 0.95
                            ? 'bg-green-500'
                            : rule.successRate >= 0.8
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${rule.successRate * 100}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="p-3 text-right">
                  <span
                    className={`text-sm font-medium ${rule.errorCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {rule.errorCount}
                  </span>
                </td>

                <td className="p-3 text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(rule.lastExecuted)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {processedData.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            <Icon name="search" className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">
              No rules found matching &quot;{searchTerm}&quot;
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
