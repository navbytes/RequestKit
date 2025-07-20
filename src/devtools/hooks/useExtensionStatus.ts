import { useState, useEffect } from 'preact/hooks';

import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import { ChromeApiUtils } from '@/shared/utils';
import { loggers } from '@/shared/utils/debug';

interface ExtensionStatus {
  enabled: boolean;
  activeProfile: string;
  profiles: Profile[];
  rules: HeaderRule[];
}

interface DevToolsStatusResponse {
  success: boolean;
  status: {
    enabled: boolean;
    activeProfile: string;
    profiles: Profile[];
    rules: HeaderRule[];
  };
  error?: string;
}

interface ProfilesResponse {
  success: boolean;
  activeProfile: string;
  profiles: Profile[];
  error?: string;
}

interface SwitchProfileResponse {
  success: boolean;
  error?: string;
}

// Get logger for this module
const logger = loggers.shared;

// Constants
const DEFAULT_PROFILE_ID = 'dev-profile';

export function useExtensionStatus() {
  const [extensionStatus, setExtensionStatus] =
    useState<ExtensionStatus | null>(null);

  const loadExtensionStatus = async () => {
    try {
      // Check if extension context is valid
      if (!chrome.runtime || !chrome.runtime.id) {
        logger.warn('Extension context is invalid, using default status');
        setExtensionStatus({
          enabled: false,
          activeProfile: DEFAULT_PROFILE_ID,
          profiles: [],
          rules: [],
        });
        return;
      }

      try {
        const response = (await ChromeApiUtils.runtime.sendMessage({
          type: 'GET_DEVTOOLS_STATUS',
        })) as DevToolsStatusResponse;

        if (response && response.success) {
          setExtensionStatus({
            enabled: response.status.enabled,
            activeProfile: response.status.activeProfile,
            profiles: response.status.profiles || [],
            rules: response.status.rules || [],
          });
        } else {
          logger.error('Failed to get DevTools status:', response?.error);
          // Fallback to basic profile data
          try {
            const profileResponse = (await ChromeApiUtils.runtime.sendMessage({
              type: 'GET_PROFILES',
            })) as ProfilesResponse;
            if (profileResponse) {
              setExtensionStatus({
                enabled: true,
                activeProfile:
                  profileResponse.activeProfile || DEFAULT_PROFILE_ID,
                profiles: profileResponse.profiles || [],
                rules: [],
              });
            } else {
              throw new Error('No profile response');
            }
          } catch (innerError) {
            logger.error('Failed to get profiles:', innerError);
            // Use default values if all else fails
            setExtensionStatus({
              enabled: false,
              activeProfile: DEFAULT_PROFILE_ID,
              profiles: [],
              rules: [],
            });
          }
        }
      } catch (messageError) {
        logger.error(
          'Failed to send message to background script:',
          messageError
        );
        // Use default values if message sending fails
        setExtensionStatus({
          enabled: false,
          activeProfile: DEFAULT_PROFILE_ID,
          profiles: [],
          rules: [],
        });
      }
    } catch (error) {
      logger.error('Failed to load extension status:', error);
      // Use default values if all else fails
      setExtensionStatus({
        enabled: false,
        activeProfile: DEFAULT_PROFILE_ID,
        profiles: [],
        rules: [],
      });
    }
  };

  const switchProfile = async (profileId: string) => {
    // Check if extension context is valid
    if (!chrome.runtime || !chrome.runtime.id) {
      logger.warn('Extension context is invalid, cannot switch profile');
      // Update UI state anyway to provide feedback
      setExtensionStatus(prev =>
        prev
          ? {
              ...prev,
              activeProfile: profileId,
            }
          : {
              enabled: false,
              activeProfile: profileId,
              profiles: [],
              rules: [],
            }
      );
      return;
    }

    try {
      const response = (await ChromeApiUtils.runtime.sendMessage({
        type: 'SWITCH_PROFILE',
        profileId,
      })) as SwitchProfileResponse;

      if (response && response.success) {
        setExtensionStatus(prev =>
          prev
            ? {
                ...prev,
                activeProfile: profileId,
              }
            : {
                enabled: true,
                activeProfile: profileId,
                profiles: [],
                rules: [],
              }
        );
      } else {
        logger.error('Failed to switch profile:', response?.error);
      }
    } catch (error) {
      logger.error('Failed to switch profile:', error);

      // Update UI state anyway to provide feedback
      setExtensionStatus(prev =>
        prev
          ? {
              ...prev,
              activeProfile: profileId,
            }
          : null
      );
    }
  };

  useEffect(() => {
    loadExtensionStatus();
  }, []);

  return {
    extensionStatus,
    loadExtensionStatus,
    switchProfile,
  };
}
