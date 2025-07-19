/**
 * Filter presets hook for RequestKit DevTools
 * Manages saved filter presets and quick access
 */

import { useState, useEffect, useCallback } from 'preact/hooks';

import { loggers } from '@/shared/utils/debug';

import { filterService } from '../services/FilterService';
import type { FilterPreset, FilterCriteria } from '../types/filtering';

interface UseFilterPresetsOptions {
  autoLoad?: boolean;
}

interface UseFilterPresetsReturn {
  // Presets state
  presets: FilterPreset[];
  defaultPresets: FilterPreset[];
  userPresets: FilterPreset[];

  // Preset actions
  loadPreset: (presetId: string) => FilterPreset | null;
  savePreset: (
    name: string,
    criteria: FilterCriteria,
    description?: string
  ) => FilterPreset;
  updatePreset: (
    presetId: string,
    updates: Partial<FilterPreset>
  ) => FilterPreset | null;
  deletePreset: (presetId: string) => boolean;
  duplicatePreset: (presetId: string, newName?: string) => FilterPreset | null;

  // Preset management
  refreshPresets: () => void;
  exportPresets: () => string;
  importPresets: (presetsJson: string) => boolean;

  // Preset utilities
  getPresetById: (presetId: string) => FilterPreset | null;
  getRecentPresets: (limit?: number) => FilterPreset[];
  searchPresets: (query: string) => FilterPreset[];
}

// Get logger for this module
const logger = loggers.shared;

export function useFilterPresets({
  autoLoad = true,
}: UseFilterPresetsOptions = {}): UseFilterPresetsReturn {
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Refresh presets from service
  const refreshPresets = useCallback(() => {
    const loadedPresets = filterService.getPresets();
    setPresets(loadedPresets);
  }, []);

  // Load presets on mount
  useEffect(() => {
    if (autoLoad) {
      refreshPresets();
    }
  }, [autoLoad, refreshPresets]);

  // Load specific preset
  const loadPreset = useCallback(
    (presetId: string): FilterPreset | null => {
      const preset = presets.find(p => p.id === presetId);
      if (preset) {
        // Update last used timestamp
        filterService.updatePreset(presetId, { lastUsed: new Date() });
        refreshPresets();
        return preset;
      }
      return null;
    },
    [presets, refreshPresets]
  );

  // Save new preset
  const savePreset = useCallback(
    (
      name: string,
      criteria: FilterCriteria,
      description?: string
    ): FilterPreset => {
      const newPreset = filterService.savePreset({
        name,
        description: description || undefined,
        criteria,
      });
      refreshPresets();
      return newPreset;
    },
    [refreshPresets]
  );

  // Update existing preset
  const updatePreset = useCallback(
    (presetId: string, updates: Partial<FilterPreset>): FilterPreset | null => {
      const updatedPreset = filterService.updatePreset(presetId, updates);
      if (updatedPreset) {
        refreshPresets();
      }
      return updatedPreset;
    },
    [refreshPresets]
  );

  // Delete preset
  const deletePreset = useCallback(
    (presetId: string): boolean => {
      const success = filterService.deletePreset(presetId);
      if (success) {
        refreshPresets();
      }
      return success;
    },
    [refreshPresets]
  );

  // Duplicate preset
  const duplicatePreset = useCallback(
    (presetId: string, newName?: string): FilterPreset | null => {
      const originalPreset = presets.find(p => p.id === presetId);
      if (!originalPreset) return null;

      const duplicatedName = newName || `${originalPreset.name} (Copy)`;
      const newPreset = savePreset(
        duplicatedName,
        originalPreset.criteria,
        originalPreset.description
      );

      return newPreset;
    },
    [presets, savePreset]
  );

  // Export presets as JSON
  const exportPresets = useCallback((): string => {
    const userPresetsOnly = presets.filter(p => !p.isDefault);
    return JSON.stringify(userPresetsOnly, null, 2);
  }, [presets]);

  // Import presets from JSON
  const importPresets = useCallback(
    (presetsJson: string): boolean => {
      try {
        const importedPresets = JSON.parse(presetsJson) as FilterPreset[];

        // Validate imported presets
        if (!Array.isArray(importedPresets)) {
          throw new Error('Invalid presets format');
        }

        // Import each preset
        importedPresets.forEach(preset => {
          if (preset.name && preset.criteria) {
            savePreset(preset.name, preset.criteria, preset.description);
          }
        });

        return true;
      } catch (error) {
        logger.error('Failed to import presets:', error);
        return false;
      }
    },
    [savePreset]
  );

  // Get preset by ID
  const getPresetById = useCallback(
    (presetId: string): FilterPreset | null => {
      return presets.find(p => p.id === presetId) || null;
    },
    [presets]
  );

  // Get recent presets (sorted by last used)
  const getRecentPresets = useCallback(
    (limit: number = 5): FilterPreset[] => {
      return presets
        .filter(p => p.lastUsed)
        .sort((a, b) => {
          const aTime = a.lastUsed?.getTime() || 0;
          const bTime = b.lastUsed?.getTime() || 0;
          return bTime - aTime;
        })
        .slice(0, limit);
    },
    [presets]
  );

  // Search presets by name or description
  const searchPresets = useCallback(
    (query: string): FilterPreset[] => {
      if (!query.trim()) return presets;

      const lowerQuery = query.toLowerCase();
      return presets.filter(
        preset =>
          preset.name.toLowerCase().includes(lowerQuery) ||
          (preset.description &&
            preset.description.toLowerCase().includes(lowerQuery))
      );
    },
    [presets]
  );

  // Computed values
  const defaultPresets = presets.filter(p => p.isDefault);
  const userPresets = presets.filter(p => !p.isDefault);

  return {
    // Presets state
    presets,
    defaultPresets,
    userPresets,

    // Preset actions
    loadPreset,
    savePreset,
    updatePreset,
    deletePreset,
    duplicatePreset,

    // Preset management
    refreshPresets,
    exportPresets,
    importPresets,

    // Preset utilities
    getPresetById,
    getRecentPresets,
    searchPresets,
  };
}
