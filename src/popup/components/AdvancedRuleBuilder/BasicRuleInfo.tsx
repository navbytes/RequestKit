import { useI18n } from '@/shared/hooks/useI18n';
import type { Profile } from '@/shared/types/profiles';

interface FormData {
  ruleName: string;
  profileId: string;
  priority: number;
}

interface BasicRuleInfoProps {
  formData: FormData;
  profiles: Profile[];
  onUpdate: (updates: Partial<FormData>) => void;
}

export function BasicRuleInfo({
  formData,
  profiles,
  onUpdate,
}: Readonly<BasicRuleInfoProps>) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label
          htmlFor={`rule-info-${formData.ruleName}`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('forms_rule_name')} *
        </label>
        <input
          type="text"
          value={formData.ruleName}
          id={`rule-info-${formData.ruleName}`}
          onChange={e =>
            onUpdate({ ruleName: (e.target as HTMLInputElement).value })
          }
          placeholder={t('forms_rule_name_placeholder')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label
          htmlFor="profile-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('ui_label_profile')}
        </label>
        <select
          id="profile-select"
          value={formData.profileId}
          onChange={e =>
            onUpdate({ profileId: (e.target as HTMLSelectElement).value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">{t('forms_no_profile_global')}</option>
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>
              {profile.name} ({profile.environment})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="priority-input"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('ui_label_priority')}
        </label>
        <input
          type="number"
          id="priority-input"
          value={formData.priority}
          onChange={e =>
            onUpdate({
              priority: parseInt((e.target as HTMLInputElement).value) || 1,
            })
          }
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
