// Advanced DevTools integration for RequestKit
import type { HeaderRule, HeaderEntry } from '@/shared/types/rules';

// DevTools API type definitions
interface DevToolsNetworkRequest {
  request: {
    url: string;
    method: string;
    headers: Array<{ name: string; value: string }>;
    postData?: { text: string };
    resourceType?: string;
  };
  response: {
    status: number;
    statusText: string;
    headers: Array<{ name: string; value: string }>;
  };
  time: number;
}

// Removed unused PerformanceMemory interface

interface DiffResult {
  added: Record<string, unknown>;
  modified: Record<string, { from: unknown; to: unknown }>;
  removed: Record<string, unknown>;
}

export interface DevToolsRequest {
  requestId: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string | ArrayBuffer;
  timestamp: number;
  resourceType: string;
}

export interface DevToolsResponse {
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: string | ArrayBuffer;
  timestamp: number;
  responseTime: number;
}

export interface ModificationPreview {
  requestId: string;
  originalRequest: DevToolsRequest;
  modifiedRequest: DevToolsRequest;
  originalResponse?: DevToolsResponse;
  modifiedResponse?: DevToolsResponse;
  appliedRules: HeaderRule[];
  modifications: {
    addedHeaders: HeaderEntry[];
    modifiedHeaders: HeaderEntry[];
    removedHeaders: string[];
  };
}

export interface NetworkTimelineEntry {
  requestId: string;
  url: string;
  method: string;
  status?: number;
  startTime: number;
  endTime?: number;
  responseTime?: number;
  size?: number;
  appliedRules: string[];
  modifications: number;
  performanceImpact: {
    processingTime: number;
    memoryUsage: number;
    cacheHits: number;
  };
}

export interface DevToolsMetrics {
  totalRequests: number;
  modifiedRequests: number;
  averageProcessingTime: number;
  totalRulesApplied: number;
  performanceImpact: {
    averageDelay: number;
    memoryUsage: number;
    cacheEfficiency: number;
  };
  errorRate: number;
}

export class DevToolsIntegration {
  private static instance: DevToolsIntegration;
  private requests: Map<string, DevToolsRequest> = new Map();
  private responses: Map<string, DevToolsResponse> = new Map();
  private modifications: Map<string, ModificationPreview> = new Map();
  private timeline: NetworkTimelineEntry[] = [];
  private metrics: DevToolsMetrics = {
    totalRequests: 0,
    modifiedRequests: 0,
    averageProcessingTime: 0,
    totalRulesApplied: 0,
    performanceImpact: {
      averageDelay: 0,
      memoryUsage: 0,
      cacheEfficiency: 0,
    },
    errorRate: 0,
  };

  static getInstance(): DevToolsIntegration {
    if (!DevToolsIntegration.instance) {
      DevToolsIntegration.instance = new DevToolsIntegration();
    }
    return DevToolsIntegration.instance;
  }

  /**
   * Initialize DevTools integration
   */
  initialize(): void {
    if (typeof chrome !== 'undefined' && chrome.devtools) {
      this.setupNetworkListener();
      this.setupConsoleIntegration();
      this.setupPerformanceMonitoring();
    }
  }

  /**
   * Setup network request/response listener
   */
  private setupNetworkListener(): void {
    if (!chrome.devtools?.network) return;

    chrome.devtools.network.onRequestFinished.addListener(request => {
      this.handleNetworkRequest(request as unknown as DevToolsNetworkRequest);
    });

    chrome.devtools.network.onNavigated.addListener(() => {
      this.clearSession();
    });
  }

