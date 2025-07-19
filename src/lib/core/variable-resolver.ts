/**
 * Variable resolution engine for RequestKit
 * Handles template parsing and variable resolution with scope priority
 */

import type {
  Variable,
  VariableContext,
  VariableResolutionResult,
  TemplateParseResult,
  VariableFunction,
  RequestContext,
} from '@/shared/types/variables';
import { VARIABLE_PATTERNS, SYSTEM_VARIABLES } from '@/shared/types/variables';
import { loggers } from '@/shared/utils/debug';

/**
 * Built-in variable functions for dynamic value generation
 */

// Get logger for this module
const logger = loggers.coreVariableResolver;

const BUILT_IN_FUNCTIONS: Record<string, VariableFunction> = {
  timestamp: {
    name: 'timestamp',
    description: 'Generate current Unix timestamp',
    parameters: [],
    execute: () => Math.floor(Date.now() / 1000).toString(),
    isBuiltIn: true,
  },
  iso_date: {
    name: 'iso_date',
    description: 'Generate current ISO date string',
    parameters: [],
    execute: () => new Date().toISOString(),
    isBuiltIn: true,
  },
  uuid: {
    name: 'uuid',
    description: 'Generate UUID v4',
    parameters: [],
    execute: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    },
    isBuiltIn: true,
  },
  random: {
    name: 'random',
    description: 'Generate random number between min and max',
    parameters: [
      {
        name: 'min',
        type: 'number',
        required: true,
        description: 'Minimum value',
      },
      {
        name: 'max',
        type: 'number',
        required: true,
        description: 'Maximum value',
      },
    ],
    execute: (args: unknown[]) => {
      const min = parseInt(String(args[0])) || 0;
      const max = parseInt(String(args[1])) || 100;
      return Math.floor(Math.random() * (max - min + 1) + min).toString();
    },
    isBuiltIn: true,
  },
  base64: {
    name: 'base64',
    description: 'Base64 encode a value',
    parameters: [
      {
        name: 'value',
        type: 'string',
        required: true,
        description: 'Value to encode',
      },
    ],
    execute: (args: unknown[]) => {
      const value = String(args[0]) || '';
      return btoa(value);
    },
    isBuiltIn: true,
  },
  date: {
    name: 'date',
    description: 'Format current date',
    parameters: [
      {
        name: 'format',
        type: 'string',
        required: false,
        description: 'Date format (iso, locale, timestamp)',
        defaultValue: 'iso',
      },
    ],
    execute: (args: unknown[]) => {
      const format = String(args[0]) || 'iso';
      const now = new Date();

      switch (format.toLowerCase()) {
        case 'iso':
          return now.toISOString();
        case 'locale':
          return now.toLocaleString();
        case 'timestamp':
          return Math.floor(now.getTime() / 1000).toString();
        default:
          return now.toISOString();
      }
    },
    isBuiltIn: true,
  },
};

/**
 * Variable resolver class for handling template resolution
 */
export class VariableResolver {
  private static readonly MAX_RESOLUTION_DEPTH = 10;

