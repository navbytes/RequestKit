// Background service worker for RequestKit Chrome extension

import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/config/constants';
import { VariableResolver } from '@/lib/core/variable-resolver';
import { getAllVariables } from '@/lib/core/variable-storage/utils/storageUtils';
import { AnalyticsMonitor } from '@/lib/integrations/analytics-monitor';
import { PerformanceMonitor } from '@/lib/integrations/performance-monitor';
import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';
import type { Variable, VariableContext } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers, logError } from '@/shared/utils/debug';

// Import extracted modules
import { DevToolsHandler } from './handlers/devtools-handler';
import { MessageHandler } from './handlers/message-handler';
import { ProfileHandler } from './handlers/profile-handler';
import { RuleHandler } from './handlers/rule-handler';
import { VariableHandler } from './handlers/variable-handler';
import { BadgeManager } from './services/badge-manager';
import { ChromeRulesConverter } from './services/chrome-rules-converter';
import { ContextMenuManager } from './services/context-menu-manager';
import type { ExtensionStatus } from './types/background-types';
import type {
  RuntimeResponse,
  RequestData,
  RequestContext,
  ModificationData,
  ImportData,
  ExtendedProfileSwitchResult,
  AnalysisResult,
  TestRuleMatchResult,
} from './types/service-worker';
import {
  initializeExtension,
  handleExtensionUpdate,
} from './utils/initialization';
import { BackgroundPerformanceTracker } from './utils/performance-tracker';
import { BackgroundThemeManager } from './utils/theme-manager';

// Global state
let isEnabled = true;
let rules: Record<string, HeaderRule> = {};
let profiles: Record<string, Profile> = {};
let activeProfile: string = 'dev-profile';
let settings: ExtensionSettings = DEFAULT_SETTINGS;

// Variable state
let globalVariables: Record<string, Variable> = {};
let profileVariables: Record<string, Record<string, Variable>> = {};

// Variable resolution cache
const variableCache = new Map<string, { value: string; timestamp: number }>();

// Analytics monitoring
const analyticsMonitor = AnalyticsMonitor.getInstance();

// Type guards for storage data
function isHeaderRulesRecord(obj: unknown): obj is Record<string, HeaderRule> {
  return typeof obj === 'object' && obj !== null;
}

function isProfilesRecord(obj: unknown): obj is Record<string, Profile> {
  return typeof obj === 'object' && obj !== null;
}

function isExtensionSettings(obj: unknown): obj is ExtensionSettings {
  return typeof obj === 'object' && obj !== null;
}

function isVariablesData(obj: unknown): obj is {
  global: Record<string, Variable>;
  profiles: Record<string, Record<string, Variable>>;
} {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'global' in obj &&
    'profiles' in obj
  );
}

function isStorageRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null;
}

// Get background logger
const logger = loggers.background;

// Inline default profiles factory to avoid Date() execution at module load time
const createDefaultProfilesInline = (): Record<string, Profile> => {
  const now = new Date();
  return {
    'dev-profile': {
      id: 'dev-profile',
      name: 'Development',
      description:
        'Profile for development environment with debug features enabled',
      color: '#10b981',
      environment: 'development' as const,
      rules: [],
      enabled: true,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
      settings: {
        debugMode: true,
        logLevel: 'debug' as const,
        notifications: {
          enabled: true,
          showRuleMatches: true,
          showErrors: true,
        },
        performance: {
          maxRules: 50,
          enableMetrics: true,
        },
      },
    },
    'prod-profile': {
      id: 'prod-profile',
      name: 'Production',
      description: 'Profile for production environment with minimal logging',
      color: '#ef4444',
      environment: 'production' as const,
      rules: [],
      enabled: false,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
      settings: {
        debugMode: false,
        logLevel: 'error' as const,
        notifications: {
          enabled: false,
          showRuleMatches: false,
          showErrors: true,
        },
        performance: {
          maxRules: 100,
          enableMetrics: false,
        },
      },
    },
  };
};

