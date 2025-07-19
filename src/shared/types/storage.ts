// Storage and persistence types

export interface StorageData {
  rules: Record<string, HeaderRule>;
  templates: Record<string, RuleTemplate>;
  profiles: Record<string, Profile>;
  settings: ExtensionSettings;
  stats: Record<string, RuleStats>;
  profileStats: Record<string, ProfileStats>;
  activeProfile: string;
  version: string;
  lastBackup?: Date;
  variables: {
    global: Record<string, Variable>;
    profiles: Record<string, Record<string, Variable>>; // profileId -> variables
    rules: Record<string, Record<string, Variable>>; // ruleId -> variables
  };
}

export interface ExtensionSettings {
  enabled: boolean;
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  notifications: {
    enabled: boolean;
    showRuleMatches: boolean;
    showErrors: boolean;
    showUpdates: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    showAdvancedOptions: boolean;
    defaultTab: string;
  };
  performance: {
    maxRules: number;
    cacheTimeout: number;
    enableMetrics: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupInterval: number; // hours
    maxBackups: number;
  };
  security: {
    requireConfirmation: boolean;
    allowExternalImport: boolean;
    validatePatterns: boolean;
  };
}

export interface StorageChange<T = unknown> {
  oldValue?: T;
  newValue?: T;
}

export interface StorageChanges {
  [key: string]: StorageChange;
}

export interface BackupData {
  id: string;
  name: string;
  createdAt: Date;
  data: Partial<StorageData>;
  size: number;
  checksum: string;
}

export interface ImportResult {
  success: boolean;
  imported: {
    rules: number;
    templates: number;
    settings: boolean;
  };
  errors: string[];
  warnings: string[];
  duplicates: string[];
}

export interface ExportOptions {
  includeRules: boolean;
  includeTemplates: boolean;
  includeSettings: boolean;
  includeStats: boolean;
  format: 'json' | 'yaml';
  compress: boolean;
}

// Re-export rule and profile types for convenience
import type { Profile, ProfileStats } from './profiles';
import type { HeaderRule, RuleTemplate, RuleStats } from './rules';
import type { Variable } from './variables';
