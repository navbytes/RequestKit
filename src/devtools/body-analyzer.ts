// Body modification analysis for DevTools - REMOVED
//
// This functionality has been removed because Chrome's declarativeNetRequest API
// does not support response body modification. The API only supports header modifications.
//
// If body modification is needed in the future, it would require:
// 1. Overriding fetch() and XMLHttpRequest in content scripts
// 2. Intercepting responses before they reach the page
// 3. Modifying the response body and forwarding the modified response
//
// This approach was declined as it would be more complex and potentially unreliable.

export interface BodyAnalysisResult {
  url: string;
  method: string;
  contentType: string;
  originalBody?: string | undefined;
  modifiedBody?: string | undefined;
  modifications: BodyModificationDetails[];
  totalModifications: number;
  executionTime: number;
  timestamp: string;
}

export interface BodyModificationDetails {
  ruleId: string;
  ruleName: string;
  target: 'request' | 'response';
  contentType: string;
  operation: 'replace' | 'merge' | 'inject' | 'transform';
  modifications: Array<{
    type: string;
    path: string;
    operation: string;
    originalValue?: string | undefined;
    newValue?: string | undefined;
  }>;
  executionTime: number;
  success: boolean;
  error?: string | undefined;
}

export interface BodyComparisonResult {
  contentType: string;
  hasChanges: boolean;
  changes: Array<{
    path: string;
    type: 'added' | 'modified' | 'removed';
    originalValue?: unknown;
    newValue?: unknown;
    ruleId?: string | undefined;
  }>;
  summary: {
    totalChanges: number;
    addedFields: number;
    modifiedFields: number;
    removedFields: number;
  };
}

export class BodyAnalyzer {
  /**
   * Body modification functionality has been removed.
   * Chrome's declarativeNetRequest API does not support body modification.
   */
  async analyzeBodyModifications(): Promise<BodyAnalysisResult> {
    throw new Error(
      "Body modification functionality has been removed. Chrome's declarativeNetRequest API does not support response body modification."
    );
  }
}

// Export singleton instance
export const bodyAnalyzer = new BodyAnalyzer();
