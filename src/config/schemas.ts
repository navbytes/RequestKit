import { z } from 'zod';

import {
  HEADER_OPERATIONS,
  CONDITION_TYPES,
  CONDITION_OPERATORS,
  PROTOCOLS,
  VALIDATION_PATTERNS,
  UI_CONSTANTS,
} from './constants';

// Basic schemas
export const HeaderOperationSchema = z.enum([
  HEADER_OPERATIONS.SET,
  HEADER_OPERATIONS.APPEND,
  HEADER_OPERATIONS.REMOVE,
] as const);

export const ProtocolSchema = z.enum([
  PROTOCOLS.HTTP,
  PROTOCOLS.HTTPS,
  PROTOCOLS.ANY,
] as const);

export const ConditionTypeSchema = z.enum([
  CONDITION_TYPES.URL,
  CONDITION_TYPES.METHOD,
  CONDITION_TYPES.HEADER,
  CONDITION_TYPES.TIME,
  CONDITION_TYPES.CUSTOM,
] as const);

export const ConditionOperatorSchema = z.enum([
  CONDITION_OPERATORS.EQUALS,
  CONDITION_OPERATORS.CONTAINS,
  CONDITION_OPERATORS.STARTS_WITH,
  CONDITION_OPERATORS.ENDS_WITH,
  CONDITION_OPERATORS.REGEX,
  CONDITION_OPERATORS.EXISTS,
  CONDITION_OPERATORS.NOT,
] as const);

// URL Pattern schema
export const URLPatternSchema = z.object({
  protocol: ProtocolSchema.optional(),
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(VALIDATION_PATTERNS.DOMAIN, 'Invalid domain pattern'),
  path: z
    .string()
    .regex(VALIDATION_PATTERNS.URL_PATH, 'Path must start with /')
    .optional(),
  query: z.string().optional(),
  port: z.string().regex(VALIDATION_PATTERNS.PORT, 'Invalid port').optional(),
});

// Header Entry schema
export const HeaderEntrySchema = z.object({
  name: z
    .string()
    .min(1, 'Header name is required')
    .regex(VALIDATION_PATTERNS.HEADER_NAME, 'Invalid header name'),
  value: z
    .string()
    .max(UI_CONSTANTS.MAX_HEADER_VALUE_LENGTH, 'Header value too long'),
  operation: HeaderOperationSchema,
});

// Rule Condition schema
export const RuleConditionSchema = z.object({
  type: ConditionTypeSchema,
  operator: ConditionOperatorSchema,
  value: z.string().min(1, 'Condition value is required'),
  caseSensitive: z.boolean().optional().default(false),
});

// Conditional Logic schema (recursive)
export const ConditionalLogicSchema: z.ZodSchema = z.lazy(() =>
  z.object({
    operator: z.enum(['AND', 'OR']),
    conditions: z
      .array(z.union([RuleConditionSchema, ConditionalLogicSchema]))
      .min(1, 'At least one condition is required'),
  })
);

