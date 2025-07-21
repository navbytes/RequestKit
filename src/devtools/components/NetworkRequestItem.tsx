import { Icon } from '@/shared/components/Icon';
import { useI18n } from '@/shared/hooks/useI18n';

import type { FilterableRequest } from '../types/filtering';

interface NetworkRequest extends FilterableRequest {
  originalRequestHeaders?: Record<string, string>;
  originalResponseHeaders?: Record<string, string>;
  variableResolutionTrace?: unknown;
}

interface NetworkRequestItemProps {
  readonly request: NetworkRequest;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

function getMethodBadgeClass(method: string): string {
  switch (method) {
    case 'GET':
      return 'badge-primary';
    case 'POST':
      return 'badge-success';
    case 'PUT':
      return 'badge-warning';
    case 'DELETE':
      return 'badge-error';
    default:
      return 'badge-secondary';
  }
}

function getStatusBadgeClass(status: number): string {
  if (status >= 200 && status < 300) {
    return 'badge-success';
  } else if (status >= 300 && status < 400) {
    return 'badge-warning';
  } else if (status >= 400) {
    return 'badge-error';
  } else {
    return 'badge-secondary';
  }
}

function getBorderClass(
  hasModifications: boolean,
  hasRuleMatches: boolean
): string {
  if (hasModifications) {
    return 'border-l-blue-500';
  } else if (hasRuleMatches) {
    return 'border-l-yellow-500';
  } else {
    return 'border-l-transparent';
  }
}

function getBackgroundClass(isSelected: boolean): string {
  return isSelected
    ? 'bg-primary-100 dark:bg-primary-900'
    : 'hover:bg-gray-100 dark:hover:bg-gray-800';
}

export function NetworkRequestItem({
  request,
  isSelected,
  onSelect,
}: NetworkRequestItemProps) {
  const { t } = useI18n();
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
      className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${getBorderClass(
        hasModifications,
        hasRuleMatches
      )} ${getBackgroundClass(isSelected)}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`badge badge-sm ${getMethodBadgeClass(request.method)}`}
          >
            {request.method}
          </span>
          <span
            className={`badge badge-sm ${getStatusBadgeClass(request.status)}`}
          >
            {request.status}
          </span>
          {hasModifications && (
            <span className="badge badge-sm badge-info">
              <Icon name="wrench" className="w-3 h-3 mr-1" />
              {t('devtools_headers_modified')}
            </span>
          )}
          {hasRuleMatches && !hasModifications && (
            <span className="badge badge-sm badge-warning">
              <Icon name="target" className="w-3 h-3 mr-1" />
              {t('devtools_rules_matched')}
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
              {request.modifiedHeaders.response.length} res{' '}
              {t('common_headers')}
            </span>
          )}
          {hasRuleMatches && (
            <span className="ml-2">
              {request.matchedRules.length} {t('devtools_matched_rules_label')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
