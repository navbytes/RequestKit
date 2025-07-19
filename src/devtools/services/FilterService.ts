/**
 * Advanced filtering service for RequestKit DevTools
 * Provides comprehensive filtering capabilities with performance optimization
 */

import { loggers } from '@/shared/utils/debug';

import type {
  FilterCriteria,
  FilterableRequest,
  FilterResult,
  FilterPreset,
  RegexSearchPattern,
  FilterValidation,
  FilterPerformanceMetrics,
  QuickFilter,
} from '../types/filtering';

// Get logger for this module
const logger = loggers.shared;

export class FilterService {
  private static instance: FilterService;
  private regexCache = new Map<string, RegExp>();
  private filterCache = new Map<string, FilterResult>();
  private presets: FilterPreset[] = [];
  private performanceMetrics: FilterPerformanceMetrics = {
    totalExecutionTime: 0,
    regexCompilationTime: 0,
    filterApplicationTime: 0,
    resultCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  static getInstance(): FilterService {
    if (!FilterService.instance) {
      FilterService.instance = new FilterService();
    }
    return FilterService.instance;
  }

  constructor() {
    this.initializeDefaultPresets();
  }

  /**
   * Apply filters to a list of requests
   */
  async filterRequests(
    requests: FilterableRequest[],
    criteria: FilterCriteria
  ): Promise<FilterResult> {
    const startTime = performance.now();

    // Generate cache key
    const cacheKey = this.generateCacheKey(criteria, requests.length);

    // Check cache first
    if (this.filterCache.has(cacheKey)) {
      this.performanceMetrics.cacheHits++;
      const cachedResult = this.filterCache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    this.performanceMetrics.cacheMisses++;

    // Apply filters
    const filteredRequests = await this.applyFilters(requests, criteria);

    const executionTime = performance.now() - startTime;
    this.performanceMetrics.totalExecutionTime += executionTime;
    this.performanceMetrics.filterApplicationTime += executionTime;

    const result: FilterResult = {
      totalCount: requests.length,
      filteredCount: filteredRequests.length,
      matchedRequests: filteredRequests.map(r => r.id),
      executionTime,
      appliedCriteria: criteria,
    };

    // Cache result
    this.filterCache.set(cacheKey, result);

    // Limit cache size
    if (this.filterCache.size > 100) {
      const firstKey = this.filterCache.keys().next().value;
      if (firstKey) {
        this.filterCache.delete(firstKey);
      }
    }

    return result;
  }

  /**
   * Apply individual filter criteria
   */
  public async applyFilters(
    requests: FilterableRequest[],
    criteria: FilterCriteria
  ): Promise<FilterableRequest[]> {
    let filtered = [...requests];

    // Domain filtering
    if (criteria.domains && criteria.domains.length > 0) {
      const domains = criteria.domains;
      filtered = filtered.filter(request =>
        domains.some(domain =>
          request.domain.toLowerCase().includes(domain.toLowerCase())
        )
      );
    }

    // Method filtering
    if (criteria.methods && criteria.methods.length > 0) {
      const methods = criteria.methods;
      filtered = filtered.filter(request =>
        methods.includes(request.method.toUpperCase())
      );
    }

    // Status code filtering
    if (criteria.statusCodes && criteria.statusCodes.length > 0) {
      const statusCodes = criteria.statusCodes;
      filtered = filtered.filter(request =>
        statusCodes.includes(request.status)
      );
    }

    // Status range filtering
    if (criteria.statusRanges && criteria.statusRanges.length > 0) {
      const statusRanges = criteria.statusRanges;
      filtered = filtered.filter(request =>
        statusRanges.some(
          range => request.status >= range.min && request.status <= range.max
        )
      );
    }

    // Rule match filtering
    if (criteria.hasRuleMatches !== undefined) {
      filtered = filtered.filter(request =>
        criteria.hasRuleMatches
          ? request.matchedRules.length > 0
          : request.matchedRules.length === 0
      );
    }

    // Specific rule filtering
    if (criteria.matchedRules && criteria.matchedRules.length > 0) {
      const matchedRules = criteria.matchedRules;
      filtered = filtered.filter(request =>
        matchedRules.some(ruleId => request.matchedRules.includes(ruleId))
      );
    }

    // Modification filtering
    if (criteria.hasModifications !== undefined) {
      filtered = filtered.filter(request => {
        const hasRequestMods = request.modifiedHeaders.request.length > 0;
        const hasResponseMods = request.modifiedHeaders.response.length > 0;
        const hasAnyMods = hasRequestMods || hasResponseMods;

        return criteria.hasModifications ? hasAnyMods : !hasAnyMods;
      });
    }

    // Modification type filtering
    if (criteria.modificationType) {
      filtered = filtered.filter(request => {
        const hasRequestMods = request.modifiedHeaders.request.length > 0;
        const hasResponseMods = request.modifiedHeaders.response.length > 0;

        switch (criteria.modificationType) {
          case 'request':
            return hasRequestMods;
          case 'response':
            return hasResponseMods;
          case 'both':
            return hasRequestMods && hasResponseMods;
          default:
            return true;
        }
      });
    }

    // Error filtering
    if (criteria.hasErrors !== undefined) {
      filtered = filtered.filter(request =>
        criteria.hasErrors
          ? request.hasErrors === true
          : request.hasErrors !== true
      );
    }

    // Time range filtering
    if (criteria.timeRange) {
      const timeRange = criteria.timeRange;
      filtered = filtered.filter(
        request =>
          request.timestamp >= timeRange.start &&
          request.timestamp <= timeRange.end
      );
    }

    // URL pattern filtering
    if (criteria.urlPattern) {
      filtered = await this.applyTextFilter(
        filtered,
        criteria.urlPattern,
        'url',
        criteria.useRegex || false
      );
    }

    // Header pattern filtering
    if (criteria.headerPattern) {
      filtered = await this.applyHeaderFilter(
        filtered,
        criteria.headerPattern,
        criteria.useRegex || false
      );
    }

    return filtered;
  }

  /**
   * Apply text-based filtering with regex support
   */
  private async applyTextFilter(
    requests: FilterableRequest[],
    pattern: string,
    field: keyof FilterableRequest,
    useRegex: boolean
  ): Promise<FilterableRequest[]> {
    if (useRegex) {
      const regexPattern = await this.compileRegex(pattern);
      if (!regexPattern.isValid || !regexPattern.compiledRegex) {
        return requests; // Return unfiltered if regex is invalid
      }

      return requests.filter(request => {
        const value = String(request[field]);
        return regexPattern.compiledRegex?.test(value) || false;
      });
    } else {
      const lowerPattern = pattern.toLowerCase();
      return requests.filter(request => {
        const value = String(request[field]).toLowerCase();
        return value.includes(lowerPattern);
      });
    }
  }

  /**
   * Apply header-specific filtering
   */
  private async applyHeaderFilter(
    requests: FilterableRequest[],
    pattern: string,
    useRegex: boolean
  ): Promise<FilterableRequest[]> {
    if (useRegex) {
      const regexPattern = await this.compileRegex(pattern);
      if (!regexPattern.isValid || !regexPattern.compiledRegex) {
        return requests;
      }

      return requests.filter(request => {
        // Check request headers
        const requestHeaderMatch = Object.entries(request.requestHeaders).some(
          ([key, value]) =>
            regexPattern.compiledRegex?.test(key) ||
            regexPattern.compiledRegex?.test(value)
        );

        // Check response headers
        const responseHeaderMatch = Object.entries(
          request.responseHeaders
        ).some(
          ([key, value]) =>
            regexPattern.compiledRegex?.test(key) ||
            regexPattern.compiledRegex?.test(value)
        );

        return requestHeaderMatch || responseHeaderMatch;
      });
    } else {
      const lowerPattern = pattern.toLowerCase();
      return requests.filter(request => {
        // Check request headers
        const requestHeaderMatch = Object.entries(request.requestHeaders).some(
          ([key, value]) =>
            key.toLowerCase().includes(lowerPattern) ||
            value.toLowerCase().includes(lowerPattern)
        );

        // Check response headers
        const responseHeaderMatch = Object.entries(
          request.responseHeaders
        ).some(
          ([key, value]) =>
            key.toLowerCase().includes(lowerPattern) ||
            value.toLowerCase().includes(lowerPattern)
        );

        return requestHeaderMatch || responseHeaderMatch;
      });
    }
  }

  /**
   * Compile and cache regex patterns
   */
  async compileRegex(
    pattern: string,
    flags?: string
  ): Promise<RegexSearchPattern> {
    const startTime = performance.now();
    const cacheKey = `${pattern}:${flags || ''}`;

    if (this.regexCache.has(cacheKey)) {
      const cachedRegex = this.regexCache.get(cacheKey);
      if (cachedRegex) {
        return {
          pattern,
          flags,
          isValid: true,
          compiledRegex: cachedRegex,
        };
      }
    }

    try {
      const regex = new RegExp(pattern, flags);
      this.regexCache.set(cacheKey, regex);

      const compilationTime = performance.now() - startTime;
      this.performanceMetrics.regexCompilationTime += compilationTime;

      return {
        pattern,
        flags,
        isValid: true,
        compiledRegex: regex,
      };
    } catch (error) {
      return {
        pattern,
        flags,
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid regex pattern',
      };
    }
  }

  /**
   * Validate filter criteria
   */
  validateCriteria(criteria: FilterCriteria): FilterValidation {
    const errors: Array<{ field: keyof FilterCriteria; message: string }> = [];
    const warnings: Array<{ field: keyof FilterCriteria; message: string }> =
      [];

    // Validate regex patterns
    if (criteria.urlPattern && criteria.useRegex) {
      try {
        new RegExp(criteria.urlPattern);
      } catch {
        errors.push({
          field: 'urlPattern',
          message: 'Invalid regex pattern for URL filter',
        });
      }
    }

    if (criteria.headerPattern && criteria.useRegex) {
      try {
        new RegExp(criteria.headerPattern);
      } catch {
        errors.push({
          field: 'headerPattern',
          message: 'Invalid regex pattern for header filter',
        });
      }
    }

    // Validate time range
    if (criteria.timeRange) {
      if (criteria.timeRange.start >= criteria.timeRange.end) {
        errors.push({
          field: 'timeRange',
          message: 'Start time must be before end time',
        });
      }
    }

    // Validate status ranges
    if (criteria.statusRanges) {
      criteria.statusRanges.forEach(range => {
        if (range.min > range.max) {
          errors.push({
            field: 'statusRanges',
            message: 'Minimum status code must be less than maximum',
          });
        }
        if (range.min < 100 || range.max > 599) {
          warnings.push({
            field: 'statusRanges',
            message: 'Status codes should be between 100-599',
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get default quick filters
   */
  getQuickFilters(): QuickFilter[] {
    return [
      {
        id: 'errors-only',
        name: 'Errors Only',
        icon: 'alert-circle',
        description: 'Show only requests with 4xx/5xx status codes',
        criteria: {
          statusRanges: [{ min: 400, max: 599 }],
        },
      },
      {
        id: 'modified-only',
        name: 'Modified',
        icon: 'wrench',
        description: 'Show only requests with header modifications',
        criteria: {
          hasModifications: true,
        },
      },
      {
        id: 'slow-requests',
        name: 'Slow Requests',
        icon: 'clock',
        description: 'Show requests that took longer than 1 second',
        criteria: {
          // This would need execution time data
        },
      },
      {
        id: 'post-requests',
        name: 'POST Only',
        icon: 'upload',
        description: 'Show only POST requests',
        criteria: {
          methods: ['POST'],
        },
      },
      {
        id: 'api-calls',
        name: 'API Calls',
        icon: 'code',
        description: 'Show requests to API endpoints',
        criteria: {
          urlPattern: '/api/',
          useRegex: false,
        },
      },
    ];
  }

  /**
   * Preset management
   */
  savePreset(preset: Omit<FilterPreset, 'id' | 'createdAt'>): FilterPreset {
    const newPreset: FilterPreset = {
      ...preset,
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.presets.push(newPreset);
    this.persistPresets();
    return newPreset;
  }

  getPresets(): FilterPreset[] {
    return [...this.presets];
  }

  deletePreset(id: string): boolean {
    const index = this.presets.findIndex(p => p.id === id);
    if (index >= 0) {
      this.presets.splice(index, 1);
      this.persistPresets();
      return true;
    }
    return false;
  }

  updatePreset(
    id: string,
    updates: Partial<FilterPreset>
  ): FilterPreset | null {
    const preset = this.presets.find(p => p.id === id);
    if (preset) {
      Object.assign(preset, updates);
      this.persistPresets();
      return preset;
    }
    return null;
  }

  /**
   * Performance metrics
   */
  getPerformanceMetrics(): FilterPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      totalExecutionTime: 0,
      regexCompilationTime: 0,
      filterApplicationTime: 0,
      resultCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Cache management
   */
  clearCache(): void {
    this.filterCache.clear();
    this.regexCache.clear();
  }

  getCacheStats() {
    return {
      filterCacheSize: this.filterCache.size,
      regexCacheSize: this.regexCache.size,
      cacheHitRate:
        this.performanceMetrics.cacheHits /
        (this.performanceMetrics.cacheHits +
          this.performanceMetrics.cacheMisses),
    };
  }

  /**
   * Private helper methods
   */
  private generateCacheKey(
    criteria: FilterCriteria,
    requestCount: number
  ): string {
    return `${JSON.stringify(criteria)}_${requestCount}`;
  }

  private initializeDefaultPresets(): void {
    this.presets = [
      {
        id: 'default-errors',
        name: 'Error Responses',
        description: 'Show only 4xx and 5xx responses',
        criteria: {
          statusRanges: [{ min: 400, max: 599 }],
        },
        isDefault: true,
        createdAt: new Date(),
      },
      {
        id: 'default-modified',
        name: 'Modified Requests',
        description: 'Show only requests with header modifications',
        criteria: {
          hasModifications: true,
        },
        isDefault: true,
        createdAt: new Date(),
      },
      {
        id: 'default-api',
        name: 'API Requests',
        description: 'Show requests to API endpoints',
        criteria: {
          urlPattern: '/(api|graphql)/',
          useRegex: true,
        },
        isDefault: true,
        createdAt: new Date(),
      },
    ];
  }

  private persistPresets(): void {
    try {
      const userPresets = this.presets.filter(p => !p.isDefault);
      localStorage.setItem(
        'requestkit-filter-presets',
        JSON.stringify(userPresets)
      );
    } catch (error) {
      logger.warn('Failed to persist filter presets:', error);
    }
  }

  // private loadPersistedPresets(): void { // Removed unused method
  //   try {
  //     const stored = localStorage.getItem("requestkit-filter-presets");
  //     if (stored) {
  //       const userPresets = JSON.parse(stored);
  //       this.presets.push(...userPresets);
  //     }
  //   } catch (error) {
  //     logger.warn("Failed to load persisted filter presets:", error);
  //   }
  // }
}

export const filterService = FilterService.getInstance();