  /**
   * Parse a template to extract variable references and function calls
   */
  static parseTemplate(template: string): TemplateParseResult {
    const variables: string[] = [];
    const functions: Array<{ name: string; args: string[] }> = [];
    const errors: string[] = [];

    logger.info('[FUNCTION_DEBUG] Parsing template:', { template });

    try {
      // Find variable references: ${variable_name}
      const variableMatches = template.matchAll(
        VARIABLE_PATTERNS.VARIABLE_REFERENCE
      );
      logger.info('[FUNCTION_DEBUG] Variable matches found:', {
        matches: Array.from(
          template.matchAll(VARIABLE_PATTERNS.VARIABLE_REFERENCE)
        ).map(m => ({
          fullMatch: m[0],
          variableName: m[1],
        })),
      });

      for (const match of variableMatches) {
        const variableName = match[1];
        if (variableName && !variables.includes(variableName)) {
          if (VARIABLE_PATTERNS.VARIABLE_NAME.test(variableName)) {
            variables.push(variableName);
          } else {
            errors.push(`Invalid variable name: ${variableName}`);
          }
        }
      }

      // Find function calls: ${function_name(arg1, arg2)}
      const functionMatches = template.matchAll(
        VARIABLE_PATTERNS.FUNCTION_CALL
      );
      logger.info('[FUNCTION_DEBUG] Function matches found:', {
        matches: Array.from(
          template.matchAll(VARIABLE_PATTERNS.FUNCTION_CALL)
        ).map(m => ({
          fullMatch: m[0],
          functionName: m[1],
          argsString: m[2],
        })),
      });

      for (const match of functionMatches) {
        const functionName = match[1];
        const argsString = match[2] || '';

        if (functionName) {
          if (VARIABLE_PATTERNS.FUNCTION_NAME.test(functionName)) {
            const args = argsString
              .split(',')
              .map(arg => arg.trim())
              .filter(arg => arg.length > 0);

            functions.push({ name: functionName, args });
            logger.info('[FUNCTION_DEBUG] Function parsed:', {
              functionName,
              args,
            });
          } else {
            errors.push(`Invalid function name: ${functionName}`);
          }
        }
      }

      const result = {
        success: errors.length === 0,
        variables,
        functions,
        errors,
        template,
      };

      logger.info('[FUNCTION_DEBUG] Parse result:', result);
      return result;
    } catch (error) {
      logger.error('[FUNCTION_DEBUG] Parse error:', error);
      return {
        success: false,
        variables: [],
        functions: [],
        errors: [`Template parsing failed: ${error}`],
        template,
      };
    }
  }

