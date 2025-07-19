/**
 * Runtime message handler for background service worker
 */

import type { ProfileSwitchResult, Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';

import type {
  ExtensionStatus,
  AnalysisResult,
  TestRuleMatchResult,
} from '../types/background-types';
import type {
  RuntimeMessage,
  RuntimeResponse,
  RequestData,
  RequestContext,
  ModificationData,
  ImportData,
} from '../types/service-worker';

// Get logger for this module
const logger = loggers.shared;

export class MessageHandler {
  private handlers: Map<
    string,
    (message: RuntimeMessage) => Promise<unknown> | unknown
  > = new Map();

  constructor(
    private getStatus: () => ExtensionStatus,
    private toggleExtension: (enabled: boolean) => Promise<void>,
    private testRule: (
      rule: HeaderRule,
      testUrl: string
    ) => Promise<TestRuleMatchResult>,
    private exportRules: () => Promise<{
      version: string;
      exportDate: string;
      data: Record<string, unknown>;
    }>,
    private importRules: (data: ImportData) => Promise<{
      imported: { rules: number; templates: number; settings: boolean };
      errors: string[];
      warnings: string[];
    }>,
    private getStats: () => Promise<{
      totalRules: number;
      activeRules: number;
      totalExecutions: number;
      averageExecutionTime: number;
      errorRate: number;
    }>,
    private updateRules: () => Promise<void>,
    private changeTheme: (theme: string) => Promise<void>,
    private switchProfile: (profileId: string) => Promise<ProfileSwitchResult>,
    private getProfiles: () =>
      | Promise<{
          profiles: Profile[];
          activeProfile: string;
          success: boolean;
        }>
      | {
          profiles: Profile[];
          activeProfile: string;
          success: boolean;
        },
    private getRules: () => Record<string, HeaderRule>,
    private createProfile: (
      profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
    ) => Promise<Profile>,
    private updateProfile: (
      profileId: string,
      profile: Partial<Omit<Profile, 'id' | 'createdAt'>>
    ) => Promise<Profile>,
    private deleteProfile: (
      profileId: string
    ) => Promise<{ success: boolean; transferredRules?: number }>,
    private getDevToolsStatus: () => Promise<ExtensionStatus>,
    private analyzeRequest: (
      requestData: RequestData
    ) => Promise<AnalysisResult>,
    private testRuleMatch: (
      ruleId: string,
      url: string,
      requestData: RequestData
    ) => Promise<TestRuleMatchResult>,
    private getRulePerformance: (ruleId: string) => Promise<{
      ruleId: string;
      matchCount: number;
      averageExecutionTime: number;
      lastMatched: Date | null;
      errorCount: number;
      lastError: string | null;
    }>,
    private getPerformanceDashboard: () => Promise<{
      totalRules: number;
      activeRules: number;
      totalExecutions: number;
      averageExecutionTime: number;
      errorRate: number;
      topPerformingRules: Array<{
        ruleId: string;
        matchCount: number;
        averageExecutionTime: number;
      }>;
    }>,
    private clearPerformanceData: () => Promise<{ message: string }>,
    private trackModification: (
      modificationData: ModificationData
    ) => Promise<{ success: boolean }>,
    private getVariables: (
      scope?: string,
      profileId?: string
    ) => Promise<{
      variables: Array<{
        id: string;
        name: string;
        value: string;
        scope: string;
        enabled: boolean;
      }>;
      activeProfile: string;
      scope: string;
    }>,
    private resolveVariableTemplate: (
      template: string,
      requestContext?: RequestContext
    ) => Promise<RuntimeResponse>,
    private validateVariableTemplate: (
      template: string
    ) => Promise<RuntimeResponse>,
    private clearVariableCache: () => Promise<RuntimeResponse>,
    private resetExtensionData: () => Promise<RuntimeResponse>
  ) {
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.handlers.set('GET_STATUS', () => this.getStatus());
    this.handlers.set('TOGGLE_EXTENSION', (message: RuntimeMessage) => {
      if ('enabled' in message && typeof message.enabled === 'boolean') {
        return this.toggleExtension(message.enabled);
      }
      throw new Error('Invalid TOGGLE_EXTENSION message format');
    });

    this.handlers.set('TEST_RULE', async (message: RuntimeMessage) => {
      if ('rule' in message && 'testUrl' in message) {
        const rule = message.rule;
        const testUrl = message.testUrl;
        if (
          typeof testUrl === 'string' &&
          typeof rule === 'object' &&
          rule !== null
        ) {
          return await this.testRule(rule as HeaderRule, testUrl);
        }
      }
      throw new Error('Invalid TEST_RULE message format');
    });

    this.handlers.set('EXPORT_RULES', () => this.exportRules());

    this.handlers.set('IMPORT_RULES', async (message: RuntimeMessage) => {
      if (
        'data' in message &&
        typeof message.data === 'object' &&
        message.data !== null
      ) {
        return await this.importRules(message.data as ImportData);
      }
      throw new Error('Invalid IMPORT_RULES message format');
    });

    this.handlers.set('GET_STATS', () => this.getStats());
    this.handlers.set('RULES_UPDATED', () => this.updateRules());

    this.handlers.set('CHANGE_THEME', async (message: RuntimeMessage) => {
      if (
        'theme' in message &&
        typeof message.theme === 'string' &&
        ['light', 'dark', 'auto'].includes(message.theme)
      ) {
        return await this.changeTheme(message.theme);
      }
      throw new Error('Invalid CHANGE_THEME message format');
    });

    this.handlers.set('SWITCH_PROFILE', async (message: RuntimeMessage) => {
      if ('profileId' in message && typeof message.profileId === 'string') {
        return await this.switchProfile(message.profileId);
      }
      throw new Error('Invalid SWITCH_PROFILE message format');
    });

    this.handlers.set('GET_PROFILES', async () => {
      const profiles = await this.getProfiles();
      logger.info('MessageHandler: GET_PROFILES returning:', profiles);
      return profiles;
    });
    this.handlers.set('GET_RULES', () => ({ rules: this.getRules() }));

    this.handlers.set('CREATE_PROFILE', async (message: RuntimeMessage) => {
      if (
        'profile' in message &&
        typeof message.profile === 'object' &&
        message.profile !== null
      ) {
        logger.info(
          'MessageHandler: CREATE_PROFILE received:',
          message.profile
        );
        const result = await this.createProfile(
          message.profile as Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
        );
        logger.info('MessageHandler: CREATE_PROFILE result:', result);
        return result;
      }
      throw new Error('Invalid CREATE_PROFILE message format');
    });

    this.handlers.set('UPDATE_PROFILE', async (message: RuntimeMessage) => {
      logger.info('UPDATE_PROFILE message received:', message);
      logger.info('Message validation checks:', {
        hasProfileId: 'profileId' in message,
        hasUpdates: 'updates' in message,
        profileIdType: typeof message.profileId,
        updatesType: typeof message.updates,
        updatesIsNull: message.updates === null,
        messageKeys: Object.keys(message),
      });

      if (
        'profileId' in message &&
        'updates' in message &&
        typeof message.profileId === 'string' &&
        typeof message.updates === 'object' &&
        message.updates !== null
      ) {
        return await this.updateProfile(
          message.profileId,
          message.updates as Partial<Omit<Profile, 'id' | 'createdAt'>>
        );
      }
      throw new Error('Invalid UPDATE_PROFILE message format');
    });

    this.handlers.set('DELETE_PROFILE', async (message: RuntimeMessage) => {
      if ('profileId' in message && typeof message.profileId === 'string') {
        return await this.deleteProfile(message.profileId);
      }
      throw new Error('Invalid DELETE_PROFILE message format');
    });

    // DevTools-specific handlers
    this.handlers.set('GET_DEVTOOLS_STATUS', () => this.getDevToolsStatus());

    this.handlers.set('ANALYZE_REQUEST', async (message: RuntimeMessage) => {
      if (
        'requestData' in message &&
        typeof message.requestData === 'object' &&
        message.requestData !== null
      ) {
        return await this.analyzeRequest(message.requestData as RequestData);
      }
      throw new Error('Invalid ANALYZE_REQUEST message format');
    });

    this.handlers.set('TEST_RULE_MATCH', async (message: RuntimeMessage) => {
      if (
        'ruleId' in message &&
        'url' in message &&
        'requestData' in message &&
        typeof message.ruleId === 'string' &&
        typeof message.url === 'string' &&
        typeof message.requestData === 'object' &&
        message.requestData !== null
      ) {
        return await this.testRuleMatch(
          message.ruleId,
          message.url,
          message.requestData as RequestData
        );
      }
      throw new Error('Invalid TEST_RULE_MATCH message format');
    });

    this.handlers.set(
      'GET_RULE_PERFORMANCE',
      async (message: RuntimeMessage) => {
        if ('ruleId' in message && typeof message.ruleId === 'string') {
          return await this.getRulePerformance(message.ruleId);
        }
        throw new Error('Invalid GET_RULE_PERFORMANCE message format');
      }
    );

    this.handlers.set('GET_PERFORMANCE_DASHBOARD', () =>
      this.getPerformanceDashboard()
    );
    this.handlers.set('CLEAR_PERFORMANCE_DATA', () =>
      this.clearPerformanceData()
    );

    this.handlers.set('TRACK_MODIFICATION', async (message: RuntimeMessage) => {
      if (
        'modificationData' in message &&
        typeof message.modificationData === 'object' &&
        message.modificationData !== null
      ) {
        return await this.trackModification(
          message.modificationData as ModificationData
        );
      }
      throw new Error('Invalid TRACK_MODIFICATION message format');
    });

    // Variable-related handlers
    this.handlers.set('GET_VARIABLES', async (message: RuntimeMessage) => {
      const scope =
        'scope' in message && typeof message.scope === 'string'
          ? message.scope
          : undefined;
      const profileId =
        'profileId' in message && typeof message.profileId === 'string'
          ? message.profileId
          : undefined;
      return await this.getVariables(scope, profileId);
    });

    this.handlers.set(
      'RESOLVE_VARIABLE_TEMPLATE',
      async (message: RuntimeMessage) => {
        if ('template' in message && typeof message.template === 'string') {
          const requestContext =
            'requestContext' in message &&
            typeof message.requestContext === 'object' &&
            message.requestContext !== null
              ? (message.requestContext as RequestContext)
              : undefined;
          return await this.resolveVariableTemplate(
            message.template,
            requestContext
          );
        }
        throw new Error('Invalid RESOLVE_VARIABLE_TEMPLATE message format');
      }
    );

    this.handlers.set(
      'VALIDATE_VARIABLE_TEMPLATE',
      async (message: RuntimeMessage) => {
        if ('template' in message && typeof message.template === 'string') {
          return await this.validateVariableTemplate(message.template);
        }
        throw new Error('Invalid VALIDATE_VARIABLE_TEMPLATE message format');
      }
    );

    this.handlers.set('CLEAR_VARIABLE_CACHE', () => this.clearVariableCache());
    this.handlers.set('RESET_EXTENSION_DATA', () => this.resetExtensionData());
  }

  /**
   * Handle incoming runtime message
   */
  async handleMessage(
    message: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: RuntimeResponse) => void
  ): Promise<boolean> {
    // Type guard to ensure message is RuntimeMessage
    if (!message || typeof message !== 'object' || !('type' in message)) {
      sendResponse({ error: 'Invalid message format' });
      return false;
    }

    if (!this.isRuntimeMessage(message)) {
      sendResponse({ error: 'Invalid message format' });
      return false;
    }

    const runtimeMessage = message;
    // Background received message

    const handler = this.handlers.get(runtimeMessage.type);
    if (!handler) {
      logger.warn('Unknown message type:', runtimeMessage.type);
      sendResponse({ error: 'Unknown message type' });
      return false;
    }

    try {
      const result = await handler(runtimeMessage);
      sendResponse({
        success: true,
        ...(result && typeof result === 'object' ? result : {}),
      });
      return true;
    } catch (error) {
      // Error handling message
      sendResponse({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return true;
    }
  }

  /**
   * Type guard for runtime messages
   */
  private isRuntimeMessage(message: unknown): message is RuntimeMessage {
    return (
      typeof message === 'object' &&
      message !== null &&
      'type' in message &&
      typeof (message as Record<string, unknown>).type === 'string'
    );
  }
}
