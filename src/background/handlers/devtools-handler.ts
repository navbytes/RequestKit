/**
 * DevTools-related message handler
 */

import { STORAGE_KEYS } from '@/config/constants';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

// DevTools specific interfaces
interface NetworkRequest {
  requestId: string;
  tabId: number;
  url: string;
  method: string;
  status: number;
  statusText?: string;
  timestamp: number;
  responseTime?: number;
  size?: number;
  mimeType?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}

interface DevToolsSettings {
  captureEnabled: boolean;
  maxRequests: number;
  autoRefresh: boolean;
  refreshInterval: number;
  showRequestDetails: boolean;
  showResponseHeaders: boolean;
  showRequestHeaders: boolean;
  showTiming: boolean;
  filters: {
    showSuccessful: boolean;
    showErrors: boolean;
    showRedirects: boolean;
    showCached: boolean;
  };
}

export class DevToolsHandler {
  /**
   * Handle DevTools-related messages
   */
  static async handleMessage(
    action: string,
    data: unknown,
    _sender: chrome.runtime.MessageSender
  ): Promise<unknown> {
    switch (action) {
      case 'getNetworkRequests':
        return await this.handleGetNetworkRequests(
          data as {
            tabId?: number;
            limit?: number;
            filter?: {
              url?: string;
              method?: string;
              status?: number;
              timeRange?: { start: number; end: number };
            };
          }
        );

      case 'clearNetworkRequests':
        return await this.handleClearNetworkRequests();

      case 'getRequestDetails':
        return await this.handleGetRequestDetails(
          data as { requestId: string }
        );

      case 'exportNetworkData':
        return await this.handleExportNetworkData(
          data as {
            format?: 'json' | 'csv' | 'har';
            filter?: unknown;
          }
        );

      case 'getPerformanceMetrics':
        return await this.handleGetPerformanceMetrics();

      case 'toggleRequestCapture':
        return await this.handleToggleRequestCapture(
          data as { enabled: boolean }
        );

      case 'getDevToolsSettings':
        return await this.handleGetDevToolsSettings();

      case 'updateDevToolsSettings':
        return await this.handleUpdateDevToolsSettings(
          data as { settings: unknown }
        );

      default:
        throw new Error(`Unknown DevTools action: ${action}`);
    }
  }

  /**
   * Get captured network requests
   */
  private static async handleGetNetworkRequests(data?: {
    tabId?: number;
    limit?: number;
    filter?: {
      url?: string;
      method?: string;
      status?: number;
      timeRange?: { start: number; end: number };
    };
  }): Promise<NetworkRequest[]> {
    try {
      const requestsData = await ChromeApiUtils.storage.local.get([
        STORAGE_KEYS.NETWORK_REQUESTS,
      ]);
      const allRequests =
        ((requestsData as Record<string, unknown>)[
          STORAGE_KEYS.NETWORK_REQUESTS
        ] as NetworkRequest[]) || [];

      let filteredRequests = allRequests;

      // Filter by tab ID if specified
      if (data?.tabId) {
        filteredRequests = filteredRequests.filter(
          req => req.tabId === data.tabId
        );
      }

      // Apply filters
      if (data?.filter) {
        const { url, method, status, timeRange } = data.filter;

        if (url) {
          filteredRequests = filteredRequests.filter(req =>
            req.url.toLowerCase().includes(url.toLowerCase())
          );
        }

        if (method) {
          filteredRequests = filteredRequests.filter(
            req => req.method.toLowerCase() === method.toLowerCase()
          );
        }

        if (status) {
          filteredRequests = filteredRequests.filter(
            req => req.status === status
          );
        }

        if (timeRange) {
          filteredRequests = filteredRequests.filter(
            req =>
              req.timestamp >= timeRange.start && req.timestamp <= timeRange.end
          );
        }
      }

      // Sort by timestamp (newest first)
      filteredRequests.sort((a, b) => b.timestamp - a.timestamp);

      // Apply limit
      if (data?.limit) {
        filteredRequests = filteredRequests.slice(0, data.limit);
      }

      return filteredRequests;
    } catch (error) {
      logger.error('Error getting network requests:', error);
      throw error;
    }
  }

