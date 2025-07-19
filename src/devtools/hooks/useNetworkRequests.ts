import { useState, useEffect, useCallback } from 'preact/hooks';

import { loggers } from '@/shared/utils/debug';

import type { FilterableRequest } from '../types/filtering';
import type {
  DevToolsRequestData,
  HeaderModificationResult,
} from '../types/request-analysis';
import type { VariableResolutionTrace } from '../types/resolution';

interface NetworkRequest extends FilterableRequest {
  originalRequestHeaders?: Record<string, string>;
  originalResponseHeaders?: Record<string, string>;
  variableResolutionTrace?: VariableResolutionTrace;
}

interface ExtensionStatus {
  enabled: boolean;
  activeProfile: string;
  profiles: unknown[];
  rules: unknown[];
}

interface HeaderModification {
  name: string;
  value: string;
  operation: string;
  ruleId: string;
  target: 'request' | 'response';
}

// Get logger for this module
const logger = loggers.shared;

export function useNetworkRequests(
  isRecording: boolean,
  extensionStatus: ExtensionStatus | null
) {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(
    null
  );

  // Analyze header modifications based on extension rules
  const analyzeHeaderModifications = useCallback(
    async (
      request: DevToolsRequestData,
      status: ExtensionStatus | null
    ): Promise<HeaderModificationResult> => {
      // Return empty result if no status or rules
      if (!status || !status.rules || status.rules.length === 0) {
        return {
          request: [],
          response: [],
        };
      }

      // Check if extension context is valid
      if (!chrome.runtime || !chrome.runtime.id) {
        logger.warn('Extension context is invalid, cannot analyze headers');
        return {
          request: [],
          response: [],
          error: 'Extension context invalidated',
        };
      }

      try {
        // Send request to background script for analysis
        const response = (await chrome.runtime.sendMessage({
          type: 'ANALYZE_REQUEST',
          requestData: {
            url: request.request?.url || request.url,
            method: request.request?.method || request.method || 'GET',
            headers: request.request?.headers || {},
            status: request.response?.status,
            responseHeaders: request.response?.headers || {},
          },
        })) as {
          success?: boolean;
          analysis?: {
            headerModifications?: Array<{
              name: string;
              value: string;
              operation: string;
              ruleId: string;
              target: 'request' | 'response';
            }>;
            matchedRules?: Array<{ ruleId: string }>;
            executionTime?: number;
          };
          error?: string;
        };

        if (response && response.success) {
          const analysis = response.analysis || {
            headerModifications: [],
            matchedRules: [],
          };

          // Ensure headerModifications exists and has the expected structure
          if (!analysis.headerModifications) {
            analysis.headerModifications = [];
          }

          return {
            request: Array.isArray(analysis.headerModifications)
              ? analysis.headerModifications.filter(
                  (mod: HeaderModification) => mod && mod.target === 'request'
                )
              : [],
            response: Array.isArray(analysis.headerModifications)
              ? analysis.headerModifications.filter(
                  (mod: HeaderModification) => mod && mod.target === 'response'
                )
              : [],
            matchedRules: Array.isArray(analysis.matchedRules)
              ? analysis.matchedRules
              : [],
            executionTime: analysis.executionTime || 0,
          };
        } else {
          logger.error('Failed to analyze request:', response?.error);
          return {
            request: [],
            response: [],
            error: response?.error || 'Unknown error',
          };
        }
      } catch (_error) {
        logger.error('Error analyzing header modifications:', _error);
        return {
          request: [],
          response: [],
          error: _error instanceof Error ? _error.message : 'Unknown error',
        };
      }
    },
    []
  );

  // Simulate variable resolution for demonstration
  const simulateVariableResolution = useCallback(
    async (
      request: DevToolsRequestData
    ): Promise<VariableResolutionTrace | null> => {
      // Safety check for request
      if (!request || !request.url) {
        logger.warn('Invalid request object for variable resolution');
        return null;
      }

      // Check if extension context is valid
      if (!chrome.runtime || !chrome.runtime.id) {
        logger.warn(
          'Extension context is invalid, cannot simulate variable resolution'
        );
        return null;
      }

      // This is a simulation for demonstration - in real implementation,
      // this would come from the actual variable resolution process
      const hasVariables =
        (typeof request.url === 'string' && request.url.includes('${')) ||
        (request.headers &&
          Object.values(request.headers || {}).some(
            (value: unknown) =>
              typeof value === 'string' && value.includes('${')
          ));

      if (!hasVariables) return null;

      // Return null for now - this would be implemented with actual variable resolution
      return null;
    },
    []
  );

  // Helper function to reconstruct original headers before extension modification
  const getOriginalHeaders = useCallback(
    async (
      currentHeaders: Record<string, string>,
      target: 'request' | 'response',
      request: DevToolsRequestData
    ): Promise<Record<string, string>> => {
      try {
        // Check if extension context is valid
        if (!chrome.runtime || !chrome.runtime.id) {
          logger.warn(
            'Extension context is invalid, cannot get original headers'
          );
          return currentHeaders;
        }

        // Get the header modifications that would have been applied
        const modifiedHeaders = await analyzeHeaderModifications(
          request,
          extensionStatus
        );
        const modifications =
          target === 'request'
            ? modifiedHeaders.request
            : modifiedHeaders.response;

        if (!Array.isArray(modifications) || modifications.length === 0) {
          // No modifications were made, current headers are original
          return currentHeaders;
        }

        // Reconstruct original headers by reversing the modifications
        const originalHeaders = { ...currentHeaders };

        for (const modification of modifications) {
          if (!modification || !modification.name) continue;

          switch (modification.operation) {
            case 'add':
            case 'set':
              // If header was added/set by extension, remove it to get original
              delete originalHeaders[modification.name];
              break;
            case 'remove':
              // If header was removed by extension, we can't recover the original value
              // Mark it as removed in the original headers
              originalHeaders[modification.name] = '[REMOVED BY EXTENSION]';
              break;
            case 'modify':
              // For modified headers, we can't easily determine the original value
              // Mark it as modified
              originalHeaders[modification.name] =
                `[MODIFIED BY EXTENSION] ${originalHeaders[modification.name] || ''}`;
              break;
            default:
              // Unknown operation, keep current value
              break;
          }
        }

        return originalHeaders;
      } catch (error) {
        logger.error('Error reconstructing original headers:', error);
        return currentHeaders;
      }
    },
    [analyzeHeaderModifications, extensionStatus]
  );

  const handleNetworkRequest = useCallback(
    async (request: DevToolsRequestData) => {
      if (!isRecording) return;

      try {
        // Safety check for request structure
        if (!request || !request.request || !request.response) {
          logger.warn('Invalid request object received');
          return;
        }

        // Extract request and response headers
        const requestHeaders =
          request.request?.headers?.reduce(
            (
              acc: Record<string, string>,
              header: { name: string; value: string }
            ) => {
              if (header && header.name) {
                acc[header.name] = header.value || '';
              }
              return acc;
            },
            {}
          ) || {};

        const responseHeaders =
          request.response?.headers?.reduce(
            (
              acc: Record<string, string>,
              header: { name: string; value: string }
            ) => {
              if (header && header.name) {
                acc[header.name] = header.value || '';
              }
              return acc;
            },
            {}
          ) || {};

        // Get original headers before modification by analyzing what the extension would have changed
        const originalRequestHeaders = await getOriginalHeaders(
          requestHeaders,
          'request',
          request
        );
        const originalResponseHeaders = await getOriginalHeaders(
          responseHeaders,
          'response',
          request
        );

        // Check for header modifications by comparing with extension rules
        const modifiedHeaders = await analyzeHeaderModifications(
          request,
          extensionStatus
        );

        // Simulate variable resolution for demonstration
        const variableTrace = await simulateVariableResolution(request);

        // Create domain safely
        let domain = '';
        try {
          domain = new URL(request.request.url).hostname;
        } catch {
          logger.warn('Invalid URL in request:', request.request.url);
          domain = 'unknown-domain';
        }

        const networkRequest: NetworkRequest = {
          id: `${Date.now()}_${Math.random()}`,
          url: request.request.url || '',
          method: request.request.method || 'GET',
          status: request.response.status || 0,
          domain,
          requestHeaders,
          responseHeaders,
          originalRequestHeaders,
          originalResponseHeaders,
          modifiedHeaders: {
            request: Array.isArray(modifiedHeaders.request)
              ? modifiedHeaders.request
              : [],
            response: Array.isArray(modifiedHeaders.response)
              ? modifiedHeaders.response
              : [],
          },
          matchedRules: Array.isArray(modifiedHeaders.matchedRules)
            ? modifiedHeaders.matchedRules.map(
                (rule: { ruleId: string }) => rule.ruleId
              )
            : [],
          profileId: extensionStatus?.activeProfile || 'unknown',
          timestamp: new Date(),
          ...(variableTrace && { variableResolutionTrace: variableTrace }),
        };

        setRequests(prev => [...prev, networkRequest]);
      } catch (error) {
        logger.error('Error processing network request:', error);
      }
    },
    [
      isRecording,
      extensionStatus,
      analyzeHeaderModifications,
      simulateVariableResolution,
      getOriginalHeaders,
    ]
  );

  const clearRequests = useCallback(() => {
    setRequests([]);
    setSelectedRequest(null);
  }, []);

  const handleNavigation = useCallback(
    (url: string) => {
      logger.info('Navigation to:', url);
      if (isRecording) {
        setRequests([]); // Clear requests on navigation
      }
    },
    [isRecording]
  );

  useEffect(() => {
    // Set up global handlers for DevTools communication
    (
      window as Window & {
        handleNetworkRequest?: typeof handleNetworkRequest;
        handleNavigation?: typeof handleNavigation;
      }
    ).handleNetworkRequest = handleNetworkRequest;
    (
      window as Window & {
        handleNetworkRequest?: typeof handleNetworkRequest;
        handleNavigation?: typeof handleNavigation;
      }
    ).handleNavigation = handleNavigation;

    return () => {
      // Cleanup
      const globalWindow = window as Window & {
        handleNetworkRequest?: typeof handleNetworkRequest;
        handleNavigation?: typeof handleNavigation;
      };
      delete globalWindow.handleNetworkRequest;
      delete globalWindow.handleNavigation;
    };
  }, [handleNetworkRequest, handleNavigation]);

  return {
    requests,
    selectedRequest,
    setSelectedRequest,
    clearRequests,
  };
}
