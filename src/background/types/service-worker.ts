// TypeScript types for background service worker

import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import type { Variable } from '@/shared/types/variables';

// Message types for runtime communication
export interface RuntimeMessage {
  type: string;
  [key: string]: unknown;
}

export interface GetStatusMessage extends RuntimeMessage {
  type: 'GET_STATUS';
}

export interface ToggleExtensionMessage extends RuntimeMessage {
  type: 'TOGGLE_EXTENSION';
  enabled: boolean;
}

export interface TestRuleMessage extends RuntimeMessage {
  type: 'TEST_RULE';
  rule: HeaderRule;
  testUrl: string;
}

export interface ImportRulesMessage extends RuntimeMessage {
  type: 'IMPORT_RULES';
  data: ImportData;
}

export interface AnalyzeRequestMessage extends RuntimeMessage {
  type: 'ANALYZE_REQUEST';
  requestData: RequestData;
}

export interface TestRuleMatchMessage extends RuntimeMessage {
  type: 'TEST_RULE_MATCH';
  ruleId: string;
  url: string;
  requestData: RequestData;
}

export interface ResolveVariableTemplateMessage extends RuntimeMessage {
  type: 'RESOLVE_VARIABLE_TEMPLATE';
  template: string;
  requestContext?: RequestContext;
}

export interface TrackModificationMessage extends RuntimeMessage {
  type: 'TRACK_MODIFICATION';
  modificationData: ModificationData;
}

export interface SwitchProfileMessage extends RuntimeMessage {
  type: 'SWITCH_PROFILE';
  profileId: string;
}

