/**
 * Debug configuration for development and production environments
 * Provides easy ways to enable/disable debug logging
 */

import {
  enableDebugLogging,
  enableSpecificDebugLogging,
  disableDebugLogging,
  loggers,
} from './debug';

// Get logger for this module
const logger = loggers.shared;

/**
 * Debug configuration presets for different scenarios
 */
export const DEBUG_PRESETS = {
  // Enable all RequestKit debug logs
  ALL: 'requestkit:*',

  // Background script only
  BACKGROUND: 'requestkit:background:*',

  // Core library only
  CORE: 'requestkit:core:*',

  // DevTools only
  DEVTOOLS: 'requestkit:devtools:*',

  // UI components only
  UI: 'requestkit:popup:*,requestkit:options:*',

  // Variable system only
  VARIABLES: 'requestkit:core:variable-*,requestkit:background:variables',

  // Pattern matching only
  PATTERNS: 'requestkit:core:*pattern*',

  // Performance monitoring
  PERFORMANCE: 'requestkit:*:perf,requestkit:integration:performance',

  // Error tracking only
  ERRORS: 'requestkit:*:error',

  // Warnings only
  WARNINGS: 'requestkit:*:warn',

  // Diagnostic information
  DIAGNOSTICS: 'requestkit:*:diagnostic',
} as const;

/**
 * Enable debug logging with a preset configuration
 * @param preset - Debug preset to enable
 */
export function enableDebugPreset(preset: keyof typeof DEBUG_PRESETS): void {
  const debugString = DEBUG_PRESETS[preset];

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('debug', debugString);
  }

  if (typeof process !== 'undefined' && process.env) {
    process.env.DEBUG = debugString;
  }

  logger.info(`Debug logging enabled: ${debugString}`);
  logger.info('Reload the extension to see debug logs');
}

/**
 * Quick setup functions for common scenarios
 */
export const debugSetup = {
  /**
   * Enable all debug logging (development mode)
   */
  enableAll: () => {
    enableDebugLogging();
    logger.info('All RequestKit debug logging enabled');
  },

  /**
   * Enable only error and warning logs (production debugging)
   */
  enableErrorsOnly: () => {
    enableSpecificDebugLogging(['*:error', '*:warn']);
    logger.info('Error and warning logging enabled');
  },

  /**
   * Enable performance monitoring logs
   */
  enablePerformance: () => {
    enableDebugPreset('PERFORMANCE');
  },

  /**
   * Enable variable system debugging
   */
  enableVariables: () => {
    enableDebugPreset('VARIABLES');
  },

  /**
   * Enable background script debugging
   */
  enableBackground: () => {
    enableDebugPreset('BACKGROUND');
  },

  /**
   * Disable all debug logging
   */
  disable: () => {
    disableDebugLogging();
    logger.info('Debug logging disabled');
  },

  /**
   * Show current debug configuration
   */
  showConfig: () => {
    const localStorageDebug =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('debug')
        : null;
    const envDebug =
      typeof process !== 'undefined' && process.env ? process.env.DEBUG : null;

    logger.info('Current debug configuration:', {
      localStorage: localStorageDebug || 'not set',
      processEnv: envDebug || 'not set',
    });

    if (!localStorageDebug && !envDebug) {
      logger.info(
        'Debug logging is disabled. Use debugSetup.enableAll() to enable.'
      );
    }
  },
};

/**
 * Auto-enable debug logging in development
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Auto-enable in development, but allow override
  const currentDebug = localStorage.getItem('debug');
  if (!currentDebug) {
    debugSetup.enableAll();
  }
}

// Make debug setup available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).debugSetup = debugSetup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).DEBUG_PRESETS = DEBUG_PRESETS;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).enableDebugPreset = enableDebugPreset;

  logger.info('Debug utilities available globally:', {
    methods: [
      'debugSetup.enableAll()',
      'debugSetup.enableVariables()',
      'debugSetup.enableBackground()',
      'debugSetup.disable()',
      'debugSetup.showConfig()',
      'enableDebugPreset("ALL")',
    ],
  });
}
