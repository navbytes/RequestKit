/**
 * Background service worker specific types
 */

import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import type { Variable } from '@/shared/types/variables';

export interface ExtensionStatus {
  enabled: boolean;
  activeProfile: string;
  profiles: Profile[];
  rules: HeaderRule[];
  rulesCount: number;
  activeRulesCount: number;
  profileRulesCount: number;
}

export interface VariableCache {
  value: string;
  timestamp: number;
}

export interface HeaderAnalysis {
  name: string;
  originalValue?: string;
  resolvedValue?: string;
  operation: string;
  target?: string;
  resolutionError?: string | null;
}

export interface MatchDetails {
  protocol?: boolean;
  domain?: boolean;
  path?: boolean;
  port?: boolean;
  query?: boolean;
  conditionsMatch?: boolean;
  error?: string;
}

export interface RuleMatchResult {
  matches: boolean;
  score: number;
  executionTime: number;
  matchDetails: MatchDetails;
  headerAnalysis?: HeaderAnalysis[];
  variableContext?: {
    globalVariablesCount: number;
    profileVariablesCount: number;
    requestContextAvailable: boolean;
  };
}

export interface PerformanceTimer {
  ruleId: string;
  startTime: number;
}

export interface RuleExecutionProbability {
  ruleId: string;
  probability: number;
}

export interface RuleComplexity {
  ruleId: string;
  complexity: number;
}

export interface BackgroundSettings {
  theme: 'light' | 'dark' | 'auto';
  debugMode: boolean;
  performanceTracking: boolean;
  [key: string]: unknown;
}

export interface BackgroundState {
  isEnabled: boolean;
  rules: Record<string, HeaderRule>;
  profiles: Record<string, Profile>;
  activeProfile: string;
  settings: BackgroundSettings;
  currentTheme: 'light' | 'dark';
  globalVariables: Record<string, Variable>;
  profileVariables: Record<string, Record<string, Variable>>;
  variableCache: Map<string, VariableCache>;
}

export interface RequestData {
  url: string;
  method: string;
  headers?: Record<string, string>;
  tabId?: number;
  requestId?: string;
  timestamp?: number;
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

export interface AnalysisResult {
  url: string;
  method: string;
  matchedRules: MatchedRule[];
  headerModifications: HeaderModification[];
  executionTime: number;
  timestamp: string;
}

export interface TestRuleMatchResult {
  ruleId: string;
  ruleName: string;
  testUrl: string;
  matches: boolean;
  matchScore: number;
  executionTime: number;
  matchDetails: MatchDetails;
  appliedHeaders: HeaderRule['headers'];
}

export interface UrlPattern {
  protocol?: string;
  domain?: string;
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
  error?: string;
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
