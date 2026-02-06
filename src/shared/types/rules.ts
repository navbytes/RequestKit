// Rule and pattern matching types

/**
 * Rule action type determines what the rule does when matched:
 * - modifyHeaders: Modify request/response headers (default)
 * - block: Block the matching request entirely
 * - redirect: Redirect the request to a different URL
 * - mockResponse: Return a mocked response instead of making the actual request
 */
export type RuleActionType =
  | 'modifyHeaders'
  | 'block'
  | 'redirect'
  | 'mockResponse';

export interface RedirectConfig {
  targetUrl: string; // URL to redirect to (supports ${variables})
  preserveQueryParams?: boolean; // Keep original query params
  statusCode?: 301 | 302 | 307 | 308; // HTTP redirect status code
}

export interface MockResponseConfig {
  statusCode: number; // HTTP status code to return
  headers?: Record<string, string>; // Response headers
  body?: string; // Response body (plain text, JSON, HTML, etc.)
  bodyType?: 'text' | 'json' | 'html' | 'xml'; // Body content type hint
  delay?: number; // Delay in milliseconds before returning mock
}

export interface HeaderRule {
  id: string;
  name: string;
  enabled: boolean;
  pattern: URLPattern;
  headers: HeaderEntry[];
  conditions?: RuleCondition[];
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  tags?: string[];
  resourceTypes?: ResourceType[];
  profileId?: string; // Associated profile ID
  fileInterceptions?: FileInterception[];
  actionType?: RuleActionType; // defaults to 'modifyHeaders' for backward compat
  redirectConfig?: RedirectConfig; // used when actionType is 'redirect'
  mockResponseConfig?: MockResponseConfig; // used when actionType is 'mockResponse'
}

// Import ResourceType from constants
import type { ResourceType } from '@/config/constants';

export interface URLPattern {
  protocol?: string; // 'http' | 'https' | '*'
  domain: string; // supports wildcards like *.example.com
  path?: string; // supports wildcards like /api/*
  query?: string; // query parameter patterns
  port?: string; // port number or range
}

export interface HeaderEntry {
  name: string;
  value: string;
  operation: 'set' | 'append' | 'remove';
  target: 'request' | 'response';
}

export interface FileInterception {
  id: string;
  enabled: boolean;
  pattern: URLPattern;
  operation: 'block' | 'redirect' | 'modify' | 'log';
  target: 'upload' | 'download' | 'both';
  fileTypes?: string[]; // MIME types or extensions
  maxSize?: number; // in bytes
  modifications?: {
    filename?: string;
    content?: string;
    headers?: HeaderEntry[];
  };
}

export interface RuleCondition {
  type:
    | 'responseStatus'
    | 'requestMethod'
    | 'userAgent'
    | 'cookie'
    | 'time'
    | 'header'
    | 'url'
    | 'custom';
  operator: 'equals' | 'contains' | 'regex' | 'greater' | 'less' | 'exists';
  value: string | number;
  negate?: boolean;
  caseSensitive?: boolean;
}

export interface ConditionalRule extends HeaderRule {
  conditions: RuleCondition[];
  conditionLogic: 'AND' | 'OR';
}

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  headers: HeaderEntry[];
  pattern?: Partial<URLPattern>;
  conditions?: RuleCondition[];
  tags: string[];
  isBuiltIn: boolean;
}

export interface PatternMatchResult {
  matches: boolean;
  score: number; // matching confidence score
  matchedParts: {
    protocol?: boolean;
    domain?: boolean;
    path?: boolean;
    query?: boolean;
    port?: boolean;
  };
}

export interface RuleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RuleTestResult {
  rule: HeaderRule;
  testUrl: string;
  matches: boolean;
  appliedHeaders: HeaderEntry[];
  matchDetails: PatternMatchResult;
  executionTime: number;
  errors: string[];
  warnings: string[];
}

export interface RuleStats {
  ruleId: string;
  matchCount: number;
  lastMatched?: Date;
  averageExecutionTime: number;
  errorCount: number;
  lastError?: string;
}

// Advanced rule builder types
export interface ConditionalLogic {
  operator: 'AND' | 'OR';
  conditions: (RuleCondition | ConditionalLogic)[];
}

export interface AdvancedRule extends Omit<HeaderRule, 'conditions'> {
  conditionalLogic?: ConditionalLogic;
  schedule?: RuleSchedule;
  limits?: RuleLimits;
}

export interface RuleSchedule {
  enabled: boolean;
  startDate?: Date;
  endDate?: Date;
  timeRanges?: Array<{
    start: string; // HH:MM format
    end: string; // HH:MM format
    days: number[]; // 0-6, Sunday-Saturday
  }>;
  timezone?: string;
}

export interface RuleLimits {
  maxMatches?: number;
  maxMatchesPerHour?: number;
  maxMatchesPerDay?: number;
  cooldownPeriod?: number; // seconds
}

export type RuleExportFormat = 'json' | 'yaml' | 'csv';

export interface RuleExportData {
  version: string;
  exportDate: Date;
  rules: HeaderRule[];
  templates: RuleTemplate[];
  metadata: {
    totalRules: number;
    enabledRules: number;
    exportedBy: string;
  };
}
