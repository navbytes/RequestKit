import { useI18n } from '@/shared/hooks/useI18n';
import type { Profile } from '@/shared/types/profiles';

interface ProfileSelectorProps {
  readonly activeProfile: string;
  readonly profiles: Profile[];
  readonly onSwitchProfile: (profileId: string) => void;
}

export function ProfileSelector({
  activeProfile,
  profiles,
  onSwitchProfile,
}: ProfileSelectorProps) {
  const { t } = useI18n();
  const activeProfileData = profiles.find(p => p.id === activeProfile);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {t('common_profile')}
      </span>
      <select
        value={activeProfile}
        onChange={e => onSwitchProfile((e.target as HTMLSelectElement).value)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 pr-8 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {profiles.map(profile => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>
      <div
        className="w-3 h-3 rounded-full"
        style={{
          backgroundColor: activeProfileData?.color || '#gray',
        }}
      />
    </div>
  );
}
