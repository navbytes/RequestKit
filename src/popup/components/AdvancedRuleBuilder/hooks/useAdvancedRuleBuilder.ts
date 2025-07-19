import { useState, useEffect } from 'preact/hooks';

import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule, HeaderEntry } from '@/shared/types/rules';
import { ChromeApiUtils } from '@/shared/utils';
import { loggers } from '@/shared/utils/debug';

interface ProfilesResponse {
  profiles: Profile[];
  activeProfile: string;
}

interface FormData {
  ruleName: string;
  domain: string;
  path: string;
  protocol: 'http' | 'https' | '*';
  headers: HeaderEntry[];
  resourceTypes: string[];
  priority: number;
  enabled: boolean;
  profileId: string;
}

// Get logger for this module
const logger = loggers.shared;

export function useAdvancedRuleBuilder(
  currentUrl?: string,
  initialRule?: Partial<HeaderRule>,
  onRuleCreated?: (rule: HeaderRule) => void
) {
  const [formData, setFormData] = useState<FormData>({
    ruleName: initialRule?.name || '',
    domain:
      initialRule?.pattern?.domain ||
      (currentUrl ? new URL(currentUrl).hostname : ''),
    path: initialRule?.pattern?.path || '',
    protocol: (initialRule?.pattern?.protocol as 'http' | 'https') || 'https',
    headers: initialRule?.headers || [
      { name: '', value: '', operation: 'set', target: 'request' },
    ],
    resourceTypes: initialRule?.resourceTypes || [
      'main_frame',
      'sub_frame',
      'xmlhttprequest',
    ],
    priority: initialRule?.priority || 1,
    enabled: initialRule?.enabled ?? true,
    profileId: initialRule?.profileId || '',
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const response = (await ChromeApiUtils.runtime.sendMessage({
          type: 'GET_PROFILES',
        })) as ProfilesResponse;
        if (response) {
          setProfiles(response.profiles || []);
          if (!formData.profileId && response.activeProfile) {
            setFormData(prev => ({
              ...prev,
              profileId: response.activeProfile,
            }));
          }
        }
      } catch (error) {
        logger.error('Failed to load profiles:', error);
      }
    };
    loadProfiles();
  }, [formData.profileId]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const addHeader = () => {
    setFormData(prev => ({
      ...prev,
      headers: [
        ...prev.headers,
        { name: '', value: '', operation: 'set', target: 'request' },
      ],
    }));
  };

  const removeHeader = (index: number) => {
    setFormData(prev => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index),
    }));
  };

  const updateHeader = (
    index: number,
    field: keyof HeaderEntry,
    value: string
  ) => {
    setFormData(prev => {
      const updatedHeaders = [...prev.headers];
      const currentHeader = updatedHeaders[index];
      if (currentHeader) {
        updatedHeaders[index] = {
          ...currentHeader,
          [field]: value,
        };
      }
      return { ...prev, headers: updatedHeaders };
    });
  };

  const toggleResourceType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      resourceTypes: prev.resourceTypes.includes(type)
        ? prev.resourceTypes.filter(t => t !== type)
        : [...prev.resourceTypes, type],
    }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (
      !formData.ruleName.trim() ||
      !formData.domain.trim() ||
      formData.headers.every(h => !h.name.trim())
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const validHeaders = formData.headers.filter(
        h => h.name.trim() && h.value.trim()
      );

      const newRule: HeaderRule = {
        id:
          initialRule?.id ||
          `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.ruleName.trim(),
        pattern: {
          domain: formData.domain.trim(),
          path: formData.path.trim() || '/*',
          protocol: formData.protocol === '*' ? 'https' : formData.protocol,
        },
        headers: validHeaders,
        resourceTypes:
          formData.resourceTypes.length > 0 ? formData.resourceTypes : [],
        enabled: formData.enabled,
        priority: formData.priority,
        createdAt: initialRule?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // Add profileId only if it's not empty
      if (formData.profileId) {
        newRule.profileId = formData.profileId;
      }

      onRuleCreated?.(newRule);
    } catch (error) {
      logger.error('Failed to create rule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    profiles,
    isSubmitting,
    updateFormData,
    addHeader,
    removeHeader,
    updateHeader,
    toggleResourceType,
    handleSubmit,
  };
}
