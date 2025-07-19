/**
 * Variable system type definitions for RequestKit
 * Provides comprehensive variable support for header values, body modifications, and URL patterns
 */

/**
 * Variable scope enumeration defining the priority order for variable resolution
 */
export enum VariableScope {
  SYSTEM = 'system', // Built-in, read-only variables (lowest priority)
  GLOBAL = 'global', // System-wide defaults
  PROFILE = 'profile', // Profile-specific, override global variables
  RULE = 'rule', // Rule-specific overrides (highest priority)
}

// Variable types removed - all variables are now static with optional function support

/**
 * Variable validation configuration
 */
export interface VariableValidation {
  /** Regular expression pattern for value validation */
  pattern?: string;
  /** Whether the variable is required */
  required?: boolean;
  /** Minimum length for string values */
  minLength?: number;
  /** Maximum length for string values */
  maxLength?: number;
  /** Custom validation function name */
  customValidator?: string;
}

/**
 * Variable metadata for tracking usage and lifecycle
 */
export interface VariableMetadata {
  /** When the variable was created */
  createdAt: Date | string;
  /** When the variable was last updated */
  updatedAt: Date | string;
  /** When the variable was last used in rule resolution */
  lastUsed?: Date | string;
  /** Number of times the variable has been used */
  usageCount?: number;
  /** User who created the variable */
  createdBy?: string;
  /** Additional custom metadata */
  custom?: Record<string, unknown>;
}

/**
 * Core variable interface defining the structure of all variables
 */
export interface Variable {
  /** Unique identifier for the variable */
  id: string;
  /** Human-readable name for the variable */
  name: string;
  /** The variable value or template (functions will be resolved when saved) */
  value: string;
  /** Scope determining priority in resolution */
  scope: VariableScope;
  /** Optional description explaining the variable's purpose */
  description?: string;
  /** Whether the variable contains sensitive data (API keys, tokens) */
  isSecret?: boolean;
  /** Validation rules for the variable value */
  validation?: VariableValidation;
  /** Metadata for tracking and analytics */
  metadata?: VariableMetadata;
  /** Whether the variable is enabled for resolution */
  enabled?: boolean;
  /** Tags for categorization and filtering */
  tags?: string[];
  /** Profile ID for profile-scoped variables */
  profileId?: string;
  /** Rule ID for rule-scoped variables */
  ruleId?: string;
}

/**
 * Request context information available during variable resolution
 */
export interface RequestContext {
  /** Full request URL */
  url: string;
  /** HTTP method (GET, POST, etc.) */
  method: string;
  /** Request headers */
  headers: Record<string, string>;
  /** Current timestamp */
  timestamp: number;
  /** Request domain */
  domain: string;
  /** Request path */
  path: string;
  /** Request protocol (http/https) */
  protocol: string;
  /** Query parameters */
  query?: Record<string, string>;
  /** Request referrer */
  referrer?: string;
  /** User agent string */
  userAgent?: string;
  /** Tab ID where the request originated */
  tabId?: number;
}

/**
 * Variable resolution context containing all available variables and request information
 */
export interface VariableContext {
  /** System variables (built-in, read-only) */
  systemVariables: Variable[];
  /** Global variables (system-wide defaults) */
  globalVariables: Variable[];
  /** Profile-specific variables */
  profileVariables: Variable[];
  /** Rule-specific variables */
  ruleVariables: Variable[];
  /** Current request context for computed variables */
  requestContext?: RequestContext;
  /** Active profile ID */
  profileId?: string | undefined;
  /** Rule ID being processed */
  ruleId?: string | undefined;
}

/**
 * Result of variable validation
 */
export interface VariableValidationResult {
  /** Whether the variable is valid */
  isValid: boolean;
  /** Validation error messages */
  errors: string[];
  /** Validation warning messages */
  warnings: string[];
  /** Suggested fixes for validation issues */
  suggestions?: string[];
}

/**
 * Result of variable resolution
 */
export interface VariableResolutionResult {
  /** Whether resolution was successful */
  success: boolean;
  /** The resolved value */
  value?: string;
  /** Error message if resolution failed */
  error?: string;
  /** Variables that were resolved in the template */
  resolvedVariables?: string[];
  /** Variables that could not be resolved */
  unresolvedVariables?: string[];
  /** Time taken for resolution in milliseconds */
  resolutionTime?: number;
}

/**
 * Template parsing result
 */
