import { StateUpdater } from 'preact/hooks';

import { ExportButtons } from './ExportSection/ExportButtons';
import {
  ExportOptions,
  ExportOptionsState,
} from './ExportSection/ExportOptions';
import { LastExportInfo } from './ExportSection/LastExportInfo';

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

interface ExportSectionProps {
  exportOptions: ExportOptionsState;
  setExportOptions: StateUpdater<ExportOptionsState>;
  onExport: () => void;
  onQuickExport: (type: 'rules' | 'templates' | 'profiles') => void;
  rulesCount: number;
  lastExport: ExportData | null;
}

export function ExportSection({
  exportOptions,
  setExportOptions,
  onExport,
  onQuickExport,
  rulesCount,
  lastExport,
}: ExportSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Export Data
        </h3>

        {/* Export Options */}
        <ExportOptions
          exportOptions={exportOptions}
          setExportOptions={setExportOptions}
          rulesCount={rulesCount}
        />

        {/* Export Buttons */}
        <ExportButtons
          exportOptions={exportOptions}
          onExport={onExport}
          onQuickExport={onQuickExport}
        />
      </div>

      {/* Last Export Info */}
      {lastExport && <LastExportInfo lastExport={lastExport} />}
    </div>
  );
}
