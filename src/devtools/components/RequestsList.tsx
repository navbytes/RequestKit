import { useI18n } from '@/shared/hooks/useI18n';

import type {
  FilterableRequest,
  FilterState,
  FilterResult,
  FilterCriteria,
} from '../types/filtering';
import type { VariableResolutionTrace } from '../types/resolution';

import { AdvancedFilterPanel } from './filtering/AdvancedFilterPanel';
import { NetworkRequestItem } from './NetworkRequestItem';

interface NetworkRequest extends FilterableRequest {
  originalRequestHeaders?: Record<string, string>;
  originalResponseHeaders?: Record<string, string>;
  variableResolutionTrace?: VariableResolutionTrace;
}

interface RequestsListProps {
  readonly requests: NetworkRequest[];
  readonly selectedRequest: NetworkRequest | null;
  readonly onSelectRequest: (request: NetworkRequest) => void;
  readonly filterState: FilterState;
  readonly filterResult: FilterResult | null;
  readonly isFiltering: boolean;
  readonly onUpdateCriteria: (criteria: FilterCriteria) => void;
  readonly onClearFilters: () => void;
  readonly onToggleCollapsed: () => void;
  readonly isRecording: boolean;
}

export function RequestsList({
  requests,
  selectedRequest,
  onSelectRequest,
  filterState,
  filterResult,
  isFiltering,
  onUpdateCriteria,
  onClearFilters,
  onToggleCollapsed,
  isRecording,
}: RequestsListProps) {
  const { t } = useI18n();

  return (
    <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        criteria={filterState.activeCriteria}
        onCriteriaChange={onUpdateCriteria}
        onClearFilters={onClearFilters}
        onToggleCollapsed={onToggleCollapsed}
        filterResult={filterResult}
        isFiltering={isFiltering}
        isCollapsed={filterState.isCollapsed}
      />

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('devtools_network_requests')} ({requests.length})
          {filterResult &&
            filterResult.filteredCount !== filterResult.totalCount && (
              <span className="ml-2 text-xs text-gray-500">
                (filtered from {filterResult.totalCount})
              </span>
            )}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {isRecording
              ? t('devtools_no_requests_captured')
              : t('devtools_recording_stopped')}
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {requests.map(request => (
              <NetworkRequestItem
                key={request.id}
                request={request}
                isSelected={selectedRequest?.id === request.id}
                onSelect={() => onSelectRequest(request)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
