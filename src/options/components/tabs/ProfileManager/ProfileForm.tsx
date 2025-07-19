import type { Profile } from '@/shared/types/profiles';
import { ENVIRONMENT_CONFIGS } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';

interface NewProfileForm {
  name: string;
  description: string;
  environment: 'development' | 'staging' | 'production' | 'custom';
  color: string;
}

interface ProfileFormProps {
  editingProfile: Profile | null;
  newProfile: NewProfileForm;
  setNewProfile: (
    profile: NewProfileForm | ((prev: NewProfileForm) => NewProfileForm)
  ) => void;
  selectedRules: string[];
  rules: HeaderRule[];
  loading: boolean;
  onCreateProfile: () => void;
  onUpdateProfile: () => void;
  onCancel: () => void;
  onToggleRuleSelection: (ruleId: string) => void;
}

export function ProfileForm({
  editingProfile,
  newProfile,
  setNewProfile,
  selectedRules,
  rules,
  loading,
  onCreateProfile,
  onUpdateProfile,
  onCancel,
  onToggleRuleSelection,
}: ProfileFormProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {editingProfile ? 'Edit Profile' : 'Create New Profile'}
      </h3>

      <BasicProfileInfo newProfile={newProfile} setNewProfile={setNewProfile} />

      <RuleAssignment
        rules={rules}
        selectedRules={selectedRules}
        editingProfile={editingProfile}
        onToggleRuleSelection={onToggleRuleSelection}
      />

      <FormActions
        editingProfile={editingProfile}
        newProfile={newProfile}
        loading={loading}
        onCreateProfile={onCreateProfile}
        onUpdateProfile={onUpdateProfile}
        onCancel={onCancel}
      />
    </div>
  );
}

interface BasicProfileInfoProps {
  newProfile: NewProfileForm;
  setNewProfile: (
    profile: NewProfileForm | ((prev: NewProfileForm) => NewProfileForm)
  ) => void;
}

function BasicProfileInfo({
  newProfile,
  setNewProfile,
}: BasicProfileInfoProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="profile-name" className="form-label">
            Profile Name *
          </label>
          <input
            id="profile-name"
            type="text"
            className="input"
            value={newProfile.name}
            onInput={e =>
              setNewProfile(prev => ({
                ...prev,
                name: (e.target as HTMLInputElement).value,
              }))
            }
            placeholder="e.g., Staging Environment"
          />
        </div>

        <div>
          <label htmlFor="profile-environment" className="form-label">
            Environment Type
          </label>
          <select
            id="profile-environment"
            className="input"
            value={newProfile.environment}
            onChange={e => {
              const env = (e.target as HTMLSelectElement).value as
                | 'development'
                | 'staging'
                | 'production'
                | 'custom';
              setNewProfile(prev => ({
                ...prev,
                environment: env,
                color: ENVIRONMENT_CONFIGS[env]?.color || '#8b5cf6',
              }));
            }}
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="profile-description" className="form-label">
            Description
          </label>
          <textarea
            id="profile-description"
            className="input"
            rows={3}
            value={newProfile.description}
            onInput={e =>
              setNewProfile(prev => ({
                ...prev,
                description: (e.target as HTMLTextAreaElement).value,
              }))
            }
            placeholder="Optional description for this profile"
          />
        </div>

        <div>
          <label htmlFor="profile-color" className="form-label">
            Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="profile-color"
              type="color"
              className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded"
              value={newProfile.color}
              onInput={e =>
                setNewProfile(prev => ({
                  ...prev,
                  color: (e.target as HTMLInputElement).value,
                }))
              }
            />
            <input
              type="text"
              className="input flex-1"
              value={newProfile.color}
              onInput={e =>
                setNewProfile(prev => ({
                  ...prev,
                  color: (e.target as HTMLInputElement).value,
                }))
              }
              placeholder="#8b5cf6"
            />
          </div>
        </div>
      </div>
    </>
  );
}

interface RuleAssignmentProps {
  rules: HeaderRule[];
  selectedRules: string[];
  editingProfile: Profile | null;
  onToggleRuleSelection: (ruleId: string) => void;
}

function RuleAssignment({
  rules,
  selectedRules,
  editingProfile,
  onToggleRuleSelection,
}: RuleAssignmentProps) {
  return (
    <div className="mb-4">
      <label htmlFor="profile-rules" className="form-label">
        Assign Rules to Profile
      </label>
      <div
        id="profile-rules"
        className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3"
      >
        {rules.length === 0 ? (
          <EmptyRulesState />
        ) : (
          <RulesList
            rules={rules}
            selectedRules={selectedRules}
            editingProfile={editingProfile}
            onToggleRuleSelection={onToggleRuleSelection}
          />
        )}
      </div>
    </div>
  );
}

function EmptyRulesState() {
  return (
    <p className="text-gray-500 dark:text-gray-400 text-sm">
      No rules available. Create some rules first.
    </p>
  );
}

interface RulesListProps {
  rules: HeaderRule[];
  selectedRules: string[];
  editingProfile: Profile | null;
  onToggleRuleSelection: (ruleId: string) => void;
}

function RulesList({
  rules,
  selectedRules,
  editingProfile,
  onToggleRuleSelection,
}: RulesListProps) {
  return (
    <div className="space-y-2">
      {rules.map(rule => (
        <label key={rule.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedRules.includes(rule.id)}
            onChange={() => onToggleRuleSelection(rule.id)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {rule.name}
          </span>
          {rule.profileId && rule.profileId !== editingProfile?.id && (
            <span className="text-xs text-orange-600 dark:text-orange-400">
              (assigned to another profile)
            </span>
          )}
        </label>
      ))}
    </div>
  );
}

interface FormActionsProps {
  editingProfile: Profile | null;
  newProfile: NewProfileForm;
  loading: boolean;
  onCreateProfile: () => void;
  onUpdateProfile: () => void;
  onCancel: () => void;
}

function FormActions({
  editingProfile,
  newProfile,
  loading,
  onCreateProfile,
  onUpdateProfile,
  onCancel,
}: FormActionsProps) {
  return (
    <div className="flex space-x-3">
      <button
        onClick={editingProfile ? onUpdateProfile : onCreateProfile}
        disabled={loading || !newProfile.name.trim()}
        className="btn btn-primary"
      >
        {loading
          ? 'Saving...'
          : editingProfile
            ? 'Update Profile'
            : 'Create Profile'}
      </button>
      <button onClick={onCancel} className="btn btn-secondary">
        Cancel
      </button>
    </div>
  );
}
