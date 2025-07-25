/**
 * Variable usage tracking and analytics
 */

import { STORAGE_KEYS } from '@/config/constants';
import type { Variable } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

import { getAllVariables } from '../utils/storageUtils';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

export interface VariableUsageRecord {
  variableId: string;
  variableName: string;
  scope: string;
  profileId?: string;
  ruleId?: string;
  timestamp: string;
  context?: {
    url?: string;
    method?: string;
    userAgent?: string;
    tabId?: number;
  };
}

export interface VariableUsageStats {
  variableId: string;
  variableName: string;
  totalUsage: number;
  lastUsed?: string;
  firstUsed?: string;
  averageUsagePerDay: number;
  usageByDay: Record<string, number>;
  usageByHour: Record<string, number>;
  contexts: Array<{
    url?: string;
    method?: string;
    count: number;
  }>;
}

/**
 * Track variable usage
 */
export async function trackVariableUsage(
  variableId: string,
  variableName: string,
  scope: string,
  context?: {
    url?: string;
    method?: string;
    userAgent?: string;
    tabId?: number;
    profileId?: string;
    ruleId?: string;
  }
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();

    // Update variable metadata
    await updateVariableUsageMetadata(
      variableId,
      variableName,
      scope,
      context?.profileId,
      context?.ruleId
    );

    // Record usage event
    const usageRecord: VariableUsageRecord = {
      variableId,
      variableName,
      scope,
      ...(context?.profileId !== undefined && { profileId: context.profileId }),
      ...(context?.ruleId !== undefined && { ruleId: context.ruleId }),
      timestamp,
      ...(context &&
        (context.url !== undefined ||
          context.method !== undefined ||
          context.userAgent !== undefined ||
          context.tabId !== undefined) && {
          context: {
            ...(context.url !== undefined && { url: context.url }),
            ...(context.method !== undefined && { method: context.method }),
            ...(context.userAgent !== undefined && {
              userAgent: context.userAgent,
            }),
            ...(context.tabId !== undefined && { tabId: context.tabId }),
          },
        }),
    };

    await recordUsageEvent(usageRecord);

    logger.debug(`Tracked usage for variable ${variableName} (${variableId})`);
  } catch (error) {
    logger.error(`Failed to track usage for variable ${variableName}:`, error);
  }
}

/**
 * Update variable usage metadata
 */
async function updateVariableUsageMetadata(
  _variableId: string,
  variableName: string,
  scope: string,
  profileId?: string,
  ruleId?: string
): Promise<void> {
  try {
    const variablesData = await getAllVariables();
    let variable: Variable | undefined;

    // Find the variable
    if (scope === 'global') {
      variable = variablesData.global[variableName];
    } else if (scope === 'profile' && profileId) {
      variable = variablesData.profiles[profileId]?.[variableName];
    } else if (scope === 'rule' && ruleId) {
      variable = variablesData.rules[ruleId]?.[variableName];
    } else {
      // Unknown scope or missing required parameters
      logger.warn(`Invalid scope or missing parameters: ${scope}`);
    }

    if (!variable) {
      logger.warn(`Variable ${variableName} not found for usage tracking`);
      return;
    }

    // Update metadata
    const now = new Date().toISOString();
    if (!variable.metadata) {
      variable.metadata = {
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
      };
    }

    variable.metadata.usageCount = (variable.metadata.usageCount || 0) + 1;
    variable.metadata.lastUsed = now;
    variable.metadata.updatedAt = now;

    // Save updated data
    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.VARIABLES]: variablesData,
    });
  } catch (error) {
    logger.error('Failed to update variable usage metadata:', error);
  }
}

/**
 * Record usage event for analytics
 */
async function recordUsageEvent(
  usageRecord: VariableUsageRecord
): Promise<void> {
  try {
    const result = await ChromeApiUtils.storage.local.get([
      'variableUsageHistory',
    ]);
    const history: VariableUsageRecord[] =
      (result as { variableUsageHistory?: VariableUsageRecord[] })
        .variableUsageHistory || [];

    // Add new record
    history.push(usageRecord);

    // Keep only last 1000 records to prevent storage bloat
    const maxRecords = 1000;
    if (history.length > maxRecords) {
      history.splice(0, history.length - maxRecords);
    }

    await ChromeApiUtils.storage.local.set({
      variableUsageHistory: history,
    });
  } catch (error) {
    logger.error('Failed to record usage event:', error);
  }
}

/**
 * Get usage statistics for a variable
 */