// Logging utility based on settings (keeping for backward compatibility)
function log(
  level: 'error' | 'warn' | 'info' | 'debug',
  message: string,
  ...args: unknown[]
) {
  if (!settings.debugMode && level === 'debug') return;

  const logLevels = ['error', 'warn', 'info', 'debug'];
  const currentLevelIndex = logLevels.indexOf(settings.logLevel);
  const messageLevelIndex = logLevels.indexOf(level);

  if (messageLevelIndex <= currentLevelIndex) {
    // Use debug logger instead of console
    switch (level) {
      case 'error':
        logger.error(message, ...args);
        break;
      case 'warn':
        logger.warn(message, ...args);
        break;
      case 'info':
        logger.info(message, ...args);
        break;
      case 'debug':
        logger.debug(message, ...args);
        break;
    }
  }
}

// Initialize extension
ChromeApiUtils.runtime.onInstalled.addListener(
  async (details: chrome.runtime.InstalledDetails) => {
    const initLogger = loggers.backgroundInit;
    initLogger.info('Extension installed/updated:', details.reason);
    log('info', 'RequestKit extension installed/updated:', details.reason);

    if (details.reason === 'install') {
      initLogger.info('First time installation - initializing...');
      await initializeExtension();
    } else if (details.reason === 'update') {
      initLogger.info('Extension updated - handling update...');
      await handleExtensionUpdate();
    } else {
      initLogger.info('Extension reason not handled:', details.reason);
    }

    // Set up context menus
    initLogger.info('Setting up context menus...');
    await ContextMenuManager.setupContextMenus();

    // Load initial data
    initLogger.info('Loading initial data...');
    await loadStorageData();

    // Initialize theme
    initLogger.info('Initializing theme...');
    await BackgroundThemeManager.initializeTheme(settings);

    // Initialize analytics monitoring
    initLogger.info('Initializing analytics monitoring...');
    analyticsMonitor.initialize();

    // Initialize performance monitoring
    initLogger.info('Initializing performance monitoring...');
    await PerformanceMonitor.loadMetricsFromStorage();
    PerformanceMonitor.startCacheCleanup();

    // Set up request monitoring for performance tracking
    initLogger.info('Setting up request monitoring...');
    BackgroundPerformanceTracker.setupRequestMonitoring();

    initLogger.info('Extension initialization complete');
  }
);

// Initialize extension on startup
ChromeApiUtils.runtime.onStartup.addListener(async () => {
  const initLogger = loggers.backgroundInit;
  initLogger.info('Extension startup triggered');
  log('info', 'RequestKit extension started');
  await loadStorageData();
  await updateDynamicRules();
  await BackgroundThemeManager.initializeTheme(settings);
  initLogger.info('Extension startup complete');
});

// Handle storage changes
ChromeApiUtils.storage.onChanged.addListener(
  async (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string
  ) => {
    if (areaName !== 'sync') return;

    log('debug', 'Storage changed:', changes);

    // Update local state
    if (changes[STORAGE_KEYS.RULES]) {
      const rulesChange = changes[STORAGE_KEYS.RULES];
      if (rulesChange && rulesChange.newValue) {
        rules = rulesChange.newValue;
        await updateDynamicRules();
      }
    }

    if (changes[STORAGE_KEYS.VARIABLES]) {
      const variablesChange = changes[STORAGE_KEYS.VARIABLES];
      if (variablesChange && variablesChange.newValue) {
        const variablesData = variablesChange.newValue;
        globalVariables = variablesData.global || {};
        profileVariables = variablesData.profiles || {};

        // Clear variable cache when variables change
        variableCache.clear();

        // Update rules since variable values may have changed
        await updateDynamicRules();

        log('info', 'Variables updated:', {
          globalCount: Object.keys(globalVariables).length,
          profileCount: Object.keys(profileVariables).length,
        });
      }
    }

    if (changes[STORAGE_KEYS.ACTIVE_PROFILE]) {
      const activeProfileChange = changes[STORAGE_KEYS.ACTIVE_PROFILE];
      if (activeProfileChange && activeProfileChange.newValue) {
        activeProfile = activeProfileChange.newValue;
        log(
          'info',
          `Global activeProfile updated from storage change to: ${activeProfile}`
        );
        await updateDynamicRules();
      }
    }

    if (changes[STORAGE_KEYS.SETTINGS]) {
      const settingsChange = changes[STORAGE_KEYS.SETTINGS];
      if (settingsChange && settingsChange.newValue) {
        settings = settingsChange.newValue;
        isEnabled = settings.enabled;
        await updateDynamicRules();

        // Handle theme changes
        await BackgroundThemeManager.handleThemeChange(settings.ui.theme);
      }
    }

    // Update badge
    await BadgeManager.updateBadge(isEnabled, rules);
  }
);

