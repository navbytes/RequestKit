/**
 * Centralized debug logging utility using the debug package
 * Provides structured logging with namespaces for different components
 */

import debug from 'debug';

// Main namespace for the extension
const NAMESPACE = 'requestkit';

/**
 * Debug logger interface for consistent logging across the extension
 */
export interface DebugLogger {
  /** Log general information */
  info: debug.Debugger;
  /** Log warnings */
  warn: debug.Debugger;
  /** Log errors */
  error: debug.Debugger;
  /** Log debug information */
  debug: debug.Debugger;
  /** Log performance metrics */
  perf: debug.Debugger;
  /** Log diagnostic information */
  diagnostic: debug.Debugger;
}

/**
 * Create a debug logger for a specific component
 * @param component - Component name (e.g., 'background', 'popup', 'devtools')
 * @param subComponent - Optional sub-component name (e.g., 'rules', 'variables')
 * @returns DebugLogger instance with namespaced loggers
 */
export function createDebugLogger(
  component: string,
  subComponent?: string
): DebugLogger {
  const baseNamespace = subComponent
    ? `${NAMESPACE}:${component}:${subComponent}`
    : `${NAMESPACE}:${component}`;

  return {
    info: debug(`${baseNamespace}:info`),
    warn: debug(`${baseNamespace}:warn`),
    error: debug(`${baseNamespace}:error`),
    debug: debug(`${baseNamespace}:debug`),
    perf: debug(`${baseNamespace}:perf`),
    diagnostic: debug(`${baseNamespace}:diagnostic`),
  };
}

/**
 * Pre-configured loggers for common components
 */
export const loggers = {
  // Background script loggers
  background: createDebugLogger('background'),
  backgroundRules: createDebugLogger('background', 'rules'),
  backgroundVariables: createDebugLogger('background', 'variables'),
  backgroundPerformance: createDebugLogger('background', 'performance'),
  backgroundStorage: createDebugLogger('background', 'storage'),
  backgroundProfiles: createDebugLogger('background', 'profiles'),
  backgroundDevtools: createDebugLogger('background', 'devtools'),
  backgroundTheme: createDebugLogger('background', 'theme'),
  backgroundContext: createDebugLogger('background', 'context'),
  backgroundBadge: createDebugLogger('background', 'badge'),
  backgroundInit: createDebugLogger('background', 'init'),

  // Core library loggers
  coreStorage: createDebugLogger('core', 'storage'),
  coreVariableStorage: createDebugLogger('core', 'variable-storage'),
  coreVariableResolver: createDebugLogger('core', 'variable-resolver'),
  corePatternMatcher: createDebugLogger('core', 'pattern-matcher'),
  coreAdvancedPatternMatcher: createDebugLogger(
    'core',
    'advanced-pattern-matcher'
  ),

  // DevTools loggers
  devtools: createDebugLogger('devtools'),
  devtoolsAnalyzer: createDebugLogger('devtools', 'analyzer'),
  devtoolsFiltering: createDebugLogger('devtools', 'filtering'),
  devtoolsPerformance: createDebugLogger('devtools', 'performance'),
  devtoolsNetwork: createDebugLogger('devtools', 'network'),
  devtoolsDemo: createDebugLogger('devtools', 'demo'),

  // Popup loggers
  popup: createDebugLogger('popup'),
  popupRules: createDebugLogger('popup', 'rules'),
  popupTemplates: createDebugLogger('popup', 'templates'),
  popupTheme: createDebugLogger('popup', 'theme'),

  // Options page loggers
  options: createDebugLogger('options'),
  optionsRules: createDebugLogger('options', 'rules'),
  optionsVariables: createDebugLogger('options', 'variables'),
  optionsTemplates: createDebugLogger('options', 'templates'),
  optionsSettings: createDebugLogger('options', 'settings'),
  optionsAnalytics: createDebugLogger('options', 'analytics'),
  optionsImportExport: createDebugLogger('options', 'import-export'),

  // Content script loggers
  content: createDebugLogger('content'),
  contentInjected: createDebugLogger('content', 'injected'),

  // Shared utilities loggers
  shared: createDebugLogger('shared'),
  sharedChromeApi: createDebugLogger('shared', 'chrome-api'),
  sharedTheme: createDebugLogger('shared', 'theme'),
  sharedHooks: createDebugLogger('shared', 'hooks'),
  sharedValidation: createDebugLogger('shared', 'validation'),

  // Integration loggers
  integrationPerformance: createDebugLogger('integration', 'performance'),
  integrationAnalytics: createDebugLogger('integration', 'analytics'),
  integrationFileEngine: createDebugLogger('integration', 'file-engine'),

  // Test loggers
  tests: createDebugLogger('tests'),
  testsIntegration: createDebugLogger('tests', 'integration'),
  testsMocks: createDebugLogger('tests', 'mocks'),
};

