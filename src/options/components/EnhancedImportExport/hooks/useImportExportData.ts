import { useState } from 'preact/hooks';

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

export function useImportExportData() {
  const [lastExport, setLastExport] = useState<ExportData | null>(null);

  return {
    lastExport,
    setLastExport,
  };
}
