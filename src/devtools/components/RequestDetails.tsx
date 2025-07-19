import { useI18n } from '@/shared/hooks/useI18n';

import type { FilterableRequest } from '../types/filtering';
import type { VariableResolutionTrace } from '../types/resolution';

import { HeadersView } from './HeadersView';
import { VariableResolutionViewer } from './VariableResolutionViewer';

interface NetworkRequest extends FilterableRequest {
  originalRequestHeaders?: Record<string, string>;
  originalResponseHeaders?: Record<string, string>;
  variableResolutionTrace?: VariableResolutionTrace;
}

interface RequestDetailsProps {
  readonly selectedRequest: NetworkRequest | null;
  readonly selectedTab: 'request' | 'response';
  readonly selectedDetailTab: 'headers' | 'variables';
  readonly onTabChange: (tab: 'request' | 'response') => void;
  readonly onDetailTabChange: (tab: 'headers' | 'variables') => void;
}

export function RequestDetails({
  selectedRequest,
  selectedTab,
  selectedDetailTab,
  onTabChange,
  onDetailTabChange,
}: RequestDetailsProps) {
  const { t } = useI18n();

  if (!selectedRequest) {
    return (
      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('devtools_request_details')}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('devtools_select_request')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/2 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('devtools_request_details')}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* URL */}
          <div>
            <div className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('devtools_url_label')}
            </div>
            <div className="code text-sm break-all">{selectedRequest.url}</div>
          </div>

          {/* Method & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('devtools_method_label')}
              </div>
              <div className="code text-sm">{selectedRequest.method}</div>
            </div>
            <div>
              <div className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('devtools_status_label')}
              </div>
              <div className="code text-sm">{selectedRequest.status}</div>
            </div>
          </div>

          {/* Detail Tabs */}
          <div>
            <div className="flex space-x-1 mb-3">
              <button
                onClick={() => onDetailTabChange('headers')}
                className={`px-3 py-1 text-xs rounded ${
                  selectedDetailTab === 'headers'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {t('devtools_headers_tab')}
              </button>
              {selectedRequest.variableResolutionTrace && (
                <button
                  onClick={() => onDetailTabChange('variables')}
                  className={`px-3 py-1 text-xs rounded ${
                    selectedDetailTab === 'variables'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {t('devtools_variable_resolution')}
                  <span className="ml-1 px-1 py-0.5 bg-blue-500 text-white text-xs rounded">
                    {selectedRequest.variableResolutionTrace.steps.length}
                  </span>
                </button>
              )}
            </div>

            {selectedDetailTab === 'headers' && (
              <HeadersView
                request={selectedRequest}
                selectedTab={selectedTab}
                onTabChange={onTabChange}
              />
            )}

            {selectedDetailTab === 'variables' &&
              selectedRequest.variableResolutionTrace && (
                <div className="h-96">
                  <VariableResolutionViewer
                    trace={selectedRequest.variableResolutionTrace}
                  />
                </div>
              )}

            {/* Profile and Rule Information */}
            {selectedRequest.profileId && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('devtools_profile_rules_info')}
                </div>
                <div className="space-y-1">
                  <div className="text-xs">
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      Profile:
                    </span>{' '}
                    <span className="text-gray-900 dark:text-white">
                      {selectedRequest.profileId}
                    </span>
                  </div>
                  {selectedRequest.matchedRules.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        Matched Rules:
                      </span>{' '}
                      <span className="text-gray-900 dark:text-white">
                        {selectedRequest.matchedRules.join(', ')}
                      </span>
                    </div>
                  )}
                  {selectedRequest.modifiedHeaders.request.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        Modified Request Headers:
                      </span>{' '}
                      <span className="text-gray-900 dark:text-white">
                        {selectedRequest.modifiedHeaders.request.length}
                      </span>
                    </div>
                  )}
                  {selectedRequest.modifiedHeaders.response.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-green-600 dark:text-green-400">
                        Modified Response Headers:
                      </span>{' '}
                      <span className="text-gray-900 dark:text-white">
                        {selectedRequest.modifiedHeaders.response.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div>
            <div className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('devtools_timestamp_label')}
            </div>
            <div className="code text-sm">
              {new Date(selectedRequest.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
