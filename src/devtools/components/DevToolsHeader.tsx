import { Icon } from '@/shared/components/Icon';
import { useI18n } from '@/shared/hooks/useI18n';
import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';

interface DevToolsHeaderProps {
  readonly extensionStatus: {
    enabled: boolean;
    activeProfile: string;
    profiles: Profile[];
    rules: HeaderRule[];
  } | null;
  readonly isRecording: boolean;
  readonly requestsCount: number;
  readonly onToggleRecording: () => void;
  readonly onClearRequests: () => void;
  readonly exportMenuOpen: boolean;
  readonly onToggleExportMenu: () => void;
  readonly onExportJSON: () => void;
  readonly onExportHAR: () => void;
  readonly onSwitchProfile: (profileId: string) => void;
}

export function DevToolsHeader({
  extensionStatus,
  isRecording,
  requestsCount,
  onToggleRecording,
  onClearRequests,
  exportMenuOpen,
  onToggleExportMenu,
  onExportJSON,
  onExportHAR,
  onSwitchProfile,
}: DevToolsHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('devtools_header_title')}
          </h1>
          {extensionStatus && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('common_profile')}
              </span>
              <select
                value={extensionStatus.activeProfile}
                onChange={e =>
                  onSwitchProfile((e.target as HTMLSelectElement).value)
                }
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 pr-8 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {extensionStatus.profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    extensionStatus.profiles.find(
                      p => p.id === extensionStatus.activeProfile
                    )?.color || '#gray',
                }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleRecording}
            className={`btn btn-sm ${
              isRecording ? 'btn-error' : 'btn-success'
            }`}
          >
            {isRecording ? (
              <>
                <Icon name="stop" className="w-4 h-4 mr-2" />
                {t('devtools_stop_recording')}
              </>
            ) : (
              <>
                <Icon name="play" className="w-4 h-4 mr-2" />
                {t('devtools_start_recording')}
              </>
            )}
          </button>
          <button
            onClick={onClearRequests}
            className="btn btn-sm btn-secondary"
          >
            <Icon name="trash" className="w-4 h-4 mr-2" />
            {t('devtools_clear_requests')}
          </button>
          <div className="relative">
            <button
              onClick={onToggleExportMenu}
              className="btn btn-sm btn-primary"
              disabled={requestsCount === 0}
            >
              <Icon name="download" className="w-4 h-4 mr-2" />
              {t('devtools_export_requests')}
              <Icon name="chevron-down" className="w-3 h-3 ml-1" />
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <button
                  onClick={onExportJSON}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  Export JSON
                </button>
                <button
                  onClick={onExportHAR}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  Export HAR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
