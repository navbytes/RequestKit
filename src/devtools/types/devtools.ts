/**
 * Main DevTools types for RequestKit
 * Includes filtering, performance, and resolution types
 */

export * from './filtering';
export * from './performance';
export * from './resolution';

// Main DevTools panel state
export interface DevToolsState {
  selectedMainTab: 'requests' | 'performance';
  selectedDetailTab: 'headers' | 'variables';
  selectedTab: 'request' | 'response';
  isRecording: boolean;
  showVariableResolution: boolean;
}

// DevTools configuration
export interface DevToolsConfig {
  autoFilter: boolean;
  debounceMs: number;
  maxRequests: number;
  enablePerformanceTracking: boolean;
  enableVariableResolution: boolean;
}
