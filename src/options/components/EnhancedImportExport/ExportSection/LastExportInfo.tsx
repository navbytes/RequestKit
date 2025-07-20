import { Icon } from '@/shared/components/Icon';

interface ExportData {
  version: string;
  timestamp: string;
  rules?: unknown[];
  templates?: unknown[];
  profiles?: unknown[];
  settings?: unknown;
  stats?: unknown;
  profileStats?: unknown;
  activeProfile?: string;
  appVersion?: string;
  lastBackup?: string;
}

interface LastExportInfoProps {
  readonly lastExport: ExportData;
}

export function LastExportInfo({ lastExport }: LastExportInfoProps) {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <Icon
          name="check-circle"
          className="w-5 h-5 text-green-600 dark:text-green-400"
        />
        <span className="text-sm font-medium text-green-800 dark:text-green-200">
          Last export: {new Date(lastExport.timestamp).toLocaleString()}
        </span>
      </div>
      <div className="mt-2 text-xs text-green-700 dark:text-green-300">
        Exported:{' '}
        {[
          lastExport.rules && 'rules',
          lastExport.templates && 'templates',
          lastExport.profiles && 'profiles',
          lastExport.settings && 'settings',
          lastExport.stats && 'stats',
          lastExport.profileStats && 'profileStats',
          lastExport.activeProfile && 'activeProfile',
          lastExport.appVersion && 'appVersion',
        ]
          .filter(Boolean)
          .join(', ')}
      </div>
    </div>
  );
}