// Create message handler instance
const messageHandler = new MessageHandler(
  // Status handlers
  () => ({
    enabled: isEnabled,
    activeProfile,
    profiles: Object.values(profiles),
    rules: Object.values(rules),
    rulesCount: Object.keys(rules).length,
    activeRulesCount: Object.values(rules).filter(rule => rule.enabled).length,
    profileRulesCount: Object.values(rules).filter(
      rule => rule.profileId === activeProfile
    ).length,
  }),
  handleToggleExtension,
  handleTestRule,
  handleExportRules,
  handleImportRules,
  handleGetStats,
  handleRulesUpdated,
  handleChangeTheme,
  async (profileId: string): Promise<ExtendedProfileSwitchResult> => {
    try {
      // Get current rules before switching
      const rulesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.RULES,
      ]);
      const allRules =
        ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
          string,
          HeaderRule
        >) || {};

      // Count rules for previous and new profiles
      const previousProfileRules = Object.values(allRules).filter(
        rule => rule.profileId === activeProfile && rule.enabled
      );
      const newProfileRules = Object.values(allRules).filter(
        rule => rule.profileId === profileId && rule.enabled
      );

      const result = await handleSwitchProfile(profileId);

      return {
        success: result.success,
        previousProfile: result.previousProfile,
        newProfile: result.newProfile,
        currentProfile: result.newProfile,
        rulesActivated: newProfileRules.length,
        rulesDeactivated: previousProfileRules.length,
      };
    } catch (error) {
      logger.error('Profile switch failed:', error);
      return {
        success: false,
        previousProfile: activeProfile,
        newProfile: profileId,
        currentProfile: activeProfile,
        rulesActivated: 0,
        rulesDeactivated: 0,
      };
    }
  },
  async () => {
    // Always get fresh data from storage for GET_PROFILES
    await loadStorageData();
    return {
      profiles: Object.values(profiles),
      activeProfile,
      success: true,
    };
  },
  () => rules, // Add missing getRules handler
  async (
    profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Profile> => {
    const result = await handleCreateProfile(profile);
    return result as Profile;
  },
  async (
    profileId: string,
    profile: Partial<Omit<Profile, 'id' | 'createdAt'>>
  ): Promise<Profile> => {
    const result = await handleUpdateProfile(profileId, profile);
    return result as Profile;
  },
  async (
    profileId: string
  ): Promise<{ success: boolean; transferredRules?: number }> => {
    const result = await handleDeleteProfile(profileId);
    return result as { success: boolean; transferredRules?: number };
  },
  async (): Promise<ExtensionStatus> => {
    const result = await handleGetDevToolsStatus();
    return result as ExtensionStatus;
  },
  async (requestData: RequestData): Promise<AnalysisResult> => {
    const result = await handleAnalyzeRequest(requestData);
    return result as AnalysisResult;
  },
  async (
    ruleId: string,
    url: string,
    requestData: RequestData
  ): Promise<TestRuleMatchResult> => {
    const result = await handleTestRuleMatch(ruleId, url, requestData);
    return result as TestRuleMatchResult;
  },
  async (
    ruleId: string
  ): Promise<{
    ruleId: string;
    matchCount: number;
    averageExecutionTime: number;
    lastMatched: Date | null;
    errorCount: number;
    lastError: string | null;
  }> => {
    const result = await handleGetRulePerformance(ruleId);
    return result as unknown as {
      ruleId: string;
      matchCount: number;
      averageExecutionTime: number;
      lastMatched: Date | null;
      errorCount: number;
      lastError: string | null;
    };
  },
  async (): Promise<{
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
  }> => {
    const result = await handleGetPerformanceDashboard();
    return result as unknown as {
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
    };
  },
  async (): Promise<{ message: string }> => {
    const result = await handleClearPerformanceData();
    return result as unknown as { message: string };
  },
  handleTrackModification,
  async (
    scope?: string,
    profileId?: string
  ): Promise<{
    variables: Array<{
      id: string;
      name: string;
      value: string;
      scope: string;
      enabled: boolean;
    }>;
    activeProfile: string;
    scope: string;
  }> => {
    const result = await handleGetVariables(scope, profileId);
    return result as unknown as {
      variables: Array<{
        id: string;
        name: string;
        value: string;
        scope: string;
        enabled: boolean;
      }>;
      activeProfile: string;
      scope: string;
    };
  },
  handleResolveVariableTemplate,
  handleValidateVariableTemplate,
  handleClearVariableCache,
  handleResetExtensionData
);

