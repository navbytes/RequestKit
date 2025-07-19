import { Icon } from '@/shared/components/Icon';
import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';

interface DevToolsHeaderProps {
  extensionStatus: {
    enabled: boolean;
    activeProfile: string;
    profiles: Profile[];
    rules: HeaderRule[];
  } | null;
  isRecording: boolean;
  requestsCount: number;
  onToggleRecording: () => void;
  onClearRequests: () => void;
  onExportRequests: () => void;
  onSwitchProfile: (profileId: string) => void;
}

export function DevToolsHeader({
  extensionStatus,
  isRecording,
  requestsCount,
  onToggleRecording,
  onClearRequests,
  onExportRequests,
  onSwitchProfile,
}: DevToolsHeaderProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            RequestKit DevTools
          </h1>
          {extensionStatus && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Profile:
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
                Stop
              </>
            ) : (
              <>
                <Icon name="play" className="w-4 h-4 mr-2" />
                Record
              </>
            )}
          </button>
          <button
            onClick={onClearRequests}
            className="btn btn-sm btn-secondary"
          >
            <Icon name="trash" className="w-4 h-4 mr-2" />
            Clear
          </button>
          <button
            onClick={onExportRequests}
            className="btn btn-sm btn-primary"
            disabled={requestsCount === 0}
          >
            <Icon name="download" className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
