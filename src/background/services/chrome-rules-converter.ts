/**
 * Chrome declarativeNetRequest rules conversion service
 */

import { performanceService } from '@/devtools/services/PerformanceService';
import { VariableResolver } from '@/lib/core/variable-resolver';
import { AnalyticsMonitor } from '@/lib/integrations/analytics-monitor';
import { PerformanceMonitor } from '@/lib/integrations/performance-monitor';
import type { HeaderRule, HeaderEntry } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';
import type { VariableContext } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

import type { ChromeRule } from '../types/service-worker';

// Get logger for this module
const logger = loggers.shared;

// Chrome rules converter specific interfaces
interface UrlPattern {
  protocol?: string;
  domain: string;
  path?: string;
  port?: string;
  query?: string;
}

export class ChromeRulesConverter {
  /**
   * Convert RequestKit rules to Chrome declarativeNetRequest format
   */
  static async convertToDeclarativeNetRequestRules(
    headerRules: Record<string, HeaderRule>,
    activeProfile: string,
    baseContext: VariableContext,
    _settings: ExtensionSettings
  ): Promise<ChromeRule[]> {
    const chromeRules: ChromeRule[] = [];
    logger.info(
      `[Background] Converting ${Object.keys(headerRules).length} rules to Chrome format`
    );

    // Check if any rules contain variables
    const rulesWithVariables = Object.values(headerRules).filter(rule =>
      rule.headers.some(
        header =>
          header.value &&
          (header.value.includes('${') || header.value.includes('{{'))
      )
    );
    logger.info(
      `[Background] Found ${rulesWithVariables.length} rules with variables:`,
      rulesWithVariables.map(r => ({
        id: r.id,
        name: r.name,
        headers: r.headers.filter(
          h => h.value && (h.value.includes('${') || h.value.includes('{{'))
        ),
      }))
    );

    // Update analytics with current rule stats
    const analyticsMonitor = AnalyticsMonitor.getInstance();
    analyticsMonitor.updateRuleStats(Object.values(headerRules));

    for (const [ruleIndex, rule] of Object.values(headerRules).entries()) {
      logger.info(`Processing rule ${rule.id}:`, {
        enabled: rule.enabled,
        name: rule.name,
        headers: rule.headers,
        pattern: rule.pattern,
        profileId: rule.profileId,
      });

      if (!rule.enabled) {
        logger.info(`Skipping disabled rule: ${rule.id}`);
        continue;
      }

      // Handle profile-based rule filtering
      if (activeProfile === 'unassigned') {
        // When "unassigned" is selected, only include rules without profileId
        if (rule.profileId) {
          logger.info(
            `Skipping rule ${rule.id} (has profile: ${rule.profileId}, showing unassigned only)`
          );
          continue;
        }
      } else {
        // Normal profile filtering: skip rules that don't belong to the active profile
        // Rules without profileId are considered "unassigned" and should only show when unassigned is selected
        if (rule.profileId && rule.profileId !== activeProfile) {
          logger.info(
            `Skipping rule ${rule.id} (profile: ${rule.profileId}, active: ${activeProfile})`
          );
          continue;
        }
        // Also skip unassigned rules when a specific profile is active
        if (!rule.profileId && activeProfile !== 'unassigned') {
          logger.info(
            `Skipping unassigned rule ${rule.id} (active profile: ${activeProfile})`
          );
          continue;
        }
      }

      // Start performance monitoring for this rule
      const perfTimer = PerformanceMonitor.startRuleExecution(rule.id);
      logger.info(
        `[Background] Starting performance monitoring for rule: ${rule.id}`
      );

      try {
        // Separate request and response headers
        const requestHeaders = rule.headers.filter(
          header => header.target === 'request' || !header.target
        );
        const responseHeaders = rule.headers.filter(
          header => header.target === 'response'
        );

        // Resolve variables in headers and validate
        const validRequestHeaders = await this.processHeaders(
          requestHeaders,
          rule.id,
          baseContext,
          'request'
        );

        const validResponseHeaders = await this.processHeaders(
          responseHeaders,
          rule.id,
          baseContext,
          'response'
        );

        if (
          validRequestHeaders.length === 0 &&
          validResponseHeaders.length === 0
        ) {
          logger.warn(`No valid headers found in rule ${rule.id}`);
          continue;
        }

        // Build resource types filter
        const resourceTypes =
          rule.resourceTypes && rule.resourceTypes.length > 0
            ? rule.resourceTypes
            : ['main_frame', 'sub_frame', 'xmlhttprequest', 'other'];

        const chromeRule: ChromeRule = {
          id: ruleIndex + 1, // Chrome requires numeric IDs starting from 1
          priority: rule.priority || 1,
          condition: {
            urlFilter: this.buildUrlFilter(rule.pattern),
            resourceTypes:
              resourceTypes as chrome.declarativeNetRequest.ResourceType[],
          },
          action: {
            type: 'modifyHeaders',
          },
        };

        // Add request headers if any
        if (validRequestHeaders.length > 0) {
          chromeRule.action.requestHeaders = validRequestHeaders.map(
            header => ({
              header: header.name,
              operation:
                header.operation as chrome.declarativeNetRequest.HeaderOperation,
              value: header.operation !== 'remove' ? header.value : undefined,
            })
          );
        }

        // Add response headers if any
        if (validResponseHeaders.length > 0) {
          chromeRule.action.responseHeaders = validResponseHeaders.map(
            header => ({
              header: header.name,
              operation:
                header.operation as chrome.declarativeNetRequest.HeaderOperation,
              value: header.operation !== 'remove' ? header.value : undefined,
            })
          );
        }

        logger.info(`Created Chrome rule for ${rule.id}:`, chromeRule);
        chromeRules.push(chromeRule);

        // End performance monitoring for successful rule processing
        PerformanceMonitor.endRuleExecution(perfTimer);
        const executionTime = performance.now() - perfTimer.startTime;
        logger.info(
          `[Background] Completed performance monitoring for rule: ${rule.id}, execution time: ${executionTime.toFixed(2)}ms`
        );

        // Track successful rule processing
        analyticsMonitor.trackRuleUsage(
          rule.id,
          rule.name,
          true,
          executionTime
        );

        // Track performance in DevTools service
        performanceService.trackRuleExecution(
          rule.id,
          rule.name,
          executionTime,
          executionTime * 0.3, // Estimate match time as 30% of total
          executionTime * 0.7, // Estimate modification time as 70% of total
          true
        );
      } catch (error) {
        logger.error(`Failed to convert rule ${rule.id}:`, error);

        // End performance monitoring for failed rule processing
        PerformanceMonitor.endRuleExecution(perfTimer);

        // Track rule processing error
        analyticsMonitor.trackError({
          type: 'rule_error',
          message: `Failed to convert rule: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ruleId: rule.id,
          severity: 'medium',
        });
        const executionTime = performance.now() - perfTimer.startTime;
        analyticsMonitor.trackRuleUsage(
          rule.id,
          rule.name,
          false,
          executionTime
        );

        // Track failed performance in DevTools service
        performanceService.trackRuleExecution(
          rule.id,
          rule.name,
          executionTime,
          executionTime * 0.3,
          executionTime * 0.7,
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    logger.info(`Converted ${chromeRules.length} rules to Chrome format`);
    return chromeRules;
  }

  /**
   * Process headers with variable resolution and validation
   */
  private static async processHeaders(
    headers: HeaderEntry[],
    ruleId: string,
    baseContext: VariableContext,
    target: 'request' | 'response'
  ): Promise<Array<{ name: string; operation: string; value: string }>> {
    const validHeaders = [];

    for (const header of headers) {
      const isValidName =
        header.name &&
        !header.name.startsWith('-') &&
        !header.name.startsWith('_') &&
        header.name.match(/^[a-zA-Z0-9-]+$/);

      if (!isValidName) {
        logger.warn(
          `Invalid ${target} header name "${header.name}" in rule ${ruleId}`
        );
        continue;
      }

      // Pre-resolve variables for Chrome's declarativeNetRequest
      let resolvedValue = header.value;
      if (
        header.operation !== 'remove' &&
        header.value &&
        header.value.includes('${')
      ) {
        logger.info(
          `[RequestKit] Pre-resolving variables in ${target} header ${header.name}:`,
          {
            original: header.value,
            ruleId,
          }
        );

        try {
          const cacheKey = `${ruleId}_${target}_${header.name}_${header.value}`;
          resolvedValue = await this.resolveHeaderValue(
            header.value,
            baseContext,
            cacheKey
          );

          logger.info(`[RequestKit] Variable pre-resolution successful:`, {
            header: header.name,
            original: header.value,
            resolved: resolvedValue,
            ruleId,
            wasResolved: header.value !== resolvedValue,
          });
        } catch (error) {
          logger.error(
            `[RequestKit] Variable pre-resolution failed for ${header.name}:`,
            error
          );
          // Keep original value if resolution fails
          resolvedValue = header.value;
        }
      }

      validHeaders.push({
        name: header.name,
        operation: header.operation,
        value: resolvedValue,
      });
    }

    return validHeaders;
  }

  /**
   * Resolve variables in a header value with caching
   */
  private static async resolveHeaderValue(
    value: string,
    context: VariableContext,
    _cacheKey?: string
  ): Promise<string> {
    // Check if value contains variables
    const parseResult = VariableResolver.parseTemplate(value);
    logger.info('[RequestKit] Parse template result:', {
      value,
      variables: parseResult.variables,
      functions: parseResult.functions,
      hasVariables: parseResult.variables.length > 0,
      hasFunctions: parseResult.functions.length > 0,
    });

    if (!parseResult.variables.length && !parseResult.functions.length) {
      logger.info(
        '[RequestKit] No variables or functions found, returning original value'
      );
      return value;
    }

    try {
      const result = await VariableResolver.resolve(value, context);

      logger.info('[DIAGNOSTIC] Variable resolution result:', {
        template: value,
        success: result.success,
        resolvedValue: result.value,
        error: result.error,
        resolvedVariables: result.resolvedVariables,
        unresolvedVariables: result.unresolvedVariables,
        resolutionTime: result.resolutionTime,
      });

      if (result.success && result.value) {
        let finalValue = result.value;

        // Check if the resolved value still contains variables/functions and resolve recursively
        if (finalValue.includes('${') || finalValue.includes('{{')) {
          logger.info(
            '[RequestKit] Resolved value still contains variables, attempting recursive resolution:',
            finalValue
          );

          const recursiveResult = await VariableResolver.resolve(
            finalValue,
            context
          );
          logger.info('[RequestKit] Recursive resolution result:', {
            template: finalValue,
            success: recursiveResult.success,
            resolvedValue: recursiveResult.value,
            error: recursiveResult.error,
            resolvedVariables: recursiveResult.resolvedVariables,
            unresolvedVariables: recursiveResult.unresolvedVariables,
          });

          if (recursiveResult.success && recursiveResult.value) {
            finalValue = recursiveResult.value;
            logger.info(
              '[RequestKit] Recursive resolution successful:',
              finalValue
            );
          } else {
            logger.info(
              '[RequestKit] Recursive resolution failed:',
              recursiveResult.error
            );
          }
        }

        logger.info(
          'debug',
          `Variable resolved: "${value}" -> "${finalValue}"`
        );
        return finalValue;
      } else {
        logger.info(
          'warn',
          `Variable resolution failed for "${value}":`,
          result.error
        );
        if (
          result.unresolvedVariables &&
          result.unresolvedVariables.length > 0
        ) {
          logger.info(
            'warn',
            `Unresolved variables: ${result.unresolvedVariables.join(', ')}`
          );
        }
        return value; // Return original value on failure
      }
    } catch (error) {
      logger.info('error', `Variable resolution error for "${value}":`, error);
      return value; // Return original value on error
    }
  }

  /**
   * Build URL filter for Chrome declarativeNetRequest
   */
  private static buildUrlFilter(pattern: UrlPattern): string {
    let filter = '';

    // Protocol
    if (pattern.protocol && pattern.protocol !== '*') {
      filter += `${pattern.protocol}://`;
    } else {
      filter += '*://';
    }

    // Domain
    filter += pattern.domain;

    // Path - Chrome declarativeNetRequest requires wildcards for proper matching
    if (pattern.path && pattern.path !== '/*') {
      // Ensure path starts with /
      let path = pattern.path.startsWith('/')
        ? pattern.path
        : `/${pattern.path}`;

      // If path doesn't end with wildcard, add one for better matching
      if (!path.includes('*')) {
        path += '*';
      }

      filter += path;
    } else {
      filter += '/*';
    }

    return filter;
  }

  /**
   * Get all current dynamic rule IDs
   */
  static async getAllDynamicRuleIds(): Promise<number[]> {
    const rules = await ChromeApiUtils.declarativeNetRequest.getDynamicRules();
    return rules.map(rule => rule.id);
  }

  /**
   * Update dynamic rules in Chrome
   */
  static async updateDynamicRules(
    isEnabled: boolean,
    rules: Record<string, HeaderRule>,
    activeProfile: string,
    baseContext: VariableContext,
    settings: ExtensionSettings
  ): Promise<void> {
    try {
      if (!isEnabled) {
        // Remove all rules if extension is disabled
        await ChromeApiUtils.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: await this.getAllDynamicRuleIds(),
        });
        logger.info('All dynamic rules removed (extension disabled)');
        return;
      }

      // Convert RequestKit rules to Chrome declarativeNetRequest rules (now async)
      const chromeRules = await this.convertToDeclarativeNetRequestRules(
        rules,
        activeProfile,
        baseContext,
        settings
      );

      // Apply performance limits
      const maxRules = settings.performance.maxRules || 100;
      if (chromeRules.length > maxRules) {
        logger.info(
          'warn',
          `Too many rules (${chromeRules.length}), limiting to ${maxRules}`
        );
        chromeRules.splice(maxRules);
      }

      // Get existing rule IDs
      const existingRuleIds = await this.getAllDynamicRuleIds();

      // Update rules
      await ChromeApiUtils.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: chromeRules as chrome.declarativeNetRequest.Rule[],
      });

      logger.info(
        '[Background] Dynamic rules updated in Chrome:',
        chromeRules.length
      );
      logger.info(
        '[Background] Note: Chrome processes these rules natively, not through our JavaScript'
      );
      logger.info('info', `Updated ${chromeRules.length} dynamic rules`);

      // Show rule match notification if enabled
      if (
        settings.notifications.enabled &&
        settings.notifications.showRuleMatches &&
        chromeRules.length > 0
      ) {
        ChromeApiUtils.notifications.create(`rules-updated-${Date.now()}`, {
          type: 'basic',
          iconUrl: ChromeApiUtils.runtime.getURL('assets/icons/icon-48.png'),
          title: 'RequestKit Rules Updated',
          message: `${chromeRules.length} rules are now active`,
        });
      }
    } catch (error) {
      logger.info('error', 'Failed to update dynamic rules:', error);

      // Show error notification if enabled
      if (settings.notifications.enabled && settings.notifications.showErrors) {
        ChromeApiUtils.notifications.create(`error-${Date.now()}`, {
          type: 'basic',
          iconUrl: ChromeApiUtils.runtime.getURL('assets/icons/icon-48.png'),
          title: 'RequestKit Error',
          message: 'Failed to update dynamic rules. Check console for details.',
        });
      }
    }
  }
}