  /**
   * Clear captured network requests
   */
  private static async handleClearNetworkRequests(): Promise<{
    success: boolean;
    cleared: number;
  }> {
    try {
      const requestsData = await ChromeApiUtils.storage.local.get([
        STORAGE_KEYS.NETWORK_REQUESTS,
      ]);
      const allRequests =
        ((requestsData as Record<string, unknown>)[
          STORAGE_KEYS.NETWORK_REQUESTS
        ] as unknown[]) || [];
      const clearedCount = allRequests.length;

      await ChromeApiUtils.storage.local.set({
        [STORAGE_KEYS.NETWORK_REQUESTS]: [],
      });

      return {
        success: true,
        cleared: clearedCount,
      };
    } catch (error) {
      logger.error('Error clearing network requests:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific request
   */
  private static async handleGetRequestDetails(data: {
    requestId: string;
  }): Promise<NetworkRequest | null> {
    try {
      const requestsData = await ChromeApiUtils.storage.local.get([
        STORAGE_KEYS.NETWORK_REQUESTS,
      ]);
      const allRequests =
        ((requestsData as Record<string, unknown>)[
          STORAGE_KEYS.NETWORK_REQUESTS
        ] as unknown[]) || [];

      const request = allRequests.find(
        req => (req as NetworkRequest).requestId === data.requestId
      );
      return (request as NetworkRequest) || null;
    } catch (error) {
      logger.error('Error getting request details:', error);
      throw error;
    }
  }

  /**
   * Export network data
   */
  private static async handleExportNetworkData(data?: {
    format?: 'json' | 'csv' | 'har';
    filter?: unknown;
  }): Promise<{ data: string; filename: string; mimeType: string }> {
    try {
      const requests = await this.handleGetNetworkRequests({
        filter: data?.filter as {
          url?: string;
          method?: string;
          status?: number;
          timeRange?: { start: number; end: number };
        },
      });
      const format = data?.format || 'json';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      switch (format) {
        case 'json':
          return {
            data: JSON.stringify(requests, null, 2),
            filename: `network-requests-${timestamp}.json`,
            mimeType: 'application/json',
          };

        case 'csv': {
          const csvData = this.convertToCSV(requests);
          return {
            data: csvData,
            filename: `network-requests-${timestamp}.csv`,
            mimeType: 'text/csv',
          };
        }

        case 'har': {
          const harData = this.convertToHAR(requests);
          return {
            data: JSON.stringify(harData, null, 2),
            filename: `network-requests-${timestamp}.har`,
            mimeType: 'application/json',
          };
        }

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      logger.error('Error exporting network data:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  private static async handleGetPerformanceMetrics(): Promise<{
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    requestsByMethod: Record<string, number>;
    requestsByStatus: Record<string, number>;
    topDomains: Array<{ domain: string; count: number }>;
  }> {
    try {
      const requests = await this.handleGetNetworkRequests();

      const metrics = {
        totalRequests: requests.length,
        averageResponseTime: 0,
        errorRate: 0,
        requestsByMethod: {} as Record<string, number>,
        requestsByStatus: {} as Record<string, number>,
        topDomains: [] as Array<{ domain: string; count: number }>,
      };

      if (requests.length === 0) {
        return metrics;
      }

      // Calculate average response time
      const responseTimes = requests
        .filter(req => req.responseTime)
        .map(req => req.responseTime)
        .filter((time): time is number => time !== undefined);

      if (responseTimes.length > 0) {
        metrics.averageResponseTime =
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }

      // Calculate error rate
      const errorRequests = requests.filter(req => req.status >= 400);
      metrics.errorRate = (errorRequests.length / requests.length) * 100;

      // Group by method
      requests.forEach(req => {
        const method = req.method || 'UNKNOWN';
        metrics.requestsByMethod[method] =
          (metrics.requestsByMethod[method] || 0) + 1;
      });

      // Group by status
      requests.forEach(req => {
        const status = req.status
          ? Math.floor(req.status / 100) * 100
          : 'UNKNOWN';
        const statusRange = status === 'UNKNOWN' ? 'UNKNOWN' : `${status}xx`;
        metrics.requestsByStatus[statusRange] =
          (metrics.requestsByStatus[statusRange] || 0) + 1;
      });

      // Top domains
      const domainCounts: Record<string, number> = {};
      requests.forEach(req => {
        try {
          const domain = new URL(req.url).hostname;
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        } catch {
          // Invalid URL, skip
        }
      });

      metrics.topDomains = Object.entries(domainCounts)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return metrics;
    } catch (error) {
      logger.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  /**
   * Toggle request capture
   */
  private static async handleToggleRequestCapture(data: {
    enabled: boolean;
  }): Promise<{ success: boolean; enabled: boolean }> {
    try {
      await ChromeApiUtils.storage.local.set({
        [STORAGE_KEYS.DEVTOOLS_CAPTURE_ENABLED]: data.enabled,
      });

      return {
        success: true,
        enabled: data.enabled,
      };
    } catch (error) {
      logger.error('Error toggling request capture:', error);
      throw error;
    }
  }

  /**
   * Get DevTools settings
   */
  private static async handleGetDevToolsSettings(): Promise<DevToolsSettings> {
    try {
      const settingsData = await ChromeApiUtils.storage.local.get([
        STORAGE_KEYS.DEVTOOLS_SETTINGS,
      ]);
      const defaultSettings = {
        captureEnabled: true,
        maxRequests: 1000,
        autoRefresh: true,
        refreshInterval: 5000,
        showRequestDetails: true,
        showResponseHeaders: true,
        showRequestHeaders: true,
        showTiming: true,
        filters: {
          showSuccessful: true,
          showErrors: true,
          showRedirects: true,
          showCached: true,
        },
      };

      return {
        ...defaultSettings,
        ...((settingsData as Record<string, unknown>)[
          STORAGE_KEYS.DEVTOOLS_SETTINGS
        ] as Partial<DevToolsSettings>),
      };
    } catch (error) {
      logger.error('Error getting DevTools settings:', error);
      throw error;
    }
  }

  /**
   * Update DevTools settings
   */
  private static async handleUpdateDevToolsSettings(data: {
    settings: unknown;
  }): Promise<{ success: boolean }> {
    try {
      const currentSettings = await this.handleGetDevToolsSettings();
      const updatedSettings = {
        ...currentSettings,
        ...(data.settings as Partial<DevToolsSettings>),
      };

      await ChromeApiUtils.storage.local.set({
        [STORAGE_KEYS.DEVTOOLS_SETTINGS]: updatedSettings,
      });

      return { success: true };
    } catch (error) {
      logger.error('Error updating DevTools settings:', error);
      throw error;
    }
  }

  /**
   * Convert requests to CSV format
   */
  private static convertToCSV(requests: NetworkRequest[]): string {
    if (requests.length === 0) {
      return 'No data available';
    }

    const headers = [
      'timestamp',
      'method',
      'url',
      'status',
      'responseTime',
      'size',
    ];
    const csvRows = [headers.join(',')];

    requests.forEach(req => {
      const row = [
        new Date(req.timestamp).toISOString(),
        req.method || '',
        `"${req.url || ''}"`,
        req.status || '',
        req.responseTime || '',
        req.size || '',
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Convert requests to HAR format
   */
  private static convertToHAR(requests: NetworkRequest[]): unknown {
    return {
      log: {
        version: '1.2',
        creator: {
          name: 'RequestKit',
          version: '1.0.0',
        },
        entries: requests.map(req => ({
          startedDateTime: new Date(req.timestamp).toISOString(),
          time: req.responseTime || 0,
          request: {
            method: req.method || 'GET',
            url: req.url || '',
            httpVersion: 'HTTP/1.1',
            headers: Object.entries(req.requestHeaders || {}).map(
              ([name, value]) => ({
                name,
                value: String(value),
              })
            ),
            queryString: [],
            cookies: [],
            headersSize: -1,
            bodySize: -1,
          },
          response: {
            status: req.status || 0,
            statusText: req.statusText || '',
            httpVersion: 'HTTP/1.1',
            headers: Object.entries(req.responseHeaders || {}).map(
              ([name, value]) => ({
                name,
                value: String(value),
              })
            ),
            cookies: [],
            content: {
              size: req.size || 0,
              mimeType: req.mimeType || 'text/plain',
            },
            redirectURL: '',
            headersSize: -1,
            bodySize: req.size || 0,
          },
          cache: {},
          timings: {
            blocked: -1,
            dns: -1,
            connect: -1,
            send: 0,
            wait: req.responseTime || 0,
            receive: 0,
            ssl: -1,
          },
        })),
      },
    };
  }
}
