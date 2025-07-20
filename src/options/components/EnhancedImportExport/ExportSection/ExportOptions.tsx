export interface ExportOptionsState {
  rules: boolean;
  templates: boolean;
  profiles: boolean;
  settings: boolean;
  stats: boolean;
  profileStats: boolean;
  activeProfile: boolean;
  appVersion: boolean;
}

interface ExportOptionsProps {
  exportOptions: ExportOptionsState;
  setExportOptions: (
    updater: (prev: ExportOptionsState) => ExportOptionsState
  ) => void;
  rulesCount: number;
}

export function ExportOptions({
  exportOptions,
  setExportOptions,
  rulesCount,
}: Readonly<ExportOptionsProps>) {
  const handleOptionChange = (
    key: keyof ExportOptionsState,
    checked: boolean
  ) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: checked,
    }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={exportOptions.rules}
          onChange={e =>
            handleOptionChange('rules', (e.target as HTMLInputElement).checked)
          }
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Rules ({rulesCount})
        </span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={exportOptions.templates}
          onChange={e =>
            handleOptionChange(
              'templates',
              (e.target as HTMLInputElement).checked
            )
          }
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Templates
        </span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={exportOptions.profiles}
          onChange={e =>
            handleOptionChange(
              'profiles',
              (e.target as HTMLInputElement).checked
            )
          }
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Profiles
        </span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={exportOptions.settings}
          onChange={e =>
            handleOptionChange(
              'settings',
              (e.target as HTMLInputElement).checked
            )
          }
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Settings
        </span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={exportOptions.activeProfile}
          onChange={e =>
            handleOptionChange(
              'activeProfile',
              (e.target as HTMLInputElement).checked
            )
          }
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Active Profile
        </span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={exportOptions.appVersion}
          onChange={e =>
            handleOptionChange(
              'appVersion',
              (e.target as HTMLInputElement).checked
            )
          }
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          App Version
        </span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={exportOptions.stats}
          onChange={e =>
            handleOptionChange('stats', (e.target as HTMLInputElement).checked)
          }
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Usage Stats
        </span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={exportOptions.profileStats}
          onChange={e =>
            handleOptionChange(
              'profileStats',
              (e.target as HTMLInputElement).checked
            )
          }
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Profile Stats
        </span>
      </label>
    </div>
  );
}
