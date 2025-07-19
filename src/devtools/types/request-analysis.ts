// Type definitions for DevTools
export interface RequestData {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  timestamp: string;
  type: 'fetch' | 'xhr';
  status?: number;
  statusText?: string;
}

export interface HeaderModification {
  name: string;
  value: string;
  operation: 'set' | 'append' | 'remove';
  target: 'request' | 'response';
  ruleId?: string;
}

export interface RequestAnalysis {
  matchedRules: Array<{
    ruleId: string;
    ruleName: string;
    matchScore: number;
    matchDetails: Record<string, boolean>;
  }>;
  headerModifications: HeaderModification[];
  executionTime: number;
  variableResolutions: Array<{
    name: string;
    input: string;
    output: string;
    executionTime: number;
    error?: string;
  }>;
}

export type ResourceType =
  | 'main_frame'
  | 'xmlhttprequest'
  | 'stylesheet'
  | 'script'
  | 'image'
  | 'font'
  | 'other';

// DevTools specific types
export interface DevToolsRequestData {
  request?: {
    url: string;
    method: string;
    headers: Array<{ name: string; value: string }>;
  };
  response?: {
    status: number;
    headers: Array<{ name: string; value: string }>;
  };
  url?: string;
  method?: string;
  headers?: Record<string, string>;
}

export interface HeaderModificationResult {
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
  matchedRules?: Array<{ ruleId: string }>;
  executionTime?: number;
  error?: string;
}

export interface ExtensionContextError extends Error {
  context?: string;
}
