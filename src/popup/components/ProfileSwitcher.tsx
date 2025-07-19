import { useState, useEffect } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';
import { useI18n } from '@/shared/hooks/useI18n';
import type { Profile } from '@/shared/types/profiles';
import { ChromeApiUtils } from '@/shared/utils';
import { loggers } from '@/shared/utils/debug';

interface ProfileSwitcherProps {
  className?: string;
  activeProfile?: string;
  onProfileChange?: (profileId: string) => void;
}

interface ProfileData {
  profiles: Profile[];
  activeProfile: string;
}

interface ProfilesResponse {
  profiles: Profile[];
  activeProfile: string;
}

interface SwitchProfileResponse {
  success: boolean;
  error?: string;
}

// Get logger for this module
const logger = loggers.shared;

export function ProfileSwitcher({
  className = '',
  activeProfile: externalActiveProfile,
  onProfileChange,
}: Readonly<ProfileSwitcherProps>) {
  const { t } = useI18n();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  // Use external activeProfile if provided, otherwise use internal state
  const currentActiveProfile =
    externalActiveProfile || profileData?.activeProfile || 'dev-profile';

  const loadProfiles = async () => {
    try {
      const response = (await ChromeApiUtils.runtime.sendMessage({
        type: 'GET_PROFILES',
      })) as ProfilesResponse;
      if (response) {
        setProfileData({
          profiles: response.profiles || [],
          activeProfile: response.activeProfile || 'dev-profile',
        });
      }
    } catch (error) {
      logger.error('Failed to load profiles:', error);
    }
  };

  const switchProfile = async (profileId: string) => {
    if (isLoading || !profileData) return;

    setIsLoading(true);
    try {
      // Send switch request to background script for both normal profiles and "unassigned"
      const response = (await ChromeApiUtils.runtime.sendMessage({
        type: 'SWITCH_PROFILE',
        profileId,
      })) as SwitchProfileResponse;

      if (response.success) {
        setProfileData(prev =>
          prev
            ? {
                ...prev,
                activeProfile: profileId,
              }
            : null
        );

        // Notify parent component if callback is provided
        onProfileChange?.(profileId);

        // Show success notification
        if (profileId === 'unassigned') {
          logger.info('Switched to view unassigned rules');
        } else {
          const activeProfile = profileData.profiles.find(
            p => p.id === profileId
          );
          if (activeProfile) {
            logger.info(`Switched to profile: ${activeProfile.name}`);
          }
        }
      } else {
        logger.error('Failed to switch profile:', response.error);
      }
    } catch (error) {
      logger.error('Failed to switch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profileData) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  const activeProfile = profileData.profiles.find(
    p => p.id === currentActiveProfile
  );

  const isUnassignedView = currentActiveProfile === 'unassigned';

  if (!profileData.profiles.length) {
    return null; // No profiles available
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
      <div className={`profile-switcher ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('ui_label_profile')}
          </div>

          <div className="relative">
            <select
              value={currentActiveProfile}
              onChange={e =>
                switchProfile((e.target as HTMLSelectElement).value)
              }
              disabled={isLoading}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 pr-8 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="unassigned">{t('ui_option_unassigned')}</option>
              {profileData.profiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>

            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Icon name="chevron-down" className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <span className="flex-1" />

          {/* Profile color indicator */}
          {activeProfile && !isUnassignedView && (
            <div className="flex items-center space-x-1">
              {/* Profile color dot */}
              <span
                className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: activeProfile.color }}
                title={`${activeProfile.name} (${activeProfile.environment})`}
              />
              <span>
                {t('ui_label_rules')}&nbsp;
                <span className="font-medium">
                  {activeProfile.rules.length}
                </span>
              </span>
            </div>
          )}

          {/* Unassigned view indicator */}
          {isUnassignedView && (
            <div className="flex items-center space-x-1">
              {/* Unassigned indicator dot */}
              <span
                className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-400"
                title={t('ui_tooltip_unassigned_rules')}
              />
              <span>{t('ui_label_unassigned_rules')}</span>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        {/* Profile info */}
        {activeProfile?.description && !isUnassignedView && (
          <div className="mt-1 text-gray-400 dark:text-gray-500">
            {activeProfile.description}
          </div>
        )}

        {/* Unassigned view description */}
        {isUnassignedView && (
          <div className="mt-1 text-gray-400 dark:text-gray-500">
            {t('ui_description_unassigned_rules')}
          </div>
        )}
      </div>
    </div>
  );
}
