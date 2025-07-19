import { useState, useEffect } from 'preact/hooks';

import { STORAGE_KEYS } from '@/config/constants';
import { TabDescription } from '@/shared/components/TabDescription';
import type { Profile } from '@/shared/types/profiles';
import { ENVIRONMENT_CONFIGS } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import { ChromeApiUtils } from '@/shared/utils';
import { loggers } from '@/shared/utils/debug';

import { ProfileForm } from './ProfileForm';
import { ProfilesList } from './ProfilesList';
import { UnassignedRules } from './UnassignedRules';

interface ProfileManagerProps {
  rules: HeaderRule[];
  onRulesUpdate: (rules: HeaderRule[]) => void;
}

interface ProfileData {
  profiles: Profile[];
  activeProfile: string;
}

interface NewProfileForm {
  name: string;
  description: string;
  environment: 'development' | 'staging' | 'production' | 'custom';
  color: string;
}

interface ProfilesResponse {
  success: boolean;
  profiles: Profile[];
  activeProfile: string;
  error?: string;
}

interface CreateProfileResponse {
  success: boolean;
  profile: Profile;
  error?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  error?: string;
}

interface DeleteProfileResponse {
  success: boolean;
  error?: string;
}

interface SwitchProfileResponse {
  success: boolean;
  error?: string;
}

// Custom Hooks

// Get logger for this module
const logger = loggers.shared;

