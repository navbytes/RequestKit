// Header modification analysis for DevTools
import type { HeaderEntry } from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

export interface RequestData {
  url?: string;
  method?: string;
  request?: {
    url?: string;
    method?: string;
    headers?: unknown;
  };
  response?: {
    headers?: unknown;
  };
}

export interface HeaderModification {
  ruleId: string;
  ruleName: string;
  headerName: string;
  operation: 'set' | 'append' | 'remove';
  target: 'request' | 'response';
  originalValue?: string | undefined;
  newValue?: string | undefined;
  timestamp: string;
}

export interface HeaderComparison {
  headerName: string;
  original?: string | undefined;
  modified?: string | undefined;
  operation: 'added' | 'modified' | 'removed' | 'unchanged';
  ruleId?: string | undefined;
  ruleName?: string | undefined;
}

export interface HeaderAnalysisResult {
  url: string;
  method: string;
  requestHeaders: {
    original: Record<string, string>;
    modified: Record<string, string>;
    comparison: HeaderComparison[];
  };
  responseHeaders: {
    original: Record<string, string>;
    modified: Record<string, string>;
    comparison: HeaderComparison[];
  };
  modifications: HeaderModification[];
  totalModifications: number;
  executionTime: number;
  timestamp: string;
}

export class HeaderAnalyzer {
  private modificationHistory = new Map<string, HeaderModification[]>();

  /**
   * Analyze header modifications for a network request
   */
  analyzeHeaders(
    requestData: RequestData,
    appliedRules: Array<{
      ruleId: string;
      ruleName: string;
      headers: HeaderEntry[];
    }>
  ): HeaderAnalysisResult {
    const startTime = performance.now();

    const originalRequestHeaders = this.extractHeaders(
      requestData.request?.headers || {}
    );
    const originalResponseHeaders = this.extractHeaders(
      requestData.response?.headers || {}
    );

    // Apply rule modifications to get modified headers
    const modifiedRequestHeaders = { ...originalRequestHeaders };
    const modifiedResponseHeaders = { ...originalResponseHeaders };
    const modifications: HeaderModification[] = [];

    // Process each rule's header modifications
    for (const rule of appliedRules) {
      for (const header of rule.headers) {
        const modification = this.applyHeaderModification(
          header,
          header.target === 'request'
            ? modifiedRequestHeaders
            : modifiedResponseHeaders,
          header.target === 'request'
            ? originalRequestHeaders
            : originalResponseHeaders,
          rule.ruleId,
          rule.ruleName
        );

        if (modification) {
          modifications.push(modification);
        }
      }
    }

    // Generate comparisons
    const requestComparison = this.compareHeaders(
      originalRequestHeaders,
      modifiedRequestHeaders,
      modifications.filter(m => m.target === 'request')
    );

    const responseComparison = this.compareHeaders(
      originalResponseHeaders,
      modifiedResponseHeaders,
      modifications.filter(m => m.target === 'response')
    );

    const executionTime = performance.now() - startTime;
    const timestamp = new Date().toISOString();

    // Store in history
    const requestId = this.generateRequestId(requestData);
    this.modificationHistory.set(requestId, modifications);

    return {
      url: requestData.url || requestData.request?.url || '',
      method: requestData.method || requestData.request?.method || 'GET',
      requestHeaders: {
        original: originalRequestHeaders,
        modified: modifiedRequestHeaders,
        comparison: requestComparison,
      },
      responseHeaders: {
        original: originalResponseHeaders,
        modified: modifiedResponseHeaders,
        comparison: responseComparison,
      },
      modifications,
      totalModifications: modifications.length,
      executionTime,
      timestamp,
    };
  }

