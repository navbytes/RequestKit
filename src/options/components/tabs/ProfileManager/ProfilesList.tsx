import { Icon } from '@/shared/components/Icon';
import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';

import { getRulesForProfile } from './utils';

interface ProfileData {
  profiles: Profile[];
  activeProfile: string;
}

interface ProfilesListProps {
  profileData: ProfileData;
  rules: HeaderRule[];
  onCreateNew: () => void;
  onEditProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: string) => void;
  onSwitchProfile: (profileId: string) => void;
}

export function ProfilesList({
  profileData,
  rules,
  onCreateNew,
  onEditProfile,
  onDeleteProfile,
  onSwitchProfile,
}: ProfilesListProps) {
  return (
    <div className="space-y-4">
      <ProfilesHeader
        profileCount={profileData.profiles.length}
        onCreateNew={onCreateNew}
      />

      {profileData.profiles.length === 0 ? (
        <EmptyProfilesState onCreateNew={onCreateNew} />
      ) : (
        <ProfileCards
          profiles={profileData.profiles}
          activeProfileId={profileData.activeProfile}
          rules={rules}
          onEditProfile={onEditProfile}
          onDeleteProfile={onDeleteProfile}
          onSwitchProfile={onSwitchProfile}
        />
      )}
    </div>
  );
}

interface ProfilesHeaderProps {
  profileCount: number;
  onCreateNew: () => void;
}

function ProfilesHeader({ profileCount, onCreateNew }: ProfilesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Existing Profiles ({profileCount})
      </h3>
      <button onClick={onCreateNew} className="btn btn-primary btn-sm">
        + Create Profile
      </button>
    </div>
  );
}

interface EmptyProfilesStateProps {
  onCreateNew: () => void;
}

function EmptyProfilesState({ onCreateNew }: EmptyProfilesStateProps) {
  return (
    <div className="flex flex-col items-center py-12">
      <Icon name="users" size={60} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No profiles configured
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Create your first profile to organize your header rules
      </p>
      <button onClick={onCreateNew} className="btn btn-primary">
        Create Your First Profile
      </button>
    </div>
  );
}

interface ProfileCardsProps {
  profiles: Profile[];
  activeProfileId: string;
  rules: HeaderRule[];
  onEditProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: string) => void;
  onSwitchProfile: (profileId: string) => void;
}

function ProfileCards({
  profiles,
  activeProfileId,
  rules,
  onEditProfile,
  onDeleteProfile,
  onSwitchProfile,
}: ProfileCardsProps) {
  return (
    <>
      {profiles.map(profile => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          isActive={profile.id === activeProfileId}
          profileRules={getRulesForProfile(rules, profile.id)}
          onEditProfile={onEditProfile}
          onDeleteProfile={onDeleteProfile}
          onSwitchProfile={onSwitchProfile}
        />
      ))}
    </>
  );
}

interface ProfileCardProps {
  profile: Profile;
  isActive: boolean;
  profileRules: HeaderRule[];
  onEditProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: string) => void;
  onSwitchProfile: (profileId: string) => void;
}

function ProfileCard({
  profile,
  isActive,
  profileRules,
  onEditProfile,
  onDeleteProfile,
  onSwitchProfile,
}: ProfileCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 ${
        isActive
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-600'
      }`}
    >
      <ProfileCardHeader
        profile={profile}
        isActive={isActive}
        profileRules={profileRules}
        onEditProfile={onEditProfile}
        onDeleteProfile={onDeleteProfile}
        onSwitchProfile={onSwitchProfile}
      />

      {profile.description && (
        <ProfileDescription description={profile.description} />
      )}

      {profileRules.length > 0 && <AssignedRules rules={profileRules} />}
    </div>
  );
}

interface ProfileCardHeaderProps {
  profile: Profile;
  isActive: boolean;
  profileRules: HeaderRule[];
  onEditProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: string) => void;
  onSwitchProfile: (profileId: string) => void;
}

function ProfileCardHeader({
  profile,
  isActive,
  profileRules,
  onEditProfile,
  onDeleteProfile,
  onSwitchProfile,
}: ProfileCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div
          className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: profile.color }}
        />
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <span>{profile.name}</span>
            {isActive && (
              <span className="badge badge-sm badge-primary">Active</span>
            )}
            {profile.isDefault && (
              <span className="badge badge-sm badge-secondary">Default</span>
            )}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {profile.environment} • {profileRules.length} rules
          </p>
        </div>
      </div>

      <ProfileActions
        profile={profile}
        isActive={isActive}
        onEditProfile={onEditProfile}
        onDeleteProfile={onDeleteProfile}
        onSwitchProfile={onSwitchProfile}
      />
    </div>
  );
}

interface ProfileActionsProps {
  profile: Profile;
  isActive: boolean;
  onEditProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: string) => void;
  onSwitchProfile: (profileId: string) => void;
}

function ProfileActions({
  profile,
  isActive,
  onEditProfile,
  onDeleteProfile,
  onSwitchProfile,
}: ProfileActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      {!isActive && (
        <button
          onClick={() => onSwitchProfile(profile.id)}
          className="btn btn-sm btn-primary"
        >
          Switch To
        </button>
      )}
      <button
        onClick={() => onEditProfile(profile)}
        className="btn btn-sm btn-secondary"
      >
        Edit
      </button>
      {!profile.isDefault && (
        <button
          onClick={() => onDeleteProfile(profile.id)}
          className="btn btn-sm bg-error-600 text-white hover:bg-error-700"
        >
          Delete
        </button>
      )}
    </div>
  );
}

interface ProfileDescriptionProps {
  description: string;
}

function ProfileDescription({ description }: ProfileDescriptionProps) {
  return (
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
      {description}
    </p>
  );
}

interface AssignedRulesProps {
  rules: HeaderRule[];
}

function AssignedRules({ rules }: AssignedRulesProps) {
  return (
    <div className="text-sm">
      <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
        Assigned Rules:
      </p>
      <div className="space-y-1">
        {rules.map(rule => (
          <RuleItem key={rule.id} rule={rule} />
        ))}
      </div>
    </div>
  );
}

interface RuleItemProps {
  rule: HeaderRule;
}

function RuleItem({ rule }: RuleItemProps) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
      <span className="text-gray-900 dark:text-white">{rule.name}</span>
      <span
        className={`badge badge-sm ${
          rule.enabled ? 'badge-success' : 'badge-secondary'
        }`}
      >
        {rule.enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}
