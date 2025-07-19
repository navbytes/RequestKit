import { useState } from 'preact/hooks';

import { TabDescription } from '@/shared/components/TabDescription';
import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';

import { ExportSection } from './ExportSection';
import { ExportOptionsState } from './ExportSection/ExportOptions';
import { useImportExportData } from './hooks/useImportExportData';
import { useImportExportOperations } from './hooks/useImportExportOperations';
import { ImportSection } from './ImportSection';
import { ProgressModal } from './ProgressModal';

interface EnhancedImportExportProps {
  rules: HeaderRule[];
  settings: ExtensionSettings;
  onRulesUpdate: (rules: HeaderRule[]) => void;
  onSettingsUpdate: (settings: ExtensionSettings) => void;
}

export function EnhancedImportExport({
  rules,
  settings,
  onRulesUpdate,
  onSettingsUpdate,
}: EnhancedImportExportProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptionsState>({
    rules: true,
    templates: true,
    profiles: true,
    settings: false,
    stats: false,
    profileStats: false,
    activeProfile: true,
    appVersion: true,
  });

  const [importProgress, setImportProgress] = useState<{
    show: boolean;
    step: string;
    progress: number;
  }>({ show: false, step: '', progress: 0 });

  const { lastExport, setLastExport } = useImportExportData();

  const { handleExport, handleImport, handleQuickExport } =
    useImportExportOperations(
      rules,
      settings,
      exportOptions,
      onRulesUpdate,
      onSettingsUpdate,
      setImportProgress,
      setLastExport
    );

  return (
    <div className="p-6 space-y-8">
      <TabDescription
        title="Enhanced Import/Export"
        description="Comprehensive backup and restore functionality for all RequestKit data. Export and import rules, templates, profiles, settings, statistics, and configuration with granular control over what data to include."
        icon="download"
        features={[
          'Selective data export with customizable options',
          'Complete backup including rules, templates, and profiles',
          'Settings and statistics backup and restore',
          'Merge or replace options during import',
          'Progress tracking for large data operations',
        ]}
        useCases={[
          'Create complete backups before major changes',
          'Share rule configurations between devices',
          'Migrate data to new browser installations',
          'Export specific data types for collaboration',
        ]}
      />

      {/* Export Section */}
      <ExportSection
        exportOptions={exportOptions}
        setExportOptions={setExportOptions}
        onExport={handleExport}
        onQuickExport={handleQuickExport}
        rulesCount={rules.length}
        lastExport={lastExport}
      />

      {/* Import Section */}
      <ImportSection onImport={handleImport} />

      {/* Progress Modal */}
      {importProgress.show && (
        <ProgressModal
          step={importProgress.step}
          progress={importProgress.progress}
        />
      )}
    </div>
  );
}
