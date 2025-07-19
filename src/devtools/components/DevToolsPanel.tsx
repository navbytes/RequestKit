import { useState, useEffect } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';
import { loggers } from '@/shared/utils/debug';

import { useAdvancedFiltering } from '../hooks/useAdvancedFiltering';
import { useExtensionStatus } from '../hooks/useExtensionStatus';
import { useNetworkRequests } from '../hooks/useNetworkRequests';
import type { ExtensionContextError } from '../types/request-analysis';

import { DevToolsHeader } from './DevToolsHeader';
import { PerformanceDashboard } from './performance/PerformanceDashboard';
import { RequestDetails } from './RequestDetails';
import { RequestsList } from './RequestsList';

interface DevToolsPanelProps {
  tabId?: number;
}

interface WindowWithPanel extends Window {
  initializePanel?: (data: unknown) => void;
}

// Get logger for this module
const logger = loggers.shared;

export function DevToolsPanel({ tabId }: DevToolsPanelProps) {
  const [filter, setFilter] = useState('');
  const [isRecording, setIsRecording] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'request' | 'response'>(
    'response'
  );
  const [selectedDetailTab, setSelectedDetailTab] = useState<
    'headers' | 'variables'
  >('headers');
  const [selectedMainTab, setSelectedMainTab] = useState<
    'requests' | 'performance'
  >('requests');

  // Custom hooks
  const { extensionStatus, switchProfile } = useExtensionStatus();
  const { requests, selectedRequest, setSelectedRequest, clearRequests } =
    useNetworkRequests(isRecording, extensionStatus);

  // Advanced filtering
  const {
    filterState,
    filteredRequests,
    filterResult,
    updateCriteria,
    clearFilters,
    toggleCollapsed,
    isFiltering,
  } = useAdvancedFiltering({
    requests: requests.map(req => ({
      ...req,
      domain: req.domain || new URL(req.url).hostname,
    })),
    autoFilter: true,
    debounceMs: 300,
  });

  useEffect(() => {
    logger.info('DevTools panel initialized for tab:', tabId);

    // Add global error handler for extension context invalidation
    const handleExtensionContextError = (error: ExtensionContextError) => {
      logger.error('Extension context error:', error);
    };

    // Check extension context periodically
    const contextCheckInterval = setInterval(() => {
      try {
        // Simple check if extension context is still valid
        if (!chrome.runtime || !chrome.runtime.id) {
          handleExtensionContextError(
            new Error('Extension context invalidated') as ExtensionContextError
          );
        }
      } catch (error) {
        handleExtensionContextError(error as ExtensionContextError);
      }
    }, 10000); // Check every 10 seconds

    // Initialize panel
    (window as WindowWithPanel).initializePanel = (data: unknown) => {
      logger.info('Panel initialized with data:', data);
    };

    return () => {
      // Cleanup
      clearInterval(contextCheckInterval);
      delete (window as WindowWithPanel).initializePanel;
    };
  }, [tabId]);

  // Use advanced filtering instead of basic filter
  const basicFilteredRequests = requests.filter(
    request =>
      request.url.toLowerCase().includes(filter.toLowerCase()) ||
      request.method.toLowerCase().includes(filter.toLowerCase())
  );

  // Use advanced filtered requests if available, otherwise fall back to basic filter
  const displayRequests =
    filteredRequests.length > 0 ? filteredRequests : basicFilteredRequests;

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const exportRequests = () => {
    const data = JSON.stringify(requests, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requestkit-requests-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearRequests = () => {
    clearRequests();
  };

  const handleSwitchProfile = async (profileId: string) => {
    await switchProfile(profileId);
    // Clear requests to show fresh data for new profile
    clearRequests();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <DevToolsHeader
        extensionStatus={extensionStatus}
        isRecording={isRecording}
        requestsCount={requests.length}
        onToggleRecording={toggleRecording}
        onClearRequests={handleClearRequests}
        onExportRequests={exportRequests}
        onSwitchProfile={handleSwitchProfile}
      />

      {/* Main Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              onClick={() => setSelectedMainTab('requests')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedMainTab === 'requests'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icon name="globe" className="w-4 h-4 mr-2 inline" />
              Network Requests
            </button>
            <button
              onClick={() => setSelectedMainTab('performance')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedMainTab === 'performance'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icon name="zap" className="w-4 h-4 mr-2 inline" />
              Performance
            </button>
          </div>

          {selectedMainTab === 'requests' && (
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Filter requests..."
                value={filter}
                onInput={e => setFilter((e.target as HTMLInputElement).value)}
                className="input w-full max-w-md"
              />
              {extensionStatus && (
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    Active Rules:{' '}
                    {
                      extensionStatus.rules.filter(
                        r =>
                          r.enabled &&
                          r.profileId === extensionStatus.activeProfile
                      ).length
                    }
                  </span>
                  <span>
                    Modified Requests:{' '}
                    {
                      requests.filter(
                        r =>
                          r.modifiedHeaders.request.length > 0 ||
                          r.modifiedHeaders.response.length > 0
                      ).length
                    }
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {selectedMainTab === 'performance' ? (
          <PerformanceDashboard className="w-full" />
        ) : (
          <>
            <RequestsList
              requests={displayRequests}
              selectedRequest={selectedRequest}
              onSelectRequest={setSelectedRequest}
              filterState={filterState}
              filterResult={filterResult}
              isFiltering={isFiltering}
              onUpdateCriteria={updateCriteria}
              onClearFilters={clearFilters}
              onToggleCollapsed={toggleCollapsed}
              isRecording={isRecording}
            />
            <RequestDetails
              selectedRequest={selectedRequest}
              selectedTab={selectedTab}
              selectedDetailTab={selectedDetailTab}
              onTabChange={setSelectedTab}
              onDetailTabChange={setSelectedDetailTab}
            />
          </>
        )}
      </div>
    </div>
  );
}