  /**
   * Resolve a template with the given variable context
   */
  static async resolve(
    template: string,
    context: VariableContext
  ): Promise<VariableResolutionResult> {
    const startTime = Date.now();

    try {
      // Parse the template first
      const parseResult = this.parseTemplate(template);
      if (!parseResult.success) {
        return {
          success: false,
          error: `Template parsing failed: ${parseResult.errors.join(', ')}`,
          resolvedVariables: [],
          unresolvedVariables: [],
          resolutionTime: Date.now() - startTime,
        };
      }

      // Build variable lookup map with scope priority
      const variableLookup = this.buildVariableLookup(context);

      // Resolve the template
      const resolutionResult = await this.resolveWithDepthLimit(
        template,
        variableLookup,
        context,
        0
      );

      return {
        ...resolutionResult,
        resolutionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: `Resolution failed: ${error}`,
        resolvedVariables: [],
        unresolvedVariables: [],
        resolutionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Build variable lookup map with scope priority (Rule > Profile > Global > System)
   */
  private static buildVariableLookup(
    context: VariableContext
  ): Map<string, Variable> {
    const lookup = new Map<string, Variable>();

    // Add system variables (lowest priority)
    Object.entries(SYSTEM_VARIABLES).forEach(([name, varDef]) => {
      const systemVar: Variable = {
        id: `system_${name}`,
        name,
        value: varDef.value,
        scope: varDef.scope,
        ...(varDef.description && { description: varDef.description }),
        enabled: varDef.enabled ?? true,
        ...(varDef.tags && { tags: varDef.tags }),
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      lookup.set(name, systemVar);
    });

    // Add global variables (override system)
    context.globalVariables.forEach(variable => {
      if (variable.enabled !== false) {
        lookup.set(variable.name, variable);
      }
    });

    // Add profile variables (override global)
    context.profileVariables.forEach(variable => {
      if (variable.enabled !== false) {
        lookup.set(variable.name, variable);
      }
    });

    // Add rule variables (highest priority)
    context.ruleVariables.forEach(variable => {
      if (variable.enabled !== false) {
        lookup.set(variable.name, variable);
      }
    });

    return lookup;
  }

  /**
   * Resolve template with depth limit to prevent infinite recursion
   */
  private static async resolveWithDepthLimit(
    template: string,
    variableLookup: Map<string, Variable>,
    context: VariableContext,
    depth: number
  ): Promise<Omit<VariableResolutionResult, 'resolutionTime'>> {
    if (depth >= this.MAX_RESOLUTION_DEPTH) {
      return {
        success: false,
        error:
          'Maximum resolution depth exceeded (possible circular reference)',
        resolvedVariables: [],
        unresolvedVariables: [],
      };
    }

    const resolvedVariables: string[] = [];
    const unresolvedVariables: string[] = [];
    let resolvedTemplate = template;

    // Resolve function calls first
    const functionMatches = [
      ...template.matchAll(VARIABLE_PATTERNS.FUNCTION_CALL),
    ];

    logger.info('[FUNCTION_DEBUG] Processing function calls:', {
      template,
      functionMatches: functionMatches.map(m => ({
        fullMatch: m[0],
        functionName: m[1],
        argsString: m[2],
      })),
    });

    for (const match of functionMatches) {
      const fullMatch = match[0];
      const functionName = match[1];
      const argsString = match[2] || '';

      if (!functionName) continue;

      logger.info('[FUNCTION_DEBUG] Processing function call:', {
        fullMatch,
        functionName,
        argsString,
      });

      try {
        const functionResult = await this.executeFunction(
          functionName,
          argsString,
          context
        );
        logger.info('[FUNCTION_DEBUG] Function call resolved:', {
          functionName,
          fullMatch,
          functionResult,
          beforeReplace: resolvedTemplate,
        });

        resolvedTemplate = resolvedTemplate.replace(fullMatch, functionResult);
        resolvedVariables.push(`${functionName}()`);

        logger.info('[FUNCTION_DEBUG] Template after function replacement:', {
          resolvedTemplate,
        });
      } catch (error) {
        logger.error('[FUNCTION_DEBUG] Function call failed:', {
          functionName,
          fullMatch,
          error: error instanceof Error ? error.message : error,
        });
        unresolvedVariables.push(`${functionName}()`);
        logger.warn(`Failed to execute function ${functionName}:`, error);
      }
    }

    // Resolve variable references
    const variableMatches = [
      ...resolvedTemplate.matchAll(VARIABLE_PATTERNS.VARIABLE_REFERENCE),
    ];

    logger.info('[DIAGNOSTIC] Variable resolution loop:', {
      template: resolvedTemplate,
      variableMatches: variableMatches.map(m => ({
        fullMatch: m[0],
        variableName: m[1],
      })),
      availableVariables: Array.from(variableLookup.keys()),
    });

    for (const match of variableMatches) {
      const fullMatch = match[0];
      const variableName = match[1];

      if (!variableName) continue;

      logger.info('[DIAGNOSTIC] Processing variable:', {
        variableName,
        fullMatch,
        variableExists: variableLookup.has(variableName),
      });

      const variable = variableLookup.get(variableName);
      if (variable) {
        logger.info('[DIAGNOSTIC] Found variable:', {
          name: variable.name,
          value: variable.value,
          scope: variable.scope,
        });

        try {
          let variableValue = await this.resolveVariableValue(variable);

          logger.info('[DIAGNOSTIC] Variable resolved to:', {
            variableName,
            originalValue: variable.value,
            resolvedValue: variableValue,
            containsMoreVariables: this.containsVariables(variableValue),
          });

          // If the resolved value contains more variables, resolve recursively
          if (this.containsVariables(variableValue)) {
            logger.info(
              '[DIAGNOSTIC] Attempting recursive resolution for:',
              variableValue
            );

            const nestedResult = await this.resolveWithDepthLimit(
              variableValue,
              variableLookup,
              context,
              depth + 1
            );

            logger.info('[DIAGNOSTIC] Recursive resolution result:', {
              template: variableValue,
              success: nestedResult.success,
              resolvedValue: nestedResult.value,
              error: nestedResult.error,
            });

            if (nestedResult.success && nestedResult.value) {
              variableValue = nestedResult.value;
              if (nestedResult.resolvedVariables) {
                resolvedVariables.push(...nestedResult.resolvedVariables);
              }
              if (nestedResult.unresolvedVariables) {
                unresolvedVariables.push(...nestedResult.unresolvedVariables);
              }
            }
          }

          logger.info('[DIAGNOSTIC] Final variable value:', {
            variableName,
            finalValue: variableValue,
            willReplace: `${fullMatch} -> ${variableValue}`,
          });

          resolvedTemplate = resolvedTemplate.replace(fullMatch, variableValue);
          if (!resolvedVariables.includes(variableName)) {
            resolvedVariables.push(variableName);
          }
        } catch (error) {
          logger.error('[DIAGNOSTIC] Variable resolution error:', {
            variableName,
            error: error instanceof Error ? error.message : error,
          });
          unresolvedVariables.push(variableName);
          logger.warn(`Failed to resolve variable ${variableName}:`, error);
        }
      } else {
        // Check if this is a built-in function that can be called directly
        if (BUILT_IN_FUNCTIONS[variableName]) {
          logger.info('[DIAGNOSTIC] Found built-in function:', {
            functionName: variableName,
          });

          try {
            const functionResult = await this.executeFunctionByName(
              variableName,
              context
            );
            resolvedTemplate = resolvedTemplate.replace(
              fullMatch,
              functionResult
            );
            resolvedVariables.push(variableName);
          } catch (error) {
            logger.error('[DIAGNOSTIC] Function execution error:', {
              functionName: variableName,
              error: error instanceof Error ? error.message : error,
            });
            unresolvedVariables.push(variableName);
          }
        } else {
          logger.warn('[DIAGNOSTIC] Variable not found:', {
            variableName,
            availableVariables: Array.from(variableLookup.keys()),
          });
          unresolvedVariables.push(variableName);
        }
      }
    }

    return {
      success: unresolvedVariables.length === 0,
      value: resolvedTemplate,
      resolvedVariables: [...new Set(resolvedVariables)],
      unresolvedVariables: [...new Set(unresolvedVariables)],
    };
  }

  /**
   * Resolve the value of a variable (simplified - all variables are static with function support)
   */
  private static async resolveVariableValue(
    variable: Variable
  ): Promise<string> {
    // All variables are now treated as static values
    // Functions within variable values will be resolved during pre-resolution
    return variable.value;
  }

  /**
   * Execute a function with given arguments
   */
  private static async executeFunction(
    functionName: string,
    argsString: string,
    context: VariableContext
  ): Promise<string> {
    logger.info('[FUNCTION_DEBUG] Executing function:', {
      functionName,
      argsString,
    });

    const func = BUILT_IN_FUNCTIONS[functionName];
    if (!func) {
      logger.error('[FUNCTION_DEBUG] Function not found:', {
        functionName,
        availableFunctions: Object.keys(BUILT_IN_FUNCTIONS),
      });
      throw new Error(`Unknown function: ${functionName}`);
    }

    const args = argsString
      .split(',')
      .map(arg => arg.trim().replace(/^['"]|['"]$/g, '')) // Remove quotes
      .filter(arg => arg.length > 0);

    logger.info('[FUNCTION_DEBUG] Parsed arguments:', { functionName, args });

    try {
      const result = await func.execute(args, context);
      logger.info('[FUNCTION_DEBUG] Function executed successfully:', {
        functionName,
        args,
        result,
      });
      return result;
    } catch (error) {
      logger.error('[FUNCTION_DEBUG] Function execution failed:', {
        functionName,
        args,
        error: error instanceof Error ? error.message : error,
      });
      throw new Error(
        `Function execution failed for ${functionName}: ${error}`
      );
    }
  }

  /**
   * Execute a function by name (for direct variable references like ${uuid})
   */
  private static async executeFunctionByName(
    functionName: string,
    context: VariableContext
  ): Promise<string> {
    logger.info('[FUNCTION_DEBUG] Executing function by name:', {
      functionName,
    });

    const func = BUILT_IN_FUNCTIONS[functionName];
    if (!func) {
      logger.error('[FUNCTION_DEBUG] Function not found by name:', {
        functionName,
        availableFunctions: Object.keys(BUILT_IN_FUNCTIONS),
      });
      throw new Error(`Unknown function: ${functionName}`);
    }

    try {
      const result = await func.execute([], context);
      logger.info('[FUNCTION_DEBUG] Function by name executed successfully:', {
        functionName,
        result,
      });
      return result;
    } catch (error) {
      logger.error('[FUNCTION_DEBUG] Function by name execution failed:', {
        functionName,
        error: error instanceof Error ? error.message : error,
      });
      throw new Error(
        `Function execution failed for ${functionName}: ${error}`
      );
    }
  }

  /**
   * Check if a string contains variable references
   */
  private static containsVariables(value: string): boolean {
    return (
      VARIABLE_PATTERNS.VARIABLE_REFERENCE.test(value) ||
      VARIABLE_PATTERNS.FUNCTION_CALL.test(value)
    );
  }

  /**
   * Validate a template for syntax errors
   */
  static validateTemplate(template: string): {
    isValid: boolean;
    errors: string[];
  } {
    const parseResult = this.parseTemplate(template);
    return {
      isValid: parseResult.success,
      errors: parseResult.errors,
    };
  }

  /**
   * Get all variable names referenced in a template
   */
  static getReferencedVariables(template: string): string[] {
    const parseResult = this.parseTemplate(template);
    return parseResult.variables;
  }

  /**
   * Get all function calls in a template
   */
  static getReferencedFunctions(
    template: string
  ): Array<{ name: string; args: string[] }> {
    const parseResult = this.parseTemplate(template);
    return parseResult.functions;
  }

  /**
   * Preview template resolution without full context
   */
  static previewResolution(
    template: string,
    sampleVariables: Record<string, string> = {}
  ): string {
    let preview = template;

    // Replace sample variables
    Object.entries(sampleVariables).forEach(([name, value]) => {
      const pattern = new RegExp(`\\$\\{${name}\\}`, 'g');
      preview = preview.replace(pattern, value);
    });

    // Replace function calls with sample values
    // timestamp() function
    preview = preview.replace(/\$\{timestamp\(\)\}/g, '1704067200');
    preview = preview.replace(/\$\{timestamp\}/g, '1704067200');

    // iso_date() function
    preview = preview.replace(
      /\$\{iso_date\(\)\}/g,
      '2024-01-01T00:00:00.000Z'
    );
    preview = preview.replace(/\$\{iso_date\}/g, '2024-01-01T00:00:00.000Z');

    // uuid() function
    preview = preview.replace(
      /\$\{uuid\(\)\}/g,
      '550e8400-e29b-41d4-a716-446655440000'
    );
    preview = preview.replace(
      /\$\{uuid\}/g,
      '550e8400-e29b-41d4-a716-446655440000'
    );

    // random(min, max) function - handle various parameter combinations
    preview = preview.replace(
      /\$\{random\(\s*(\d+)\s*,\s*(\d+)\s*\)\}/g,
      (_, min, max) => {
        const minNum = parseInt(min) || 0;
        const maxNum = parseInt(max) || 100;
        const randomValue = Math.floor(
          Math.random() * (maxNum - minNum + 1) + minNum
        );
        return randomValue.toString();
      }
    );

    // base64(value) function - handle quoted and unquoted strings
    preview = preview.replace(
      /\$\{base64\(\s*['"]([^'"]*)['"]\s*\)\}/g,
      (_, value) => {
        try {
          return btoa(value);
        } catch {
          return 'base64_encoded_value';
        }
      }
    );
    preview = preview.replace(/\$\{base64\(\s*([^)]*)\s*\)\}/g, (_, value) => {
      try {
        // Remove quotes if present
        const cleanValue = value.replace(/^['"]|['"]$/g, '');
        return btoa(cleanValue);
      } catch {
        return 'base64_encoded_value';
      }
    });

    // date(format) function - handle various format parameters
    preview = preview.replace(
      /\$\{date\(\s*['"]([^'"]*)['"]\s*\)\}/g,
      (_, format) => {
        const now = new Date();
        switch (format.toLowerCase()) {
          case 'iso':
            return now.toISOString();
          case 'locale':
            return now.toLocaleString();
          case 'timestamp':
            return Math.floor(now.getTime() / 1000).toString();
          case 'mm-dd-yy':
            return `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getFullYear().toString().slice(-2)}`;
          case 'yyyy-mm-dd':
            return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
          default:
            return now.toISOString();
        }
      }
    );
    preview = preview.replace(/\$\{date\(\s*([^)]*)\s*\)\}/g, (_, format) => {
      const now = new Date();
      const cleanFormat = format.replace(/^['"]|['"]$/g, '');
      switch (cleanFormat.toLowerCase()) {
        case 'iso':
          return now.toISOString();
        case 'locale':
          return now.toLocaleString();
        case 'timestamp':
          return Math.floor(now.getTime() / 1000).toString();
        case 'mm-dd-yy':
          return `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getFullYear().toString().slice(-2)}`;
        case 'yyyy-mm-dd':
          return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        default:
          return now.toISOString();
      }
    });
    preview = preview.replace(/\$\{date\(\)\}/g, new Date().toISOString());
    preview = preview.replace(/\$\{date\}/g, new Date().toISOString());

    // Replace common system variables with sample values
    preview = preview.replace(/\$\{domain\}/g, 'example.com');
    preview = preview.replace(/\$\{path\}/g, '/api/v1/users');
    preview = preview.replace(/\$\{method\}/g, 'GET');

    return preview;
  }

  /**
   * Build request context from request details
   */
  static buildRequestContext(details: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    tabId?: number;
  }): RequestContext {
    const url = new URL(details.url);

    return {
      url: details.url,
      method: details.method,
      headers: details.headers || {},
      timestamp: Date.now(),
      domain: url.hostname,
      path: url.pathname,
      protocol: url.protocol.replace(':', ''),
      query: Object.fromEntries(url.searchParams.entries()),
      ...(details.headers?.['Referer'] || details.headers?.['referer']
        ? {
            referrer:
              details.headers?.['Referer'] || details.headers?.['referer'],
          }
        : {}),
      ...(details.headers?.['User-Agent'] || details.headers?.['user-agent']
        ? {
            userAgent:
              details.headers?.['User-Agent'] ||
              details.headers?.['user-agent'],
          }
        : {}),
      ...(details.tabId !== undefined ? { tabId: details.tabId } : {}),
    };
  }

  /**
   * Pre-resolve variables by executing any functions they contain
   * This is used when variables are saved/updated to generate static values
   */
  static async preResolveVariable(variable: Variable): Promise<Variable> {
    // If the variable value contains functions, resolve them now
    if (variable.value.includes('${') && variable.value.includes('(')) {
      try {
        // Create a minimal context for function execution
        const context: VariableContext = {
          systemVariables: [],
          globalVariables: [],
          profileVariables: [],
          ruleVariables: [],
        };

        const result = await this.resolve(variable.value, context);

        if (result.success && result.value) {
          // Return variable with resolved value
          return {
            ...variable,
            value: result.value,
            metadata: {
              createdAt: variable.metadata?.createdAt || new Date(),
              updatedAt: new Date(),
              ...variable.metadata,
            },
          };
        }
      } catch (error) {
        logger.warn(`Failed to pre-resolve variable ${variable.name}:`, error);
      }
    }

    // Return original variable if no functions or resolution failed
    return variable;
  }

  /**
   * Get all available built-in functions
   */
  static getAvailableFunctions(): VariableFunction[] {
    return Object.values(BUILT_IN_FUNCTIONS);
  }

  /**
   * Get a specific function by name
   */
  static getFunction(name: string): VariableFunction | undefined {
    return BUILT_IN_FUNCTIONS[name];
  }
}