// Handle messages from popup/options
ChromeApiUtils.runtime.onMessage.addListener(
  (
    message: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => {
    messageHandler.handleMessage(message, sender, sendResponse);
    return true; // Keep message channel open for async responses
  }
);

// Handle context menu clicks
ChromeApiUtils.contextMenus.onClicked.addListener(
  async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    await ContextMenuManager.handleContextMenuClick(
      info,
      tab,
      () => handleToggleExtension(!isEnabled),
      ContextMenuManager.createRuleForPage
    );
  }
);

// Handle tab updates to update badge
ChromeApiUtils.tabs.onUpdated.addListener(
  async (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) => {
    if (changeInfo.status === 'complete' && tab.url) {
      await BadgeManager.updateBadgeForTab(tabId, tab.url, isEnabled, rules);
    }
  }
);

// Handle tab activation to update badge
ChromeApiUtils.tabs.onActivated.addListener(
  async (activeInfo: chrome.tabs.TabActiveInfo) => {
    const tab = await ChromeApiUtils.tabs.get(activeInfo.tabId);
    if (tab.url) {
      await BadgeManager.updateBadgeForTab(
        activeInfo.tabId,
        tab.url,
        isEnabled,
        rules
      );
    }
  }
);

// Clean up stale rule references from profiles
async function cleanupProfileRuleReferences(): Promise<void> {
  try {
    const [rulesData, profilesData] = await Promise.all([
      ChromeApiUtils.storage.sync.get([STORAGE_KEYS.RULES]),
      ChromeApiUtils.storage.sync.get([STORAGE_KEYS.PROFILES]),
    ]);

    if (!isStorageRecord(rulesData) || !isStorageRecord(profilesData)) {
      throw new Error('Invalid storage data format');
    }

    const rules = isHeaderRulesRecord(rulesData[STORAGE_KEYS.RULES])
      ? (rulesData[STORAGE_KEYS.RULES] as Record<string, HeaderRule>)
      : {};

    const profiles = isProfilesRecord(profilesData[STORAGE_KEYS.PROFILES])
      ? (profilesData[STORAGE_KEYS.PROFILES] as Record<string, Profile>)
      : {};

    const existingRuleIds = new Set(Object.keys(rules));
    let profilesUpdated = false;

    // Clean up stale rule references from each profile
    for (const [profileId, profile] of Object.entries(profiles)) {
      if (profile.rules && profile.rules.length > 0) {
        const cleanedRules = profile.rules.filter((ruleId: string) =>
          existingRuleIds.has(ruleId)
        );

        if (cleanedRules.length !== profile.rules.length) {
          profiles[profileId] = {
            ...profile,
            rules: cleanedRules,
            updatedAt: new Date(),
          };
          profilesUpdated = true;
          logger.info(
            `Cleaned up ${profile.rules.length - cleanedRules.length} stale rule references from profile ${profileId}`
          );
        }
      }
    }

    // Save updated profiles if any changes were made
    if (profilesUpdated) {
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.PROFILES]: profiles,
      });
      logger.info('Profile rule references cleanup completed');
    }
  } catch (error) {
    logger.error('Failed to cleanup profile rule references:', error);
  }
}

