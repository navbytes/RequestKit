/**
 * Profile-related message handler
 */

import { STORAGE_KEYS } from '@/config/constants';
import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';
import { createDefaultProfiles } from '@/shared/utils/default-profiles';

import { BadgeManager } from '../services/badge-manager';

// Get logger for this module
const logger = loggers.shared;

// Profile handler specific interfaces
interface ProfileExportResult {
  profile: Profile;
  rules?: HeaderRule[];
  metadata: {
    exportedAt: string;
    version: string;
    includeRules: boolean;
    rulesCount?: number;
  };
}

interface ProfileImportResult {
  profile: Profile;
  importedRules?: number;
}

export class ProfileHandler {
  /**
   * Handle profile-related messages
   */
  static async handleMessage(
    action: string,
    data: unknown,
    _sender: chrome.runtime.MessageSender
  ): Promise<unknown> {
    switch (action) {
      case 'switchProfile':
        return await this.handleSwitchProfile(data as { profileId: string });

      case 'createProfile':
        return await this.handleCreateProfile(
          data as { profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> }
        );

      case 'updateProfile':
        return await this.handleUpdateProfile(
          data as {
            profileId: string;
            updates: Partial<Omit<Profile, 'id' | 'createdAt'>>;
          }
        );

      case 'deleteProfile':
        return await this.handleDeleteProfile(
          data as { profileId: string; transferRulesTo?: string }
        );

      case 'duplicateProfile':
        return await this.handleDuplicateProfile(
          data as { profileId: string; newName?: string; copyRules?: boolean }
        );

      case 'getProfiles':
        return await this.handleGetProfiles();

      case 'getActiveProfile':
        return await this.handleGetActiveProfile();

      case 'exportProfile':
        return await this.handleExportProfile(
          data as { profileId: string; includeRules?: boolean }
        );

      case 'importProfile':
        return await this.handleImportProfile(
          data as {
            profile: Profile;
            rules?: HeaderRule[];
            options?: { overwrite?: boolean; generateNewId?: boolean };
          }
        );

      default:
        throw new Error(`Unknown profile action: ${action}`);
    }
  }

  /**
   * Switch to a different profile
   */
  private static async handleSwitchProfile(data: {
    profileId: string;
  }): Promise<{
    success: boolean;
    previousProfile: string;
    newProfile: string;
  }> {
    try {
      // Get current active profile
      const profileData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.ACTIVE_PROFILE,
      ]);
      const previousProfile =
        ((profileData as Record<string, unknown>)[
          STORAGE_KEYS.ACTIVE_PROFILE
        ] as string) || 'dev-profile';

