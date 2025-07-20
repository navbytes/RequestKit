/**
 * Filter Presets for RequestKit DevTools
 * Saved filter management and quick access
 */

import { useState } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';

import { useFilterPresets } from '../../hooks/useFilterPresets';
import type { FilterCriteria } from '../../types/filtering';

interface FilterPresetsProps {
  currentCriteria: FilterCriteria;
  onLoadPreset: (criteria: FilterCriteria) => void;
  onClearFilters: () => void;
  className?: string;
}

export function FilterPresets({
  currentCriteria,
  onLoadPreset,
  onClearFilters,
  className = '',
}: Readonly<FilterPresetsProps>) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    presets,
    defaultPresets,
    userPresets,
    loadPreset,
    savePreset,
    deletePreset,
    duplicatePreset,
    searchPresets,
    getRecentPresets,
  } = useFilterPresets();

  const hasActiveFilters = Object.keys(currentCriteria).some(key => {
    const value = currentCriteria[key as keyof FilterCriteria];
    return Array.isArray(value)
      ? value.length > 0
      : typeof value === 'string'
        ? value.trim() !== ''
        : typeof value === 'boolean'
          ? value
          : !!(value && typeof value === 'object');
  });

  const handleLoadPreset = (presetId: string) => {
    const preset = loadPreset(presetId);
    if (preset) {
      onLoadPreset(preset.criteria);
    }
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(
        presetName.trim(),
        currentCriteria,
        presetDescription.trim() || undefined
      );
      setShowSaveDialog(false);
      setPresetName('');
      setPresetDescription('');
    }
  };

  const handleDeletePreset = (presetId: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      deletePreset(presetId);
    }
  };

  const handleDuplicatePreset = (presetId: string) => {
    const original = presets.find(p => p.id === presetId);
    if (original) {
      duplicatePreset(presetId, `${original.name} (Copy)`);
    }
  };

  const filteredPresets = searchQuery ? searchPresets(searchQuery) : presets;
  const recentPresets = getRecentPresets(3);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Save Current Filters */}
      {hasActiveFilters && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Save Current Filters
            </span>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Icon name="save" className="w-3 h-3 mr-1 inline" />
              Save
            </button>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Save your current filter configuration as a preset for quick access
            later.
          </p>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Save Filter Preset
            </h3>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Icon name="close" className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="preset-name"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Preset Name *
              </label>
              <input
                id="preset-name"
                type="text"
                value={presetName}
                onChange={e => {
                  e.stopPropagation();
                  setPresetName((e.target as HTMLInputElement).value);
                }}
                onClick={e => e.stopPropagation()}
                placeholder="Enter preset name..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="preset-description"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description (optional)
              </label>
              <textarea
                id="preset-description"
                value={presetDescription}
                onChange={e => {
                  e.stopPropagation();
                  setPresetDescription((e.target as HTMLTextAreaElement).value);
                }}
                onClick={e => e.stopPropagation()}
                placeholder="Describe what this preset filters for..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save Preset
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => {
            e.stopPropagation();
            setSearchQuery((e.target as HTMLInputElement).value);
          }}
          onClick={e => e.stopPropagation()}
          placeholder="Search presets..."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Recent Presets */}
      {!searchQuery && recentPresets.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recently Used
          </h4>
          <div className="space-y-1">
            {recentPresets.map(preset => (
              <button
                key={`recent-${preset.id}`}
                onClick={() => handleLoadPreset(preset.id)}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {preset.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {preset.lastUsed?.toLocaleDateString()}
                  </span>
                </div>
                {preset.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {preset.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Default Presets */}
      {defaultPresets.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Presets
          </h4>
          <div className="space-y-1">
            {defaultPresets
              .filter(
                preset =>
                  !searchQuery ||
                  preset.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(preset => (
                <div key={preset.id} className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLoadPreset(preset.id)}
                    className="flex-1 text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {preset.name}
                    </div>
                    {preset.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {preset.description}
                      </p>
                    )}
                  </button>
                  <button
                    onClick={() => handleDuplicatePreset(preset.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Duplicate preset"
                  >
                    <Icon name="copy" className="w-3 h-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* User Presets */}
      {userPresets.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            My Presets
          </h4>
          <div className="space-y-1">
            {userPresets
              .filter(
                preset =>
                  !searchQuery ||
                  preset.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(preset => (
                <div key={preset.id} className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLoadPreset(preset.id)}
                    className="flex-1 text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {preset.name}
                    </div>
                    {preset.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {preset.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Created: {preset.createdAt.toLocaleDateString()}
                    </div>
                  </button>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleDuplicatePreset(preset.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Duplicate preset"
                    >
                      <Icon name="copy" className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete preset"
                    >
                      <Icon name="trash" className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && filteredPresets.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <Icon name="search" className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            No presets found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClearFilters}
            className="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Icon name="trash" className="w-4 h-4 mr-2 inline" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
