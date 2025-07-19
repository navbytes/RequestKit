import { Icon } from '@/shared/components/Icon';

import type { FilterableRequest } from '../types/filtering';

interface NetworkRequest extends FilterableRequest {
  originalRequestHeaders?: Record<string, string>;
  originalResponseHeaders?: Record<string, string>;
  variableResolutionTrace?: unknown;
}

interface NetworkRequestItemProps {
  request: NetworkRequest;
  isSelected: boolean;
  onSelect: () => void;
}

export function NetworkRequestItem({
  request,
  isSelected,
  onSelect,
}: NetworkRequestItemProps) {
  const hasModifications =
    request.modifiedHeaders.request.length > 0 ||
    request.modifiedHeaders.response.length > 0;
  const hasRuleMatches = request.matchedRules.length > 0;

  return (
    <div
      onClick={e => {
        e.preventDefault();
        onSelect();
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
        hasModifications
          ? 'border-l-blue-500'
          : hasRuleMatches
            ? 'border-l-yellow-500'
            : 'border-l-transparent'
      } ${
        isSelected
          ? 'bg-primary-100 dark:bg-primary-900'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`badge badge-sm ${
              request.method === 'GET'
                ? 'badge-primary'
                : request.method === 'POST'
                  ? 'badge-success'
                  : request.method === 'PUT'
                    ? 'badge-warning'
                    : request.method === 'DELETE'
                      ? 'badge-error'
                      : 'badge-secondary'
            }`}
          >
            {request.method}
          </span>
          <span
            className={`badge badge-sm ${
              request.status >= 200 && request.status < 300
                ? 'badge-success'
                : request.status >= 300 && request.status < 400
                  ? 'badge-warning'
                  : request.status >= 400
                    ? 'badge-error'
                    : 'badge-secondary'
            }`}
          >
            {request.status}
          </span>
          {hasModifications && (
            <span className="badge badge-sm badge-info">
              <Icon name="wrench" className="w-3 h-3 mr-1" />
              Modified
            </span>
          )}
          {hasRuleMatches && !hasModifications && (
            <span className="badge badge-sm badge-warning">
              <Icon name="target" className="w-3 h-3 mr-1" />
              Matched
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(request.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="mt-1 text-sm text-gray-900 dark:text-white truncate">
        {request.url}
      </div>
      {(hasModifications || hasRuleMatches) && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {hasModifications && (
            <span>
              {request.modifiedHeaders.request.length} req,{' '}
              {request.modifiedHeaders.response.length} res headers
            </span>
          )}
          {hasRuleMatches && (
            <span className="ml-2">
              {request.matchedRules.length} rule
              {request.matchedRules.length !== 1 ? 's' : ''} matched
            </span>
          )}
        </div>
      )}
    </div>
  );
}
