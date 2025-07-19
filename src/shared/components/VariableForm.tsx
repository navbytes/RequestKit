import { useState, useEffect } from 'preact/hooks';

import { VariableResolver } from '@/lib/core';
import { FormField } from '@/shared/components/forms/FormField';
import { Icon } from '@/shared/components/Icon';
import { Button } from '@/shared/components/ui/Button';
import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import { VariableScope as VarScope } from '@/shared/types/variables';
import type { Variable, VariableScope } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

interface VariableFormProps {
  variable?: Variable | null;
  onSave: (variable: Variable) => void;
  onCancel: () => void;
}

// Get logger for this module
const logger = loggers.shared;

export function VariableForm({
  variable,
  onSave,
  onCancel,
}: Readonly<VariableFormProps>) {
  const [formData, setFormData] = useState<Partial<Variable>>({
    name: '',
    value: '',
    scope: VarScope.GLOBAL,
    description: '',
    isSecret: false,
    enabled: true,
    tags: [],
    profileId: '',
    ruleId: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [previewValue, setPreviewValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rules, setRules] = useState<HeaderRule[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize form with existing variable data
  useEffect(() => {
    if (variable) {
      setFormData({
        ...variable,
        tags: variable.tags || [],
      });
    } else {
      setFormData({
        name: '',
        value: '',
        scope: VarScope.GLOBAL,
        description: '',
        isSecret: false,
        enabled: true,
        tags: [],
        profileId: '',
        ruleId: '',
      });
    }
    setErrors({});
    setWarnings({});
  }, [variable]);

  // Load profiles and rules for dropdowns
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profilesResponse, rulesResponse] = await Promise.all([
          ChromeApiUtils.getProfiles(),
          ChromeApiUtils.getRules(),
        ]);

        if (profilesResponse?.profiles) {
          setProfiles(profilesResponse.profiles);
        }
        if (rulesResponse?.rules) {
          setRules(Object.values(rulesResponse.rules));
        }
      } catch (error) {
        logger.error('Failed to load profiles and rules:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update preview when value changes
  useEffect(() => {
    const updatePreview = () => {
      if (!formData.value) {
        setPreviewValue('');
        return;
      }

      try {
        const preview = VariableResolver.previewResolution(formData.value, {
          sample_var: 'example_value',
          api_key: 'sk-1234567890abcdef',
        });
        setPreviewValue(preview);
      } catch (error) {
        setPreviewValue(`Preview error: ${error}`);
      }
    };
    if (formData.value && showPreview) {
      updatePreview();
    }
  }, [formData.value, showPreview]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newWarnings: Record<string, string> = {};

    // Validate name
    if (!formData.name?.trim()) {
      newErrors.name = 'Variable name is required';
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.name)) {
      newErrors.name =
        'Variable name must start with a letter or underscore and contain only letters, numbers, and underscores';
    }

    // Validate value
    if (!formData.value?.trim()) {
      newErrors.value = 'Variable value is required';
    } else {
      // Validate template syntax
      const templateValidation = VariableResolver.validateTemplate(
        formData.value
      );
      if (!templateValidation.isValid) {
        newErrors.value = `Template syntax error: ${templateValidation.errors.join(', ')}`;
      } else {
        // Check for undefined variables in template
        const referencedVars = VariableResolver.getReferencedVariables(
          formData.value
        );
        if (referencedVars.length > 0) {
          newWarnings.value = `References variables: ${referencedVars.join(', ')}. Ensure these variables exist.`;
        }
      }
    }

    // Validate scope-specific requirements
    if (
      formData.scope === VarScope.PROFILE &&
      (!formData.profileId || formData.profileId.trim() === '')
    ) {
      newErrors.profileId =
        'Profile selection is required for profile-scoped variables';
    }

    if (
      formData.scope === VarScope.RULE &&
      (!formData.ruleId || formData.ruleId.trim() === '')
    ) {
      newErrors.ruleId = 'Rule selection is required for rule-scoped variables';
    }

    // Validate description length
    if (formData.description && formData.description.length > 500) {
      newWarnings.description =
        'Description is quite long. Consider keeping it concise.';
    }

    setErrors(newErrors);
    setWarnings(newWarnings);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updatedAt = new Date().toISOString();
    const variableData: Variable = {
      id: variable?.id || `var_${Date.now()}`,
      name: formData.name?.trim() || '',
      value: formData.value?.trim() || '',
      scope: formData.scope || VarScope.GLOBAL,
      isSecret: formData.isSecret || false,
      enabled: formData.enabled !== false,
      tags: formData.tags || [],
      metadata: {
        createdAt: variable?.metadata?.createdAt || updatedAt,
        updatedAt,
        usageCount: variable?.metadata?.usageCount || 0,
      },
    };

    // Add scope-specific associations
    if (
      formData.scope === VarScope.PROFILE &&
      formData.profileId &&
      formData.profileId.trim() !== ''
    ) {
      variableData.profileId = formData.profileId;
    }

    if (
      formData.scope === VarScope.RULE &&
      formData.ruleId &&
      formData.ruleId.trim() !== ''
    ) {
      variableData.ruleId = formData.ruleId;
    }

    // Add optional properties only if they have values
    if (formData.description?.trim()) {
      variableData.description = formData.description.trim();
    }

    onSave(variableData);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (
      e.key === 'Enter' &&
      e.target === document.querySelector('#tag-input')
    ) {
      e.preventDefault();
      addTag();
    }
  };

  const handleScopeChange = (newScope: VariableScope) => {
    setFormData(prev => ({
      ...prev,
      scope: newScope,
      // Clear scope-specific fields when scope changes
      profileId: newScope === VarScope.PROFILE ? prev.profileId || '' : '',
      ruleId: newScope === VarScope.RULE ? prev.ruleId || '' : '',
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {variable ? 'Edit Variable' : 'Create New Variable'}
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            variant="ghost"
            size="sm"
            icon={showPreview ? 'eye-off' : 'eye'}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <FormField
            label="Variable Name"
            required
            {...(errors.name && { error: errors.name })}
            help="Use letters, numbers, and underscores only. Must start with letter or underscore."
          >
            <input
              type="text"
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              value={formData.name || ''}
              onInput={e =>
                setFormData(prev => ({ ...prev, name: e.currentTarget.value }))
              }
              placeholder="e.g., api_key, user_token, base_url"
              required
            />
          </FormField>

          <FormField
            label="Variable Scope"
            help="Determines where the variable can be used and its priority"
          >
            <select
              className="input"
              value={formData.scope}
              onInput={e =>
                handleScopeChange(e.currentTarget.value as VariableScope)
              }
            >
              <option value={VarScope.GLOBAL}>
                Global - Available everywhere
              </option>
              <option value={VarScope.PROFILE}>
                Profile - Profile-specific
              </option>
              <option value={VarScope.RULE}>
                Rule - Rule-specific override
              </option>
            </select>
          </FormField>

          {/* Profile Selector - shown when scope is PROFILE */}
          {formData.scope === VarScope.PROFILE && (
            <FormField
              label="Target Profile"
              required
              {...(errors.profileId && { error: errors.profileId })}
              help="Select which profile this variable belongs to"
            >
              <select
                className={`input ${errors.profileId ? 'border-red-500' : ''}`}
                value={formData.profileId || ''}
                onInput={e =>
                  setFormData(prev => ({
                    ...prev,
                    profileId: e.currentTarget.value,
                  }))
                }
                required
                disabled={loading}
              >
                <option value="">
                  {loading ? 'Loading profiles...' : 'Select a profile...'}
                </option>
                {profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {/* Rule Selector - shown when scope is RULE */}
          {formData.scope === VarScope.RULE && (
            <FormField
              label="Target Rule"
              required
              {...(errors.ruleId && { error: errors.ruleId })}
              help="Select which rule this variable belongs to"
            >
              <select
                className={`input ${errors.ruleId ? 'border-red-500' : ''}`}
                value={formData.ruleId || ''}
                onInput={e =>
                  setFormData(prev => ({
                    ...prev,
                    ruleId: e.currentTarget.value,
                  }))
                }
                required
                disabled={loading}
              >
                <option value="">
                  {loading ? 'Loading rules...' : 'Select a rule...'}
                </option>
                {rules.map(rule => (
                  <option key={rule.id} value={rule.id}>
                    {rule.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <FormField
            label="Description"
            {...(warnings.description && { warning: warnings.description })}
            help="Optional description explaining the variable's purpose"
          >
            <textarea
              className="input"
              rows={3}
              value={formData.description || ''}
              onInput={e =>
                setFormData(prev => ({
                  ...prev,
                  description: e.currentTarget.value,
                }))
              }
              placeholder="Describe what this variable is used for..."
            />
          </FormField>
        </div>

        {/* Value and Configuration */}
        <div className="space-y-4">
          <FormField
            label="Variable Value"
            required
            {...(errors.value && { error: errors.value })}
            {...(warnings.value && { warning: warnings.value })}
            help="Use ${variable_name} syntax to reference other variables or ${function()} for functions"
          >
            <div className="relative">
              <textarea
                className={`input ${errors.value ? 'border-red-500' : ''} ${formData.isSecret ? 'font-mono' : ''}`}
                rows={4}
                value={formData.value || ''}
                onInput={e =>
                  setFormData(prev => ({
                    ...prev,
                    value: e.currentTarget.value,
                  }))
                }
                placeholder="Enter value with optional functions like ${uuid()}, ${timestamp()}, etc."
                type={formData.isSecret ? 'password' : 'text'}
                required
              />
              {formData.isSecret && (
                <Icon
                  name="eye-off"
                  className="absolute top-3 right-3 text-gray-400"
                  size={16}
                />
              )}
            </div>
          </FormField>

          {/* Preview */}
          {showPreview && formData.value && (
            <FormField
              label="Preview"
              help="Preview of resolved value with sample data"
            >
              <div className="bg-gray-50 dark:bg-gray-700 border rounded-md p-3">
                <code className="text-sm text-gray-800 dark:text-gray-200">
                  {previewValue || 'No preview available'}
                </code>
              </div>
            </FormField>
          )}

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isSecret || false}
                onInput={e =>
                  setFormData(prev => ({
                    ...prev,
                    isSecret: e.currentTarget.checked,
                  }))
                }
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Secret variable (mask value in UI)
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enabled !== false}
                onInput={e =>
                  setFormData(prev => ({
                    ...prev,
                    enabled: e.currentTarget.checked,
                  }))
                }
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Enable variable for resolution
              </span>
            </label>
          </div>

          {/* Tags */}
          <FormField
            label="Tags"
            help="Add tags to categorize and filter variables"
          >
            <div className="space-y-2">
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-primary-500 hover:text-primary-700"
                      >
                        <Icon name="close" size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  id="tag-input"
                  type="text"
                  className="input flex-1"
                  value={tagInput}
                  onInput={e => setTagInput(e.currentTarget.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter tag name..."
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="secondary"
                  size="sm"
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </FormField>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={Object.keys(errors).length > 0 || loading}
        >
          {variable ? 'Update Variable' : 'Create Variable'}
        </Button>
      </div>
    </form>
  );
}