export async function getVariableUsageStats(
  variableId: string
): Promise<VariableUsageStats | null> {
  try {
    const result = await ChromeApiUtils.storage.local.get([
      'variableUsageHistory',
    ]);
    const history: VariableUsageRecord[] =
      (result as { variableUsageHistory?: VariableUsageRecord[] })
        .variableUsageHistory || [];

    const variableRecords = history.filter(
      record => record.variableId === variableId
    );

    if (variableRecords.length === 0) {
      return null;
    }

    const firstRecord = variableRecords[0];
    const lastRecord = variableRecords[variableRecords.length - 1];

    if (!firstRecord || !lastRecord) {
      return null;
    }

    // Calculate usage by day
    const usageByDay: Record<string, number> = {};
    const usageByHour: Record<string, number> = {};
    const contextCounts = new Map<string, number>();

    variableRecords.forEach(record => {
      const date = new Date(record.timestamp);
      const dayKey = date.toISOString().split('T')[0];
      const hourKey = date.getHours().toString().padStart(2, '0');

      if (dayKey) {
        usageByDay[dayKey] = (usageByDay[dayKey] || 0) + 1;
      }
      if (hourKey) {
        usageByHour[hourKey] = (usageByHour[hourKey] || 0) + 1;
      }

      // Track context usage
      if (record.context?.url && record.context?.method) {
        const contextKey = `${record.context.method} ${record.context.url}`;
        contextCounts.set(contextKey, (contextCounts.get(contextKey) || 0) + 1);
      }
    });

    // Calculate average usage per day
    const firstDate = new Date(firstRecord.timestamp);
    const lastDate = new Date(lastRecord.timestamp);
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const averageUsagePerDay = variableRecords.length / daysDiff;

    // Get top contexts
    const contexts = Array.from(contextCounts.entries())
      .map(([context, count]) => {
        const [method, ...urlParts] = context.split(' ');
        const url = urlParts.join(' ');
        return {
          ...(method && { method }),
          ...(url && { url }),
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      variableId,
      variableName: firstRecord.variableName,
      totalUsage: variableRecords.length,
      lastUsed: lastRecord.timestamp,
      firstUsed: firstRecord.timestamp,
      averageUsagePerDay,
      usageByDay,
      usageByHour,
      contexts,
    };
  } catch (error) {
    logger.error(
      `Failed to get usage stats for variable ${variableId}:`,
      error
    );
    return null;
  }
}

/**
 * Get usage statistics for all variables
 */
export async function getAllVariableUsageStats(): Promise<
  VariableUsageStats[]
> {
  try {
    const result = await ChromeApiUtils.storage.local.get([
      'variableUsageHistory',
    ]);
    const history: VariableUsageRecord[] =
      (result as { variableUsageHistory?: VariableUsageRecord[] })
        .variableUsageHistory || [];

    const variableIds = new Set(history.map(record => record.variableId));
    const stats: VariableUsageStats[] = [];

    for (const variableId of variableIds) {
      const variableStats = await getVariableUsageStats(variableId);
      if (variableStats) {
        stats.push(variableStats);
      }
    }

    return stats.sort((a, b) => b.totalUsage - a.totalUsage);
  } catch (error) {
    logger.error('Failed to get all variable usage stats:', error);
    return [];
  }
}

/**
 * Get usage trends over time
 */
export async function getUsageTrends(days = 30): Promise<{
  totalUsage: Record<string, number>;
  variableUsage: Record<string, Record<string, number>>;
  topVariables: Array<{
    variableId: string;
    variableName: string;
    usage: number;
  }>;
}> {
  try {
    const result = await ChromeApiUtils.storage.local.get([
      'variableUsageHistory',
    ]);
    const history: VariableUsageRecord[] =
      (result as { variableUsageHistory?: VariableUsageRecord[] })
        .variableUsageHistory || [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentRecords = history.filter(
      record => new Date(record.timestamp) >= cutoffDate
    );

    const totalUsage: Record<string, number> = {};
    const variableUsage: Record<string, Record<string, number>> = {};
    const variableCounts = new Map<string, { name: string; count: number }>();

    recentRecords.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];

      if (date) {
        // Total usage by day
        totalUsage[date] = (totalUsage[date] || 0) + 1;

        // Usage by variable and day
        variableUsage[record.variableId] ??= {};
        const variableRecord = variableUsage[record.variableId];
        if (variableRecord) {
          variableRecord[date] = (variableRecord[date] || 0) + 1;
        }
      }

      // Variable counts
      const existing = variableCounts.get(record.variableId);
      variableCounts.set(record.variableId, {
        name: record.variableName,
        count: (existing?.count || 0) + 1,
      });
    });

    const topVariables = Array.from(variableCounts.entries())
      .map(([variableId, data]) => ({
        variableId,
        variableName: data.name,
        usage: data.count,
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    return {
      totalUsage,
      variableUsage,
      topVariables,
    };
  } catch (error) {
    logger.error('Failed to get usage trends:', error);
    return {
      totalUsage: {},
      variableUsage: {},
      topVariables: [],
    };
  }
}

/**
 * Clear usage history
 */
export async function clearUsageHistory(): Promise<void> {
  try {
    await ChromeApiUtils.storage.local.remove(['variableUsageHistory']);
    logger.info('Variable usage history cleared');
  } catch (error) {
    logger.error('Failed to clear usage history:', error);
    throw error;
  }
}

/**
 * Export usage data
 */
export async function exportUsageData(): Promise<{
  history: VariableUsageRecord[];
  stats: VariableUsageStats[];
  exportDate: string;
}> {
  try {
    const result = await ChromeApiUtils.storage.local.get([
      'variableUsageHistory',
    ]);
    const history: VariableUsageRecord[] =
      (result as { variableUsageHistory?: VariableUsageRecord[] })
        .variableUsageHistory || [];
    const stats = await getAllVariableUsageStats();

    return {
      history,
      stats,
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Failed to export usage data:', error);
    throw error;
  }
}