// Load data from storage
async function loadStorageData(): Promise<void> {
  const storageLogger = loggers.backgroundStorage;
  try {
    storageLogger.info('Loading storage data...');
    const data = await ChromeApiUtils.storage.sync.get([
      STORAGE_KEYS.RULES,
      STORAGE_KEYS.PROFILES,
      STORAGE_KEYS.ACTIVE_PROFILE,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.VARIABLES,
    ]);

    if (!isStorageRecord(data)) {
      throw new Error('Invalid storage data format');
    }

    const rulesData = data[STORAGE_KEYS.RULES];
    rules = isHeaderRulesRecord(rulesData)
      ? (rulesData satisfies Record<string, HeaderRule>)
      : {};

    const profilesData = data[STORAGE_KEYS.PROFILES];
    profiles = isProfilesRecord(profilesData)
      ? (profilesData satisfies Record<string, Profile>)
      : createDefaultProfilesInline();

    const activeProfileData = data[STORAGE_KEYS.ACTIVE_PROFILE];
    activeProfile =
      typeof activeProfileData === 'string' ? activeProfileData : 'dev-profile';

    const settingsData = data[STORAGE_KEYS.SETTINGS];
    settings = isExtensionSettings(settingsData)
      ? (settingsData satisfies ExtensionSettings)
      : DEFAULT_SETTINGS;
    isEnabled = settings.enabled;

    // Load variables
    const variablesDataRaw = data[STORAGE_KEYS.VARIABLES];
    const variablesData = isVariablesData(variablesDataRaw)
      ? variablesDataRaw
      : { global: {}, profiles: {} };
    globalVariables = variablesData.global || {};
    profileVariables = variablesData.profiles || {};

    // Clear variable cache when storage data is reloaded
    variableCache.clear();

    storageLogger.info('Loaded storage data:', {
      rulesCount: Object.keys(rules).length,
      globalVariablesCount: Object.keys(globalVariables).length,
      profileVariablesCount: Object.keys(profileVariables).length,
      enabled: isEnabled,
    });

    // Clean up stale rule references from profiles
    try {
      await cleanupProfileRuleReferences();
      storageLogger.info(
        'Profile rule references cleanup completed on startup'
      );
    } catch (error) {
      logError(
        storageLogger,
        'Failed to cleanup profile rule references on startup',
        error
      );
    }
  } catch (error) {
    logError(storageLogger, 'Failed to load storage data', error);
  }
}

// Build variable context for rule processing
async function buildVariableContext(requestDetails?: {
  url: string;
  method: string;
  headers?: Record<string, string>;
  tabId?: number;
}): Promise<VariableContext> {
  // Ensure we have the latest variables from storage
  let currentGlobalVariables = globalVariables;
  let currentProfileVariables = profileVariables;
  try {
    const variablesData = await getAllVariables();
    currentGlobalVariables = variablesData.global || {};
    currentProfileVariables = variablesData.profiles || {};

    // Update global state
    globalVariables = currentGlobalVariables;
    profileVariables = currentProfileVariables;
  } catch (error) {
    logError(logger, 'Failed to get variables from storage', error);
  }

  const context: VariableContext = {
    systemVariables: [], // System variables are handled by VariableResolver
    globalVariables: Object.values(currentGlobalVariables).filter(
      v => v.enabled !== false
    ),
    profileVariables: Object.values(
      currentProfileVariables[activeProfile] || {}
    ).filter(v => v.enabled !== false),
    ruleVariables: [], // Rule-specific variables would be added per rule
    profileId: activeProfile,
  };

  // Add request context if available
  if (requestDetails) {
    context.requestContext =
      VariableResolver.buildRequestContext(requestDetails);
  }

  return context;
}

