// Profile and environment management types

export interface Profile {
  id: string;
  name: string;
  description?: string;
  color: string;
  environment: 'development' | 'staging' | 'production' | 'custom';
  rules: string[]; // Rule IDs associated with this profile
  enabled: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings?: ProfileSettings;
}

export interface ProfileSettings {
  // Profile-specific overrides for extension settings
  debugMode?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  notifications?: {
    enabled?: boolean;
    showRuleMatches?: boolean;
    showErrors?: boolean;
  };
  performance?: {
    maxRules?: number;
    enableMetrics?: boolean;
  };
}

export interface ProfileSwitchResult {
  success: boolean;
  previousProfile?: string;
  currentProfile: string;
  rulesActivated: number;
  rulesDeactivated: number;
  errors?: string[];
}

export interface ProfileStats {
  profileId: string;
  activationCount: number;
  lastActivated?: Date;
  averageRulesCount: number;
  totalUsageTime: number; // in milliseconds
  errorCount: number;
}

export interface ProfileExportData {
  version: string;
  exportDate: Date;
  profiles: Profile[];
  rules: unknown[]; // Associated rules
  metadata: {
    totalProfiles: number;
    exportedBy: string;
  };
}

// Environment-specific configurations
export const ENVIRONMENT_CONFIGS = {
  development: {
    color: '#10b981', // green
    defaultSettings: {
      debugMode: true,
      logLevel: 'debug',
      notifications: { enabled: true, showRuleMatches: true },
    },
  },
  staging: {
    color: '#f59e0b', // amber
    defaultSettings: {
      debugMode: true,
      logLevel: 'info',
      notifications: { enabled: true, showErrors: true },
    },
  },
  production: {
    color: '#ef4444', // red
    defaultSettings: {
      debugMode: false,
      logLevel: 'error',
      notifications: { enabled: false },
    },
  },
  custom: {
    color: '#8b5cf6', // purple
    defaultSettings: {
      debugMode: false,
      logLevel: 'info',
    },
  },
} satisfies Record<
  string,
  {
    color: string;
    defaultSettings: {
      debugMode: boolean;
      logLevel: 'error' | 'warn' | 'info' | 'debug';
      notifications?: {
        enabled?: boolean;
        showRuleMatches?: boolean;
        showErrors?: boolean;
      };
    };
  }
>;

export type EnvironmentType = keyof typeof ENVIRONMENT_CONFIGS;