export interface CreateProfileMessage extends RuntimeMessage {
  type: 'CREATE_PROFILE';
  profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateProfileMessage extends RuntimeMessage {
  type: 'UPDATE_PROFILE';
  profileId: string;
  profile: Partial<Omit<Profile, 'id' | 'createdAt'>>;
}

export interface DeleteProfileMessage extends RuntimeMessage {
  type: 'DELETE_PROFILE';
  profileId: string;
}

export interface GetVariablesMessage extends RuntimeMessage {
  type: 'GET_VARIABLES';
  scope?: string;
  profileId?: string;
}

export interface ValidateVariableTemplateMessage extends RuntimeMessage {
  type: 'VALIDATE_VARIABLE_TEMPLATE';
  template: string;
}

export interface GetRulePerformanceMessage extends RuntimeMessage {
  type: 'GET_RULE_PERFORMANCE';
  ruleId: string;
}

export interface ChangeThemeMessage extends RuntimeMessage {
  type: 'CHANGE_THEME';
  theme: 'light' | 'dark' | 'auto';
}

// Response types
export interface RuntimeResponse {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface StatusResponse extends RuntimeResponse {
  enabled: boolean;
  rulesCount: number;
  activeRulesCount: number;
}

export interface TestRuleResponse extends RuntimeResponse {
  matches: boolean;
  appliedHeaders: HeaderRule['headers'];
  executionTime: number;
}

export interface ExportResponse extends RuntimeResponse {
  version: string;
  exportDate: string;
  data: Record<string, unknown>;
}

export interface ImportResponse extends RuntimeResponse {
  imported: {
    rules: number;
    templates: number;
    settings: boolean;
  };
  errors: string[];
  warnings: string[];
}

export interface ProfileSwitchResponse extends RuntimeResponse {
  previousProfile?: string;
  currentProfile: string;
  rulesActivated: number;
  rulesDeactivated: number;
  errors?: string[];
}

// Extend ProfileSwitchResult to be compatible with RuntimeResponse
export interface ExtendedProfileSwitchResult {
  success: boolean;
  previousProfile?: string;
  currentProfile: string;
  rulesActivated: number;
  rulesDeactivated: number;
  errors?: string[];
  [key: string]: unknown;
}

export interface ProfileCreateResponse extends RuntimeResponse {
  profile?: Profile;
}

export interface ProfileUpdateResponse extends RuntimeResponse {
  profile?: Profile;
}

export interface VariablesResponse extends RuntimeResponse {
  variables: Variable[];
  activeProfile: string;
  scope: string;
}

export interface VariableTemplateResponse extends RuntimeResponse {
  resolvedValue?: string;
  resolvedVariables?: string[];
  unresolvedVariables?: string[];
  resolutionTime?: number;
}

export interface VariableValidationResponse extends RuntimeResponse {
  isValid: boolean;
  errors: string[];
  variables: string[];
  functions: string[];
}

export interface PerformanceResponse extends RuntimeResponse {
  performance: RulePerformanceStats;
}

export interface DashboardResponse extends RuntimeResponse {
  dashboard: DashboardData;
}

// Data types
export interface ImportData {
  version: string;
  exportDate: string;
  data: Record<string, unknown>;
}

export interface RequestData {
  url: string;
  method: string;
  headers?: Record<string, string>;
  tabId?: number;
  timestamp?: number;
}

export interface RequestContext {
  url: string;
  method: string;
  headers: Record<string, string>;
  timestamp: number;
  domain: string;
  path: string;
  query: string;
}

export interface ModificationData {
  ruleId: string;
  executionTime?: number;
  error?: string;
  headerName?: string;
  headerValue?: string;
  operation?: string;
}

export interface RulePerformanceStats {
  ruleId: string;
  matchCount: number;
  averageExecutionTime: number;
  lastMatched: Date | null;
  errorCount: number;
  lastError: string | null;
}

export interface DashboardData {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  averageExecutionTime: number;
  errorRate: number;
  topPerformingRules: RulePerformanceStats[];
}

// URL pattern matching types
export interface UrlPattern {
  protocol?: string;
  domain: string;
  path?: string;
  port?: string;
  query?: string;
}

export interface UrlMatchResult {
  matches: boolean;
  score: number;
  matchedParts: {
    protocol?: boolean;
    domain?: boolean;
    path?: boolean;
    port?: boolean;
    query?: boolean;
  };
}

export interface DomainMatchResult {
  matches: boolean;
  score: number;
}

export interface PathMatchResult {
  matches: boolean;
  score: number;
}

export interface QueryMatchResult {
  matches: boolean;
  score: number;
}

// Rule analysis types
export interface RuleMatchResult {
  matches: boolean;
  score: number;
  executionTime: number;
  matchDetails: UrlMatchResult & {
    conditionsMatch?: boolean;
    error?: string;
  };
  headerAnalysis?: HeaderAnalysis[];
  variableContext?: {
    globalVariablesCount: number;
    profileVariablesCount: number;
    requestContextAvailable: boolean;
  };
}

export interface HeaderAnalysis {
  name: string;
  originalValue?: string;
  resolvedValue?: string;
  operation: string;
  target?: string;
  resolutionError?: string | null;
}

export interface AnalysisResult {
  url: string;
  method: string;
  matchedRules: MatchedRule[];
  headerModifications: HeaderModification[];
  executionTime: number;
  timestamp: string;
}

export interface MatchedRule {
  ruleId: string;
  ruleName: string;
  matchScore: number;
  executionTime: number;
  priority?: number;
}

export interface HeaderModification {
  ruleId: string;
  ruleName: string;
  headerName: string;
  headerValue?: string;
  operation: string;
  target?: string;
}

// Chrome declarativeNetRequest types
export interface ChromeRule {
  id: number;
  priority: number;
  condition: {
    urlFilter: string;
    resourceTypes: chrome.declarativeNetRequest.ResourceType[];
  };
  action: {
    type: 'modifyHeaders';
    requestHeaders?: chrome.declarativeNetRequest.ModifyHeaderInfo[];
    responseHeaders?: chrome.declarativeNetRequest.ModifyHeaderInfo[];
  };
}

export interface ChromeHeader {
  header: string;
  operation: chrome.declarativeNetRequest.HeaderOperation;
  value?: string;
}

// Condition evaluation types
export interface RuleCondition {
  type: 'requestMethod' | 'header' | 'url';
  operator: 'equals' | 'contains' | 'exists' | 'regex';
  value: string;
}

// Performance timer type
export interface PerformanceTimer {
  ruleId: string;
  startTime: number;
}

// Profile statistics
export interface ProfileStats {
  switchCount: number;
  ruleMatches: number;
  lastUsed: string;
}

// DevTools status
export interface DevToolsStatus {
  enabled: boolean;
  activeProfile: string;
  profiles: Profile[];
  rules: HeaderRule[];
  settings: Record<string, unknown>;
  rulesCount: number;
  activeRulesCount: number;
  profileRulesCount: number;
}

// Test rule match result
export interface TestRuleMatchResult {
  ruleId: string;
  ruleName: string;
  testUrl: string;
  matches: boolean;
  matchScore: number;
  executionTime: number;
  matchDetails: RuleMatchResult['matchDetails'];
  appliedHeaders: HeaderRule['headers'];
}

// Clear performance result
export interface ClearPerformanceResult {
  message: string;
}

// Variable cache entry
export interface VariableCacheEntry {
  value: string;
  timestamp: number;
}
