/**
 * Variable-related message handler
 */

import { STORAGE_KEYS } from '@/config/constants';
import { VariableResolver } from '@/lib/core/variable-resolver';
import { saveGlobalVariable } from '@/lib/core/variable-storage/operations/globalOperations';
import { saveProfileVariable } from '@/lib/core/variable-storage/operations/profileOperations';
import { getAllVariables } from '@/lib/core/variable-storage/utils/storageUtils';
import type { Variable, VariableContext } from '@/shared/types/variables';
import { VariableScope } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

// Variable handler specific interfaces
interface RequestContext {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  tabId?: number;
  timestamp?: number;
  [key: string]: unknown;
}

interface VariableUsageStats {
  totalResolutions: number;
  uniqueVariables: string[];
  mostUsedVariables: Array<{ name: string; count: number }>;
  errorRate: number;
  averageResolutionTime: number;
  timeRange: 'hour' | 'day' | 'week' | 'month';
  profileId?: string;
}

interface VariableExportMetadata {
  exportedAt: string;
  version: string;
  includeGlobal: boolean;
  includeSystem: boolean;
  profileId?: string;
}

interface VariableExportResult {
  globalVariables?: Variable[];
  profileVariables?: Record<string, Variable[]>;
  systemVariables?: Variable[];
  metadata: VariableExportMetadata;
}

interface VariableImportResult {
  imported: { global: number; profiles: Record<string, number> };
  skipped: { global: number; profiles: Record<string, number> };
  errors: string[];
}

interface VariableResolutionResult {
  success: boolean;
  value?: string;
  error?: string;
}

interface TemplateResolutionResult extends VariableResolutionResult {
  resolvedVariables?: string[];
}

interface VariableTestResult {
  contextName: string;
  success: boolean;
  value?: string;
  error?: string;
  executionTime: number;
}

interface VariableValidationResult {
  valid: boolean;
  errors: string[];
}

interface CacheClearResult {
  success: boolean;
  clearedCount: number;
}

type VariableHandlerResponse =
  | VariableResolutionResult
  | TemplateResolutionResult
  | { variables: string[]; functions: string[]; isValid: boolean }
  | VariableContext
  | VariableValidationResult
  | VariableTestResult[]
  | Variable[]
  | CacheClearResult
  | VariableUsageStats
  | VariableExportResult
  | VariableImportResult;

export class VariableHandler {
  /**
   * Handle variable-related messages
   */
  static async handleMessage(
    action: string,
    data: unknown,
    _sender: chrome.runtime.MessageSender
  ): Promise<VariableHandlerResponse> {
    switch (action) {
      case 'resolveVariable':
        return await this.handleResolveVariable(
          data as {
            variableName: string;
            context?: Partial<VariableContext>;
            requestContext?: RequestContext;
          }
        );

      case 'resolveTemplate':
        return await this.handleResolveTemplate(
          data as {
            template: string;
            context?: Partial<VariableContext>;
            requestContext?: RequestContext;
          }
        );

      case 'parseTemplate':
        return await this.handleParseTemplate(data as { template: string });

      case 'getVariableContext':
        return await this.handleGetVariableContext(
          data as
            | {
                profileId?: string;
                includeRequestContext?: boolean;
                requestDetails?: RequestContext;
              }
            | undefined
        );

      case 'validateVariable':
        return await this.handleValidateVariable(
          data as { variable: Partial<Variable> }
        );

      case 'testVariableResolution':
        return await this.handleTestVariableResolution(
          data as {
            template: string;
            testContexts?: Array<{
              name: string;
              context: Partial<VariableContext>;
              requestContext?: RequestContext;
            }>;
          }
        );

      case 'getSystemVariables':
        return await this.handleGetSystemVariables();

      case 'clearVariableCache':
        return await this.handleClearVariableCache();

      case 'getVariableUsage':
        return await this.handleGetVariableUsage(
          data as
            | {
                profileId?: string;
                timeRange?: 'hour' | 'day' | 'week' | 'month';
              }
            | undefined
        );

      case 'exportVariables':
        return await this.handleExportVariables(
          data as
            | {
                profileId?: string;
                includeGlobal?: boolean;
                includeSystem?: boolean;
              }
            | undefined
        );

      case 'importVariables':
        return await this.handleImportVariables(
          data as {
            globalVariables?: Variable[];
            profileVariables?: Record<string, Variable[]>;
            options?: {
              overwrite?: boolean;
              targetProfileId?: string;
              validateBeforeImport?: boolean;
            };
          }
        );

      default:
        throw new Error(`Unknown variable action: ${action}`);
    }
  }

