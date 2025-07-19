/**
 * Advanced filtering types for RequestKit DevTools
 */

export interface FilterCriteria {
  // Domain filtering
  domains?: string[] | undefined;

  // HTTP method filtering
  methods?: string[] | undefined;

  // Status code filtering
  statusCodes?: number[] | undefined;
  statusRanges?: Array<{ min: number; max: number }> | undefined;

  // Rule-based filtering
  matchedRules?: string[] | undefined;
  hasRuleMatches?: boolean | undefined;

  // Modification filtering
  hasModifications?: boolean | undefined;
  modificationType?: 'request' | 'response' | 'both' | undefined;

  // Error filtering
  hasErrors?: boolean | undefined;

  // Time-based filtering
  timeRange?:
    | {
        start: Date;
        end: Date;
      }
    | undefined;

  // Text search
  urlPattern?: string | undefined;
  headerPattern?: string | undefined;
  useRegex?: boolean | undefined;
}

export interface RegexSearchPattern {
  pattern: string;
  flags?: string | undefined;
  isValid: boolean;
  error?: string;
  compiledRegex?: RegExp;
}

export interface FilterPreset {
  id: string;
  name: string;
  description?: string | undefined;
  criteria: FilterCriteria;
  isDefault?: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface FilterResult {
  totalCount: number;
  filteredCount: number;
  matchedRequests: string[]; // Request IDs
  executionTime: number;
  appliedCriteria: FilterCriteria;
}

export interface QuickFilter {
  id: string;
  name: string;
  icon: string;
  criteria: FilterCriteria;
  description: string;
}

export interface FilterState {
  activeCriteria: FilterCriteria;
  activePreset?: string | undefined;
  searchHistory: string[];
  isAdvancedMode: boolean;
  isCollapsed: boolean;
}

export interface FilterValidation {
  isValid: boolean;
  errors: Array<{
    field: keyof FilterCriteria;
    message: string;
  }>;
  warnings: Array<{
    field: keyof FilterCriteria;
    message: string;
  }>;
}

// Network request interface for filtering
export interface FilterableRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  timestamp: Date;
  domain: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  modifiedHeaders: {
    request: Array<{
      name: string;
      value: string;
      operation: string;
      ruleId: string;
    }>;
    response: Array<{
      name: string;
      value: string;
      operation: string;
      ruleId: string;
    }>;
  };
  matchedRules: string[];
  profileId: string;
  hasErrors?: boolean;
  executionTime?: number;
}

// Filter operation types
export type FilterOperation =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'regex'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'in'
  | 'notIn';

export interface AdvancedFilterRule {
  field: keyof FilterableRequest;
  operation: FilterOperation;
  value: unknown;
  caseSensitive?: boolean;
}

export interface FilterPerformanceMetrics {
  totalExecutionTime: number;
  regexCompilationTime: number;
  filterApplicationTime: number;
  resultCount: number;
  cacheHits: number;
  cacheMisses: number;
}
