import type { HeaderRule } from '@/shared/types/rules';

// Utility Functions for Profile Manager
export const getRulesForProfile = (rules: HeaderRule[], profileId: string) => {
  return rules.filter(rule => rule.profileId === profileId);
};

export const getUnassignedRules = (rules: HeaderRule[]) => {
  return rules.filter(rule => !rule.profileId);
};