export interface TemplateParseResult {
  /** Whether parsing was successful */
  success: boolean;
  /** Variables found in the template */
  variables: string[];
  /** Function calls found in the template */
  functions: Array<{
    name: string;
    args: string[];
  }>;
  /** Parsing errors */
  errors: string[];
  /** Original template */
  template: string;
}

/**
 * Variable function definition for advanced variables
 */
export interface VariableFunction {
  /** Function name */
  name: string;
  /** Function description */
  description: string;
  /** Parameter definitions */
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    description: string;
    defaultValue?: unknown;
  }>;
  /** Function implementation */
  execute: (
    args: unknown[],
    context: VariableContext
  ) => Promise<string> | string;
  /** Whether the function is built-in */
  isBuiltIn: boolean;
}

/**
 * Variable usage statistics
 */
export interface VariableUsageStats {
  /** Variable ID */
  variableId: string;
  /** Number of times used */
  usageCount: number;
  /** Last usage timestamp */
  lastUsed?: Date;
  /** Average resolution time */
  averageResolutionTime: number;
  /** Number of resolution errors */
  errorCount: number;
  /** Last error message */
  lastError?: string;
  /** Rules that use this variable */
  usedInRules: string[];
}

/**
 * Variable export/import data structure
 */
export interface VariableExportData {
  /** Export format version */
  version: string;
  /** Export timestamp */
  exportDate: Date;
  /** Exported variables */
  variables: Variable[];
  /** Export metadata */
  metadata: {
    totalVariables: number;
    exportedBy: string;
    includeSecrets: boolean;
  };
}

/**
 * Variable import result
 */
export interface VariableImportResult {
  /** Whether import was successful */
  success: boolean;
  /** Number of variables imported */
  imported: number;
  /** Import errors */
  errors: string[];
  /** Import warnings */
  warnings: string[];
  /** Variables that were skipped due to conflicts */
  skipped: string[];
  /** Variables that were updated */
  updated: string[];
}

/**
 * Built-in system variables that are always available
 */
export const SYSTEM_VARIABLES: Readonly<
  Record<string, Omit<Variable, 'id' | 'metadata'>>
> = {
  timestamp: {
    name: 'timestamp',
    value: '${timestamp()}',
    scope: VariableScope.SYSTEM,
    description: 'Current Unix timestamp (generated when variable is used)',
    enabled: true,
    tags: ['time', 'system'],
  },
  iso_date: {
    name: 'iso_date',
    value: '${iso_date()}',
    scope: VariableScope.SYSTEM,
    description: 'Current ISO date string (generated when variable is used)',
    enabled: true,
    tags: ['time', 'system'],
  },
  uuid: {
    name: 'uuid',
    value: '${uuid()}',
    scope: VariableScope.SYSTEM,
    description: 'Generated UUID v4 (generated when variable is used)',
    enabled: true,
    tags: ['random', 'system'],
  },
  request_id: {
    name: 'request_id',
    value: '${uuid()}',
    scope: VariableScope.SYSTEM,
    description: 'Unique request identifier (generated when variable is used)',
    enabled: true,
    tags: ['request', 'system'],
  },
} satisfies Readonly<Record<string, Omit<Variable, 'id' | 'metadata'>>>;

/**
 * Variable template syntax patterns
 */
export const VARIABLE_PATTERNS = {
  /** Pattern for variable references: ${variable_name} */
  VARIABLE_REFERENCE: /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g,
  /** Pattern for function calls: ${function_name(arg1, arg2)} */
  FUNCTION_CALL: /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\(([^)]*)\)\}/g,
  /** Pattern for variable names */
  VARIABLE_NAME: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  /** Pattern for function names */
  FUNCTION_NAME: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
} satisfies Record<string, RegExp>;

/**
 * Variable validation error codes
 */
export enum VariableErrorCode {
  INVALID_NAME = 'INVALID_NAME',
  INVALID_VALUE = 'INVALID_VALUE',
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_SCOPE = 'INVALID_SCOPE',
  CIRCULAR_REFERENCE = 'CIRCULAR_REFERENCE',
  UNRESOLVED_VARIABLE = 'UNRESOLVED_VARIABLE',
  FUNCTION_NOT_FOUND = 'FUNCTION_NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

/**
 * Variable error with detailed information
 */
export interface VariableError extends Error {
  code: VariableErrorCode;
  variableName?: string;
  template?: string;
  context?: unknown;
}
