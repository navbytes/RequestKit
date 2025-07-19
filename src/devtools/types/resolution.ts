/**
 * TypeScript interfaces for variable resolution tracking in DevTools
 */

import type { Variable } from '@/shared/types/variables';

/**
 * Represents a single step in the variable resolution process
 */
export interface ResolutionStep {
  /** Unique identifier for this step */
  id: string;
  /** Step number in the resolution sequence */
  stepNumber: number;
  /** Type of resolution step */
  type: 'variable' | 'function' | 'nested' | 'cache_hit' | 'cache_miss';
  /** The template or variable being resolved at this step */
  input: string;
  /** The resolved output from this step */
  output: string;
  /** Variable or function name being resolved */
  name: string;
  /** Variable scope if applicable */
  scope?: string;
  /** Whether this was a cache hit */
  cacheHit?: boolean;
  /** Time taken for this step in milliseconds */
  executionTime: number;
  /** Timestamp when this step was executed */
  timestamp: number;
  /** Any error that occurred during this step */
  error?: string;
  /** Additional metadata for this step */
  metadata?: {
    /** Original variable definition */
    variable?: Variable;
    /** Function arguments if applicable */
    functionArgs?: string[];
    /** Nested resolution depth */
    depth?: number;
    /** Whether this step required recursive resolution */
    recursive?: boolean;
  };
}

/**
 * Complete trace of variable resolution for a template
 */
export interface VariableResolutionTrace {
  /** Unique identifier for this trace */
  id: string;
  /** Original template being resolved */
  originalTemplate: string;
  /** Final resolved value */
  finalValue: string;
  /** Whether resolution was successful */
  success: boolean;
  /** Total resolution time in milliseconds */
  totalTime: number;
  /** Timestamp when resolution started */
  startTime: number;
  /** Timestamp when resolution completed */
  endTime: number;
  /** All resolution steps in order */
  steps: ResolutionStep[];
  /** Variables that were successfully resolved */
  resolvedVariables: string[];
  /** Variables that could not be resolved */
  unresolvedVariables: string[];
  /** Any errors that occurred during resolution */
  errors: string[];
  /** Context used for resolution */
  context: {
    /** Profile ID */
    profileId?: string | undefined;
    /** Rule ID */
    ruleId?: string | undefined;
    /** Request URL */
    requestUrl?: string | undefined;
    /** Request method */
    requestMethod?: string | undefined;
  };
  /** Performance metrics */
  metrics: {
    /** Number of variables resolved */
    variableCount: number;
    /** Number of functions executed */
    functionCount: number;
    /** Number of cache hits */
    cacheHits: number;
    /** Number of cache misses */
    cacheMisses: number;
    /** Maximum resolution depth */
    maxDepth: number;
  };
}

/**
 * Variable dependency information for tree view
 */
export interface VariableDependency {
  /** Variable name */
  name: string;
  /** Variable value/template */
  value: string;
  /** Variable scope */
  scope: string;
  /** Variables this one depends on */
  dependencies: string[];
  /** Variables that depend on this one */
  dependents: string[];
  /** Resolution order */
  resolutionOrder: number;
  /** Whether this variable was resolved successfully */
  resolved: boolean;
  /** Resolution time for this variable */
  resolutionTime?: number;
  /** Any error that occurred */
  error?: string | undefined;
}

/**
 * Tree structure for variable dependencies
 */
export interface VariableDependencyTree {
  /** Root variables (no dependencies) */
  roots: VariableDependency[];
  /** All variables in the tree */
  variables: Map<string, VariableDependency>;
  /** Circular dependencies detected */
  circularDependencies: string[][];
}

/**
 * Configuration for resolution step tracking
 */
export interface ResolutionTrackingConfig {
  /** Whether to track resolution steps */
  enabled: boolean;
  /** Maximum number of steps to track */
  maxSteps?: number;
  /** Whether to track cache operations */
  trackCache?: boolean;
  /** Whether to track execution times */
  trackTiming?: boolean;
  /** Whether to include variable metadata */
  includeMetadata?: boolean;
}

/**
 * Cache entry for variable resolution
 */
export interface ResolutionCacheEntry {
  /** Cached value */
  value: string;
  /** When this was cached */
  timestamp: number;
  /** How many times this has been used */
  hitCount: number;
  /** Context hash for cache validation */
  contextHash: string;
}

/**
 * Resolution cache for performance optimization
 */
export interface ResolutionCache {
  /** Cache entries by template */
  entries: Map<string, ResolutionCacheEntry>;
  /** Cache statistics */
  stats: {
    hits: number;
    misses: number;
    evictions: number;
  };
  /** Cache configuration */
  config: {
    maxSize: number;
    ttl: number; // Time to live in milliseconds
  };
}
