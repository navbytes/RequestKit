import type { FilterableRequest } from '../types/filtering';
import type { VariableResolutionTrace } from '../types/resolution';

interface NetworkRequest extends FilterableRequest {
  originalRequestHeaders?: Record<string, string>;
  originalResponseHeaders?: Record<string, string>;
  variableResolutionTrace?: VariableResolutionTrace;
}

interface HeadersViewProps {
  request: NetworkRequest;
  selectedTab: 'request' | 'response';
  onTabChange: (tab: 'request' | 'response') => void;
}

export function HeadersView({
  request,
  selectedTab,
  onTabChange,
}: Readonly<HeadersViewProps>) {
  const headers =
    selectedTab === 'request'
      ? request.requestHeaders
      : request.responseHeaders;

  const modifiedHeaders =
    selectedTab === 'request'
      ? request.modifiedHeaders.request
      : request.modifiedHeaders.response;

  return (
    <div>
      <div className="flex space-x-1 mb-3">
        <button
          onClick={() => onTabChange('request')}
          className={`px-3 py-1 text-xs rounded ${
            selectedTab === 'request'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Request Headers ({Object.keys(request.requestHeaders).length})
        </button>
        <button
          onClick={() => onTabChange('response')}
          className={`px-3 py-1 text-xs rounded ${
            selectedTab === 'response'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Response Headers ({Object.keys(request.responseHeaders).length})
        </button>
      </div>

      <div className="code-block text-xs max-h-64 overflow-y-auto">
        {Object.entries(headers).length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">
            No {selectedTab} headers
          </div>
        ) : (
          Object.entries(headers).map(([key, value]) => {
            const isModified = modifiedHeaders.some(
              mod => mod.name?.toLowerCase() === key.toLowerCase()
            );
            const modification = modifiedHeaders.find(
              mod => mod.name?.toLowerCase() === key.toLowerCase()
            );

            return (
              <div key={key} className="mb-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-medium ${
                      isModified
                        ? 'text-orange-600 dark:text-orange-400'
                        : selectedTab === 'request'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {key}:
                  </span>
                  {isModified && (
                    <span className="badge badge-xs badge-warning">
                      {modification?.operation || 'modified'}
                    </span>
                  )}
                </div>
                <span className="text-gray-900 dark:text-white ml-2">
                  {value}
                </span>
                {isModified && modification?.ruleId && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    Rule: {modification.ruleId}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
