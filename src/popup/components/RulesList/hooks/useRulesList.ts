import { matchURLPattern } from '@/lib/core';
import type { HeaderRule } from '@/shared/types/rules';

export function useRulesList(rules: HeaderRule[], currentUrl?: string) {
  const getMatchingRules = () => {
    if (!currentUrl) return [];
    return rules.filter(rule => {
      try {
        const result = matchURLPattern(currentUrl, rule.pattern);
        return result.matches;
      } catch {
        return false;
      }
    });
  };

  const getActiveRules = () => {
    return getMatchingRules().filter(rule => rule.enabled);
  };

  const matchingRules = getMatchingRules();
  const activeRules = getActiveRules();
  const otherRules = rules.filter(rule => !matchingRules.includes(rule));

  return {
    matchingRules,
    activeRules,
    otherRules,
  };
}