  /**
   * Setup console integration for debugging
   */
  private setupConsoleIntegration(): void {
    // Add RequestKit-specific console commands
    this.addConsoleCommands();
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor performance impact of header modifications
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 5000);
  }

  /**
   * Handle network request from DevTools
   */
  private handleNetworkRequest(request: DevToolsNetworkRequest): void {
    const devToolsRequest: DevToolsRequest = {
      requestId: `${request.request.url}_${Date.now()}`,
      url: request.request.url,
      method: request.request.method,
      headers: this.parseHeaders(request.request.headers),
      ...(request.request.postData?.text && {
        body: request.request.postData.text,
      }),
      timestamp: Date.now(),
      resourceType: request.request.resourceType ?? 'other',
    };

    const devToolsResponse: DevToolsResponse = {
      requestId: devToolsRequest.requestId,
      status: request.response.status,
      statusText: request.response.statusText,
      headers: this.parseHeaders(request.response.headers),
      timestamp: Date.now(),
      responseTime: request.time,
    };

    this.requests.set(devToolsRequest.requestId, devToolsRequest);
    this.responses.set(devToolsRequest.requestId, devToolsResponse);

    // Check for applied modifications
    this.analyzeModifications(devToolsRequest, devToolsResponse);

    // Update timeline
    this.updateTimeline(devToolsRequest, devToolsResponse);

    // Update metrics
    this.updateMetrics();
  }

  /**
   * Parse headers from DevTools format
   */
  private parseHeaders(
    headers: Array<{ name: string; value: string }>
  ): Record<string, string> {
    const result: Record<string, string> = {};
    if (Array.isArray(headers)) {
      headers.forEach(header => {
        result[header.name.toLowerCase()] = header.value;
      });
    }
    return result;
  }

  /**
   * Analyze modifications applied to request/response
   */
  private analyzeModifications(
    request: DevToolsRequest,
    response: DevToolsResponse
  ): void {
    // This would integrate with the actual rule engine to detect modifications
    // For now, we'll simulate the analysis
    const appliedRules = this.detectAppliedRules(request);

    if (appliedRules.length > 0) {
      const preview: ModificationPreview = {
        requestId: request.requestId,
        originalRequest: request,
        modifiedRequest: request, // Would be different if modifications were applied
        originalResponse: response,
        modifiedResponse: response, // Would be different if modifications were applied
        appliedRules,
        modifications: {
          addedHeaders: [],
          modifiedHeaders: [],
          removedHeaders: [],
        },
      };

      this.modifications.set(request.requestId, preview);
    }
  }

  /**
   * Detect which rules were applied to a request
   */
  private detectAppliedRules(_request: DevToolsRequest): HeaderRule[] {
    // This would integrate with the actual rule matching logic
    // For now, return empty array
    return [];
  }

  /**
   * Update network timeline
   */
  private updateTimeline(
    request: DevToolsRequest,
    response: DevToolsResponse
  ): void {
    const entry: NetworkTimelineEntry = {
      requestId: request.requestId,
      url: request.url,
      method: request.method,
      status: response.status,
      startTime: request.timestamp,
      endTime: response.timestamp,
      responseTime: response.responseTime,
      appliedRules: [],
      modifications: 0,
      performanceImpact: {
        processingTime: 0,
        memoryUsage: 0,
        cacheHits: 0,
      },
    };

    this.timeline.push(entry);

    // Keep only last 1000 entries
    if (this.timeline.length > 1000) {
      this.timeline = this.timeline.slice(-1000);
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    this.metrics.totalRequests = this.requests.size;
    this.metrics.modifiedRequests = this.modifications.size;

    if (this.timeline.length > 0) {
      const totalProcessingTime = this.timeline.reduce(
        (sum, entry) => sum + entry.performanceImpact.processingTime,
        0
      );
      this.metrics.averageProcessingTime =
        totalProcessingTime / this.timeline.length;
    }
  }

  /**
   * Update performance metrics periodically
   */
  private updatePerformanceMetrics(): void {
    // Calculate memory usage
    const memoryInfo = (
      performance as Performance & { memory?: { usedJSHeapSize: number } }
    ).memory;
    if (memoryInfo) {
      this.metrics.performanceImpact.memoryUsage = memoryInfo.usedJSHeapSize;
    }
  }

  /**
   * Add console commands for debugging
   */
  private addConsoleCommands(): void {
    // Add RequestKit debugging commands to console
    (window as Window & { RequestKit?: unknown }).RequestKit = {
      getMetrics: () => this.getMetrics(),
      getTimeline: () => this.getTimeline(),
      getModifications: () => this.getModifications(),
      clearSession: () => this.clearSession(),
      exportSession: () => this.exportSession(),
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): DevToolsMetrics {
    return { ...this.metrics };
  }

  /**
   * Get network timeline
   */
  getTimeline(): NetworkTimelineEntry[] {
    return [...this.timeline];
  }

  /**
   * Get all modifications
   */
  getModifications(): ModificationPreview[] {
    return Array.from(this.modifications.values());
  }

  /**
   * Get modification preview for specific request
   */
  getModificationPreview(requestId: string): ModificationPreview | null {
    return this.modifications.get(requestId) || null;
  }

  /**
   * Get request/response diff
   */
  getRequestResponseDiff(requestId: string): {
    requestDiff: DiffResult;
    responseDiff: DiffResult;
  } | null {
    const modification = this.modifications.get(requestId);
    if (!modification) return null;

    return {
      requestDiff: this.generateDiff(
        modification.originalRequest,
        modification.modifiedRequest
      ),
      responseDiff: this.generateDiff(
        modification.originalResponse,
        modification.modifiedResponse
      ),
    };
  }

  /**
   * Generate diff between two objects
   */
  private generateDiff(original: unknown, modified: unknown): DiffResult {
    // Simple diff implementation
    // In production, use a proper diff library
    const diff: DiffResult = {
      added: {},
      modified: {},
      removed: {},
    };

    // Compare headers
    const originalObj = original as { headers?: Record<string, unknown> };
    const modifiedObj = modified as { headers?: Record<string, unknown> };

    if (originalObj?.headers && modifiedObj?.headers) {
      for (const [key, value] of Object.entries(modifiedObj.headers)) {
        if (!(key in originalObj.headers)) {
          diff.added[key] = value;
        } else if (originalObj.headers[key] !== value) {
          diff.modified[key] = { from: originalObj.headers[key], to: value };
        } else {
          // Header value unchanged
        }
      }

      for (const key of Object.keys(originalObj.headers)) {
        if (!(key in modifiedObj.headers)) {
          diff.removed[key] = originalObj.headers[key];
        }
      }
    }

    return diff;
  }

  /**
   * Clear current session data
   */
  clearSession(): void {
    this.requests.clear();
    this.responses.clear();
    this.modifications.clear();
    this.timeline = [];
    this.metrics = {
      totalRequests: 0,
      modifiedRequests: 0,
      averageProcessingTime: 0,
      totalRulesApplied: 0,
      performanceImpact: {
        averageDelay: 0,
        memoryUsage: 0,
        cacheEfficiency: 0,
      },
      errorRate: 0,
    };
  }

  /**
   * Export session data
   */
  exportSession(): {
    requests: DevToolsRequest[];
    responses: DevToolsResponse[];
    modifications: ModificationPreview[];
    timeline: NetworkTimelineEntry[];
    metrics: DevToolsMetrics;
  } {
    return {
      requests: Array.from(this.requests.values()),
      responses: Array.from(this.responses.values()),
      modifications: Array.from(this.modifications.values()),
      timeline: [...this.timeline],
      metrics: { ...this.metrics },
    };
  }

  /**
   * Import session data
   */
  importSession(data: {
    requests?: DevToolsRequest[];
    responses?: DevToolsResponse[];
    modifications?: ModificationPreview[];
    timeline?: NetworkTimelineEntry[];
    metrics?: DevToolsMetrics;
  }): void {
    if (data.requests) {
      this.requests.clear();
      data.requests.forEach((req: DevToolsRequest) => {
        this.requests.set(req.requestId, req);
      });
    }

    if (data.responses) {
      this.responses.clear();
      data.responses.forEach((res: DevToolsResponse) => {
        this.responses.set(res.requestId, res);
      });
    }

    if (data.modifications) {
      this.modifications.clear();
      data.modifications.forEach((mod: ModificationPreview) => {
        this.modifications.set(mod.requestId, mod);
      });
    }

    if (data.timeline) {
      this.timeline = [...data.timeline];
    }

    if (data.metrics) {
      this.metrics = { ...data.metrics };
    }
  }

  /**
   * Get performance visualization data
   */
  getPerformanceVisualization(): {
    requestsOverTime: Array<{ timestamp: number; count: number }>;
    responseTimeDistribution: Array<{ range: string; count: number }>;
    modificationImpact: Array<{ rule: string; impact: number }>;
    errorRates: Array<{ timestamp: number; rate: number }>;
  } {
    // Generate visualization data from timeline
    const requestsOverTime = this.generateRequestsOverTime();
    const responseTimeDistribution = this.generateResponseTimeDistribution();
    const modificationImpact = this.generateModificationImpact();
    const errorRates = this.generateErrorRates();

    return {
      requestsOverTime,
      responseTimeDistribution,
      modificationImpact,
      errorRates,
    };
  }

  /**
   * Generate requests over time data
   */
  private generateRequestsOverTime(): Array<{
    timestamp: number;
    count: number;
  }> {
    const buckets: Map<number, number> = new Map();
    const bucketSize = 60000; // 1 minute buckets

    this.timeline.forEach(entry => {
      const bucket = Math.floor(entry.startTime / bucketSize) * bucketSize;
      buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
    });

    return Array.from(buckets.entries()).map(([timestamp, count]) => ({
      timestamp,
      count,
    }));
  }

  /**
   * Generate response time distribution
   */
  private generateResponseTimeDistribution(): Array<{
    range: string;
    count: number;
  }> {
    const ranges = [
      { min: 0, max: 100, label: '0-100ms' },
      { min: 100, max: 500, label: '100-500ms' },
      { min: 500, max: 1000, label: '500ms-1s' },
      { min: 1000, max: 5000, label: '1-5s' },
      { min: 5000, max: Infinity, label: '5s+' },
    ];

    const distribution = ranges.map(range => ({
      range: range.label,
      count: 0,
    }));

    this.timeline.forEach(entry => {
      if (entry.responseTime) {
        const rangeIndex = ranges.findIndex(
          range =>
            entry.responseTime !== undefined &&
            entry.responseTime >= range.min &&
            entry.responseTime < range.max
        );
        if (rangeIndex !== -1) {
          const distributionItem = distribution[rangeIndex];
          if (distributionItem) {
            distributionItem.count++;
          }
        }
      }
    });

    return distribution;
  }

  /**
   * Generate modification impact data
   */
  private generateModificationImpact(): Array<{
    rule: string;
    impact: number;
  }> {
    // This would analyze the actual impact of each rule
    // For now, return empty array
    return [];
  }

  /**
   * Generate error rates over time
   */
  private generateErrorRates(): Array<{ timestamp: number; rate: number }> {
    const buckets: Map<number, { total: number; errors: number }> = new Map();
    const bucketSize = 60000; // 1 minute buckets

    this.timeline.forEach(entry => {
      const bucket = Math.floor(entry.startTime / bucketSize) * bucketSize;
      const bucketData = buckets.get(bucket) || { total: 0, errors: 0 };

      bucketData.total++;
      if (entry.status && entry.status >= 400) {
        bucketData.errors++;
      }

      buckets.set(bucket, bucketData);
    });

    return Array.from(buckets.entries()).map(([timestamp, data]) => ({
      timestamp,
      rate: data.total > 0 ? data.errors / data.total : 0,
    }));
  }
}