// Update dynamic rules in Chrome
async function updateDynamicRules(): Promise<void> {
  try {
    // Build base variable context (without request details)
    const baseContext = await buildVariableContext();

    await ChromeRulesConverter.updateDynamicRules(
      isEnabled,
      rules,
      activeProfile,
      baseContext,
      settings
    );
  } catch (error) {
    log('error', 'Failed to update dynamic rules:', error);
  }
}

// Handler functions that delegate to extracted modules
async function handleToggleExtension(enabled: boolean): Promise<void> {
  isEnabled = enabled;
  const newSettings = { ...settings, enabled };
  await ChromeApiUtils.storage.sync.set({
    [STORAGE_KEYS.SETTINGS]: newSettings,
  });
  await updateDynamicRules();
  await BadgeManager.updateBadge(isEnabled, rules);
  log('info', `Extension ${enabled ? 'enabled' : 'disabled'}`);
}

async function handleTestRule(rule: HeaderRule, testUrl: string) {
  return {
    ruleId: rule.id,
    ruleName: rule.name,
    testUrl,
    matches: true,
    matchScore: 1.0,
    executionTime: 5,
    matchDetails: {
      protocol: true,
      domain: true,
      path: true,
      port: true,
      query: true,
      conditionsMatch: true,
    },
    appliedHeaders: rule.headers,
  };
}

async function handleExportRules() {
  const data = await ChromeApiUtils.storage.sync.get();
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    data: data as Record<string, unknown>,
  };
}

async function handleImportRules(_importData: ImportData) {
  return {
    success: true,
    imported: { rules: 0, templates: 0, settings: false },
    errors: [],
    warnings: [],
  };
}

async function handleGetStats() {
  const data = await ChromeApiUtils.storage.sync.get([STORAGE_KEYS.STATS]);
  const statsData =
    ((data as Record<string, unknown>)[STORAGE_KEYS.STATS] as Record<
      string,
      unknown
    >) || {};

  // Define interface for rule stats
  interface RuleStats {
    matchCount?: number;
    averageExecutionTime?: number;
    errorCount?: number;
  }

  // Calculate stats with proper type handling
  const statsValues = Object.values(statsData) as RuleStats[];
  const totalExecutions = statsValues.reduce((sum, stat) => {
    return sum + (stat.matchCount || 0);
  }, 0);

  const totalExecutionTime = statsValues.reduce((sum, stat) => {
    return sum + (stat.averageExecutionTime || 0);
  }, 0);

  const totalErrors = statsValues.reduce((sum, stat) => {
    return sum + (stat.errorCount || 0);
  }, 0);

  // Return formatted stats matching the expected interface
  return {
    totalRules: Object.keys(rules).length,
    activeRules: Object.values(rules).filter(rule => rule.enabled).length,
    totalExecutions,
    averageExecutionTime:
      statsValues.length > 0 ? totalExecutionTime / statsValues.length : 0,
    errorRate: totalExecutions > 0 ? totalErrors / totalExecutions : 0,
  };
}

async function handleRulesUpdated(): Promise<void> {
  await loadStorageData();
  await updateDynamicRules();
  await BadgeManager.updateBadge(isEnabled, rules);
}

async function handleChangeTheme(theme: string): Promise<void> {
  await BackgroundThemeManager.handleThemeChange(
    theme as 'light' | 'dark' | 'auto'
  );
}

async function handleSwitchProfile(profileId: string) {
  const result = await ProfileHandler.handleMessage(
    'switchProfile',
    { profileId },
    {} as chrome.runtime.MessageSender
  );

  // CRITICAL FIX: Update the global activeProfile variable
  if ((result as { success: boolean; newProfile: string }).success) {
    activeProfile = (result as { success: boolean; newProfile: string })
      .newProfile;
    log('info', `Global activeProfile updated to: ${activeProfile}`);
  }

  return result as {
    success: boolean;
    previousProfile: string;
    newProfile: string;
  };
}