function useProfileData() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const loadProfiles = async () => {
    try {
      logger.info('ProfileManager: Loading profiles...');
      const response = (await ChromeApiUtils.runtime.sendMessage({
        type: 'GET_PROFILES',
      })) as ProfilesResponse;
      logger.info('ProfileManager: GET_PROFILES response:', response);
      if (response) {
        const profileData = {
          profiles: response.profiles || [],
          activeProfile: response.activeProfile || 'dev-profile',
        };
        logger.info('ProfileManager: Setting profile data:', profileData);
        setProfileData(profileData);
      }
    } catch (error) {
      logger.error('Failed to load profiles:', error);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  return {
    profileData,
    setProfileData,
    loadProfiles,
  };
}

function useProfileForm() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newProfile, setNewProfile] = useState<NewProfileForm>({
    name: '',
    description: '',
    environment: 'custom',
    color: '#8b5cf6',
  });
  const [selectedRules, setSelectedRules] = useState<string[]>([]);

  const resetForm = () => {
    setNewProfile({
      name: '',
      description: '',
      environment: 'custom',
      color: '#8b5cf6',
    });
    setSelectedRules([]);
    setEditingProfile(null);
    setShowCreateForm(false);
  };

  const startEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setNewProfile({
      name: profile.name,
      description: profile.description || '',
      environment: profile.environment,
      color: profile.color,
    });
    setSelectedRules(profile.rules || []);
    setShowCreateForm(true);
  };

  const toggleRuleSelection = (ruleId: string) => {
    setSelectedRules(prev =>
      prev.includes(ruleId)
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  return {
    showCreateForm,
    setShowCreateForm,
    editingProfile,
    newProfile,
    setNewProfile,
    selectedRules,
    setSelectedRules,
    resetForm,
    startEditProfile,
    toggleRuleSelection,
  };
}

function useProfileOperations(
  rules: HeaderRule[],
  onRulesUpdate: (rules: HeaderRule[]) => void,
  loadProfiles: () => Promise<void>
) {
  const [loading, setLoading] = useState(false);

  const updateRulesForProfile = async (
    profileId: string,
    selectedRules: string[],
    isEdit = false
  ) => {
    const updatedRules = rules.map(rule => {
      if (selectedRules.includes(rule.id)) {
        return { ...rule, profileId };
      } else if (isEdit && rule.profileId === profileId) {
        const ruleWithoutProfile = { ...rule };
        delete ruleWithoutProfile.profileId;
        return ruleWithoutProfile as HeaderRule;
      }
      return rule;
    });

    const rulesObject = updatedRules.reduce(
      (acc, rule) => {
        acc[rule.id] = rule;
        return acc;
      },
      {} as Record<string, HeaderRule>
    );

    await ChromeApiUtils.storage.sync.set({
      [STORAGE_KEYS.RULES]: rulesObject,
    });

    onRulesUpdate(updatedRules);
    ChromeApiUtils.runtime.sendMessage({ type: 'RULES_UPDATED' });
  };

  const handleCreateProfile = async (
    newProfile: NewProfileForm,
    selectedRules: string[],
    resetForm: () => void
  ) => {
    if (!newProfile.name.trim()) return;

    setLoading(true);
    try {
      const profileToCreate = {
        name: newProfile.name.trim(),
        description: newProfile.description.trim() || undefined,
        environment: newProfile.environment,
        color: newProfile.color,
        rules: selectedRules,
        enabled: true,
        isDefault: false,
      };

      logger.info('ProfileManager: Creating profile:', profileToCreate);
      const response = (await ChromeApiUtils.runtime.sendMessage({
        type: 'CREATE_PROFILE',
        profile: profileToCreate,
      })) as CreateProfileResponse;

      logger.info('ProfileManager: CREATE_PROFILE response:', response);

      if (response.success) {
        logger.info(
          'ProfileManager: Profile created successfully, updating rules...'
        );
        if (selectedRules.length > 0) {
          await updateRulesForProfile(response.profile.id, selectedRules);
        }
        resetForm();
        logger.info('ProfileManager: Reloading profiles after creation...');
        await loadProfiles();
      } else {
        logger.error(
          'ProfileManager: Profile creation failed:',
          response.error
        );
        alert(`Failed to create profile: ${response.error}`);
      }
    } catch (error) {
      logger.error('Failed to create profile:', error);
      alert('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (
    editingProfile: Profile,
    newProfile: NewProfileForm,
    selectedRules: string[],
    resetForm: () => void
  ) => {
    if (!newProfile.name.trim()) return;

    setLoading(true);
    try {
      const updates = {
        name: newProfile.name.trim(),
        description: newProfile.description.trim() || undefined,
        environment: newProfile.environment,
        color: newProfile.color,
        rules: selectedRules,
      };

      const message = {
        type: 'UPDATE_PROFILE',
        profileId: editingProfile.id,
        updates,
      };

      logger.info('ProfileManager: Sending UPDATE_PROFILE message:', message);
      logger.info('ProfileManager: Message details:', {
        type: message.type,
        profileId: message.profileId,
        updates: message.updates,
        profileIdType: typeof message.profileId,
        updatesType: typeof message.updates,
        updatesIsNull: message.updates === null,
        messageKeys: Object.keys(message),
      });

      const response = (await ChromeApiUtils.runtime.sendMessage(
        message
      )) as UpdateProfileResponse;

      if (response.success) {
        await updateRulesForProfile(editingProfile.id, selectedRules, true);
        resetForm();
        await loadProfiles();
      } else {
        alert(`Failed to update profile: ${response.error}`);
      }
    } catch (error) {
      logger.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this profile? This will unassign all rules from this profile.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = (await ChromeApiUtils.runtime.sendMessage({
        type: 'DELETE_PROFILE',
        profileId,
      })) as DeleteProfileResponse;

      if (response.success) {
        await loadProfiles();
      } else {
        alert(`Failed to delete profile: ${response.error}`);
      }
    } catch (error) {
      logger.error('Failed to delete profile:', error);
      alert('Failed to delete profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchProfile = async (
    profileId: string,
    setProfileData: (
      updater: (prev: ProfileData | null) => ProfileData | null
    ) => void
  ) => {
    try {
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
      } else {
        alert(`Failed to switch profile: ${response.error}`);
      }
    } catch (error) {
      logger.error('Failed to switch profile:', error);
      alert('Failed to switch profile');
    }
  };

  return {
    loading,
    handleCreateProfile,
    handleUpdateProfile,
    handleDeleteProfile,
    handleSwitchProfile,
  };
}

export const getEnvironmentConfig = (environment: string) => {
  return ENVIRONMENT_CONFIGS[environment as keyof typeof ENVIRONMENT_CONFIGS];
};

// Main Component
export function ProfileManager({ rules, onRulesUpdate }: ProfileManagerProps) {
  const { profileData, setProfileData, loadProfiles } = useProfileData();
  const {
    showCreateForm,
    setShowCreateForm,
    editingProfile,
    newProfile,
    setNewProfile,
    selectedRules,
    resetForm,
    startEditProfile,
    toggleRuleSelection,
  } = useProfileForm();
  const {
    loading,
    handleCreateProfile,
    handleUpdateProfile,
    handleDeleteProfile,
    handleSwitchProfile,
  } = useProfileOperations(rules, onRulesUpdate, loadProfiles);

  if (!profileData) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <TabDescription
        title="Profile Management"
        description="Create and manage environment profiles to organize your header rules by different contexts like development, staging, and production. Profiles help you quickly switch between different sets of rules for different environments."
        icon="users"
        features={[
          'Create custom environment profiles',
          'Assign rules to specific profiles',
          'Switch between profiles instantly',
          'Color-coded profile organization',
          'Default and custom environment types',
        ]}
        useCases={[
          'Separate dev/staging/production rules',
          'Client-specific rule configurations',
          'Testing different rule combinations',
          'Team collaboration with shared profiles',
          'Quick environment switching',
        ]}
      />

      {/* Create/Edit Profile Form */}
      {showCreateForm && (
        <ProfileForm
          editingProfile={editingProfile}
          newProfile={newProfile}
          setNewProfile={setNewProfile}
          selectedRules={selectedRules}
          rules={rules}
          loading={loading}
          onCreateProfile={() =>
            handleCreateProfile(newProfile, selectedRules, resetForm)
          }
          onUpdateProfile={() =>
            editingProfile &&
            handleUpdateProfile(
              editingProfile,
              newProfile,
              selectedRules,
              resetForm
            )
          }
          onCancel={resetForm}
          onToggleRuleSelection={toggleRuleSelection}
        />
      )}

      {/* Profiles List */}
      <ProfilesList
        profileData={profileData}
        rules={rules}
        onCreateNew={() => setShowCreateForm(true)}
        onEditProfile={startEditProfile}
        onDeleteProfile={handleDeleteProfile}
        onSwitchProfile={(profileId: string) =>
          handleSwitchProfile(profileId, setProfileData)
        }
      />

      {/* Unassigned Rules */}
      <UnassignedRules rules={rules} />
    </div>
  );
}
