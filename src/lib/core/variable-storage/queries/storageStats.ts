/**
 * Storage statistics and analytics
 */

import type { Variable } from '@/shared/types/variables';
import { loggers } from '@/shared/utils/debug';

import { getAllVariables } from '../utils/storageUtils';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

export interface StorageStatistics {
  total: {
    count: number;
    enabled: number;
    disabled: number;
    secret: number;
    public: number;
  };
  byScope: {
    global: number;
    profile: number;
    rule: number;
  };
  byType: {
    string: number;
    number: number;
    boolean: number;
    object: number;
    array: number;
    other: number;
  };
  usage: {
    totalUsage: number;
    averageUsage: number;
    mostUsed: Variable | null;
    leastUsed: Variable | null;
    unused: number;
  };
  dates: {
    oldestCreated: Date | null;
    newestCreated: Date | null;
    lastUpdated: Date | null;
  };
  tags: {
    totalTags: number;
    uniqueTags: string[];
    mostCommonTags: Array<{ tag: string; count: number }>;
  };
  profiles: {
    totalProfiles: number;
    profilesWithVariables: number;
    averageVariablesPerProfile: number;
  };
  rules: {
    totalRules: number;
    rulesWithVariables: number;
    averageVariablesPerRule: number;
  };
}

/**
 * Get comprehensive storage statistics
 */