  /**
   * Resolve a single variable
   */
  private static async handleResolveVariable(data: {
    variableName: string;
    context?: Partial<VariableContext>;
    requestContext?: RequestContext;
  }): Promise<VariableResolutionResult> {
    try {
      const context = await this.buildVariableContext(
        data.context,
        data.requestContext
      );
      const result = await VariableResolver.resolve(
        `\${${data.variableName}}`,
        context
      );

      const returnResult: { success: boolean; value?: string; error?: string } =
        {
          success: result.success,
        };

      if (result.value !== undefined) {
        returnResult.value = result.value;
      }
      if (result.error !== undefined) {
        returnResult.error = result.error;
      }

      return returnResult;
    } catch (error) {
      logger.error('Error resolving variable:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Resolve a template string
   */
  private static async handleResolveTemplate(data: {
    template: string;
    context?: Partial<VariableContext>;
    requestContext?: RequestContext;
  }): Promise<TemplateResolutionResult> {
    try {
      const context = await this.buildVariableContext(
        data.context,
        data.requestContext
      );
      const result = await VariableResolver.resolve(data.template, context);

      const returnResult: {
        success: boolean;
        value?: string;
        error?: string;
        resolvedVariables?: string[];
      } = {
        success: result.success,
      };

      if (result.value !== undefined) {
        returnResult.value = result.value;
      }
      if (result.error !== undefined) {
        returnResult.error = result.error;
      }
      if (result.resolvedVariables !== undefined) {
        returnResult.resolvedVariables = result.resolvedVariables;
      }

      return returnResult;
    } catch (error) {
      logger.error('Error resolving template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse a template to extract variables and functions
   */
  private static async handleParseTemplate(data: {
    template: string;
  }): Promise<{ variables: string[]; functions: string[]; isValid: boolean }> {
    try {
      const parseResult = VariableResolver.parseTemplate(data.template);
      return {
        variables: parseResult.variables,
        functions: parseResult.functions.map(f => f.name),
        isValid: parseResult.success,
      };
    } catch (error) {
      logger.error('Error parsing template:', error);
      return {
        variables: [],
        functions: [],
        isValid: false,
      };
    }
  }

  /**
   * Get variable context for resolution
   */
  private static async handleGetVariableContext(data?: {
    profileId?: string;
    includeRequestContext?: boolean;
    requestDetails?: RequestContext;
  }): Promise<VariableContext> {
    try {
      return await this.buildVariableContext(
        { profileId: data?.profileId },
        data?.includeRequestContext ? data?.requestDetails : undefined
      );
    } catch (error) {
      logger.error('Error getting variable context:', error);
      throw error;
    }
  }

  /**
   * Validate a variable definition
   */
  private static async handleValidateVariable(data: {
    variable: Partial<Variable>;
  }): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];

      // Basic validation
      if (!data.variable.name) {
        errors.push('Variable name is required');
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(data.variable.name)) {
        errors.push(
          'Variable name must be a valid identifier (letters, numbers, underscore)'
        );
      }

      if (!data.variable.value) {
        errors.push('Variable value is required');
      }

      if (!data.variable.scope) {
        errors.push('Variable scope is required');
      }

      // Test resolution if value is provided
      if (data.variable.value && errors.length === 0) {
        try {
          const context = await this.buildVariableContext();
          const testResult = await VariableResolver.resolve(
            data.variable.value,
            context
          );
          if (!testResult.success) {
            errors.push(`Variable resolution test failed: ${testResult.error}`);
          }
        } catch (error) {
          errors.push(
            `Variable resolution test error: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error('Error validating variable:', error);
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Test variable resolution with different contexts
   */
  private static async handleTestVariableResolution(data: {
    template: string;
    testContexts?: Array<{
      name: string;
      context: Partial<VariableContext>;
      requestContext?: RequestContext;
    }>;
  }): Promise<VariableTestResult[]> {
    try {
      const results = [];
      const testContexts = data.testContexts || [
        { name: 'default', context: {} },
      ];

      for (const testContext of testContexts) {
        const startTime = performance.now();

        try {
          const context = await this.buildVariableContext(
            testContext.context,
            testContext.requestContext
          );
          const result = await VariableResolver.resolve(data.template, context);

          const testResult: {
            contextName: string;
            success: boolean;
            value?: string;
            error?: string;
            executionTime: number;
          } = {
            contextName: testContext.name,
            success: result.success,
            executionTime: performance.now() - startTime,
          };

          if (result.value !== undefined) {
            testResult.value = result.value;
          }
          if (result.error !== undefined) {
            testResult.error = result.error;
          }

          results.push(testResult);
        } catch (error) {
          results.push({
            contextName: testContext.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: performance.now() - startTime,
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error testing variable resolution:', error);
      throw error;
    }
  }

  /**
   * Get system variables
   */
  private static async handleGetSystemVariables(): Promise<Variable[]> {
    try {
      return VariableResolver.getAvailableFunctions().map(func => ({
        id: `system_${func.name}`,
        name: func.name,
        value: func.description,
        scope: VariableScope.SYSTEM,
        enabled: true,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }));
    } catch (error) {
      logger.error('Error getting system variables:', error);
      throw error;
    }
  }

  /**
   * Clear variable cache
   */
  private static async handleClearVariableCache(): Promise<{
    success: boolean;
    clearedCount: number;
  }> {
    try {
      // VariableResolver doesn't have a clearCache method, so we'll simulate it
      return {
        success: true,
        clearedCount: 0,
      };
    } catch (error) {
      logger.error('Error clearing variable cache:', error);
      throw error;
    }
  }

  /**
   * Get variable usage statistics
   */
  private static async handleGetVariableUsage(data?: {
    profileId?: string;
    timeRange?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<VariableUsageStats> {
    try {
      // This would typically come from analytics/usage tracking
      // For now, return a placeholder structure
      const usage: VariableUsageStats = {
        totalResolutions: 0,
        uniqueVariables: [],
        mostUsedVariables: [],
        errorRate: 0,
        averageResolutionTime: 0,
        timeRange: data?.timeRange || 'day',
      };

      if (data?.profileId) {
        usage.profileId = data.profileId;
      }

      // In a real implementation, you would query usage statistics from storage
      // const statsData = await ChromeApiUtils.storage.local.get(['variableUsageStats']);
      // Process and filter the stats based on timeRange and profileId

      return usage;
    } catch (error) {
      logger.error('Error getting variable usage:', error);
      throw error;
    }
  }

  /**
   * Export variables
   */
  private static async handleExportVariables(data?: {
    profileId?: string;
    includeGlobal?: boolean;
    includeSystem?: boolean;
  }): Promise<VariableExportResult> {
    try {
      const result: VariableExportResult = {
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          includeGlobal: data?.includeGlobal !== false,
          includeSystem: data?.includeSystem || false,
        },
      };

      if (data?.profileId) {
        result.metadata.profileId = data.profileId;
      }

      // Get variables from storage
      const variablesData = await getAllVariables();

      // Include global variables
      if (data?.includeGlobal !== false) {
        result.globalVariables = Object.values(variablesData.global || {});
      }

      // Include profile variables
      if (data?.profileId) {
        const profileVars = variablesData.profiles?.[data.profileId];
        if (profileVars) {
          result.profileVariables = {
            [data.profileId]: Object.values(profileVars),
          };
        }
      } else {
        // Include all profile variables
        result.profileVariables = {};
        for (const [profileId, vars] of Object.entries(
          variablesData.profiles || {}
        )) {
          result.profileVariables[profileId] = Object.values(vars);
        }
      }

      // Include system variables if requested
      if (data?.includeSystem) {
        result.systemVariables = VariableResolver.getAvailableFunctions().map(
          func => ({
            id: `system_${func.name}`,
            name: func.name,
            value: func.description,
            scope: VariableScope.SYSTEM,
            enabled: true,
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
        );
      }

      return result;
    } catch (error) {
      logger.error('Error exporting variables:', error);
      throw error;
    }
  }

  /**
   * Import variables
   */
  private static async handleImportVariables(data: {
    globalVariables?: Variable[];
    profileVariables?: Record<string, Variable[]>;
    options?: {
      overwrite?: boolean;
      targetProfileId?: string;
      validateBeforeImport?: boolean;
    };
  }): Promise<{
    imported: { global: number; profiles: Record<string, number> };
    skipped: { global: number; profiles: Record<string, number> };
    errors: string[];
  }> {
    try {
      const result = {
        imported: { global: 0, profiles: {} as Record<string, number> },
        skipped: { global: 0, profiles: {} as Record<string, number> },
        errors: [] as string[],
      };

      // Get existing variables
      const existingVariables = await getAllVariables();

      // Import global variables
      if (data.globalVariables) {
        for (const variable of data.globalVariables) {
          try {
            // Validate if requested
            if (data.options?.validateBeforeImport) {
              const validation = await this.handleValidateVariable({
                variable,
              });
              if (!validation.valid) {
                result.errors.push(
                  `Global variable ${variable.name}: ${validation.errors.join(', ')}`
                );
                result.skipped.global++;
                continue;
              }
            }

            // Check if exists and overwrite is not allowed
            if (
              existingVariables.global[variable.id] &&
              !data.options?.overwrite
            ) {
              result.skipped.global++;
              continue;
            }

            // Import the variable
            await saveGlobalVariable(variable);
            result.imported.global++;
          } catch (error) {
            result.errors.push(
              `Global variable ${variable.name}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`
            );
            result.skipped.global++;
          }
        }
      }

      // Import profile variables
      if (data.profileVariables) {
        for (const [profileId, variables] of Object.entries(
          data.profileVariables
        )) {
          const targetProfile = data.options?.targetProfileId || profileId;

          if (!result.imported.profiles[targetProfile]) {
            result.imported.profiles[targetProfile] = 0;
          }
          if (!result.skipped.profiles[targetProfile]) {
            result.skipped.profiles[targetProfile] = 0;
          }

          for (const variable of variables) {
            try {
              // Validate if requested
              if (data.options?.validateBeforeImport) {
                const validation = await this.handleValidateVariable({
                  variable,
                });
                if (!validation.valid) {
                  result.errors.push(
                    `Profile variable ${variable.name} (${targetProfile}): ${validation.errors.join(', ')}`
                  );
                  result.skipped.profiles[targetProfile] =
                    (result.skipped.profiles[targetProfile] || 0) + 1;
                  continue;
                }
              }

              // Check if exists and overwrite is not allowed
              const existingProfileVars =
                existingVariables.profiles[targetProfile] || {};
              if (
                existingProfileVars[variable.id] &&
                !data.options?.overwrite
              ) {
                result.skipped.profiles[targetProfile] =
                  (result.skipped.profiles[targetProfile] || 0) + 1;
                continue;
              }

              // Import the variable
              await saveProfileVariable(targetProfile, variable);
              result.imported.profiles[targetProfile] =
                (result.imported.profiles[targetProfile] || 0) + 1;
            } catch (error) {
              result.errors.push(
                `Profile variable ${variable.name} (${targetProfile}): ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`
              );
              result.skipped.profiles[targetProfile] =
                (result.skipped.profiles[targetProfile] || 0) + 1;
            }
          }
        }
      }

      return result;
    } catch (error) {
      logger.error('Error importing variables:', error);
      throw error;
    }
  }

  /**
   * Build variable context for resolution
   */
  private static async buildVariableContext(
    contextOverrides?: Partial<VariableContext>,
    requestDetails?: RequestContext
  ): Promise<VariableContext> {
    try {
      // Get current variables from storage
      const variablesData = await getAllVariables();
      const globalVariables = variablesData.global || {};
      const profileVariables = variablesData.profiles || {};

      // Get active profile
      const profileData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.ACTIVE_PROFILE,
      ]);
      const activeProfile =
        contextOverrides?.profileId ||
        ((profileData as Record<string, unknown>)[
          STORAGE_KEYS.ACTIVE_PROFILE
        ] as string) ||
        'dev-profile';

      const systemVariables = VariableResolver.getAvailableFunctions().map(
        func => ({
          id: `system_${func.name}`,
          name: func.name,
          value: func.description,
          scope: VariableScope.SYSTEM,
          enabled: true,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      );

      const context: VariableContext = {
        systemVariables,
        globalVariables: Object.values(globalVariables).filter(
          (v): v is Variable => v.enabled !== false
        ),
        profileVariables: Object.values(
          profileVariables[activeProfile] || {}
        ).filter((v): v is Variable => v.enabled !== false),
        ruleVariables: [], // Rule-specific variables would be added per rule
        profileId: activeProfile,
        ...contextOverrides,
      };

      // Add request context if available
      if (requestDetails && requestDetails.url && requestDetails.method) {
        const requestContextData: {
          url: string;
          method: string;
          headers?: Record<string, string>;
          tabId?: number;
        } = {
          url: requestDetails.url,
          method: requestDetails.method,
        };

        if (requestDetails.headers) {
          requestContextData.headers = requestDetails.headers;
        }

        if (requestDetails.tabId) {
          requestContextData.tabId = requestDetails.tabId;
        }

        context.requestContext =
          VariableResolver.buildRequestContext(requestContextData);
      }

      return context;
    } catch (error) {
      logger.error('Error building variable context:', error);
      throw error;
    }
  }
}