// Rule Schedule schema
export const RuleScheduleSchema = z.object({
  enabled: z.boolean(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timeRanges: z
    .array(
      z.object({
        start: z
          .string()
          .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
        end: z
          .string()
          .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
        days: z
          .array(z.number().min(0).max(6))
          .min(1, 'At least one day must be selected'),
      })
    )
    .optional(),
  timezone: z.string().optional(),
});

// Rule Limits schema
export const RuleLimitsSchema = z.object({
  maxMatches: z.number().positive().optional(),
  maxMatchesPerHour: z.number().positive().optional(),
  maxMatchesPerDay: z.number().positive().optional(),
  cooldownPeriod: z.number().positive().optional(),
});

// Header Rule schema
export const HeaderRuleSchema = z.object({
  id: z.string().min(1, 'Rule ID is required'),
  name: z
    .string()
    .min(1, 'Rule name is required')
    .max(UI_CONSTANTS.MAX_RULE_NAME_LENGTH, 'Rule name too long'),
  enabled: z.boolean(),
  pattern: URLPatternSchema,
  headers: z.array(HeaderEntrySchema).min(1, 'At least one header is required'),
  conditions: z.array(RuleConditionSchema).optional(),
  priority: z.number().min(1).max(2147483647),
  createdAt: z.date(),
  updatedAt: z.date(),
  description: z
    .string()
    .max(UI_CONSTANTS.MAX_DESCRIPTION_LENGTH, 'Description too long')
    .optional(),
  tags: z.array(z.string()).optional(),
});

// Advanced Rule schema
export const AdvancedRuleSchema = HeaderRuleSchema.omit({
  conditions: true,
}).extend({
  conditionalLogic: ConditionalLogicSchema.optional(),
  schedule: RuleScheduleSchema.optional(),
  limits: RuleLimitsSchema.optional(),
});

// Rule Template schema
export const RuleTemplateSchema = z.object({
  id: z.string().min(1, 'Template ID is required'),
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(UI_CONSTANTS.MAX_RULE_NAME_LENGTH, 'Template name too long'),
  description: z
    .string()
    .max(UI_CONSTANTS.MAX_DESCRIPTION_LENGTH, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
  headers: z.array(HeaderEntrySchema).min(1, 'At least one header is required'),
  pattern: URLPatternSchema.partial().optional(),
  conditions: z.array(RuleConditionSchema).optional(),
  tags: z.array(z.string()),
  isBuiltIn: z.boolean(),
});

// Extension Settings schema
export const ExtensionSettingsSchema = z.object({
  enabled: z.boolean(),
  debugMode: z.boolean(),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']),
  notifications: z.object({
    enabled: z.boolean(),
    showRuleMatches: z.boolean(),
    showErrors: z.boolean(),
    showUpdates: z.boolean(),
  }),
  ui: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    compactMode: z.boolean(),
    showAdvancedOptions: z.boolean(),
    defaultTab: z.string(),
  }),
  performance: z.object({
    maxRules: z.number().positive(),
    cacheTimeout: z.number().positive(),
    enableMetrics: z.boolean(),
  }),
  backup: z.object({
    autoBackup: z.boolean(),
    backupInterval: z.number().positive(),
    maxBackups: z.number().positive(),
  }),
  security: z.object({
    requireConfirmation: z.boolean(),
    allowExternalImport: z.boolean(),
    validatePatterns: z.boolean(),
  }),
});

// Storage Data schema
export const StorageDataSchema = z.object({
  rules: z.record(z.string(), HeaderRuleSchema),
  templates: z.record(z.string(), RuleTemplateSchema),
  settings: ExtensionSettingsSchema,
  stats: z.record(
    z.string(),
    z.object({
      ruleId: z.string(),
      matchCount: z.number(),
      lastMatched: z.date().optional(),
      averageExecutionTime: z.number(),
      errorCount: z.number(),
      lastError: z.string().optional(),
    })
  ),
  version: z.string(),
  lastBackup: z.date().optional(),
});

// Export options schema
export const ExportOptionsSchema = z.object({
  includeRules: z.boolean(),
  includeTemplates: z.boolean(),
  includeSettings: z.boolean(),
  includeStats: z.boolean(),
  format: z.enum(['json', 'yaml']),
  compress: z.boolean(),
});

// Import validation schema
export const ImportDataSchema = z.object({
  version: z.string().optional(),
  rules: z.record(z.string(), HeaderRuleSchema).optional(),
  templates: z.record(z.string(), RuleTemplateSchema).optional(),
  settings: ExtensionSettingsSchema.optional(),
});

// Form validation schemas for UI
export const CreateRuleFormSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  priority: z.number().min(1).max(100).default(50),
  pattern: URLPatternSchema,
  headers: z.array(HeaderEntrySchema).min(1, 'At least one header is required'),
  tags: z.array(z.string()).optional(),
});

export const EditRuleFormSchema = CreateRuleFormSchema.partial().extend({
  id: z.string().min(1, 'Rule ID is required'),
});

// Validation helper functions
export const validateRule = (rule: unknown) => {
  return HeaderRuleSchema.safeParse(rule);
};

export const validateTemplate = (template: unknown) => {
  return RuleTemplateSchema.safeParse(template);
};

export const validateSettings = (settings: unknown) => {
  return ExtensionSettingsSchema.safeParse(settings);
};

export const validateImportData = (data: unknown) => {
  return ImportDataSchema.safeParse(data);
};

// Type inference from schemas
export type HeaderRuleType = z.infer<typeof HeaderRuleSchema>;
export type RuleTemplateType = z.infer<typeof RuleTemplateSchema>;
export type ExtensionSettingsType = z.infer<typeof ExtensionSettingsSchema>;
export type StorageDataType = z.infer<typeof StorageDataSchema>;
export type CreateRuleFormType = z.infer<typeof CreateRuleFormSchema>;
export type EditRuleFormType = z.infer<typeof EditRuleFormSchema>;