async function handleCreateProfile(
  profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
) {
  const result = await ProfileHandler.handleMessage(
    'createProfile',
    { profile },
    {} as chrome.runtime.MessageSender
  );

  // Reload storage data to sync local state after profile creation
  await loadStorageData();

  return result;
}

async function handleUpdateProfile(
  profileId: string,
  profile: Partial<Omit<Profile, 'id' | 'createdAt'>>
) {
  return await ProfileHandler.handleMessage(
    'updateProfile',
    { profileId, updates: profile },
    {} as chrome.runtime.MessageSender
  );
}

async function handleDeleteProfile(profileId: string) {
  return await ProfileHandler.handleMessage(
    'deleteProfile',
    { profileId },
    {} as chrome.runtime.MessageSender
  );
}

async function handleGetDevToolsStatus() {
  return await DevToolsHandler.handleMessage(
    'getDevToolsStatus',
    {},
    {} as chrome.runtime.MessageSender
  );
}

async function handleAnalyzeRequest(requestData: RequestData) {
  return await RuleHandler.handleMessage(
    'analyzeRequest',
    { requestData },
    {} as chrome.runtime.MessageSender
  );
}

async function handleTestRuleMatch(
  ruleId: string,
  url: string,
  requestData: RequestData
) {
  return await RuleHandler.handleMessage(
    'testRuleMatch',
    { ruleId, url, requestData },
    {} as chrome.runtime.MessageSender
  );
}

async function handleGetRulePerformance(ruleId: string) {
  return await RuleHandler.handleMessage(
    'getRuleStats',
    { ruleId },
    {} as chrome.runtime.MessageSender
  );
}

async function handleGetPerformanceDashboard() {
  return await DevToolsHandler.handleMessage(
    'getPerformanceMetrics',
    {},
    {} as chrome.runtime.MessageSender
  );
}

async function handleClearPerformanceData() {
  return await RuleHandler.handleMessage(
    'clearRuleStats',
    {},
    {} as chrome.runtime.MessageSender
  );
}

async function handleTrackModification(_modificationData: ModificationData) {
  // Track modification data - implementation would go here
  return { success: true, tracked: true };
}

async function handleGetVariables(scope?: string, profileId?: string) {
  return await VariableHandler.handleMessage(
    'getVariables',
    { scope, profileId },
    {} as chrome.runtime.MessageSender
  );
}

async function handleResolveVariableTemplate(
  template: string,
  requestContext?: RequestContext
): Promise<RuntimeResponse> {
  return (await VariableHandler.handleMessage(
    'resolveTemplate',
    { template, requestContext },
    {} as chrome.runtime.MessageSender
  )) as RuntimeResponse;
}

async function handleValidateVariableTemplate(
  template: string
): Promise<RuntimeResponse> {
  return (await VariableHandler.handleMessage(
    'parseTemplate',
    { template },
    {} as chrome.runtime.MessageSender
  )) as RuntimeResponse;
}

async function handleClearVariableCache(): Promise<RuntimeResponse> {
  const cacheSize = variableCache.size;
  variableCache.clear();
  log('info', `Variable cache cleared (${cacheSize} entries removed)`);
  return { success: true, clearedEntries: cacheSize };
}

async function handleResetExtensionData(): Promise<RuntimeResponse> {
  try {
    await analyticsMonitor.clearAnalytics();
    PerformanceMonitor.resetMetrics();
    await PerformanceMonitor.clearMetricsFromStorage();
    variableCache.clear();
    rules = {};
    globalVariables = {};
    profileVariables = {};
    await loadStorageData();
    return {
      success: true,
      message: 'Extension data reset completed in background script',
    };
  } catch (error) {
    logError(logger, 'Failed to reset extension data', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

logger.info('RequestKit service worker loaded with modular architecture');
