import { useState, useEffect } from 'preact/hooks';

import { STORAGE_KEYS } from '@/config/constants';
import { matchURLPattern } from '@/lib/core/pattern-matcher';
import { Icon } from '@/shared/components/Icon';
import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

interface Profile {
  id: string;
  name: string;
}

interface ProfilesResponse {
  profiles: Profile[];
  activeProfile: string;
}

interface StatusResponse {
  enabled: boolean;
}

export function SidePanelApp() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<HeaderRule[]>([]);
  const [matchingRules, setMatchingRules] = useState<HeaderRule[]>([]);
  const [activeProfile, setActiveProfile] = useState('dev-profile');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Get extension status
        const statusResponse = (await ChromeApiUtils.runtime.sendMessage({
          type: 'GET_STATUS',
        })) as StatusResponse;

        // Get profiles
        const profileResponse = (await ChromeApiUtils.runtime.sendMessage({
          type: 'GET_PROFILES',
        })) as ProfilesResponse;

        // Load rules and settings from storage
        const storage = (await ChromeApiUtils.storage.get([
          STORAGE_KEYS.RULES,
          STORAGE_KEYS.SETTINGS,
        ])) as Record<string, unknown>;

        const loadedRules = Object.values(
          (storage[STORAGE_KEYS.RULES] as Record<string, HeaderRule>) || {}
        ) as HeaderRule[];

        const settings = storage[STORAGE_KEYS.SETTINGS] as ExtensionSettings;

        setEnabled(statusResponse?.enabled ?? settings?.enabled ?? true);
        setRules(loadedRules);
        setProfiles(profileResponse?.profiles || []);
        setActiveProfile(profileResponse?.activeProfile || 'dev-profile');

        // Get current tab
        const tabs = (await ChromeApiUtils.tabs.query({
          active: true,
          currentWindow: true,
        })) as chrome.tabs.Tab[];
        setCurrentTab(tabs[0] || null);

        setLoading(false);
      } catch (err) {
        logger.error('Failed to load side panel data:', err);
        setError('Failed to load extension data');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Recalculate matching rules when tab or rules change
  useEffect(() => {
    if (currentTab?.url && rules.length > 0) {
      const matched = rules.filter((rule: HeaderRule) => {
        if (!rule.enabled) return false;
        try {
          if (!currentTab.url) return false;
          const result = matchURLPattern(currentTab.url, rule.pattern);
          return result.matches;
        } catch {
          return false;
        }
      });
      setMatchingRules(matched);
    } else {
      setMatchingRules([]);
    }
  }, [currentTab?.url, rules]);

  // Listen for tab updates
  useEffect(() => {
    function handleTabActivated() {
      ChromeApiUtils.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs: unknown) => {
          const tabArray = tabs as chrome.tabs.Tab[];
          setCurrentTab(tabArray[0] || null);
        });
    }

    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
      if (changeInfo.status === 'complete') {
        handleTabActivated();
      }
    });

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated);
    };
  }, []);

  const handleToggleExtension = async () => {
    try {
      const newEnabled = !enabled;
      await ChromeApiUtils.runtime.sendMessage({
        type: 'TOGGLE_EXTENSION',
        enabled: newEnabled,
      });
      setEnabled(newEnabled);
    } catch (err) {
      logger.error('Failed to toggle extension:', err);
      setError('Failed to toggle extension');
    }
  };

  const handleProfileSwitch = async (profileId: string) => {
    try {
      await ChromeApiUtils.runtime.sendMessage({
        type: 'SET_ACTIVE_PROFILE',
        profileId,
      });
      setActiveProfile(profileId);
    } catch (err) {
      logger.error('Failed to switch profile:', err);
      setError('Failed to switch profile');
    }
  };

  const openOptionsPage = () => {
    ChromeApiUtils.runtime.openOptionsPage();
  };

  const activeRulesCount = matchingRules.length;
  const totalEnabledRules = rules.filter(r => r.enabled).length;
  const currentProfileName =
    profiles.find(p => p.id === activeProfile)?.name || activeProfile;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Icon
            name="spinner"
            size={24}
            className="animate-spin text-blue-500"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Icon name="zap" size={18} className="text-blue-500" />
          <span className="font-semibold text-sm">RequestKit</span>
        </div>
        <button
          onClick={openOptionsPage}
          className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Open full options"
        >
          <Icon name="settings" size={16} />
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-3 mt-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Enable/Disable Toggle */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <span className="text-sm font-medium">
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <button
            onClick={handleToggleExtension}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-4.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Active Profile */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Active Profile
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Icon
            name="users"
            size={14}
            className="text-gray-400 dark:text-gray-500"
          />
          <select
            value={activeProfile}
            onChange={e =>
              handleProfileSwitch((e.target as HTMLSelectElement).value)
            }
            className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {profiles.length > 0 ? (
              profiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))
            ) : (
              <option value={activeProfile}>{currentProfileName}</option>
            )}
          </select>
        </div>
      </div>

      {/* Rules Stats */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-blue-500">
              {activeRulesCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Matching Rules
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
              {totalEnabledRules}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Active
            </div>
          </div>
        </div>
      </div>

      {/* Matching Rules for Current Page */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Matching Rules
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {currentTab?.url
              ? new URL(currentTab.url).hostname
              : 'No active tab'}
          </span>
        </div>

        {matchingRules.length === 0 ? (
          <div className="py-6 text-center">
            <Icon
              name="shield"
              size={24}
              className="mx-auto mb-2 text-gray-300 dark:text-gray-600"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              No matching rules for this page
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {matchingRules.map(rule => (
              <div
                key={rule.id}
                className="flex items-center gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                <Icon
                  name="check-circle"
                  size={14}
                  className="text-green-500 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {rule.name}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {rule.pattern?.domain || '*'}
                  </div>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                  {rule.actionType || 'headers'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open Options Button */}
      <div className="px-4 py-3 mt-auto border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={openOptionsPage}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        >
          <Icon name="external-link" size={14} />
          Open Full Dashboard
        </button>
      </div>
    </div>
  );
}