      // Handle special "unassigned" case
      if (data.profileId === 'unassigned') {
        // Switch to unassigned view - this is a special virtual profile
        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.ACTIVE_PROFILE]: 'unassigned',
        });

        // Update badge to reflect the unassigned view
        await BadgeManager.updateBadge(true, {});

        // Trigger immediate dynamic rules update for unassigned rules
        try {
          const { ChromeRulesConverter } = await import(
            '../services/chrome-rules-converter'
          );
          const { getAllVariables } = await import(
            '@/lib/core/variable-storage/utils/storageUtils'
          );

          // Get current rules and settings
          const [rulesData, settingsData] = await Promise.all([
            ChromeApiUtils.storage.sync.get([STORAGE_KEYS.RULES]),
            ChromeApiUtils.storage.sync.get([STORAGE_KEYS.SETTINGS]),
          ]);

          const rules =
            ((rulesData as Record<string, unknown>)[
              STORAGE_KEYS.RULES
            ] as Record<string, HeaderRule>) || {};
          const settings = ((settingsData as Record<string, unknown>)[
            STORAGE_KEYS.SETTINGS
          ] as ExtensionSettings) || { enabled: true };

          // Build variable context for unassigned rules (no profile-specific variables)
          const variablesData = await getAllVariables();
          const globalVariables = variablesData.global || {};

          const baseContext = {
            systemVariables: [],
            globalVariables: Object.values(globalVariables).filter(
              v => v.enabled !== false
            ),
            profileVariables: [], // No profile variables for unassigned
            ruleVariables: [],
            profileId: 'unassigned',
          };

          // Update Chrome rules immediately for unassigned view
          await ChromeRulesConverter.updateDynamicRules(
            settings.enabled !== false,
            rules,
            'unassigned',
            baseContext,
            settings
          );

          logger.info('Dynamic rules updated for unassigned view');
        } catch (error) {
          logger.error(
            'Failed to update dynamic rules for unassigned view:',
            error
          );
        }

        return {
          success: true,
          previousProfile,
          newProfile: 'unassigned',
        };
      }

      // Validate that the target profile exists (for normal profiles)
      const profilesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.PROFILES,
      ]);
      let profiles =
        ((profilesData as Record<string, unknown>)[
          STORAGE_KEYS.PROFILES
        ] as Record<string, Profile>) || {};

      // If profiles storage is empty, initialize with default profiles
      if (Object.keys(profiles).length === 0) {
        logger.info('DEBUG: Creating default profiles inline');
        try {
          profiles = { ...createDefaultProfiles() };
          logger.info('DEBUG: Successfully created default profiles');
          await ChromeApiUtils.storage.sync.set({
            [STORAGE_KEYS.PROFILES]: profiles,
          });
          logger.info('Initialized profiles storage with default profiles');
        } catch (error) {
          logger.error('DEBUG: Error creating default profiles:', error);
          throw error;
        }
      }

      if (!profiles[data.profileId]) {
        throw new Error(`Profile ${data.profileId} does not exist`);
      }

      // Switch to the new profile
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.ACTIVE_PROFILE]: data.profileId,
      });

      // Update badge to reflect the profile switch
      await BadgeManager.updateBadge(true, {});

      // Trigger immediate dynamic rules update for the new profile
      try {
        // Import the ChromeRulesConverter to update rules immediately
        const { ChromeRulesConverter } = await import(
          '../services/chrome-rules-converter'
        );
        const { getAllVariables } = await import(
          '@/lib/core/variable-storage/utils/storageUtils'
        );

        // Get current rules and settings
        const [rulesData, settingsData] = await Promise.all([
          ChromeApiUtils.storage.sync.get([STORAGE_KEYS.RULES]),
          ChromeApiUtils.storage.sync.get([STORAGE_KEYS.SETTINGS]),
        ]);

        const rules =
          ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
            string,
            HeaderRule
          >) || {};
        const settings = ((settingsData as Record<string, unknown>)[
          STORAGE_KEYS.SETTINGS
        ] as ExtensionSettings) || { enabled: true };

        // Build variable context for the new profile
        const variablesData = await getAllVariables();
        const globalVariables = variablesData.global || {};
        const profileVariables = variablesData.profiles || {};

        const baseContext = {
          systemVariables: [],
          globalVariables: Object.values(globalVariables).filter(
            v => v.enabled !== false
          ),
          profileVariables: Object.values(
            profileVariables[data.profileId] || {}
          ).filter(v => v.enabled !== false),
          ruleVariables: [],
          profileId: data.profileId,
        };

        // Update Chrome rules immediately with new profile
        await ChromeRulesConverter.updateDynamicRules(
          settings.enabled !== false,
          rules,
          data.profileId,
          baseContext,
          settings
        );

        logger.info(
          `Dynamic rules updated immediately for profile switch to: ${data.profileId}`
        );
      } catch (error) {
        logger.error(
          'Failed to update dynamic rules after profile switch:',
          error
        );

        // Fallback to message-based update
        try {
          await chrome.runtime.sendMessage({
            type: 'RULES_UPDATED',
          });
        } catch (msgError) {
          logger.warn('Failed to trigger rules update via message:', msgError);
        }
      }

      // Notify all tabs about the profile switch
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: 'profileSwitched',
              data: {
                previousProfile,
                newProfile: data.profileId,
                profile: profiles[data.profileId],
              },
            });
          } catch {
            // Ignore errors for tabs that don't have content scripts
          }
        }
      }

      return {
        success: true,
        previousProfile,
        newProfile: data.profileId,
      };
    } catch (error) {
      logger.error('Error switching profile:', error);
      throw error;
    }
  }

  /**
   * Create a new profile
   */
  private static async handleCreateProfile(data: {
    profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;
  }): Promise<Profile> {
    try {
      const profilesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.PROFILES,
      ]);
      const profiles =
        ((profilesData as Record<string, unknown>)[
          STORAGE_KEYS.PROFILES
        ] as Record<string, Profile>) || {};

      // Generate unique ID
      const profileId = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      // Create new profile
      const newProfile: Profile = {
        ...data.profile,
        id: profileId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save the profile
      profiles[profileId] = newProfile;
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.PROFILES]: profiles,
      });

      return newProfile;
    } catch (error) {
      logger.error('Error creating profile:', error);
      throw error;
    }
  }

  /**
   * Update an existing profile
   */
  private static async handleUpdateProfile(data: {
    profileId: string;
    updates: Partial<Omit<Profile, 'id' | 'createdAt'>>;
  }): Promise<Profile> {
    try {
      const profilesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.PROFILES,
      ]);
      let profiles =
        ((profilesData as Record<string, unknown>)[
          STORAGE_KEYS.PROFILES
        ] as Record<string, Profile>) || {};

      // If profiles storage is empty, initialize with default profiles
      if (Object.keys(profiles).length === 0) {
        logger.info('DEBUG: Creating default profiles inline');
        try {
          profiles = { ...createDefaultProfiles() };
          logger.info('DEBUG: Successfully created default profiles');
          await ChromeApiUtils.storage.sync.set({
            [STORAGE_KEYS.PROFILES]: profiles,
          });
          logger.info('Initialized profiles storage with default profiles');
        } catch (error) {
          logger.error('DEBUG: Error creating default profiles:', error);
          throw error;
        }
      }

      const existingProfile = profiles[data.profileId];
      if (!existingProfile) {
        throw new Error(`Profile ${data.profileId} not found`);
      }

      // Update the profile
      const updatedProfile: Profile = {
        ...existingProfile,
        ...data.updates,
        updatedAt: new Date(),
      };

      profiles[data.profileId] = updatedProfile;
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.PROFILES]: profiles,
      });

      return updatedProfile;
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Delete a profile
   */
  private static async handleDeleteProfile(data: {
    profileId: string;
    transferRulesTo?: string;
  }): Promise<{ success: boolean; transferredRules?: number }> {
    try {
      const profilesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.PROFILES,
      ]);
      const profiles =
        ((profilesData as Record<string, unknown>)[
          STORAGE_KEYS.PROFILES
        ] as Record<string, Profile>) || {};

      if (!profiles[data.profileId]) {
        throw new Error(`Profile ${data.profileId} not found`);
      }

      // Check if this is the active profile
      const activeProfileData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.ACTIVE_PROFILE,
      ]);
      const activeProfile =
        ((activeProfileData as Record<string, unknown>)[
          STORAGE_KEYS.ACTIVE_PROFILE
        ] as string) || 'dev-profile';

      if (activeProfile === data.profileId) {
        // Switch to a different profile before deleting
        const remainingProfiles = Object.keys(profiles).filter(
          id => id !== data.profileId
        );
        if (remainingProfiles.length === 0) {
          throw new Error('Cannot delete the last remaining profile');
        }

        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.ACTIVE_PROFILE]: remainingProfiles[0],
        });
      }

      // Handle rules associated with this profile
      let transferredRules = 0;
      if (data.transferRulesTo) {
        const rulesData = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.RULES,
        ]);
        const rules =
          ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
            string,
            HeaderRule
          >) || {};

        for (const [ruleId, rule] of Object.entries(rules)) {
          if (rule.profileId === data.profileId) {
            rules[ruleId] = {
              ...rule,
              profileId: data.transferRulesTo,
              updatedAt: new Date(),
            };
            transferredRules++;
          }
        }

        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.RULES]: rules,
        });
      } else {
        // Delete rules associated with this profile
        const rulesData = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.RULES,
        ]);
        const rules =
          ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
            string,
            HeaderRule
          >) || {};

        for (const [ruleId, rule] of Object.entries(rules)) {
          if (rule.profileId === data.profileId) {
            delete rules[ruleId];
          }
        }

        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.RULES]: rules,
        });
      }

      // Delete the profile
      delete profiles[data.profileId];
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.PROFILES]: profiles,
      });

      // Update badge
      await BadgeManager.updateBadge(true, {});

      // Trigger dynamic rules update after profile deletion
      try {
        const { ChromeRulesConverter } = await import(
          '../services/chrome-rules-converter'
        );
        const { getAllVariables } = await import(
          '@/lib/core/variable-storage/utils/storageUtils'
        );

        // Get current active profile after deletion
        const newActiveProfileData = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.ACTIVE_PROFILE,
        ]);
        const newActiveProfile =
          ((newActiveProfileData as Record<string, unknown>)[
            STORAGE_KEYS.ACTIVE_PROFILE
          ] as string) || 'dev-profile';

        // Get current rules and settings
        const [rulesData, settingsData] = await Promise.all([
          ChromeApiUtils.storage.sync.get([STORAGE_KEYS.RULES]),
          ChromeApiUtils.storage.sync.get([STORAGE_KEYS.SETTINGS]),
        ]);

        const rules =
          ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
            string,
            HeaderRule
          >) || {};
        const settings = ((settingsData as Record<string, unknown>)[
          STORAGE_KEYS.SETTINGS
        ] as ExtensionSettings) || { enabled: true };

        // Build variable context for the new active profile
        const variablesData = await getAllVariables();
        const globalVariables = variablesData.global || {};
        const profileVariables = variablesData.profiles || {};

        const baseContext = {
          systemVariables: [],
          globalVariables: Object.values(globalVariables).filter(
            v => v.enabled !== false
          ),
          profileVariables:
            newActiveProfile === 'unassigned'
              ? []
              : Object.values(profileVariables[newActiveProfile] || {}).filter(
                  v => v.enabled !== false
                ),
          ruleVariables: [],
          profileId: newActiveProfile,
        };

        // Update Chrome rules immediately after profile deletion
        await ChromeRulesConverter.updateDynamicRules(
          settings.enabled !== false,
          rules,
          newActiveProfile,
          baseContext,
          settings
        );

        logger.info(
          `Dynamic rules updated after profile deletion, active profile: ${newActiveProfile}`
        );
      } catch (error) {
        logger.error(
          'Failed to update dynamic rules after profile deletion:',
          error
        );
      }

      const result: { success: boolean; transferredRules?: number } = {
        success: true,
      };

      if (data.transferRulesTo) {
        result.transferredRules = transferredRules;
      }

      return result;
    } catch (error) {
      logger.error('Error deleting profile:', error);
      throw error;
    }
  }

  /**
   * Duplicate a profile
   */
  private static async handleDuplicateProfile(data: {
    profileId: string;
    newName?: string;
    copyRules?: boolean;
  }): Promise<Profile> {
    try {
      const profilesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.PROFILES,
      ]);
      const profiles =
        ((profilesData as Record<string, unknown>)[
          STORAGE_KEYS.PROFILES
        ] as Record<string, Profile>) || {};

      const originalProfile = profiles[data.profileId];
      if (!originalProfile) {
        throw new Error(`Profile ${data.profileId} not found`);
      }

      // Create duplicate profile
      const newProfileId = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const duplicatedProfile: Profile = {
        ...originalProfile,
        id: newProfileId,
        name: data.newName || `${originalProfile.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      profiles[newProfileId] = duplicatedProfile;
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.PROFILES]: profiles,
      });

      // Copy rules if requested
      if (data.copyRules) {
        const rulesData = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.RULES,
        ]);
        const rules =
          ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
            string,
            HeaderRule
          >) || {};

        const newRules = { ...rules };
        for (const [ruleId, rule] of Object.entries(rules)) {
          if (rule.profileId === data.profileId) {
            const newRuleId = `${ruleId}_copy_${Date.now()}`;
            newRules[newRuleId] = {
              ...rule,
              id: newRuleId,
              profileId: newProfileId,
              name: `${rule.name} (Copy)`,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }
        }

        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.RULES]: newRules,
        });
      }

      return duplicatedProfile;
    } catch (error) {
      logger.error('Error duplicating profile:', error);
      throw error;
    }
  }

  /**
   * Get all profiles
   */
  private static async handleGetProfiles(): Promise<Record<string, Profile>> {
    try {
      const profilesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.PROFILES,
      ]);
      let profiles =
        ((profilesData as Record<string, unknown>)[
          STORAGE_KEYS.PROFILES
        ] as Record<string, Profile>) || {};

      // If profiles storage is empty, initialize with default profiles
      if (Object.keys(profiles).length === 0) {
        logger.info('DEBUG: Creating default profiles inline');
        try {
          profiles = { ...createDefaultProfiles() };
          logger.info('DEBUG: Successfully created default profiles');
          await ChromeApiUtils.storage.sync.set({
            [STORAGE_KEYS.PROFILES]: profiles,
          });
          logger.info('Initialized profiles storage with default profiles');
        } catch (error) {
          logger.error('DEBUG: Error creating default profiles:', error);
          throw error;
        }
      }

      return profiles;
    } catch (error) {
      logger.error('Error getting profiles:', error);
      throw error;
    }
  }

  /**
   * Get the active profile
   */
  private static async handleGetActiveProfile(): Promise<{
    profileId: string;
    profile?: Profile;
  }> {
    try {
      const activeProfileData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.ACTIVE_PROFILE,
      ]);
      const profileId =
        ((activeProfileData as Record<string, unknown>)[
          STORAGE_KEYS.ACTIVE_PROFILE
        ] as string) || 'dev-profile';

      const profilesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.PROFILES,
      ]);
      let profiles =
        ((profilesData as Record<string, unknown>)[
          STORAGE_KEYS.PROFILES
        ] as Record<string, Profile>) || {};

      // If profiles storage is empty, initialize with default profiles
      if (Object.keys(profiles).length === 0) {
        logger.info('DEBUG: Creating default profiles inline');
        try {
          profiles = { ...createDefaultProfiles() };
          logger.info('DEBUG: Successfully created default profiles');
          await ChromeApiUtils.storage.sync.set({
            [STORAGE_KEYS.PROFILES]: profiles,
          });
          logger.info('Initialized profiles storage with default profiles');
        } catch (error) {
          logger.error('DEBUG: Error creating default profiles:', error);
          throw error;
        }
      }

      const result: { profileId: string; profile?: Profile } = {
        profileId,
      };

      const profile = profiles[profileId];
      if (profile) {
        result.profile = profile;
      }

      return result;
    } catch (error) {
      logger.error('Error getting active profile:', error);
      throw error;
    }
  }

  /**
   * Export a profile
   */
  private static async handleExportProfile(data: {
    profileId: string;
    includeRules?: boolean;
  }): Promise<ProfileExportResult> {
    try {
      const profilesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.PROFILES,
      ]);
      const profiles =
        ((profilesData as Record<string, unknown>)[
          STORAGE_KEYS.PROFILES
        ] as Record<string, Profile>) || {};

      const profile = profiles[data.profileId];
      if (!profile) {
        throw new Error(`Profile ${data.profileId} not found`);
      }

      const result: ProfileExportResult = {
        profile,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          includeRules: data.includeRules || false,
        },
      };

      // Include rules if requested
      if (data.includeRules) {
        const rulesData = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.RULES,
        ]);
        const rules =
          ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
            string,
            HeaderRule
          >) || {};

        const profileRules = Object.values(rules).filter(
          rule => rule.profileId === data.profileId
        );

        result.rules = profileRules;
        result.metadata.rulesCount = profileRules.length;
      }

      return result;
    } catch (error) {
      logger.error('Error exporting profile:', error);
      throw error;
    }
  }

  /**
   * Import a profile
   */
  private static async handleImportProfile(data: {
    profile: Profile;
    rules?: HeaderRule[];
    options?: {
      overwrite?: boolean;
      generateNewId?: boolean;
    };
  }): Promise<ProfileImportResult> {
    try {
      const profilesData = await ChromeApiUtils.storage.sync.get([
        STORAGE_KEYS.PROFILES,
      ]);
      const profiles =
        ((profilesData as Record<string, unknown>)[
          STORAGE_KEYS.PROFILES
        ] as Record<string, Profile>) || {};

      const profileToImport = { ...data.profile };

      // Generate new ID if requested or if profile already exists
      if (
        data.options?.generateNewId ||
        (profiles[profileToImport.id] && !data.options?.overwrite)
      ) {
        profileToImport.id = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      }

      // Check if profile exists and overwrite is not allowed
      if (profiles[profileToImport.id] && !data.options?.overwrite) {
        throw new Error(`Profile ${profileToImport.id} already exists`);
      }

      // Update timestamps
      profileToImport.updatedAt = new Date();
      if (!profiles[profileToImport.id]) {
        profileToImport.createdAt = new Date();
      }

      // Save the profile
      profiles[profileToImport.id] = profileToImport;
      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.PROFILES]: profiles,
      });

      let importedRules = 0;

      // Import rules if provided
      if (data.rules && data.rules.length > 0) {
        const rulesData = await ChromeApiUtils.storage.sync.get([
          STORAGE_KEYS.RULES,
        ]);
        const existingRules =
          ((rulesData as Record<string, unknown>)[STORAGE_KEYS.RULES] as Record<
            string,
            HeaderRule
          >) || {};

        for (const rule of data.rules) {
          const ruleToImport = {
            ...rule,
            profileId: profileToImport.id,
            updatedAt: new Date(),
          };

          // Generate new ID if rule already exists
          if (existingRules[ruleToImport.id]) {
            ruleToImport.id = `${ruleToImport.id}_imported_${Date.now()}`;
            ruleToImport.createdAt = new Date();
          }

          existingRules[ruleToImport.id] = ruleToImport;
          importedRules++;
        }

        await ChromeApiUtils.storage.sync.set({
          [STORAGE_KEYS.RULES]: existingRules,
        });
      }

      const result: { profile: Profile; importedRules?: number } = {
        profile: profileToImport,
      };

      if (data.rules) {
        result.importedRules = importedRules;
      }

      return result;
    } catch (error) {
      logger.error('Error importing profile:', error);
      throw error;
    }
  }
}