export async function getStorageStatistics(): Promise<StorageStatistics> {
  try {
    const variablesData = await getAllVariables();
    const allVariables: Variable[] = [];
    const tagCounts = new Map<string, number>();

    // Collect all variables and count tags
    Object.values(variablesData.global).forEach(variable => {
      allVariables.push(variable);
      variable.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    Object.values(variablesData.profiles).forEach(profileVars => {
      Object.values(profileVars).forEach(variable => {
        allVariables.push(variable);
        variable.tags?.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });
    });

    Object.values(variablesData.rules).forEach(ruleVars => {
      Object.values(ruleVars).forEach(variable => {
        allVariables.push(variable);
        variable.tags?.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });
    });

    // Calculate basic counts
    const totalCount = allVariables.length;
    const enabledCount = allVariables.filter(v => v.enabled).length;
    const secretCount = allVariables.filter(v => v.isSecret).length;

    // Count by scope
    const globalCount = allVariables.filter(v => v.scope === 'global').length;
    const profileCount = allVariables.filter(v => v.scope === 'profile').length;
    const ruleCount = allVariables.filter(v => v.scope === 'rule').length;

    // Count by type
    const getValueType = (value: unknown): string => {
      if (value === null || value === undefined) return 'other';
      if (Array.isArray(value)) return 'array';
      return typeof value;
    };

    const typeCounts = {
      string: 0,
      number: 0,
      boolean: 0,
      object: 0,
      array: 0,
      other: 0,
    };

    allVariables.forEach(variable => {
      const type = getValueType(variable.value);
      if (type in typeCounts) {
        typeCounts[type as keyof typeof typeCounts]++;
      } else {
        typeCounts.other++;
      }
    });

    // Calculate usage statistics
    const usageCounts = allVariables.map(v => v.metadata?.usageCount || 0);
    const totalUsage = usageCounts.reduce((sum, count) => sum + count, 0);
    const averageUsage = totalCount > 0 ? totalUsage / totalCount : 0;

    let mostUsed: Variable | null = null;
    let leastUsed: Variable | null = null;
    let maxUsage = -1;
    let minUsage = Infinity;

    allVariables.forEach(variable => {
      const usage = variable.metadata?.usageCount || 0;
      if (usage > maxUsage) {
        maxUsage = usage;
        mostUsed = variable;
      }
      if (usage < minUsage) {
        minUsage = usage;
        leastUsed = variable;
      }
    });

    const unusedCount = allVariables.filter(
      v => (v.metadata?.usageCount || 0) === 0
    ).length;

    // Calculate date statistics
    const createdDates = allVariables
      .map(v => v.metadata?.createdAt)
      .filter((date): date is string => Boolean(date))
      .map(date => new Date(date));

    const updatedDates = allVariables
      .map(v => v.metadata?.updatedAt)
      .filter((date): date is string => Boolean(date))
      .map(date => new Date(date));

    const oldestCreated =
      createdDates.length > 0
        ? new Date(Math.min(...createdDates.map(d => d.getTime())))
        : null;

    const newestCreated =
      createdDates.length > 0
        ? new Date(Math.max(...createdDates.map(d => d.getTime())))
        : null;

    const lastUpdated =
      updatedDates.length > 0
        ? new Date(Math.max(...updatedDates.map(d => d.getTime())))
        : null;

    // Calculate tag statistics
    const uniqueTags = Array.from(tagCounts.keys());
    const mostCommonTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Calculate profile statistics
    const totalProfiles = Object.keys(variablesData.profiles).length;
    const profilesWithVariables = Object.values(variablesData.profiles).filter(
      profileVars => Object.keys(profileVars).length > 0
    ).length;
    const averageVariablesPerProfile =
      totalProfiles > 0 ? profileCount / totalProfiles : 0;

    // Calculate rule statistics
    const totalRules = Object.keys(variablesData.rules).length;
    const rulesWithVariables = Object.values(variablesData.rules).filter(
      ruleVars => Object.keys(ruleVars).length > 0
    ).length;
    const averageVariablesPerRule = totalRules > 0 ? ruleCount / totalRules : 0;

    return {
      total: {
        count: totalCount,
        enabled: enabledCount,
        disabled: totalCount - enabledCount,
        secret: secretCount,
        public: totalCount - secretCount,
      },
      byScope: {
        global: globalCount,
        profile: profileCount,
        rule: ruleCount,
      },
      byType: typeCounts,
      usage: {
        totalUsage,
        averageUsage,
        mostUsed,
        leastUsed,
        unused: unusedCount,
      },
      dates: {
        oldestCreated,
        newestCreated,
        lastUpdated,
      },
      tags: {
        totalTags: uniqueTags.length,
        uniqueTags,
        mostCommonTags,
      },
      profiles: {
        totalProfiles,
        profilesWithVariables,
        averageVariablesPerProfile,
      },
      rules: {
        totalRules,
        rulesWithVariables,
        averageVariablesPerRule,
      },
    };
  } catch (error) {
    logger.error('Failed to get storage statistics:', error);

    // Return empty statistics on error
    return {
      total: { count: 0, enabled: 0, disabled: 0, secret: 0, public: 0 },
      byScope: { global: 0, profile: 0, rule: 0 },
      byType: {
        string: 0,
        number: 0,
        boolean: 0,
        object: 0,
        array: 0,
        other: 0,
      },
      usage: {
        totalUsage: 0,
        averageUsage: 0,
        mostUsed: null,
        leastUsed: null,
        unused: 0,
      },
      dates: { oldestCreated: null, newestCreated: null, lastUpdated: null },
      tags: { totalTags: 0, uniqueTags: [], mostCommonTags: [] },
      profiles: {
        totalProfiles: 0,
        profilesWithVariables: 0,
        averageVariablesPerProfile: 0,
      },
      rules: {
        totalRules: 0,
        rulesWithVariables: 0,
        averageVariablesPerRule: 0,
      },
    };
  }
}

/**
 * Get storage size information
 */
export async function getStorageSize(): Promise<{
  totalSizeBytes: number;
  totalSizeFormatted: string;
  byScopeBytes: {
    global: number;
    profile: number;
    rule: number;
  };
  largestVariables: Array<{
    variable: Variable;
    sizeBytes: number;
    sizeFormatted: string;
  }>;
}> {
  try {
    const variablesData = await getAllVariables();

    const calculateSize = (obj: unknown): number => {
      return new Blob([JSON.stringify(obj)]).size;
    };

    const formatSize = (bytes: number): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    // Calculate sizes by scope
    const globalSize = calculateSize(variablesData.global);
    const profileSize = calculateSize(variablesData.profiles);
    const ruleSize = calculateSize(variablesData.rules);
    const totalSize = globalSize + profileSize + ruleSize;

    // Find largest variables
    const allVariables: Array<{ variable: Variable; sizeBytes: number }> = [];

    Object.values(variablesData.global).forEach(variable => {
      allVariables.push({
        variable,
        sizeBytes: calculateSize(variable),
      });
    });

    Object.values(variablesData.profiles).forEach(profileVars => {
      Object.values(profileVars).forEach(variable => {
        allVariables.push({
          variable,
          sizeBytes: calculateSize(variable),
        });
      });
    });

    Object.values(variablesData.rules).forEach(ruleVars => {
      Object.values(ruleVars).forEach(variable => {
        allVariables.push({
          variable,
          sizeBytes: calculateSize(variable),
        });
      });
    });

    const largestVariables = allVariables
      .sort((a, b) => b.sizeBytes - a.sizeBytes)
      .slice(0, 10)
      .map(({ variable, sizeBytes }) => ({
        variable,
        sizeBytes,
        sizeFormatted: formatSize(sizeBytes),
      }));

    return {
      totalSizeBytes: totalSize,
      totalSizeFormatted: formatSize(totalSize),
      byScopeBytes: {
        global: globalSize,
        profile: profileSize,
        rule: ruleSize,
      },
      largestVariables,
    };
  } catch (error) {
    logger.error('Failed to get storage size:', error);
    return {
      totalSizeBytes: 0,
      totalSizeFormatted: '0 B',
      byScopeBytes: { global: 0, profile: 0, rule: 0 },
      largestVariables: [],
    };
  }
}