/**
 * Utility function to log performance timing
 * @param logger - Debug logger to use
 * @param operation - Operation name
 * @param startTime - Start time from performance.now()
 * @param additionalData - Optional additional data to log
 */
export function logPerformance(
  logger: DebugLogger,
  operation: string,
  startTime: number,
  additionalData?: Record<string, unknown>
): void {
  const duration = performance.now() - startTime;
  logger.perf(
    `${operation} completed in ${duration.toFixed(2)}ms`,
    additionalData
  );
}

/**
 * Utility function to log errors with context
 * @param logger - Debug logger to use
 * @param operation - Operation that failed
 * @param error - Error object or message
 * @param context - Optional context data
 */
export function logError(
  logger: DebugLogger,
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error(`${operation} failed: ${errorMessage}`, {
    error: errorMessage,
    stack: errorStack,
    context,
  });
}

/**
 * Utility function to log warnings with context
 * @param logger - Debug logger to use
 * @param message - Warning message
 * @param context - Optional context data
 */
export function logWarning(
  logger: DebugLogger,
  message: string,
  context?: Record<string, unknown>
): void {
  logger.warn(message, context);
}

/**
 * Utility function to log diagnostic information
 * @param logger - Debug logger to use
 * @param operation - Operation being diagnosed
 * @param data - Diagnostic data
 */
export function logDiagnostic(
  logger: DebugLogger,
  operation: string,
  data: Record<string, unknown>
): void {
  logger.diagnostic(`${operation}:`, data);
}

/**
 * Check if we're in a browser context with localStorage
 */
function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Check if we're in a Node.js context
 */
function hasProcessEnv(): boolean {
  try {
    return typeof process !== 'undefined' && process.env !== undefined;
  } catch {
    return false;
  }
}

/**
 * Enable debug logging for development
 * This should be called in development environments
 */
export function enableDebugLogging(): void {
  // Enable all RequestKit debug logs in development
  if (hasLocalStorage()) {
    try {
      localStorage.setItem('debug', `${NAMESPACE}:*`);
    } catch {
      // Silently fail if localStorage is not accessible
    }
  }

  // For Node.js environments (tests)
  if (hasProcessEnv()) {
    try {
      process.env.DEBUG = `${NAMESPACE}:*`;
    } catch {
      // Silently fail if process.env is not accessible
    }
  }
}

/**
 * Enable specific debug namespaces
 * @param namespaces - Array of namespaces to enable (e.g., ['background:*', 'core:*'])
 */
export function enableSpecificDebugLogging(namespaces: string[]): void {
  const debugString = namespaces.map(ns => `${NAMESPACE}:${ns}`).join(',');

  if (hasLocalStorage()) {
    try {
      localStorage.setItem('debug', debugString);
    } catch {
      // Silently fail if localStorage is not accessible
    }
  }

  if (hasProcessEnv()) {
    try {
      process.env.DEBUG = debugString;
    } catch {
      // Silently fail if process.env is not accessible
    }
  }
}

/**
 * Disable debug logging
 */
export function disableDebugLogging(): void {
  if (hasLocalStorage()) {
    try {
      localStorage.removeItem('debug');
    } catch {
      // Silently fail if localStorage is not accessible
    }
  }

  if (hasProcessEnv()) {
    try {
      delete process.env.DEBUG;
    } catch {
      // Silently fail if process.env is not accessible
    }
  }
}

// Export the main debug function for custom loggers
export { debug };

// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  enableDebugLogging();
}
