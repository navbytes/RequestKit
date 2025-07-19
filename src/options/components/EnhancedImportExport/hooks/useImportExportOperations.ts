import { STORAGE_KEYS } from '@/config/constants';
import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';
import { ChromeApiUtils } from '@/shared/utils';
import { loggers } from '@/shared/utils/debug';

interface ExportData {
  version: string;
  timestamp: string;
  rules?: HeaderRule[];
  templates?: unknown[];
  profiles?: unknown[];
  settings?: ExtensionSettings;
  stats?: unknown;
  profileStats?: unknown;
  activeProfile?: string;
  appVersion?: string;
  lastBackup?: string;
}

interface ExportOptions {
  rules: boolean;
  templates: boolean;
  profiles: boolean;
  settings: boolean;
  stats: boolean;
  profileStats: boolean;
  activeProfile: boolean;
  appVersion: boolean;
}

// Get logger for this module
const logger = loggers.shared;

export function useImportExportOperations(
  rules: HeaderRule[],
  settings: ExtensionSettings,
  exportOptions: ExportOptions,
  onRulesUpdate: (rules: HeaderRule[]) => void,
  onSettingsUpdate: (settings: ExtensionSettings) => void,
  setImportProgress: (progress: {
    show: boolean;
    step: string;
    progress: number;
  }) => void,
  setLastExport: (data: ExportData) => void
) {
  const handleExport = async () => {
    try {
      setImportProgress({
        show: true,
        step: 'Gathering data...',
        progress: 20,
      });

      const exportData: ExportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };

      // Export rules
      if (exportOptions.rules) {
        exportData.rules = rules;
      }

      // Export templates
      if (exportOptions.templates) {
        setImportProgress({
          show: true,
          step: 'Loading templates...',
          progress: 25,
        });
        const storage = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.TEMPLATES,
        ]);
        exportData.templates =
          ((storage as Record<string, unknown>)[
            STORAGE_KEYS.TEMPLATES
          ] as unknown[]) || [];
      }

      // Export profiles
      if (exportOptions.profiles) {
        setImportProgress({
          show: true,
          step: 'Loading profiles...',
          progress: 35,
        });
        const storage = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.PROFILES,
        ]);
        exportData.profiles =
          ((storage as Record<string, unknown>)[
            STORAGE_KEYS.PROFILES
          ] as unknown[]) || [];
      }

      // Export stats
      if (exportOptions.stats) {
        setImportProgress({
          show: true,
          step: 'Loading stats...',
          progress: 45,
        });
        const storage = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.STATS,
        ]);
        exportData.stats =
          (storage as Record<string, unknown>)[STORAGE_KEYS.STATS] || {};
      }

      // Export profile stats
      if (exportOptions.profileStats) {
        setImportProgress({
          show: true,
          step: 'Loading profile stats...',
          progress: 55,
        });
        const storage = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.PROFILE_STATS,
        ]);
        exportData.profileStats =
          (storage as Record<string, unknown>)[STORAGE_KEYS.PROFILE_STATS] ||
          {};
      }

      // Export active profile
      if (exportOptions.activeProfile) {
        setImportProgress({
          show: true,
          step: 'Loading active profile...',
          progress: 65,
        });
        const storage = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.ACTIVE_PROFILE,
        ]);
        exportData.activeProfile =
          ((storage as Record<string, unknown>)[
            STORAGE_KEYS.ACTIVE_PROFILE
          ] as string) || 'dev-profile';
      }

      // Export app version
      if (exportOptions.appVersion) {
        setImportProgress({
          show: true,
          step: 'Loading app version...',
          progress: 70,
        });
        const storage = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.VERSION,
        ]);
        exportData.appVersion =
          ((storage as Record<string, unknown>)[
            STORAGE_KEYS.VERSION
          ] as string) || '1.0.0';
      }

      // Export settings
      if (exportOptions.settings) {
        exportData.settings = settings;
      }

      // Add backup timestamp
      exportData.lastBackup = new Date().toISOString();

      setImportProgress({
        show: true,
        step: 'Creating export file...',
        progress: 80,
      });

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `requestkit-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      setLastExport(exportData);

      setImportProgress({
        show: true,
        step: 'Export complete!',
        progress: 100,
      });
      setTimeout(
        () => setImportProgress({ show: false, step: '', progress: 0 }),
        2000
      );
    } catch (error) {
      logger.error('Export failed:', error);
      setImportProgress({ show: false, step: '', progress: 0 });
      alert('Export failed. Please try again.');
    }
  };

  const handleImport = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      setImportProgress({ show: true, step: 'Reading file...', progress: 10 });

      const text = await file.text();
      const importData = JSON.parse(text) as ExportData;

      // Validate import data
      if (!importData.version || !importData.timestamp) {
        throw new Error('Invalid export file format');
      }

      setImportProgress({
        show: true,
        step: 'Validating data...',
        progress: 30,
      });

      // Import rules
      if (importData.rules && importData.rules.length > 0) {
        setImportProgress({
          show: true,
          step: 'Importing rules...',
          progress: 50,
        });

        // Merge with existing rules or replace
        const shouldMerge = confirm(
          `Found ${importData.rules.length} rules. Do you want to merge with existing rules? (Cancel to replace all rules)`
        );

        const newRules = shouldMerge
          ? [...rules, ...importData.rules]
          : importData.rules;

        // Update storage
        const rulesObject = newRules.reduce(
          (acc, rule) => {
            acc[rule.id] = rule;
            return acc;
          },
          {} as Record<string, HeaderRule>
        );

        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.RULES]: rulesObject,
        });
        onRulesUpdate(newRules);
      }

      // Import templates
      if (importData.templates && importData.templates.length > 0) {
        setImportProgress({
          show: true,
          step: 'Importing templates...',
          progress: 50,
        });

        const storage = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.TEMPLATES,
        ]);
        const existingTemplates =
          ((storage as Record<string, unknown>)[
            STORAGE_KEYS.TEMPLATES
          ] as unknown[]) || [];

        const shouldMerge = confirm(
          `Found ${importData.templates.length} templates. Do you want to merge with existing templates? (Cancel to replace all templates)`
        );

        const newTemplates = shouldMerge
          ? [...existingTemplates, ...importData.templates]
          : importData.templates;

        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.TEMPLATES]: newTemplates,
        });
      }

      // Import profiles
      if (importData.profiles && importData.profiles.length > 0) {
        setImportProgress({
          show: true,
          step: 'Importing profiles...',
          progress: 55,
        });

        const storage = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.PROFILES,
        ]);
        const existingProfiles =
          ((storage as Record<string, unknown>)[
            STORAGE_KEYS.PROFILES
          ] as unknown[]) || [];

        const shouldMerge = confirm(
          `Found ${importData.profiles.length} profiles. Do you want to merge with existing profiles? (Cancel to replace all profiles)`
        );

        const newProfiles = shouldMerge
          ? [...existingProfiles, ...importData.profiles]
          : importData.profiles;

        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.PROFILES]: newProfiles,
        });
      }

      // Import stats
      if (importData.stats && Object.keys(importData.stats).length > 0) {
        setImportProgress({
          show: true,
          step: 'Importing stats...',
          progress: 60,
        });

        const shouldImportStats = confirm(
          'Do you want to import usage statistics? This will overwrite your current stats.'
        );

        if (shouldImportStats) {
          await ChromeApiUtils.storage.sync.set({
            [STORAGE_KEYS.STATS]: importData.stats,
          });
        }
      }

      // Import profile stats
      if (
        importData.profileStats &&
        Object.keys(importData.profileStats).length > 0
      ) {
        setImportProgress({
          show: true,
          step: 'Importing profile stats...',
          progress: 70,
        });

        const shouldImportProfileStats = confirm(
          'Do you want to import profile statistics? This will overwrite your current profile stats.'
        );

        if (shouldImportProfileStats) {
          await ChromeApiUtils.storage.sync.set({
            [STORAGE_KEYS.PROFILE_STATS]: importData.profileStats,
          });
        }
      }

      // Import active profile
      if (importData.activeProfile) {
        setImportProgress({
          show: true,
          step: 'Importing active profile...',
          progress: 75,
        });

        const shouldImportActiveProfile = confirm(
          `Do you want to set "${importData.activeProfile}" as the active profile?`
        );

        if (shouldImportActiveProfile) {
          await ChromeApiUtils.storage.sync.set({
            [STORAGE_KEYS.ACTIVE_PROFILE]: importData.activeProfile,
          });
        }
      }

      // Import app version
      if (importData.appVersion) {
        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.VERSION]: importData.appVersion,
        });
      }

      // Import settings
      if (importData.settings) {
        setImportProgress({
          show: true,
          step: 'Importing settings...',
          progress: 85,
        });

        const shouldImportSettings = confirm(
          'Do you want to import settings? This will overwrite your current preferences.'
        );

        if (shouldImportSettings) {
          await ChromeApiUtils.storage.sync.set({
            [STORAGE_KEYS.SETTINGS]: importData.settings,
          });
          onSettingsUpdate(importData.settings);
        }
      }

      // Update last backup timestamp
      if (importData.lastBackup) {
        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.LAST_BACKUP]: importData.lastBackup,
        });
      }

      setImportProgress({
        show: true,
        step: 'Import complete!',
        progress: 100,
      });
      setTimeout(
        () => setImportProgress({ show: false, step: '', progress: 0 }),
        2000
      );

      // Notify background script
      ChromeApiUtils.runtime.sendMessage({ type: 'RULES_UPDATED' });
    } catch (error) {
      logger.error('Import failed:', error);
      setImportProgress({ show: false, step: '', progress: 0 });
      alert(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Reset file input
    (event.target as HTMLInputElement).value = '';
  };

  const handleQuickExport = async (
    type: 'rules' | 'templates' | 'profiles'
  ) => {
    try {
      let data: unknown[] = [];
      let filename = '';

      switch (type) {
        case 'rules':
          data = rules;
          filename = 'requestkit-rules';
          break;
        case 'templates': {
          const storage = await ChromeApiUtils.storage.sync.get([
            STORAGE_KEYS.TEMPLATES,
          ]);
          data =
            ((storage as Record<string, unknown>)[
              STORAGE_KEYS.TEMPLATES
            ] as unknown[]) || [];
          filename = 'requestkit-templates';
          break;
        }
        case 'profiles': {
          const profileStorage = await ChromeApiUtils.storage.sync.get([
            STORAGE_KEYS.PROFILES,
          ]);
          data =
            ((profileStorage as Record<string, unknown>)[
              STORAGE_KEYS.PROFILES
            ] as unknown[]) || [];
          filename = 'requestkit-profiles';
          break;
        }
      }

      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        [type]: data,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error(`${type} export failed:`, error);
      alert(`${type} export failed. Please try again.`);
    }
  };

  return {
    handleExport,
    handleImport,
    handleQuickExport,
  };
}
