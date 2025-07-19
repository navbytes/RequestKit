import { STORAGE_KEYS } from '@/config/constants';
import type { HeaderRule } from '@/shared/types/rules';
import { ChromeApiUtils } from '@/shared/utils';

/**
 * Save rules to Chrome storage
 */
export const saveRules = async (rulesToSave: HeaderRule[]): Promise<void> => {
  const rulesObject = rulesToSave.reduce(
    (acc, rule) => {
      acc[rule.id] = rule;
      return acc;
    },
    {} as Record<string, HeaderRule>
  );

  await ChromeApiUtils.storage.sync.set({
    [STORAGE_KEYS.RULES]: rulesObject,
  });
};