  /**
   * Apply a single header modification
   */
  private applyHeaderModification(
    header: HeaderEntry,
    targetHeaders: Record<string, string>,
    originalHeaders: Record<string, string>,
    ruleId: string,
    ruleName: string
  ): HeaderModification | null {
    const headerName = header.name.toLowerCase();
    const originalValue = originalHeaders[headerName];
    let newValue: string | undefined;

    switch (header.operation) {
      case 'set':
        newValue = header.value;
        targetHeaders[headerName] = newValue;
        break;

      case 'append': {
        const existingValue = targetHeaders[headerName] || '';
        newValue = existingValue
          ? `${existingValue}, ${header.value}`
          : header.value;
        targetHeaders[headerName] = newValue;
        break;
      }

      case 'remove':
        newValue = undefined;
        delete targetHeaders[headerName];
        break;

      default:
        logger.warn(`Unknown header operation: ${header.operation}`);
        return null;
    }

    return {
      ruleId,
      ruleName,
      headerName: header.name,
      operation: header.operation,
      target: header.target,
      originalValue,
      newValue,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Compare original and modified headers
   */
  private compareHeaders(
    original: Record<string, string>,
    modified: Record<string, string>,
    modifications: HeaderModification[]
  ): HeaderComparison[] {
    const comparisons: HeaderComparison[] = [];
    const allHeaders = new Set([
      ...Object.keys(original),
      ...Object.keys(modified),
    ]);

    for (const headerName of allHeaders) {
      const originalValue = original[headerName];
      const modifiedValue = modified[headerName];
      const modification = modifications.find(
        m => m.headerName.toLowerCase() === headerName.toLowerCase()
      );

      let operation: HeaderComparison['operation'];

      if (!originalValue && modifiedValue) {
        operation = 'added';
      } else if (originalValue && !modifiedValue) {
        operation = 'removed';
      } else if (originalValue !== modifiedValue) {
        operation = 'modified';
      } else {
        operation = 'unchanged';
      }

      comparisons.push({
        headerName,
        original: originalValue,
        modified: modifiedValue,
        operation,
        ruleId: modification?.ruleId,
        ruleName: modification?.ruleName,
      });
    }

    // Sort by operation priority (modified/added/removed first, then unchanged)
    return comparisons.sort((a, b) => {
      const priority = { modified: 0, added: 1, removed: 2, unchanged: 3 };
      return priority[a.operation] - priority[b.operation];
    });
  }

  /**
   * Extract headers from various formats
   */
  private extractHeaders(headers: unknown): Record<string, string> {
    if (!headers) return {};

    // Handle array format (Chrome DevTools format)
    if (Array.isArray(headers)) {
      const result: Record<string, string> = {};
      for (const header of headers) {
        if (header.name && header.value) {
          result[header.name.toLowerCase()] = header.value;
        }
      }
      return result;
    }

    // Handle object format
    if (typeof headers === 'object') {
      const result: Record<string, string> = {};
      for (const [name, value] of Object.entries(headers)) {
        if (typeof value === 'string') {
          result[name.toLowerCase()] = value;
        }
      }
      return result;
    }

    return {};
  }

  /**
   * Generate a unique request ID for tracking
   */
  private generateRequestId(requestData: RequestData): string {
    const url = requestData.url || requestData.request?.url || '';
    const method = requestData.method || requestData.request?.method || 'GET';
    const timestamp = Date.now();
    return `${method}_${url}_${timestamp}`;
  }

  /**
   * Get modification history for a request
   */
  getModificationHistory(requestId: string): HeaderModification[] {
    return this.modificationHistory.get(requestId) || [];
  }

  /**
   * Clear modification history
   */
  clearHistory(): void {
    this.modificationHistory.clear();
  }

  /**
   * Get all modifications grouped by rule
   */
  getModificationsByRule(): Map<string, HeaderModification[]> {
    const byRule = new Map<string, HeaderModification[]>();

    for (const modifications of this.modificationHistory.values()) {
      for (const modification of modifications) {
        const existing = byRule.get(modification.ruleId) || [];
        existing.push(modification);
        byRule.set(modification.ruleId, existing);
      }
    }

    return byRule;
  }

  /**
   * Generate visual diff for headers
   */
  generateHeaderDiff(comparison: HeaderComparison[]): string {
    const lines: string[] = [];

    for (const comp of comparison) {
      switch (comp.operation) {
        case 'added':
          lines.push(`+ ${comp.headerName}: ${comp.modified}`);
          break;
        case 'removed':
          lines.push(`- ${comp.headerName}: ${comp.original}`);
          break;
        case 'modified':
          lines.push(`- ${comp.headerName}: ${comp.original}`);
          lines.push(`+ ${comp.headerName}: ${comp.modified}`);
          break;
        case 'unchanged':
          lines.push(`  ${comp.headerName}: ${comp.original}`);
          break;
      }
    }

    return lines.join('\n');
  }

  /**
   * Get statistics about header modifications
   */
  getModificationStats(): {
    totalModifications: number;
    byOperation: Record<string, number>;
    byTarget: Record<string, number>;
    byRule: Record<string, number>;
    mostModifiedHeaders: Array<{ header: string; count: number }>;
  } {
    const allModifications: HeaderModification[] = [];
    for (const modifications of this.modificationHistory.values()) {
      allModifications.push(...modifications);
    }

    const byOperation: Record<string, number> = {};
    const byTarget: Record<string, number> = {};
    const byRule: Record<string, number> = {};
    const headerCounts: Record<string, number> = {};

    for (const mod of allModifications) {
      byOperation[mod.operation] = (byOperation[mod.operation] || 0) + 1;
      byTarget[mod.target] = (byTarget[mod.target] || 0) + 1;
      byRule[mod.ruleName] = (byRule[mod.ruleName] || 0) + 1;
      headerCounts[mod.headerName] = (headerCounts[mod.headerName] || 0) + 1;
    }

    const mostModifiedHeaders = Object.entries(headerCounts)
      .map(([header, count]) => ({ header, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalModifications: allModifications.length,
      byOperation,
      byTarget,
      byRule,
      mostModifiedHeaders,
    };
  }

  /**
   * Validate header modifications
   */
  validateModifications(modifications: HeaderModification[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const mod of modifications) {
      // Check for invalid header names
      if (!/^[a-zA-Z0-9\-_]+$/.test(mod.headerName)) {
        errors.push(`Invalid header name: ${mod.headerName}`);
      }

      // Check for potentially dangerous headers
      const dangerousHeaders = [
        'host',
        'content-length',
        'transfer-encoding',
        'connection',
      ];

      if (dangerousHeaders.includes(mod.headerName.toLowerCase())) {
        warnings.push(`Modifying ${mod.headerName} may cause issues`);
      }

      // Check for empty values in set/append operations
      if (
        (mod.operation === 'set' || mod.operation === 'append') &&
        !mod.newValue
      ) {
        warnings.push(
          `Empty value for ${mod.headerName} in ${mod.operation} operation`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Export singleton instance
export const headerAnalyzer = new HeaderAnalyzer();
